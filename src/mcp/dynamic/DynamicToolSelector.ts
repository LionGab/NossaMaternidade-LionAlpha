/**
 * Dynamic Tool Selector
 *
 * Seleciona apenas as tools necessárias baseado no contexto da requisição.
 * Implementa o conceito de "Dynamic Tool Selection" do Docker MCP.
 *
 * Benefícios:
 * - Reduz tokens no context window (~85% economia)
 * - Carrega apenas tools relevantes
 * - Melhora performance do agente
 */

import { ToolDefinition } from './DockerDynamicMCPGateway';
import { logger } from '../../utils/logger';

export interface ToolSelectionContext {
  /** Mensagem do usuário ou query */
  query: string;
  /** Tipo de tarefa (ex: 'search', 'create', 'analyze') */
  taskType?: string;
  /** Tools já usadas nesta sessão */
  usedTools?: string[];
  /** Limite de tools a selecionar */
  maxTools?: number;
  /** Tags relevantes */
  relevantTags?: string[];
}

export interface ToolSelectionResult {
  /** Tools selecionadas */
  selectedTools: ToolDefinition[];
  /** Tools descartadas */
  discardedTools: string[];
  /** Razão da seleção */
  reasoning: string;
  /** Economia estimada de tokens */
  tokenSavings: number;
}

/**
 * Dynamic Tool Selector
 *
 * Seleciona tools dinamicamente baseado no contexto
 */
export class DynamicToolSelector {
  private static instance: DynamicToolSelector;
  private toolUsageStats: Map<string, number> = new Map();

  private constructor() {
    // Singleton
  }

  static getInstance(): DynamicToolSelector {
    if (!DynamicToolSelector.instance) {
      DynamicToolSelector.instance = new DynamicToolSelector();
    }
    return DynamicToolSelector.instance;
  }

  /**
   * Seleciona tools relevantes baseado no contexto
   */
  selectTools(
    availableTools: ToolDefinition[],
    context: ToolSelectionContext
  ): ToolSelectionResult {
    const query = context.query.toLowerCase();
    const maxTools = context.maxTools || 10; // Limite padrão
    const relevantTags = context.relevantTags || [];

    logger.debug('[DynamicToolSelector] Selecting tools', {
      availableTools: availableTools.length,
      query: context.query.substring(0, 50),
      maxTools,
    });

    // Score cada tool baseado na relevância
    const scoredTools = availableTools.map((tool) => ({
      tool,
      score: this.calculateRelevanceScore(tool, query, relevantTags, context),
    }));

    // Ordenar por score (maior primeiro)
    scoredTools.sort((a, b) => b.score - a.score);

    // Selecionar top N tools
    const selected = scoredTools
      .slice(0, maxTools)
      .filter((item) => item.score > 0) // Apenas tools com score > 0
      .map((item) => item.tool);

    const discarded = scoredTools.slice(maxTools).map((item) => item.tool.name);

    // Calcular economia de tokens
    const tokenSavings = this.calculateTokenSavings(availableTools.length, selected.length);

    // Gerar reasoning
    const reasoning = this.generateReasoning(selected, discarded, query);

    logger.info('[DynamicToolSelector] Tools selected', {
      selected: selected.length,
      discarded: discarded.length,
      tokenSavings: `${tokenSavings}%`,
    });

    return {
      selectedTools: selected,
      discardedTools: discarded,
      reasoning,
      tokenSavings,
    };
  }

  /**
   * Calcula score de relevância de uma tool
   */
  private calculateRelevanceScore(
    tool: ToolDefinition,
    query: string,
    relevantTags: string[],
    context: ToolSelectionContext
  ): number {
    let score = 0;

    // 1. Match no nome da tool (peso alto)
    if (tool.name.toLowerCase().includes(query)) {
      score += 50;
    }

    // 2. Match na descrição (peso médio)
    const descriptionLower = tool.description.toLowerCase();
    const queryWords = query.split(/\s+/);
    for (const word of queryWords) {
      if (descriptionLower.includes(word)) {
        score += 10;
      }
    }

    // 3. Match no nome do servidor (peso baixo)
    if (tool.server.toLowerCase().includes(query)) {
      score += 5;
    }

    // 4. Tags relevantes (peso médio)
    // Assumindo que tools têm tags implícitas baseadas no nome/servidor
    const toolTags = this.inferToolTags(tool);
    for (const tag of relevantTags) {
      if (toolTags.includes(tag.toLowerCase())) {
        score += 15;
      }
    }

    // 5. Uso histórico (peso baixo)
    const usageCount = this.toolUsageStats.get(tool.name) || 0;
    score += Math.min(usageCount, 10); // Cap em 10

    // 6. Task type matching
    if (context.taskType) {
      const taskTypeLower = context.taskType.toLowerCase();
      if (tool.name.includes(taskTypeLower) || descriptionLower.includes(taskTypeLower)) {
        score += 20;
      }
    }

    // 7. Tools já usadas (preferir continuar usando)
    if (context.usedTools?.includes(tool.name)) {
      score += 5;
    }

    return score;
  }

  /**
   * Infere tags de uma tool baseado no nome e servidor
   */
  private inferToolTags(tool: ToolDefinition): string[] {
    const tags: string[] = [];
    const nameLower = tool.name.toLowerCase();
    const serverLower = tool.server.toLowerCase();

    // Tags baseadas no servidor
    tags.push(serverLower);

    // Tags baseadas no nome da tool
    if (nameLower.includes('search')) tags.push('search');
    if (nameLower.includes('get') || nameLower.includes('fetch')) tags.push('read');
    if (nameLower.includes('create') || nameLower.includes('add')) tags.push('write');
    if (nameLower.includes('update') || nameLower.includes('edit')) tags.push('write');
    if (nameLower.includes('delete') || nameLower.includes('remove')) tags.push('delete');
    if (nameLower.includes('browser')) tags.push('browser');
    if (nameLower.includes('repo') || nameLower.includes('repository')) tags.push('git');
    if (nameLower.includes('query') || nameLower.includes('sql')) tags.push('database');

    return tags;
  }

  /**
   * Calcula economia estimada de tokens
   */
  private calculateTokenSavings(totalTools: number, selectedTools: number): number {
    if (totalTools === 0) return 0;

    // Estimativa: cada tool definition consome ~100-200 tokens
    // Economia = (tools não selecionadas / total) * 100
    const discarded = totalTools - selectedTools;
    const savings = Math.round((discarded / totalTools) * 100);

    return Math.min(savings, 95); // Cap em 95%
  }

  /**
   * Gera reasoning para a seleção
   */
  private generateReasoning(
    selected: ToolDefinition[],
    discarded: string[],
    query: string
  ): string {
    const selectedNames = selected.map((t) => t.name).join(', ');
    const discardedCount = discarded.length;

    return `Selected ${selected.length} tools (${selectedNames}) based on query "${query.substring(0, 50)}". Discarded ${discardedCount} irrelevant tools to optimize context window.`;
  }

  /**
   * Registra uso de uma tool (para melhorar seleção futura)
   */
  recordToolUsage(toolName: string): void {
    const current = this.toolUsageStats.get(toolName) || 0;
    this.toolUsageStats.set(toolName, current + 1);
  }

  /**
   * Obtém estatísticas de uso
   */
  getUsageStats(): Map<string, number> {
    return new Map(this.toolUsageStats);
  }

  /**
   * Limpa estatísticas
   */
  clearStats(): void {
    this.toolUsageStats.clear();
  }
}

// Singleton export
export const dynamicToolSelector = DynamicToolSelector.getInstance();
