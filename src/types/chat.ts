/**
 * Tipos do sistema de chat NathIA
 */

export type MessageRole = 'user' | 'assistant' | 'system';

export type AIModel =
  | 'gemini-pro'
  | 'gemini-flash'
  | 'gpt-4o'
  | 'gpt-4-turbo'
  | 'claude-opus'
  | 'claude-sonnet';

export type AIMode =
  | 'rapido' // Gemini Flash - respostas rápidas
  | 'equilibrado' // Gemini Pro - padrão
  | 'pensar' // Claude Opus - análise profunda
  | 'pesquisar'; // GPT-4 com busca

export interface ChatMessage {
  id: string;
  chat_id: string;
  user_id: string;
  role: MessageRole;
  content: string;

  // Metadados da IA
  model_used?: AIModel;
  ai_mode?: AIMode;
  tokens_used?: number;
  response_time_ms?: number;

  // Flags de segurança
  contains_crisis_keywords?: boolean;
  moderation_flagged?: boolean;
  moderation_reason?: string;

  // Timestamps
  created_at: string;
  edited_at?: string;
}

export interface Chat {
  id: string;
  user_id: string;
  title?: string;
  last_message?: string;
  last_message_at?: string;
  message_count: number;
  created_at: string;
  updated_at: string;
}

export interface ChatConfig {
  model: AIModel;
  mode: AIMode;
  temperature?: number;
  max_tokens?: number;
  system_prompt?: string;
}

// Resposta da Edge Function
export interface ChatAIResponse {
  success: boolean;
  message: string;
  model_used: AIModel;
  tokens_used: number;
  response_time_ms: number;
  contains_crisis?: boolean;
  error?: string;
}
