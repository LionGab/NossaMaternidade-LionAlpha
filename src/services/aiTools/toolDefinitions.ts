/**
 * Definições de Tools para NathIA
 * Tools que a IA pode chamar automaticamente para acessar dados da usuária
 */

import type { AITool } from '@/types/ai';

/**
 * Tools disponíveis para a NathIA
 * Seguindo formato Gemini Function Calling
 */
export const NATHIA_TOOLS: AITool[] = [
  {
    name: 'check_pregnancy_week',
    description:
      'Verifica em qual semana de gestação a usuária está baseado no perfil dela. Use quando a usuária perguntar sobre gestação, semanas, trimestre ou desenvolvimento do bebê.',
    parameters: {
      type: 'object',
      properties: {},
      required: [],
    },
  },
  {
    name: 'get_emotion_history',
    description:
      'Busca o histórico de emoções dos últimos dias para análise de padrões. Use quando a usuária mencionar sentimentos, quando quiser entender o estado emocional dela, ou quando detectar necessidade de apoio.',
    parameters: {
      type: 'object',
      properties: {
        days: {
          type: 'number',
          description: 'Número de dias para buscar (padrão: 7)',
        },
      },
      required: [],
    },
  },
  {
    name: 'search_content',
    description:
      'Busca conteúdo relevante no MundoNath baseado em palavras-chave. Use quando a usuária pedir informações, dicas, artigos ou quando quiser recomendar conteúdo educativo.',
    parameters: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Termo de busca (ex: "amamentação", "sono do bebê", "ansiedade")',
        },
        category: {
          type: 'string',
          description:
            'Categoria opcional: gestacao, pos_parto, amamentacao, sono, desenvolvimento, nutricao, saude_mental, autocuidado, relacionamento',
        },
      },
      required: ['query'],
    },
  },
  {
    name: 'get_habits_status',
    description:
      'Verifica quais hábitos a usuária completou hoje. Use quando a usuária perguntar sobre hábitos, rotina ou quando quiser motivar sobre autocuidado.',
    parameters: {
      type: 'object',
      properties: {
        date: {
          type: 'string',
          description: 'Data no formato YYYY-MM-DD (padrão: hoje)',
        },
      },
      required: [],
    },
  },
  {
    name: 'detect_crisis',
    description:
      'Analisa mensagem para detectar sinais de crise emocional ou risco. Use SEMPRE que detectar palavras ou frases preocupantes na mensagem da usuária.',
    parameters: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          description: 'Texto da mensagem da usuária para análise',
        },
      },
      required: ['message'],
    },
  },
  {
    name: 'recommend_professional',
    description:
      'Sugere buscar ajuda profissional quando necessário. Use quando detectar crise, quando a usuária pedir ajuda profissional, ou quando o padrão emocional indicar necessidade.',
    parameters: {
      type: 'object',
      properties: {
        reason: {
          type: 'string',
          description:
            'Motivo da recomendação (ex: "crise_detectada", "padrao_negativo", "solicitacao_usuario")',
        },
      },
      required: ['reason'],
    },
  },
];

/**
 * Mapeia nome da tool para descrição amigável
 */
export const TOOL_DESCRIPTIONS: Record<string, string> = {
  check_pregnancy_week: 'Verificando informações da sua gestação...',
  get_emotion_history: 'Analisando seu histórico emocional...',
  search_content: 'Buscando conteúdo relevante para você...',
  get_habits_status: 'Verificando seus hábitos de hoje...',
  detect_crisis: 'Analisando sua mensagem com cuidado...',
  recommend_professional: 'Preparando recomendações de apoio profissional...',
};
