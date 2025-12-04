/* eslint-disable no-console */
/**
 * Dynamic MCP Examples
 *
 * Exemplos práticos de uso do Dynamic MCP system.
 * Baseado nos casos de uso do vídeo do Docker.
 *
 * Nota: Este arquivo contém exemplos e pode usar console.log para demonstração.
 */

import {
  dockerDynamicMCPGateway,
  dynamicToolSelector,
  codeModeExecutor,
  statePersistenceManager,
  dynamicMCPIntegration,
} from './index';

/**
 * Exemplo 1: Buscar repositórios GitHub com múltiplas keywords
 *
 * Demonstra:
 * - Dynamic tool selection
 * - Code Mode para combinar múltiplas buscas
 * - State persistence para salvar resultados
 */
export async function exampleGitHubMultiSearch(): Promise<void> {
  console.log('=== Exemplo 1: GitHub Multi-Search ===\n');

  // 1. Inicializar Dynamic MCP
  await dynamicMCPIntegration.initialize();

  // 2. Buscar e conectar GitHub MCP
  const searchResult = await dockerDynamicMCPGateway.findServers('github');
  if (searchResult.servers.length > 0) {
    await dockerDynamicMCPGateway.addServer('github');
    console.log('✅ GitHub MCP conectado');
  }

  // 3. Criar tool customizada usando Code Mode
  const multiSearchCode = `
async function multiarchRepos(keywords) {
  const results = [];
  
  for (const keyword of keywords) {
    // Chamar GitHub MCP search_repositories
    const searchResult = await mcpCall('github', 'search_repositories', {
      query: keyword,
      sort: 'stars',
      order: 'desc',
      per_page: 5
    });
    
    results.push(...searchResult.items);
  }
  
  // Remover duplicatas
  const unique = Array.from(new Map(results.map(r => [r.id, r])).values());
  
  // Salvar em arquivo (state persistence)
  await saveState('github_search_results', unique);
  
  // Retornar apenas resumo
  return {
    total: unique.length,
    repos: unique.map(r => ({
      name: r.name,
      description: r.description,
      url: r.html_url
    }))
  };
}

return await multiarchRepos(params.keywords);
`;

  const toolCreated = await codeModeExecutor.createTool({
    name: 'multiarch_repos',
    description: 'Search GitHub repos with multiple keywords',
    code: multiSearchCode,
    inputSchema: {
      keywords: { type: 'array', items: { type: 'string' } },
    },
    createdBy: 'example',
  });

  if (toolCreated) {
    console.log('✅ Tool customizada criada: multiarch_repos');
  }

  // 4. Executar tool
  const result = await codeModeExecutor.executeTool('multiarch_repos', {
    keywords: ['react-native', 'expo', 'maternal', 'health'],
  });

  console.log('📊 Resultado:', result);
}

/**
 * Exemplo 2: GitHub → Notion Integration
 *
 * Demonstra:
 * - Chaining de MCP servers (GitHub + Notion)
 * - Code Mode para criar workflow customizado
 * - State persistence para evitar enviar dados grandes ao modelo
 */
export async function exampleGitHubToNotion(): Promise<void> {
  console.log('\n=== Exemplo 2: GitHub → Notion Integration ===\n');

  // 1. Conectar servidores necessários
  await dockerDynamicMCPGateway.addServer('github');
  await dockerDynamicMCPGateway.addServer('notion'); // Assumindo que existe

  // 2. Criar tool que integra GitHub e Notion
  const githubToNotionCode = `
async function githubToNotion(query) {
  // 1. Buscar repositórios no GitHub
  const githubResults = await mcpCall('github', 'search_repositories', {
    query: query,
    per_page: 10
  });
  
  // 2. Processar resultados
  const repos = githubResults.items.map(repo => ({
    name: repo.name,
    description: repo.description || '',
    url: repo.html_url,
    stars: repo.stargazers_count,
    language: repo.language,
    date: new Date(repo.created_at).toISOString()
  }));
  
  // 3. Salvar em Notion (usando Notion MCP)
  for (const repo of repos) {
    await mcpCall('notion', 'create_page', {
      database_id: 'notion-database-id',
      properties: {
        Name: { title: [{ text: { content: repo.name } }] },
        Description: { rich_text: [{ text: { content: repo.description } }] },
        URL: { url: repo.url },
        Stars: { number: repo.stars },
        Language: { select: { name: repo.language || 'Unknown' } },
        Date: { date: { start: repo.date } }
      }
    });
  }
  
  // 4. Retornar apenas resumo (não todos os dados)
  return {
    success: true,
    reposAdded: repos.length,
    message: 'Repositories saved to Notion'
  };
}

return await githubToNotion(params.query);
`;

  const toolCreated = await codeModeExecutor.createTool({
    name: 'github_to_notion',
    description: 'Save GitHub search results to Notion database',
    code: githubToNotionCode,
    inputSchema: {
      query: { type: 'string' },
    },
    createdBy: 'example',
  });

  if (toolCreated) {
    console.log('✅ Tool criada: github_to_notion');
  }

  // 3. Executar
  const result = await codeModeExecutor.executeTool('github_to_notion', {
    query: 'react-native maternal health',
  });

  console.log('📊 Resultado:', result);
}

/**
 * Exemplo 3: Dynamic Tool Selection
 *
 * Demonstra como apenas tools relevantes são carregadas
 */
export async function exampleDynamicToolSelection(): Promise<void> {
  console.log('\n=== Exemplo 3: Dynamic Tool Selection ===\n');

  // 1. Conectar múltiplos servidores
  await dockerDynamicMCPGateway.addServer('github');
  await dockerDynamicMCPGateway.addServer('postgres');
  await dockerDynamicMCPGateway.addServer('playwright');

  // 2. Obter todas as tools disponíveis
  const allTools = dockerDynamicMCPGateway.getAvailableTools();
  console.log(`📦 Total de tools disponíveis: ${allTools.length}`);

  // 3. Selecionar apenas tools relevantes para uma query específica
  const query = 'buscar repositórios no GitHub sobre React Native';
  const selectionResult = dynamicToolSelector.selectTools(allTools, {
    query,
    maxTools: 5,
    relevantTags: ['git', 'search'],
  });

  console.log(`✅ Tools selecionadas: ${selectionResult.selectedTools.length}`);
  console.log(`❌ Tools descartadas: ${selectionResult.discardedTools.length}`);
  console.log(`💰 Economia de tokens: ${selectionResult.tokenSavings}%`);
  console.log(`💭 Reasoning: ${selectionResult.reasoning}`);

  console.log('\n📋 Tools selecionadas:');
  selectionResult.selectedTools.forEach((tool) => {
    console.log(`  - ${tool.name} (${tool.server})`);
  });
}

/**
 * Exemplo 4: State Persistence
 *
 * Demonstra como salvar dados grandes sem poluir o context window
 */
export async function exampleStatePersistence(): Promise<void> {
  console.log('\n=== Exemplo 4: State Persistence ===\n');

  // 1. Simular dados grandes (ex: resultados de busca)
  const largeData = {
    repositories: Array.from({ length: 100 }, (_, i) => ({
      id: i,
      name: `repo-${i}`,
      description: `Description for repo ${i}`,
      stars: Math.floor(Math.random() * 1000),
      // ... muitos outros campos
    })),
    metadata: {
      searchQuery: 'react-native',
      timestamp: Date.now(),
      totalResults: 100,
    },
  };

  // 2. Salvar dados grandes
  const saveResult = await statePersistenceManager.saveLargeData(
    'github_search_results',
    largeData,
    true // Retornar resumo
  );

  console.log('💾 Dados salvos:', saveResult.saved);
  console.log('🔗 Referência:', saveResult.reference);
  console.log('📊 Resumo:', saveResult.summary);

  // 3. Carregar dados quando necessário
  const loadedData = await statePersistenceManager.loadState('github_search_results');
  console.log(`\n📥 Dados carregados: ${loadedData ? 'Sim' : 'Não'}`);

  // 4. O modelo recebe apenas a referência, não todos os dados
  console.log('\n💡 O modelo recebe apenas:');
  console.log(`   Referência: ${saveResult.reference}`);
  console.log(`   Resumo: ${JSON.stringify(saveResult.summary)}`);
  console.log('   (Não recebe os 100 repositórios completos)');
}

/**
 * Executa todos os exemplos
 */
export async function runAllExamples(): Promise<void> {
  try {
    await exampleDynamicToolSelection();
    await exampleStatePersistence();
    // Descomente para executar exemplos que requerem servidores MCP reais:
    // await exampleGitHubMultiSearch();
    // await exampleGitHubToNotion();
  } catch (error) {
    console.error('❌ Erro ao executar exemplos:', error);
  }
}
