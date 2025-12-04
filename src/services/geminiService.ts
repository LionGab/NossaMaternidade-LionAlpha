import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';

import type { MotherProfile } from '@/features/wellness/types';
import type { AIToolCall, AIContext } from '@/types/ai';
import { buildUserContext, formatContextForAI } from '@/utils/buildUserContext';
import { logger } from '@/utils/logger';

import { NATHIA_TOOLS } from './aiTools/toolDefinitions';
import { supabase } from './supabase';

const SYSTEM_INSTRUCTION_BASE = `
  Você é a MãesValente, a assistente virtual de IA da influenciadora Nathália Valente, dentro do app "Nossa Maternidade".

  Seu tom de voz é:
  - Acolhedor, calmo, direto, sem infantilizar.
  - Você usa a 2ª pessoa ("você").
  - Você fala português do Brasil.
  - Você é próxima, carinhosa, vulnerável, mas firme.
  - Você NÃO é uma guru perfeita; você entende que a maternidade é difícil.
`;

// ======================
// PROMPTS POR FASE (Release B)
// ======================

const PHASE_PROMPTS: Record<string, string> = {
  trying: `
    FASE: Tentante
    - Tom: Esperançoso, encorajador, respeitoso do timing pessoal
    - Foco: Saúde reprodutiva, bem-estar emocional, autocuidado
    - Evite: Pressão, comparações, promessas de resultado
    - Lembre-se: Cada jornada é única; valide os sentimentos de incerteza
  `,
  pregnant: `
    FASE: Gestante
    - Tom: Esperançoso, informativo, celebrador
    - Foco: Sintomas normais, preparação, vínculo com o bebê
    - Evite: Alarmar sem necessidade, diagnósticos médicos
    - Lembre-se: Validar desconfortos físicos; são reais e importantes
  `,
  'new-mother': `
    FASE: Puérpera/Mãe de recém-nascido
    - Tom: Acolhedor, validador, suportivo
    - Foco: Recuperação, amamentação, sono, vinculação
    - Evite: Julgamentos sobre escolhas, comparações entre mães
    - Lembre-se: O puerpério é intenso; normalize as dificuldades
  `,
  'experienced-mother': `
    FASE: Mãe experiente
    - Tom: Parceira, prático, empoderador
    - Foco: Desenvolvimento infantil, equilíbrio trabalho-família, autocuidado
    - Evite: Subestimar desafios; maternidade continua difícil
    - Lembre-se: Ela já passou por muito; valide sua experiência
  `,
};

const TONE_INSTRUCTIONS: Record<string, string> = {
  hopeful: `
    Use um tom esperançoso e otimista, sem minimizar dificuldades.
    Celebre pequenas vitórias e progresso.
  `,
  supportive: `
    Seja um ombro amigo. Valide sentimentos antes de oferecer soluções.
    Pergunte como ela está se sentindo antes de aconselhar.
  `,
  practical: `
    Seja objetiva e prática, mas sem frieza.
    Ofereça dicas acionáveis quando solicitado.
  `,
  empathetic: `
    Priorize a escuta e validação emocional.
    Não apresse soluções; às vezes ela só precisa ser ouvida.
    Pergunte: "Você quer que eu apenas ouça ou quer algumas ideias?"
  `,
};

class GeminiService {
  /**
   * Obtém contexto expandido do usuário (Release B)
   * Inclui dados de wellness e informações de fase
   */
  private async getUserContext(): Promise<{ context: string; phase?: string; tone?: string }> {
    try {
      // Tentar carregar perfil expandido primeiro
      const wellnessProfile = await AsyncStorage.getItem('nath_wellness_profile');
      if (wellnessProfile) {
        const profile = JSON.parse(wellnessProfile) as Partial<MotherProfile>;
        const expandedContext = buildUserContext(profile);
        return {
          context: formatContextForAI(expandedContext),
          phase: expandedContext.lifeStage,
          tone: expandedContext.tone,
        };
      }

      // Fallback para perfil legado
      const savedUser = await AsyncStorage.getItem('nath_user');
      if (savedUser) {
        const user = JSON.parse(savedUser);
        const expandedContext = buildUserContext(user);
        return {
          context: formatContextForAI(expandedContext),
          phase: expandedContext.lifeStage,
          tone: expandedContext.tone,
        };
      }
    } catch (e) {
      logger.warn('Error reading user context:', e);
    }
    return { context: '' };
  }

  /**
   * Constrói system instruction completa com contexto e prompts por fase
   */
  private buildSystemInstruction(
    userContext: string,
    phase?: string,
    tone?: string,
    additionalInstructions?: string
  ): string {
    const parts: string[] = [SYSTEM_INSTRUCTION_BASE];

    // Adicionar prompt específico da fase
    if (phase && PHASE_PROMPTS[phase]) {
      parts.push(PHASE_PROMPTS[phase]);
    }

    // Adicionar instrução de tom
    if (tone && TONE_INSTRUCTIONS[tone]) {
      parts.push(TONE_INSTRUCTIONS[tone]);
    }

    // Adicionar contexto da usuária
    if (userContext) {
      parts.push(`\nCONTEXTO DA USUÁRIA ATUAL: [ ${userContext} ]`);
      parts.push('Use o nome dela se souber. Adapte a resposta para a fase e desafios dela.');
    }

    // Adicionar instruções adicionais
    if (additionalInstructions) {
      parts.push(additionalInstructions);
    }

    // Regras obrigatórias
    parts.push(`
      Regras OBRIGATÓRIAS para o CHAT:
      1. Sempre comece acolhendo a emoção da usuária.
      2. Faça perguntas abertas para entender melhor.
      3. NUNCA dê diagnósticos médicos.
      4. Mantenha as respostas concisas (máximo 3 parágrafos curtos).
    `);

    return parts.join('\n');
  }

  /**
   * Envia mensagem com suporte a Tool Calling
   * Release B: Usa prompts por fase e contexto expandido
   */
  async sendMessage(
    message: string,
    history: { role: 'user' | 'model' | 'assistant'; text: string }[] = [],
    context?: AIContext,
    enableTools = true
  ): Promise<{ text: string; error?: string; toolCall?: AIToolCall }> {
    try {
      const { context: userCtx, phase, tone } = await this.getUserContext();
      const systemInstruction = this.buildSystemInstruction(userCtx, phase, tone);

      // Map history to API format
      const chatHistory = history.map((h) => ({
        role: h.role === 'user' ? 'user' : 'model',
        parts: [{ text: h.text }],
      }));

      // Call Supabase Edge Function com suporte a tools
      const { data, error } = await supabase.functions.invoke('chat-ai', {
        body: {
          message,
          history: chatHistory,
          systemInstruction,
          tools: enableTools ? NATHIA_TOOLS : undefined,
          context: context || undefined,
        },
      });

      if (error) {
        logger.error('[geminiService] Supabase function error:', error, {
          service: 'GeminiService',
        });
        return {
          text: '',
          error: 'Sinto muito, minha conexão falhou um pouquinho. Pode repetir, querida?',
        };
      }

      // Verifica se a IA quer chamar uma tool
      if (data?.tool_call) {
        return {
          text: '',
          toolCall: data.tool_call as AIToolCall,
        };
      }

      if (!data || !data.text) {
        return {
          text: '',
          error: 'Resposta inválida do servidor.',
        };
      }

      return { text: data.text };
    } catch (error) {
      logger.error('Error sending message to backend:', error, {
        service: 'GeminiService',
      });
      return {
        text: '',
        error: 'Sinto muito, minha conexão falhou um pouquinho. Pode repetir, querida?',
      };
    }
  }

  /**
   * Envia mensagem com resultado de tool para obter resposta final
   * Release B: Usa prompts por fase e contexto expandido
   */
  async sendMessageWithToolResult(
    message: string,
    toolResult: unknown,
    history: { role: 'user' | 'model' | 'assistant'; text: string }[] = [],
    context?: AIContext
  ): Promise<{ text: string; error?: string }> {
    try {
      const { context: userCtx, phase, tone } = await this.getUserContext();
      const additionalInstructions = `
        RESULTADO DA FERRAMENTA: ${JSON.stringify(toolResult)}
        Use essas informações para responder de forma contextualizada e útil.
      `;
      const systemInstruction = this.buildSystemInstruction(
        userCtx,
        phase,
        tone,
        additionalInstructions
      );

      const chatHistory = history.map((h) => ({
        role: h.role === 'user' ? 'user' : 'model',
        parts: [{ text: h.text }],
      }));

      const { data, error } = await supabase.functions.invoke('chat-ai', {
        body: {
          message,
          history: chatHistory,
          systemInstruction,
          tool_result: toolResult,
          context: context || undefined,
        },
      });

      if (error) {
        logger.error('[geminiService] Erro ao enviar tool result', error, {
          service: 'GeminiService',
        });
        return {
          text: '',
          error: 'Sinto muito, minha conexão falhou um pouquinho. Pode repetir, querida?',
        };
      }

      if (!data || !data.text) {
        return {
          text: '',
          error: 'Resposta inválida do servidor.',
        };
      }

      return { text: data.text };
    } catch (error) {
      logger.error('Error sending tool result to backend:', error, {
        service: 'GeminiService',
      });
      return {
        text: '',
        error: 'Sinto muito, minha conexão falhou um pouquinho. Pode repetir, querida?',
      };
    }
  }

  async sendAudio(audioUri: string): Promise<{ text: string; error?: string }> {
    try {
      const base64Audio = await FileSystem.readAsStringAsync(audioUri, {
        encoding: 'base64',
      });

      const fileExtension = audioUri.split('.').pop()?.toLowerCase() || 'm4a';
      const mimeType = fileExtension === 'mp3' ? 'audio/mp3' : 'audio/m4a';

      const userCtx = await this.getUserContext();
      const systemInstruction = `
        ${SYSTEM_INSTRUCTION_BASE}
        CONTEXTO DA USUÁRIA: [ ${userCtx} ]
        Tarefa: Transcrever e responder a um áudio da usuária.
      `;

      // Call Supabase Edge Function
      const { data, error } = await supabase.functions.invoke('audio-ai', {
        body: {
          audioBase64: base64Audio,
          mimeType,
          systemInstruction,
          prompt: 'Por favor, ouça meu áudio e me responda.',
        },
      });

      if (error) {
        logger.error('[geminiService] Supabase function error:', error, {
          service: 'GeminiService',
        });
        return {
          text: '',
          error: 'Erro ao processar áudio.',
        };
      }

      if (!data || !data.text) {
        return {
          text: '',
          error: 'Resposta inválida do servidor.',
        };
      }

      return { text: data.text };
    } catch (error) {
      logger.error('Error sending audio to backend:', error, {
        service: 'GeminiService',
      });
      return { text: '', error: 'Erro ao processar áudio.' };
    }
  }

  async analyzeDiaryEntry(entry: string): Promise<{ text: string; error?: string }> {
    try {
      const userCtx = await this.getUserContext();
      const systemInstruction = `
        ${SYSTEM_INSTRUCTION_BASE}
        CONTEXTO DA USUÁRIA: [ ${userCtx} ]

        Tarefa: Analisar uma entrada de diário maternal.
        - Identifique emoções principais
        - Reconheça conquistas, por menores que sejam
        - Ofereça validação emocional
        - Seja breve e acolhedora (máximo 2 parágrafos curtos)
        - NÃO dê conselhos não solicitados
      `;

      // Call Supabase Edge Function
      const { data, error } = await supabase.functions.invoke('analyze-diary', {
        body: {
          entry,
          systemInstruction,
        },
      });

      if (error) {
        logger.error('[geminiService] Supabase function error:', error, {
          service: 'GeminiService',
        });
        return {
          text: '',
          error: 'Erro ao analisar entrada do diário.',
        };
      }

      if (!data || !data.text) {
        return {
          text: '',
          error: 'Resposta inválida do servidor.',
        };
      }

      return { text: data.text };
    } catch (error) {
      logger.error('Error analyzing diary entry:', error, {
        service: 'GeminiService',
      });
      return { text: '', error: 'Erro ao analisar entrada do diário.' };
    }
  }

  isConfigured(): boolean {
    return true; // Backend is always "configured" from client perspective, connection check could be added
  }
}

export const geminiService = new GeminiService();
export default geminiService;
