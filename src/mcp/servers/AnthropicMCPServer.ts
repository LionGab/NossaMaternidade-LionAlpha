/**
 * Anthropic MCP Server
 * Fornece acesso ao Claude Opus 4 para raciocínio complexo e contexto extenso
 */

import Anthropic from '@anthropic-ai/sdk';
import type { MessageParam } from '@anthropic-ai/sdk/resources/messages';

import { logger } from '../../utils/logger';
import { MCPServer, MCPRequest, MCPResponse, createMCPResponse, JsonValue } from '../types';

export class AnthropicMCPServer implements MCPServer {
  name = 'anthropic-mcp';
  version = '1.0.0';

  private anthropic: Anthropic | null = null;
  private initialized = false;

  // System prompt para raciocínio complexo maternal
  private readonly deepThinkingSystemPrompt = `
Você é a NathIA, uma assistente especializada em apoio maternal com CAPACIDADE DE RACIOCÍNIO PROFUNDO.

CONTEXTO:
- Você está lidando com situações maternas complexas que requerem análise multidimensional
- Suas respostas devem considerar múltiplos aspectos: emocional, prático, relacional, cultural
- Você oferece perspectivas nuanceadas, não respostas simplistas

ABORDAGEM DE RACIOCÍNIO:
1. COMPREENSÃO PROFUNDA
   - Identifique camadas ocultas da situação
   - Considere fatores contextuais (cultura, classe social, rede de apoio)
   - Reconheça dilemas e contradições reais

2. PENSAMENTO SISTÊMICO
   - Como diferentes aspectos da vida maternal se interconectam?
   - Quais são as causas raiz vs sintomas?
   - Que padrões podem estar se repetindo?

3. VALIDAÇÃO MULTIDIMENSIONAL
   - Valide TODOS os sentimentos conflitantes
   - Normalize a complexidade da maternidade
   - Evite dicotomias simples (certo/errado, bom/mau)

4. ORIENTAÇÃO PRÁTICA E REALISTA
   - Sugira pequenos passos concretos
   - Considere limitações reais (tempo, energia, recursos)
   - Ofereça alternativas quando o "ideal" não é viável

DIRETRIZES:
1. Valide antes de orientar
2. Normalize dificuldades sem minimizar o sofrimento
3. Ofereça perspectiva sem impor soluções
4. Encoraje autonomia e autoconhecimento
5. Respeite diferentes escolhas e valores maternos
6. Identifique quando a situação requer apoio profissional

LIMITAÇÕES:
- NÃO diagnostique transtornos mentais
- NÃO prescreva tratamentos médicos
- NÃO substitua terapia ou psiquiatria
- Encaminhe para profissionais quando apropriado

TOM:
- Empático mas não condescendente
- Profundo mas acessível
- Honesto sobre complexidades da maternidade
`;

  async initialize(): Promise<void> {
    try {
      const apiKey = process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY;

      if (!apiKey) {
        logger.warn(
          '[AnthropicMCP] Anthropic API key not configured - server will not be available'
        );
        return; // Não jogar erro, apenas não inicializar
      }

      this.anthropic = new Anthropic({
        apiKey,
        dangerouslyAllowBrowser: true, // Necessário para React Native
      });

      this.initialized = true;
      logger.info('[AnthropicMCP] Initialized successfully');
    } catch (error) {
      logger.error('[AnthropicMCP] Initialization failed', error);
      throw error;
    }
  }

  async handleRequest<T = JsonValue>(request: MCPRequest): Promise<MCPResponse<T>> {
    if (!this.initialized || !this.anthropic) {
      return createMCPResponse(request.id, null, {
        code: 'NOT_INITIALIZED',
        message: 'Anthropic MCP Server not initialized (API key missing)',
      }) as MCPResponse<T>;
    }

    try {
      const [category, action] = request.method.split('.');

      switch (category) {
        case 'chat':
          return (await this.handleChat(request.id, action, request.params)) as MCPResponse<T>;
        case 'analyze':
          return (await this.handleAnalyze(request.id, action, request.params)) as MCPResponse<T>;
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
    if (!this.anthropic) throw new Error('Anthropic not initialized');

    switch (action) {
      case 'send':
      case 'deep_think': {
        // Alias para raciocínio profundo
        const {
          message,
          context,
          history,
          model = 'claude-opus-4-20250514',
        } = params as {
          message: string;
          context?: Record<string, unknown>;
          history?: Array<{ role: string; parts: Array<{ text: string }> }>;
          model?: string;
        };

        // Construir contexto enriquecido
        const userMessage = context
          ? (() => {
              const {
                name,
                lifeStage,
                emotion,
                timeline,
                challenges,
                supportNetwork,
                complexityLevel,
              } = context as {
                name?: string;
                lifeStage?: string;
                emotion?: string;
                timeline?: string;
                challenges?: string[];
                supportNetwork?: string;
                complexityLevel?: 'low' | 'medium' | 'high';
              };

              return `
CONTEXTO DETALHADO DA USUÁRIA:
- Nome: ${name || 'mãe'}
- Fase: ${lifeStage || 'não especificada'}
- Timeline: ${timeline || 'não especificada'}
- Emoção atual: ${emotion || 'não especificada'}
- Desafios: ${challenges?.join(', ') || 'não especificados'}
- Rede de apoio: ${supportNetwork || 'não especificada'}
${complexityLevel ? `- Nível de complexidade: ${complexityLevel}` : ''}

SITUAÇÃO: ${message}
`;
            })()
          : message;

        // Converter histórico de Gemini para Anthropic
        const messages: MessageParam[] = [];

        if (history && history.length > 0) {
          for (const msg of history) {
            messages.push({
              role: msg.role === 'model' ? 'assistant' : 'user',
              content: msg.parts.map((p) => p.text).join('\n'),
            });
          }
        }

        messages.push({ role: 'user', content: userMessage });

        // Chamar Anthropic
        const response = await this.anthropic.messages.create({
          model,
          max_tokens: 4096, // Claude permite muito mais contexto
          temperature: 0.9,
          system: this.deepThinkingSystemPrompt,
          messages,
        });

        const textContent = response.content.find((c) => c.type === 'text');
        const responseText = textContent?.type === 'text' ? textContent.text : '';

        return createMCPResponse(id, {
          message: responseText,
          context: context as JsonValue,
          timestamp: Date.now(),
          usage: {
            inputTokens: response.usage.input_tokens,
            outputTokens: response.usage.output_tokens,
            totalTokens: response.usage.input_tokens + response.usage.output_tokens,
          },
          model: response.model,
          stopReason: response.stop_reason,
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
    if (!this.anthropic) throw new Error('Anthropic not initialized');

    switch (action) {
      case 'patterns': {
        const { texts, type = 'general' } = params as {
          texts: string[];
          type?: 'emotional' | 'behavioral' | 'relational' | 'general';
        };

        const prompt = `
Analise os seguintes trechos de conversas de uma mãe e identifique PADRÕES recorrentes.

Tipo de análise: ${type}

Textos:
${texts.map((t, i) => `${i + 1}. "${t}"`).join('\n')}

Retorne um JSON com:
- patterns: array de padrões identificados (descrição do padrão)
- frequency: para cada padrão, estimativa de frequência (low/medium/high)
- insights: insights sobre o que esses padrões podem indicar
- recommendations: sugestões de apoio baseadas nos padrões

Retorne APENAS o JSON.
`;

        const response = await this.anthropic.messages.create({
          model: 'claude-opus-4-20250514',
          max_tokens: 2048,
          temperature: 0.7,
          system:
            'Você é um assistente especializado em análise de padrões comportamentais e emocionais maternais.',
          messages: [{ role: 'user', content: prompt }],
        });

        const textContent = response.content.find((c) => c.type === 'text');
        const responseText = textContent?.type === 'text' ? textContent.text : '{}';

        try {
          // Extrair JSON da resposta
          const jsonMatch = responseText.match(/\{[\s\S]*\}/);
          const analysis = jsonMatch ? JSON.parse(jsonMatch[0]) : {};
          return createMCPResponse(id, analysis);
        } catch {
          return createMCPResponse(id, { raw: responseText });
        }
      }

      default:
        return createMCPResponse(id, null, {
          code: 'UNKNOWN_ACTION',
          message: `Unknown analyze action: ${action}`,
        });
    }
  }

  async shutdown(): Promise<void> {
    this.anthropic = null;
    this.initialized = false;
    logger.info('[AnthropicMCP] Shutdown complete');
  }
}

// Singleton instance
export const anthropicMCP = new AnthropicMCPServer();
