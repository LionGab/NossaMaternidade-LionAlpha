/**
 * MCP (Model Context Protocol) Types
 * Define interfaces para comunicação entre agentes e serviços externos
 */

// Tipos base para dados genéricos
export type JsonPrimitive = string | number | boolean | null;
export type JsonObject = { [key: string]: JsonValue };
export type JsonArray = JsonValue[];
export type JsonValue = JsonPrimitive | JsonObject | JsonArray;

// Metadata do usuário (usado em auth.signUp)
export interface UserMetadata {
  name?: string | null;
  avatar_url?: string | null;
  [key: string]: JsonValue | undefined;
}

// Query builder para Supabase
export interface SupabaseQuery {
  select?: string | null;
  filter?: Record<string, JsonValue> | null;
  order?: { column: string; ascending?: boolean } | null;
  limit?: number | null;
  offset?: number | null;
  [key: string]: JsonValue | undefined;
}

// File para upload
export interface UploadFile {
  uri: string;
  name: string;
  type: string;
  size?: number | null;
  [key: string]: JsonValue | undefined;
}

// Contexto para IA
export interface AIContext {
  userId?: string | null;
  sessionId?: string | null;
  metadata?: Record<string, JsonValue> | null;
  [key: string]: JsonValue | undefined;
}

// Histórico de mensagens
export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: number | null;
  metadata?: Record<string, JsonValue> | null;
  [key: string]: JsonValue | undefined;
}

// Propriedades de analytics
export interface AnalyticsProperties {
  [key: string]: JsonValue;
}

// User traits para identificação
export interface UserTraits {
  name?: string | null;
  email?: string | null;
  [key: string]: JsonValue | undefined;
}

export interface MCPRequest<T = Record<string, JsonValue>> {
  id: string;
  method: string;
  params: T;
  timestamp: number;
}

export interface MCPResponse<T = JsonValue> {
  id: string;
  success: boolean;
  data?: T;
  error?: MCPError;
  timestamp: number;
}

export interface MCPError {
  code: string;
  message: string;
  details?: Record<string, JsonValue>;
}

export interface MCPServer {
  name: string;
  version: string;
  initialize(): Promise<void>;
  handleRequest<T = JsonValue>(request: MCPRequest): Promise<MCPResponse<T>>;
  shutdown(): Promise<void>;
}

// Tipos específicos para Supabase MCP
export interface SupabaseMCPMethods {
  'auth.signIn': { email: string; password: string };
  'auth.signUp': { email: string; password: string; metadata?: UserMetadata };
  'auth.signOut': Record<string, never>;
  'db.query': { table: string; query: SupabaseQuery };
  'db.insert': { table: string; data: Record<string, JsonValue> };
  'db.update': { table: string; id: string; data: Record<string, JsonValue> };
  'db.delete': { table: string; id: string };
  'storage.upload': { bucket: string; path: string; file: UploadFile };
  'storage.download': { bucket: string; path: string };
  'storage.delete': { bucket: string; path: string };
}

// Tipos específicos para Google AI MCP
export interface GoogleAIMCPMethods {
  'chat.send': { message: string; context?: AIContext; history?: ChatMessage[] };
  'chat.stream': { message: string; context?: AIContext };
  'analyze.emotion': { text: string };
  'analyze.sentiment': { text: string };
  'generate.content': { prompt: string; context?: AIContext };
  'summarize.text': { text: string; maxLength?: number };
}

// Tipos específicos para Analytics MCP
export interface AnalyticsMCPMethods {
  'event.track': { name: string; properties?: AnalyticsProperties };
  'screen.view': { name: string; properties?: AnalyticsProperties };
  'user.identify': { userId: string; traits?: UserTraits };
  'user.alias': { previousId: string; userId: string };
}

// Tipos específicos para Design Tokens Validation MCP
export interface DesignTokensValidationMCPMethods {
  'design.validate.tokens': { filePath?: string };
  'design.validate.screen': { screenPath: string };
  'design.suggest.fix': { violation: Record<string, unknown> };
  'design.check.darkmode': { filePath: string };
}

// Tipos específicos para Code Quality MCP
export interface CodeQualityMCPMethods {
  'code.analyze.design': { filePath: string };
  'code.find.hardcoded': {
    pattern: 'colors' | 'spacing' | 'typography' | 'dimension';
    filePath?: string;
  };
  'code.refactor.suggest': { filePath: string; violations: Array<Record<string, unknown>> };
}

// Tipos específicos para Accessibility MCP
export interface AccessibilityMCPMethods {
  'a11y.check.contrast': { foreground: string; background: string };
  'a11y.check.touchTargets': { componentPath: string };
  'a11y.check.labels': { screenPath: string };
  'a11y.audit.screen': { screenPath: string };
}

// Tipos específicos para Mobile Optimization MCP
export interface MobileOptimizationMCPMethods {
  'mobile.check.flatlist': { filePath: string };
  'mobile.check.memo': { filePath: string };
  'mobile.check.images': { filePath: string };
  'mobile.analyze.bundle': { filePath: string };
  'mobile.check.queries': { filePath: string };
  'mobile.analyze.all': { filePath?: string };
}

// Tipos específicos para Prompt Testing MCP
export interface PromptTestingMCPMethods {
  'prompt.validate.safety': { promptPath: string };
  'prompt.validate.clarity': { promptPath: string };
  'prompt.test.tokens': { promptPath: string; provider?: 'gemini' | 'openai' | 'anthropic' };
  'prompt.test.crisis': { promptPath: string };
  'prompt.validate.fallback': { promptPath: string };
  'prompt.validate.all': { promptPath: string; provider?: 'gemini' | 'openai' | 'anthropic' };
}

// Union de todos os methods
export type AllMCPMethods = SupabaseMCPMethods &
  GoogleAIMCPMethods &
  AnalyticsMCPMethods &
  DesignTokensValidationMCPMethods &
  CodeQualityMCPMethods &
  AccessibilityMCPMethods &
  MobileOptimizationMCPMethods &
  PromptTestingMCPMethods;

// Union type de todos os métodos
export type MCPMethod = keyof AllMCPMethods;

// Helper type para extrair params de um método
export type MCPMethodParams<T extends MCPMethod> = AllMCPMethods[T];

// Helper para criar requests
export function createMCPRequest<T extends MCPMethod>(
  method: T,
  params: MCPMethodParams<T>
): MCPRequest<MCPMethodParams<T>> {
  return {
    id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    method,
    params,
    timestamp: Date.now(),
  };
}

// Helper para criar responses
export function createMCPResponse<T = JsonValue>(
  id: string,
  data?: T,
  error?: MCPError
): MCPResponse<T> {
  return {
    id,
    success: !error,
    data,
    error,
    timestamp: Date.now(),
  };
}
