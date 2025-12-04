/**
 * Testes para MaternalChatAgent - Analytics Não Bloqueia Chat
 * 
 * Este arquivo testa que falhas de analytics NUNCA bloqueiam o fluxo principal do chat.
 * 
 * Referência: docs/Docfinal.md - Bug #1
 * Tema 2.1: Analytics Não Bloqueia Chat
 */

import { MaternalChatAgent } from '../MaternalChatAgent';
import { orchestrator } from '../../core/AgentOrchestrator';
import { logger } from '../../../utils/logger';

// Mock do orchestrator
jest.mock('../../core/AgentOrchestrator', () => ({
  orchestrator: {
    callMCP: jest.fn(),
  },
}));

// Mock do logger para não poluir logs durante testes
jest.mock('../../../utils/logger', () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  },
}));

// Helper para aguardar microtasks (fire-and-forget promises)
const flushPromises = () => new Promise(resolve => setImmediate(resolve));

describe('MaternalChatAgent - Analytics Não Bloqueia Chat', () => {
  let agent: MaternalChatAgent;
  const mockUserId = 'test-user-123';

  beforeEach(() => {
    agent = new MaternalChatAgent();
    jest.clearAllMocks();
  });

  afterEach(async () => {
    // Limpar sessão após cada teste
    await agent.endSession().catch(() => {
      // Ignorar erros de limpeza
    });
  });

  /**
   * TESTE 1: Analytics falhando em startSession() não impede criação da sessão
   * 
   * Cenário: Analytics rejeita a promise, mas a sessão deve ser criada normalmente.
   */
  it('deve criar sessão mesmo quando analytics falha em startSession()', async () => {
    // Arrange: Mock analytics para rejeitar
    (orchestrator.callMCP as jest.Mock).mockImplementation((server, _method) => {
      if (server === 'analytics') {
        // Simular falha de analytics (rejeita promise)
        return Promise.reject(new Error('Analytics service unavailable'));
      }
      // Outros MCPs funcionam normalmente
      return Promise.resolve({ success: true, data: {} });
    });

    // Act: Tentar iniciar sessão
    const session = await agent.startSession(mockUserId, {
      name: 'Test User',
      lifeStage: 'pregnant',
    });

    // Aguardar microtasks (fire-and-forget do trackEventSafely)
    await flushPromises();

    // Assert: Sessão foi criada com sucesso
    expect(session).toBeDefined();
    expect(session.id).toBeDefined();
    expect(session.userId).toBe(mockUserId);
    expect(session.messages.length).toBeGreaterThan(0); // Deve ter mensagem de boas-vindas

    // Verificar que analytics foi chamado (mas falhou silenciosamente)
    expect(orchestrator.callMCP).toHaveBeenCalledWith(
      'analytics',
      'event.track',
      expect.objectContaining({
        name: 'chat_session_started',
      })
    );

    // Verificar que warning foi logado (mas não erro fatal)
    expect(logger.warn).toHaveBeenCalledWith(
      expect.stringContaining('Analytics tracking failed'),
      expect.any(Object)
    );
  });

  /**
   * TESTE 2: Analytics falhando em process() não impede resposta da IA
   * 
   * Cenário: Usuária envia mensagem, IA responde corretamente, mas analytics falha.
   * A resposta deve ser retornada normalmente.
   */
  it('deve retornar resposta da IA mesmo quando analytics falha em process()', async () => {
    // Arrange: Criar sessão primeiro
    await agent.startSession(mockUserId);

    // Mock: Analytics rejeita, mas chat funciona
    (orchestrator.callMCP as jest.Mock).mockImplementation((server, _method, _params) => {
      if (server === 'analytics') {
        // Simular falha de analytics
        return Promise.reject(new Error('Analytics timeout'));
      }
      if (server === 'googleai' || server === 'gemini-direct') {
        // Chat funciona normalmente
        return Promise.resolve({
          success: true,
          data: {
            message: 'Olá! Como posso ajudar você hoje?',
          },
        });
      }
      return Promise.resolve({ success: true, data: {} });
    });

    // Act: Processar mensagem
    const response = await agent.process({
      message: 'Olá, estou ansiosa',
    });

    // Aguardar microtasks (fire-and-forget do trackEventSafely)
    await flushPromises();

    // Assert: Resposta foi retornada normalmente
    expect(response).toBeDefined();
    expect(response.role).toBe('assistant');
    expect(response.content).toBeTruthy();
    expect(response.content.length).toBeGreaterThan(0);

    // Verificar que analytics foi chamado (mas falhou silenciosamente)
    expect(orchestrator.callMCP).toHaveBeenCalled();

    // Verificar que warning foi logado (mas não erro fatal)
    expect(logger.warn).toHaveBeenCalledWith(
      expect.stringContaining('Analytics tracking failed'),
      expect.any(Object)
    );
  });

  /**
   * TESTE 3: Analytics lançando exceção síncrona não quebra o fluxo
   * 
   * Cenário: Analytics não apenas rejeita, mas lança exceção síncrona.
   * O try/catch interno deve capturar e não propagar.
   */
  it('deve capturar exceção síncrona de analytics sem quebrar o fluxo', async () => {
    // Arrange: Analytics lança exceção síncrona
    (orchestrator.callMCP as jest.Mock).mockImplementation((server) => {
      if (server === 'analytics') {
        throw new Error('Analytics sync error');
      }
      return Promise.resolve({ success: true, data: {} });
    });

    await agent.startSession(mockUserId);

    // Aguardar microtasks
    await flushPromises();

    // Act: Processar mensagem
    const response = await agent.process({
      message: 'Teste',
    });

    // Aguardar microtasks
    await flushPromises();

    // Assert: Resposta foi retornada
    expect(response).toBeDefined();
    expect(response.role).toBe('assistant');

    // Exceções síncronas em callMCP são capturadas pelo catch da promise
    // e logadas como warning (não devem quebrar o fluxo)
  });

  /**
   * TESTE 4: Múltiplas falhas de analytics não acumulam erros
   * 
   * Cenário: Analytics falha em startSession, process e endSession.
   * Todas as operações devem funcionar normalmente.
   */
  it('deve funcionar normalmente mesmo com múltiplas falhas de analytics', async () => {
    // Arrange: Analytics sempre falha
    let analyticsCallCount = 0;
    (orchestrator.callMCP as jest.Mock).mockImplementation((server) => {
      if (server === 'analytics') {
        analyticsCallCount++;
        return Promise.reject(new Error(`Analytics failed #${analyticsCallCount}`));
      }
      if (server === 'googleai' || server === 'gemini-direct') {
        return Promise.resolve({
          success: true,
          data: { message: 'Resposta da IA' },
        });
      }
      return Promise.resolve({ success: true, data: {} });
    });

    // Act: Executar fluxo completo
    const session = await agent.startSession(mockUserId);
    expect(session).toBeDefined();

    const response1 = await agent.process({ message: 'Mensagem 1' });
    expect(response1).toBeDefined();

    const response2 = await agent.process({ message: 'Mensagem 2' });
    expect(response2).toBeDefined();

    await agent.endSession();

    // Aguardar microtasks (fire-and-forget do trackEventSafely)
    await flushPromises();

    // Assert: Todas as operações funcionaram
    expect(session.messages.length).toBeGreaterThan(0);
    expect(response1.content).toBeTruthy();
    expect(response2.content).toBeTruthy();

    // Verificar que analytics foi chamado múltiplas vezes (mas todas falharam silenciosamente)
    expect(analyticsCallCount).toBeGreaterThan(1);
    // Verificar que warnings foram logados para cada falha
    expect(logger.warn).toHaveBeenCalled();
    expect((logger.warn as jest.Mock).mock.calls.length).toBeGreaterThanOrEqual(analyticsCallCount);
  });

  /**
   * TESTE 5: Analytics funcionando normalmente não deve gerar warnings
   * 
   * Cenário: Analytics funciona normalmente.
   * Não deve haver warnings desnecessários.
   */
  it('não deve gerar warnings quando analytics funciona normalmente', async () => {
    // Arrange: Analytics funciona normalmente
    (orchestrator.callMCP as jest.Mock).mockImplementation((server) => {
      if (server === 'analytics') {
        return Promise.resolve({ success: true, data: { tracked: true } });
      }
      if (server === 'googleai' || server === 'gemini-direct') {
        return Promise.resolve({
          success: true,
          data: { message: 'Resposta da IA' },
        });
      }
      return Promise.resolve({ success: true, data: {} });
    });

    // Act: Executar fluxo normal
    await agent.startSession(mockUserId);
    await agent.process({ message: 'Teste' });

    // Assert: Nenhum warning de analytics
    expect(logger.warn).not.toHaveBeenCalledWith(
      expect.stringContaining('Analytics tracking failed'),
      expect.any(Object)
    );
  });
});

/**
 * PSEUDO-TESTE MANUAL: Como simular falha de analytics em desenvolvimento
 * 
 * Para testar manualmente que analytics não bloqueia o chat:
 * 
 * 1. MOCK DO ANALYTICS MCP SERVER:
 *    - Editar src/mcp/servers/AnalyticsMCPServer.ts
 *    - No método handleRequest, adicionar:
 *      ```typescript
 *      if (method === 'event.track') {
 *        // Simular falha: sempre rejeitar
 *        return Promise.reject(new Error('Analytics mock failure'));
 *      }
 *      ```
 * 
 * 2. TESTE NO APP:
 *    - Abrir o app
 *    - Iniciar uma sessão de chat
 *    - Enviar mensagens
 *    - Verificar que:
 *      ✅ Chat funciona normalmente
 *      ✅ Respostas da IA aparecem
 *      ✅ Console mostra warnings de analytics (mas não erros fatais)
 *      ✅ App não crasha
 * 
 * 3. TESTE COM ANALYTICS DESABILITADO:
 *    - Remover ou comentar AnalyticsMCPServer do AgentOrchestrator
 *    - Verificar que chat continua funcionando
 * 
 * 4. TESTE COM TIMEOUT:
 *    - No AnalyticsMCPServer, adicionar delay de 10 segundos antes de responder
 *    - Verificar que chat não espera e responde imediatamente
 */

