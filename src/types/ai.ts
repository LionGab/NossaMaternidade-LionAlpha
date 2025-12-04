/**
 * Tipos relacionados ao sistema de IA e Tool Calling
 * Fase 1 - MVP Básico
 */

export type AIModel =
  | 'gemini-1.5-flash'
  | 'gemini-1.5-pro'
  | 'gpt-4o'
  | 'gpt-4-turbo'
  | 'claude-opus'
  | 'claude-sonnet';

export type AIMode =
  | 'rapido' // Gemini Flash - respostas rápidas
  | 'equilibrado' // Gemini Pro - padrão
  | 'pensar' // Claude Opus - análise profunda
  | 'pesquisar'; // GPT-4 com busca

export interface AITool {
  name: string;
  description: string;
  parameters: {
    type: 'object';
    properties: Record<
      string,
      {
        type: string;
        description: string;
        required?: boolean;
      }
    >;
    required?: string[];
  };
}

export interface AIToolCall {
  name: string;
  parameters: Record<string, unknown>;
}

export interface AIToolResult {
  success: boolean;
  data?: unknown;
  error?: string;
  message?: string;
}

export interface AIContext {
  user_id: string;
  name?: string;
  phase?: string;
  pregnancy_week?: number;
  recent_emotions?: string[];
  current_habits?: string[];
}

export interface ChatAIResponse {
  success: boolean;
  message: string;
  model_used?: AIModel;
  tokens_used?: number;
  response_time_ms?: number;
  tool_call?: AIToolCall;
  contains_crisis?: boolean;
  error?: string;
}
