/**
 * MCP Servers Export
 * Exportações centralizadas de todos os servidores MCP
 */

export { SupabaseMCPServer, supabaseMCP } from './SupabaseMCPServer';
export { GoogleAIMCPServer, googleAIMCP } from './GoogleAIMCPServer';
export { OpenAIMCPServer, openAIMCP } from './OpenAIMCPServer';
export { AnthropicMCPServer, anthropicMCP } from './AnthropicMCPServer';
export { AnalyticsMCPServer, analyticsMCP } from './AnalyticsMCPServer';
// Servidores MCP que usam módulos Node.js (fs, path) não são exportados aqui
// porque não estão disponíveis no React Native. Estes servidores devem ser usados
// apenas em scripts de build, CI/CD ou Edge Functions.
// Para usar, importe diretamente:
// import { DesignTokensValidationMCPServer } from './DesignTokensValidationMCPServer';
// import { CodeQualityMCPServer } from './CodeQualityMCPServer';
// import { AccessibilityMCPServer } from './AccessibilityMCPServer';
// MobileOptimizationMCPServer não é exportado aqui porque usa módulos Node.js (fs, path)
// que não estão disponíveis no React Native. Este servidor deve ser usado apenas em
// scripts de build ou Edge Functions. Para usar, importe diretamente:
// import { MobileOptimizationMCPServer } from './MobileOptimizationMCPServer';
// PromptTestingMCPServer não é exportado aqui porque usa módulos Node.js
// Para usar, importe diretamente: import { PromptTestingMCPServer } from './PromptTestingMCPServer';

// Re-export types
export type {
  MCPServer,
  MCPRequest,
  MCPResponse,
  MCPError,
  MCPMethod,
  SupabaseMCPMethods,
  GoogleAIMCPMethods,
  AnalyticsMCPMethods,
  // DesignTokensValidationMCPMethods,
  // CodeQualityMCPMethods,
  // AccessibilityMCPMethods,
  // MobileOptimizationMCPMethods,
  // PromptTestingMCPMethods,
} from '../types';

export { createMCPRequest, createMCPResponse } from '../types';
