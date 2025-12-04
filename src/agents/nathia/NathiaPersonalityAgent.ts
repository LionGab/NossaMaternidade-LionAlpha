/**
 * NATHIA Personality Agent
 *
 * Agente que garante a AUTENTICIDADE da voz da Nathália Valente
 *
 * PRINCÍPIOS INEGOCIÁVEIS:
 * 1. NUNCA fugir do contexto maternal
 * 2. NUNCA dar conselhos médicos
 * 3. SEMPRE validar emocionalmente ANTES de orientar
 * 4. SEMPRE redirecionar para profissionais quando necessário
 * 5. Falar como a Nathália: real, vulnerável, firme, sem guru vibes
 */

import { createMCPRequest } from '../../mcp/servers';
import { MCPResponse } from '../../mcp/types';
import { logger } from '../../utils/logger';
import { orchestrator } from '../core/AgentOrchestrator';
import { BaseAgent, AgentContext as _AgentContext } from '../core/BaseAgent';

export interface NathiaContext {
  userEmotion?: string;
  lifeStage?: string;
  recentTopics?: string[];
}

export interface NathiaMessage {
  originalText: string;
  context?: NathiaContext;
}

export type NathiaTone =
  | 'empathetic'
  | 'validating'
  | 'firm-but-kind'
  | 'vulnerable'
  | 'celebratory';
export type IssueType = 'medical-advice' | 'off-context' | 'inappropriate-tone';
export type IssueSeverity = 'low' | 'medium' | 'high';
export type SpecialistType = 'medico' | 'psicologo' | 'nutricionista' | 'obstetra';

export interface NathiaIssue {
  type: IssueType;
  severity: IssueSeverity;
  suggestion: string;
}

export interface CrisisResponse {
  blockFreeChat: boolean;
  response: string;
  emergencyContacts: string[];
  notifySystem: boolean;
}

export interface NathiaResponse {
  processedText: string;
  tone: NathiaTone;
  flaggedIssues: NathiaIssue[];
  redirectToSpecialist: boolean;
  specialistType?: SpecialistType;
  isCrisis?: boolean;
  crisisResponse?: CrisisResponse;
}

/**
 * NATHIA - A voz autêntica de Nathália Valente
 */
export class NathiaPersonalityAgent extends BaseAgent {
  // NATHIA_VOICE_RULES removed - documentation moved to comments
  // Voice rules: validar emoções ANTES, falar como amiga real, ser vulnerável,
  // redirecionar para profissionais, usar "você", ser direta mas carinhosa

  // Detectores de crise (CRÍTICO - prioridade máxima)
  private readonly CRISIS_KEYWORDS = [
    'suicídio',
    'me matar',
    'acabar com tudo',
    'machucar o bebê',
    'não aguento mais viver',
    'ouvir vozes',
    'vou sumir',
    'quero morrer',
    'não vale a pena viver',
    'seria melhor se eu não existisse',
    'vou me matar',
    'acabar com minha vida',
    'não quero mais viver',
    'prefiro estar morta',
    'vou fazer algo ruim',
    'machucar alguém',
    'fazer mal ao bebê',
    'não consigo mais',
    'chegou ao limite',
    'não tem mais jeito',
  ];

  private readonly MEDICAL_RED_FLAGS = [
    // Palavras que indicam conselho médico
    'você deve tomar',
    'tome esse medicamento',
    'esse remédio',
    'diagnóstico',
    'prescrevo',
    'tratamento recomendado',
    'dose de',
    'suspenda a medicação',
    'você tem',
    'você está com',
    'sintoma de',
    'doença',
  ];

  constructor() {
    super({
      name: 'nathia-personality',
      description: 'Garante autenticidade da voz da Nathália e previne conselhos médicos',
      capabilities: [
        'personality-validation',
        'medical-advice-detection',
        'tone-correction',
        'context-enforcement',
        'specialist-redirection',
      ],
      version: '1.0.0',
    });
  }

  async initialize(): Promise<void> {
    logger.info('[NathiaPersonalityAgent] Voz da Nathália ATIVA');
    this.initialized = true;
  }

  /**
   * Processa qualquer mensagem IA para garantir voz da Nathália
   */
  async process(input: NathiaMessage, _options?: Record<string, unknown>): Promise<NathiaResponse> {
    const { originalText, context } = input;

    // 0. PRIORIDADE MÁXIMA: Detectar crise emocional/suicídio
    const crisisCheck = this.detectCrisis(originalText);
    if (crisisCheck) {
      logger.warn(
        '[NathiaPersonalityAgent] CRISE DETECTADA - bloqueando chat livre e acionando protocolo de emergência',
        {
          message: originalText.substring(0, 50),
        }
      );
      return {
        processedText: crisisCheck.response,
        tone: 'empathetic',
        flaggedIssues: [
          {
            type: 'medical-advice',
            severity: 'high',
            suggestion: 'Crise emocional detectada - protocolo de emergência acionado',
          },
        ],
        redirectToSpecialist: true,
        specialistType: 'psicologo',
        isCrisis: true,
        crisisResponse: crisisCheck,
      };
    }

    // 1. Detectar problemas na mensagem original
    const issues = this.detectIssues(originalText);

    // 2. Verificar se precisa redirecionar para especialista
    const redirectInfo = this.checkForSpecialistRedirect(originalText, issues);

    // 3. Se houver problemas graves, reprocessar com IA
    let processedText = originalText;
    if (issues.some((i) => i.severity === 'high')) {
      processedText = await this.reprocessWithNathiaVoice(originalText, issues, context);
    } else {
      // Apenas ajustes leves
      processedText = this.applyLightToneAdjustments(originalText);
    }

    // 4. Determinar tom da mensagem
    const tone = this.detectTone(processedText);

    return {
      processedText,
      tone,
      flaggedIssues: issues,
      redirectToSpecialist: redirectInfo.redirect,
      specialistType: redirectInfo.type,
      isCrisis: false,
    };
  }

  /**
   * Detecta crise emocional/suicídio na mensagem do usuário
   * Retorna resposta automática de segurança se crise detectada
   */
  private detectCrisis(message: string): CrisisResponse | null {
    const lowerMessage = message.toLowerCase();

    // Verificar se contém palavras-chave de crise
    const hasCrisisKeyword = this.CRISIS_KEYWORDS.some((keyword) =>
      lowerMessage.includes(keyword.toLowerCase())
    );

    if (!hasCrisisKeyword) {
      return null;
    }

    logger.error('[NathiaPersonalityAgent] CRISE DETECTADA', {
      keywordsFound: this.CRISIS_KEYWORDS.filter((kw) => lowerMessage.includes(kw.toLowerCase())),
      messagePreview: message.substring(0, 100),
    });

    return this.handleCrisis(message);
  }

  /**
   * Resposta automática de segurança para crise
   */
  private handleCrisis(_message: string): CrisisResponse {
    return {
      blockFreeChat: true,
      response: `Entendo que você está passando por um momento muito difícil 💙

🆘 Por favor, procure ajuda profissional AGORA:

• CVV: 188 (24h, gratuito)
• SAMU: 192
• CAPS mais próximo

Você não está sozinha. Há pessoas prontas para te ajudar.`,
      emergencyContacts: this.getEmergencyContacts(),
      notifySystem: true, // Para monitoramento agregado
    };
  }

  /**
   * Retorna lista de contatos de emergência
   */
  private getEmergencyContacts(): string[] {
    return [
      'CVV: 188 (24h, gratuito)',
      'SAMU: 192',
      'CAPS mais próximo',
      'Disque 100 (Direitos Humanos)',
    ];
  }

  /**
   * Detecta problemas na mensagem (conselhos médicos, tom errado, etc.)
   */
  private detectIssues(text: string): NathiaIssue[] {
    const issues: NathiaIssue[] = [];
    const lowerText = text.toLowerCase();

    // 1. Detectar conselhos médicos (CRÍTICO)
    for (const flag of this.MEDICAL_RED_FLAGS) {
      if (lowerText.includes(flag)) {
        issues.push({
          type: 'medical-advice',
          severity: 'high',
          suggestion: `Detectado possível conselho médico: "${flag}". DEVE redirecionar para profissional.`,
        });
      }
    }

    // 2. Detectar diagnósticos médicos
    const diagnosisPatterns = [
      /você (tem|está com|pode ter) (depressão|ansiedade|mastite|infecção)/i,
      /isso é (sintoma de|sinal de)/i,
      /você precisa de (medicamento|remédio|antibiótico)/i,
    ];

    for (const pattern of diagnosisPatterns) {
      if (pattern.test(text)) {
        issues.push({
          type: 'medical-advice',
          severity: 'high',
          suggestion:
            'Detectado diagnóstico ou prescrição. REPROCESSAR para validação + redirecionamento.',
        });
      }
    }

    // 3. Detectar tom de "guru perfeita"
    const guruPhrases = [
      'você só precisa',
      'é só fazer',
      'basta',
      'simplesmente',
      'facilmente',
      'sempre funciona',
      'garanto que',
    ];

    for (const phrase of guruPhrases) {
      if (lowerText.includes(phrase)) {
        issues.push({
          type: 'inappropriate-tone',
          severity: 'medium',
          suggestion: `Tom de "guru perfeita" detectado: "${phrase}". Ajustar para ser mais real.`,
        });
      }
    }

    // 4. Detectar fuga de contexto maternal
    const offContextKeywords = ['investimentos', 'política', 'esportes', 'tecnologia'];
    for (const keyword of offContextKeywords) {
      if (lowerText.includes(keyword) && !lowerText.includes('maternidade')) {
        issues.push({
          type: 'off-context',
          severity: 'medium',
          suggestion: `Possível desvio de contexto: "${keyword}". Recontextualizar para maternidade.`,
        });
      }
    }

    // 5. Detectar falta de validação emocional
    const hasEmotionalValidation =
      lowerText.includes('compreendo') ||
      lowerText.includes('entendo') ||
      lowerText.includes('você não está sozinha') ||
      lowerText.includes('é normal') ||
      lowerText.includes('está tudo bem');

    const hasAdvice =
      lowerText.includes('tente') ||
      lowerText.includes('experimente') ||
      lowerText.includes('sugiro') ||
      lowerText.includes('recomendo');

    if (hasAdvice && !hasEmotionalValidation) {
      issues.push({
        type: 'inappropriate-tone',
        severity: 'medium',
        suggestion: 'Conselho sem validação emocional prévia. Adicionar empatia ANTES.',
      });
    }

    return issues;
  }

  /**
   * Verifica se deve redirecionar para especialista
   */
  private checkForSpecialistRedirect(
    text: string,
    issues: NathiaIssue[]
  ): { redirect: boolean; type?: SpecialistType } {
    const hasMedicalIssue = issues.some(
      (i) => i.type === 'medical-advice' && i.severity === 'high'
    );

    if (hasMedicalIssue) {
      const lowerText = text.toLowerCase();

      // Determinar tipo de especialista
      if (
        lowerText.includes('dor') ||
        lowerText.includes('sangramento') ||
        lowerText.includes('febre')
      ) {
        return { redirect: true, type: 'medico' as const };
      }

      if (
        lowerText.includes('deprimida') ||
        lowerText.includes('ansiosa') ||
        lowerText.includes('pânico')
      ) {
        return { redirect: true, type: 'psicologo' as const };
      }

      if (
        lowerText.includes('amamentação') ||
        lowerText.includes('parto') ||
        lowerText.includes('gravidez')
      ) {
        return { redirect: true, type: 'obstetra' as const };
      }

      if (
        lowerText.includes('alimentação') ||
        lowerText.includes('dieta') ||
        lowerText.includes('peso')
      ) {
        return { redirect: true, type: 'nutricionista' as const };
      }

      return { redirect: true, type: 'medico' as const };
    }

    return { redirect: false, type: undefined };
  }

  /**
   * Reprocessa mensagem usando IA para corrigir problemas graves
   */
  private async reprocessWithNathiaVoice(
    originalText: string,
    issues: NathiaIssue[],
    context?: NathiaContext
  ): Promise<string> {
    try {
      const issuesSummary = issues.map((i) => `- ${i.type}: ${i.suggestion}`).join('\n');

      const prompt = `
Você é a Nathália Valente, influenciadora de maternidade real e vulnerável.

MENSAGEM ORIGINAL (COM PROBLEMAS):
"${originalText}"

PROBLEMAS DETECTADOS:
${issuesSummary}

SUA MISSÃO:
Reescreva esta mensagem seguindo RIGOROSAMENTE estas regras:

🚫 NUNCA:
- Dar conselhos médicos, diagnósticos ou prescrições
- Usar tom de "guru perfeita" ou frases motivacionais genéricas
- Infantilizar ou julgar a mãe
- Fugir do contexto de maternidade

✅ SEMPRE:
- Validar emocionalmente PRIMEIRO
- Ser vulnerável e real: "Maternidade é difícil, eu sei"
- Redirecionar para profissionais quando necessário
- Falar na 2ª pessoa ("você")
- Ser direta mas carinhosa

TOM: Conversa de cafezinho entre amigas, não palestra motivacional.

CONTEXTO ADICIONAL:
- Fase: ${context?.lifeStage || 'não informado'}
- Emoção atual: ${context?.userEmotion || 'não informado'}

IMPORTANTE: Se houver questão médica, VALIDE + REDIRECIONE (ex: "Eu entendo sua preocupação. Por favor, converse com seu obstetra sobre isso.")

RESPOSTA REPROCESSADA (apenas o texto, sem explicações):
      `;

      interface ChatSendResponse {
        text?: string;
      }

      const request = createMCPRequest('chat.send', {
        message: prompt,
        context: {
          temperature: 0.8,
          maxTokens: 300,
        },
      });

      const response = await orchestrator.callMCP('googleai', 'chat.send', request.params);

      if (response.success && response.data) {
        const data = response.data as ChatSendResponse;
        if (data.text) {
          return data.text.trim();
        }
      }

      // Fallback: retornar versão segura genérica
      return this.createSafeFallback(issues);
    } catch (error) {
      logger.error('[NathiaPersonalityAgent] Reprocess error', error);
      return this.createSafeFallback(issues);
    }
  }

  /**
   * Aplica ajustes leves de tom
   */
  private applyLightToneAdjustments(text: string): string {
    let adjusted = text;

    // Remover excesso de exclamações
    adjusted = adjusted.replace(/!{3,}/g, '!');

    // Adicionar validação se faltar
    if (adjusted.length > 100 && !this.hasEmotionalValidation(adjusted)) {
      adjusted = 'Eu compreendo como você está se sentindo. ' + adjusted;
    }

    return adjusted;
  }

  /**
   * Cria resposta segura em caso de falha
   */
  private createSafeFallback(issues: NathiaIssue[]): string {
    const hasMedical = issues.some((i) => i.type === 'medical-advice');

    if (hasMedical) {
      return `Eu entendo sua preocupação, e ela é totalmente válida. Mas sobre questões de saúde, é muito importante que você converse com um profissional médico. Ele vai poder te orientar da melhor forma, ok? Estou aqui para te apoiar emocionalmente sempre. 💜`;
    }

    return `Eu ouvi você, e suas emoções são válidas. Maternidade é difícil, e você não está sozinha nisso. Como posso te apoiar melhor neste momento?`;
  }

  /**
   * Detecta tom da mensagem
   */
  private detectTone(text: string): NathiaTone {
    const lowerText = text.toLowerCase();

    if (
      lowerText.includes('parabéns') ||
      lowerText.includes('incrível') ||
      lowerText.includes('você conseguiu')
    ) {
      return 'celebratory';
    }

    if (
      lowerText.includes('compreendo') ||
      lowerText.includes('entendo') ||
      lowerText.includes('eu sei como é')
    ) {
      return 'empathetic';
    }

    if (lowerText.includes('é normal') || lowerText.includes('você não está sozinha')) {
      return 'validating';
    }

    if (
      lowerText.includes('maternidade é difícil') ||
      lowerText.includes('eu também') ||
      lowerText.includes('eu passei')
    ) {
      return 'vulnerable';
    }

    if (lowerText.includes('é importante') || lowerText.includes('precisa')) {
      return 'firm-but-kind';
    }

    return 'empathetic';
  }

  /**
   * Verifica se mensagem tem validação emocional
   */
  private hasEmotionalValidation(text: string): boolean {
    const validationPhrases = [
      'compreendo',
      'entendo',
      'é normal',
      'você não está sozinha',
      'está tudo bem',
      'é válido',
      'eu sei',
      'te escuto',
    ];

    const lowerText = text.toLowerCase();
    return validationPhrases.some((phrase) => lowerText.includes(phrase));
  }

  /**
   * Implementação do callMCP
   */
  protected async callMCP(
    server: string,
    method: string,
    params: Record<string, unknown>
  ): Promise<MCPResponse> {
    // Cast method to proper type based on the server
    if (server === 'googleai') {
      return await orchestrator.callMCP(
        server,
        method as keyof import('../../mcp/types').GoogleAIMCPMethods,
        params
      );
    } else if (server === 'analytics') {
      return await orchestrator.callMCP(
        server,
        method as keyof import('../../mcp/types').AnalyticsMCPMethods,
        params
      );
    }
    return await orchestrator.callMCP(
      server,
      method as keyof import('../../mcp/types').AllMCPMethods,
      params
    );
  }

  async shutdown(): Promise<void> {
    logger.info('[NathiaPersonalityAgent] Shutdown');
  }
}
