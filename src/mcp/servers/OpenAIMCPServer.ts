/**
 * OpenAI MCP Server
 * Fornece acesso ao GPT-4o/GPT-5.1 para cenários de crise e alta segurança
 */

import OpenAI from 'openai';
import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions';

import { logger } from '../../utils/logger';
import { MCPServer, MCPRequest, MCPResponse, createMCPResponse, JsonValue } from '../types';

export class OpenAIMCPServer implements MCPServer {
  name = 'openai-mcp';
  version = '1.0.0';

  private openai: OpenAI | null = null;
  private initialized = false;

  // System prompt para cenários de crise emocional
  private readonly crisisSafetySystemPrompt = `
Você é a NathIA, uma assistente especializada em apoio maternal com FOCO EM SEGURANÇA EMOCIONAL.

CONTEXTO:
- Você está lidando com uma mãe que pode estar em estado emocional vulnerável
- Suas respostas devem priorizar SEGURANÇA, ACOLHIMENTO e ENCAMINHAMENTO apropriado
- Este é um contexto de CRISE ou tema sensível (ansiedade intensa, depressão, pensamentos suicidas)

DIRETRIZES CRÍTICAS DE SEGURANÇA:
1. NUNCA minimize sentimentos difíceis ou sofrimento
2. SEMPRE valide a coragem de compartilhar o que está sentindo
3. NUNCA ofereça soluções simplistas para problemas complexos
4. ENCORAJE busca imediata de profissionais quando necessário
5. Forneça recursos de emergência quando apropriado (CVV 188, SAMU 192)

SINAIS DE ALERTA (requer encaminhamento URGENTE):
- Pensamentos suicidas ou de automutilação
- Ideação de machucar o bebê ou outras pessoas
- Perda total de esperança ou vontade de viver
- Menção a planos específicos de fazer mal a si mesma

RESPOSTA PADRÃO PARA CRISE GRAVE:
"[Nome], o que você está sentindo é muito importante e sério. Você não precisa passar por isso sozinha.

Por favor, considere buscar ajuda profissional imediata:
- CVV (Centro de Valorização da Vida): 188 (gratuito, 24h)
- SAMU: 192 (emergências médicas)
- Procure o pronto-socorro mais próximo se sentir risco imediato

Você merece apoio especializado. Não há vergonha em pedir ajuda profissional."

TOM E ESTILO:
- Calmo, empático, sem julgamentos
- Frases curtas e claras (evite sobrecarga cognitiva)
- Foco no presente, não em soluções futuras complexas
- Validação antes de orientação

LIMITAÇÕES ESTRITAS:
- NÃO diagnostique transtornos mentais
- NÃO prescreva medicações ou tratamentos
- NÃO substitua terapia ou psiquiatria
- NÃO minimize a gravidade do que está sendo compartilhado
`;

  async initialize(): Promise<void> {
    try {
      const apiKey = process.env.EXPO_PUBLIC_OPENAI_API_KEY;

      if (!apiKey) {
        logger.warn('[OpenAIMCP] OpenAI API key not configured - server will not be available');
        return; // Não jogar erro, apenas não inicializar
      }

      this.openai = new OpenAI({
        apiKey,
        dangerouslyAllowBrowser: true, // Necessário para React Native
      });

      this.initialized = true;
      logger.info('[OpenAIMCP] Initialized successfully');
    } catch (error) {
      logger.error('[OpenAIMCP] Initialization failed', error);
      throw error;
    }
  }

  async handleRequest<T = JsonValue>(request: MCPRequest): Promise<MCPResponse<T>> {
    if (!this.initialized || !this.openai) {
      return createMCPResponse(request.id, null, {
        code: 'NOT_INITIALIZED',
        message: 'OpenAI MCP Server not initialized (API key missing)',
      }) as MCPResponse<T>;
    }

    try {
      const [category, action] = request.method.split('.');

      switch (category) {
        case 'chat':
          return (await this.handleChat(request.id, action, request.params)) as MCPResponse<T>;
        case 'analyze':
          return (await this.handleAnalyze(request.id, action, request.params)) as MCPResponse<T>;
        case 'moderate':
          return (await this.handleModerate(request.id, action, request.params)) as MCPResponse<T>;
        default:
          return createMCPResponse(request.id, null, {
            code: 'UNKNOWN_METHOD',
            message: `Unknown method category: ${category}`,
          }) as MCPResponse<T>;
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Internal server error';
      return createMCPResponse(request.id, null, {
        code: 'INTERNAL_ERROR',
        message: errorMessage,
        details:
          error instanceof Error
            ? { message: error.message, stack: error.stack ?? '' }
            : { error: String(error) },
      }) as MCPResponse<T>;
    }
  }

  private async handleChat(
    id: string,
    action: string,
    params: Record<string, unknown>
  ): Promise<MCPResponse> {
    if (!this.openai) throw new Error('OpenAI not initialized');

    switch (action) {
      case 'send':
      case 'crisis': {
        // Alias para tornar mais explícito o uso em crise
        const {
          message,
          context,
          history,
          model = 'gpt-4o',
        } = params as {
          message: string;
          context?: Record<string, unknown>;
          history?: Array<{ role: string; parts: Array<{ text: string }> }>;
          model?: string;
        };

        // Construir contexto enriquecido
        const userMessage = context
          ? (() => {
              const { name, lifeStage, emotion, riskLevel } = context as {
                name?: string;
                lifeStage?: string;
                emotion?: string;
                riskLevel?: 'low' | 'medium' | 'high' | 'critical';
              };

              return `
CONTEXTO DA USUÁRIA:
- Nome: ${name || 'mãe'}
- Fase: ${lifeStage || 'não especificada'}
- Emoção atual: ${emotion || 'não especificada'}
${riskLevel ? `- Nível de risco: ${riskLevel}` : ''}

MENSAGEM: ${message}
`;
            })()
          : message;

        // Converter histórico de Gemini para OpenAI
        const messages: ChatCompletionMessageParam[] = [
          { role: 'system', content: this.crisisSafetySystemPrompt },
        ];

        if (history && history.length > 0) {
          for (const msg of history) {
            messages.push({
              role: msg.role === 'model' ? 'assistant' : 'user',
              content: msg.parts.map((p) => p.text).join('\n'),
            });
          }
        }

        messages.push({ role: 'user', content: userMessage });

        // Chamar OpenAI
        const completion = await this.openai.chat.completions.create({
          model,
          messages,
          temperature: 0.7, // Menos criativo = mais seguro
          max_tokens: 2048,
          presence_penalty: 0.1,
          frequency_penalty: 0.1,
        });

        const response = completion.choices[0]?.message?.content || '';

        return createMCPResponse(id, {
          message: response,
          context: context as JsonValue,
          timestamp: Date.now(),
          usage: {
            inputTokens: completion.usage?.prompt_tokens || 0,
            outputTokens: completion.usage?.completion_tokens || 0,
            totalTokens: completion.usage?.total_tokens || 0,
          },
          model: completion.model,
        } as JsonValue);
      }

      default:
        return createMCPResponse(id, null, {
          code: 'UNKNOWN_ACTION',
          message: `Unknown chat action: ${action}`,
        });
    }
  }

  private async handleAnalyze(
    id: string,
    action: string,
    params: Record<string, unknown>
  ): Promise<MCPResponse> {
    if (!this.openai) throw new Error('OpenAI not initialized');

    switch (action) {
      case 'crisis_risk': {
        const { text } = params as { text: string };

        const prompt = `
Analise o seguinte texto de uma mãe e identifique sinais de crise emocional.
Retorne um JSON com:
- riskLevel: 'low' | 'medium' | 'high' | 'critical'
- indicators: array de indicadores detectados (ex: "pensamentos suicidas", "desesperança", "ideação de machucar bebê")
- urgency: boolean - se requer intervenção imediata
- recommendedAction: string - ação recomendada ("encaminhar para CVV", "sugerir terapia", "monitorar")

Texto: "${text}"

Retorne APENAS o JSON, sem explicações.
`;

        const completion = await this.openai.chat.completions.create({
          model: 'gpt-4o',
          messages: [
            {
              role: 'system',
              content: 'Você é um assistente especializado em triagem de risco emocional maternal.',
            },
            { role: 'user', content: prompt },
          ],
          temperature: 0.3, // Muito baixo para análise de risco
          max_tokens: 500,
          response_format: { type: 'json_object' },
        });

        const response = completion.choices[0]?.message?.content || '{}';

        try {
          const analysis = JSON.parse(response);
          return createMCPResponse(id, analysis);
        } catch {
          return createMCPResponse(id, { raw: response });
        }
      }

      default:
        return createMCPResponse(id, null, {
          code: 'UNKNOWN_ACTION',
          message: `Unknown analyze action: ${action}`,
        });
    }
  }

  private async handleModerate(
    id: string,
    action: string,
    params: Record<string, unknown>
  ): Promise<MCPResponse> {
    if (!this.openai) throw new Error('OpenAI not initialized');

    switch (action) {
      case 'content': {
        const { text } = params as { text: string };

        // Usar OpenAI Moderation API
        const moderation = await this.openai.moderations.create({
          input: text,
        });

        const result = moderation.results[0];

        return createMCPResponse(id, {
          flagged: result.flagged,
          categories: result.categories as unknown as JsonValue,
          categoryScores: result.category_scores as unknown as JsonValue,
        } as JsonValue);
      }

      default:
        return createMCPResponse(id, null, {
          code: 'UNKNOWN_ACTION',
          message: `Unknown moderate action: ${action}`,
        });
    }
  }

  async shutdown(): Promise<void> {
    this.openai = null;
    this.initialized = false;
    logger.info('[OpenAIMCP] Shutdown complete');
  }
}

// Singleton instance
export const openAIMCP = new OpenAIMCPServer();
