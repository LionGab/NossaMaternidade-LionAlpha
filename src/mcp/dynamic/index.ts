/**
 * Dynamic MCP Module
 *
 * Exporta todos os componentes do Dynamic MCP system:
 * - DockerDynamicMCPGateway: Integração com Docker MCP Gateway
 * - DynamicToolSelector: Seleção dinâmica de tools
 * - CodeModeExecutor: Execução de código em sandbox
 * - StatePersistenceManager: Persistência de estado
 */

export {
  DockerDynamicMCPGateway,
  dockerDynamicMCPGateway,
  type MCPServerInfo,
  type ToolDefinition,
  type CatalogSearchResult,
} from './DockerDynamicMCPGateway';

export {
  DynamicToolSelector,
  dynamicToolSelector,
  type ToolSelectionContext,
  type ToolSelectionResult,
} from './DynamicToolSelector';

export {
  CodeModeExecutor,
  codeModeExecutor,
  type CodeModeTool,
  type CodeExecutionResult,
  type SandboxConfig,
} from './CodeModeExecutor';

export {
  StatePersistenceManager,
  statePersistenceManager,
  type VolumeConfig,
  type PersistedState,
} from './StatePersistenceManager';

export {
  DynamicMCPIntegration,
  dynamicMCPIntegration,
  type DynamicMCPOptions,
  type DynamicMCPResult,
} from './DynamicMCPIntegration';
