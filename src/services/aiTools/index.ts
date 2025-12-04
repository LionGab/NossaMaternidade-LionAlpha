/**
 * Barrel file - exporta todas as tools e executor
 * Import único: import { NATHIA_TOOLS, aiToolExecutor } from '@/services/aiTools'
 */

export { NATHIA_TOOLS, TOOL_DESCRIPTIONS } from './toolDefinitions';
export { aiToolExecutor } from './toolExecutor';
export { AIToolExecutor } from './toolExecutor';

// Export type for tool execution result
export type { AIToolResult } from '@/types/ai';
