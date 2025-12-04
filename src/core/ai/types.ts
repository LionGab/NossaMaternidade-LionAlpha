/**
 * AI Gateway Types
 *
 * Tipos compartilhados para o sistema de AI Gateway multi-provider
 */

export type AIProvider = 'gemini' | 'claude' | 'openai';

export interface AIMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface AIResponse {
  content: string;
  provider: AIProvider;
  model: string;
  tokens?: {
    prompt: number;
    completion: number;
    total: number;
  };
  latency: number; // milliseconds
  finishReason?: string;
}

export interface AIConfig {
  provider: AIProvider;
  model: string;
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
}

export interface AIProviderConfig {
  apiKey: string;
  baseURL?: string;
  timeout?: number;
  maxRetries?: number;
}

export interface AIError {
  provider: AIProvider;
  message: string;
  code?: string;
  statusCode?: number;
  originalError?: unknown;
}

export type AIProviderFunction = (messages: AIMessage[], config: AIConfig) => Promise<AIResponse>;
