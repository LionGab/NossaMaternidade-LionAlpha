/**
 * Testes para filtros no ContentRecommendationAgent
 *
 * Regras de negócio testadas:
 * - tags: trim, remove strings vazias, lista vazia = sem filtro
 * - types e categories: comportamento preservado
 * - Itens sem tags não quebram o filtro
 */

import {
  ContentRecommendationAgent,
  ContentItem,
  RecommendationRequest,
} from '../../src/agents/content/ContentRecommendationAgent';

// Mock do logger
jest.mock('../../src/utils/logger', () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

// Mock do orchestrator
jest.mock('../../src/agents/core/AgentOrchestrator', () => ({
  orchestrator: {
    callMCP: jest.fn().mockResolvedValue({ success: false }),
  },
}));

describe('ContentRecommendationAgent - Filtros', () => {
  let agent: ContentRecommendationAgent;

  // Helper para criar content item
  const createContent = (
    id: string,
    type: 'video' | 'audio' | 'reel' | 'text' | 'article',
    category: string,
    tags: string[]
  ): ContentItem => ({
    id,
    type,
    title: `Conteúdo ${id}`,
    category,
    tags,
  });

  // Pool de conteúdo para testes
  const contentPool: ContentItem[] = [
    createContent('1', 'video', 'saúde', ['sono', 'bem-estar']),
    createContent('2', 'audio', 'maternidade', ['amamentação', 'bebê']),
    createContent('3', 'text', 'saúde', ['alimentação']),
    createContent('4', 'reel', 'lifestyle', ['autocuidado', 'bem-estar']),
    createContent('5', 'article', 'saúde', []), // Sem tags
  ];

  // Conteúdo com tags undefined
  const contentWithUndefinedTags: ContentItem = {
    id: '6',
    type: 'video',
    title: 'Conteúdo sem tags',
    category: 'saúde',
    tags: undefined as unknown as string[], // Simula item com tags undefined
  };

  const baseRequest: RecommendationRequest = {
    userId: 'user-1',
    userProfile: {
      lifeStage: 'new-mother',
    },
    contentPool,
    maxResults: 10,
  };

  beforeEach(() => {
    agent = new ContentRecommendationAgent();
  });

  describe('Normalização de tags', () => {
    it('deve_tratar_lista_vazia_de_tags_como_sem_filtro', async () => {
      const result = await agent.process({
        ...baseRequest,
        filters: {
          tags: [], // Lista vazia
        },
      });

      // Deve retornar todos os itens (sem filtro de tags)
      expect(result.recommendations.length).toBeGreaterThan(0);
    });

    it('deve_normalizar_tags_com_trim_e_remover_vazias', async () => {
      const result = await agent.process({
        ...baseRequest,
        filters: {
          tags: ['  sono  ', '', '   ', 'bem-estar'], // Tags com espaços e vazias
        },
      });

      // Deve filtrar por 'sono' e 'bem-estar' após normalização
      const recommendedIds = result.recommendations.map((r) => r.id);

      // Items 1 e 4 têm 'sono' ou 'bem-estar'
      expect(recommendedIds).toContain('1');
      expect(recommendedIds).toContain('4');
    });

    it('deve_ignorar_filtro_de_tags_quando_todas_forem_vazias_ou_espacos', async () => {
      const result = await agent.process({
        ...baseRequest,
        filters: {
          tags: ['', '   ', '  '], // Todas vazias
        },
      });

      // Deve retornar todos os itens (sem filtro efetivo)
      expect(result.recommendations.length).toBeGreaterThan(0);
    });
  });

  describe('Itens sem tags', () => {
    it('deve_manter_item_sem_tags_quando_nao_houver_filtro_de_tags', async () => {
      const result = await agent.process({
        ...baseRequest,
        filters: {
          categories: ['saúde'], // Filtro apenas por categoria
        },
      });

      const recommendedIds = result.recommendations.map((r) => r.id);

      // Item 5 não tem tags mas deve aparecer (categoria 'saúde')
      expect(recommendedIds).toContain('5');
    });

    it('deve_excluir_item_sem_tags_quando_houver_filtro_de_tags_ativo', async () => {
      const result = await agent.process({
        ...baseRequest,
        filters: {
          tags: ['sono'],
        },
      });

      const recommendedIds = result.recommendations.map((r) => r.id);

      // Item 5 não tem tags e não deve aparecer (filtro de tags ativo)
      expect(recommendedIds).not.toContain('5');
    });

    it('nao_deve_quebrar_quando_item_tem_tags_undefined', async () => {
      const poolWithUndefined = [...contentPool, contentWithUndefinedTags];

      const result = await agent.process({
        ...baseRequest,
        contentPool: poolWithUndefined,
        filters: {
          tags: ['sono'],
        },
      });

      // Não deve lançar erro
      expect(result.recommendations).toBeDefined();
    });
  });

  describe('Filtros de types e categories', () => {
    it('deve_filtrar_por_type_corretamente', async () => {
      const result = await agent.process({
        ...baseRequest,
        filters: {
          types: ['video', 'audio'],
        },
      });

      const recommendedTypes = result.recommendations.map((r) => r.type);

      // Deve ter apenas videos e audios
      recommendedTypes.forEach((type) => {
        expect(['video', 'audio']).toContain(type);
      });
    });

    it('deve_filtrar_por_category_corretamente', async () => {
      const result = await agent.process({
        ...baseRequest,
        filters: {
          categories: ['saúde'],
        },
      });

      const recommendedCategories = result.recommendations.map((r) => r.category);

      // Todos devem ser da categoria 'saúde'
      recommendedCategories.forEach((cat) => {
        expect(cat).toBe('saúde');
      });
    });

    it('deve_combinar_filtros_de_type_category_e_tags', async () => {
      const result = await agent.process({
        ...baseRequest,
        filters: {
          types: ['video'],
          categories: ['saúde'],
          tags: ['sono'],
        },
      });

      const recommendedIds = result.recommendations.map((r) => r.id);

      // Apenas item 1 atende todos os critérios
      expect(recommendedIds).toContain('1');
      expect(recommendedIds).not.toContain('2');
      expect(recommendedIds).not.toContain('3');
    });
  });

  describe('Sem filtros', () => {
    it('deve_retornar_todos_items_quando_filters_for_undefined', async () => {
      const result = await agent.process({
        ...baseRequest,
        filters: undefined,
      });

      // Deve retornar recomendações (pode ser limitado por maxResults)
      expect(result.recommendations.length).toBeGreaterThan(0);
    });

    it('deve_retornar_todos_items_quando_filters_for_objeto_vazio', async () => {
      const result = await agent.process({
        ...baseRequest,
        filters: {},
      });

      // Deve retornar recomendações
      expect(result.recommendations.length).toBeGreaterThan(0);
    });
  });
});

