#!/usr/bin/env node
/**
 * Code Quality MCP Runner
 *
 * Node.js stdio wrapper para CodeQualityMCPServer
 * Permite integração com Cursor via Model Context Protocol
 */

const path = require('path');
const Module = require('module');

// Mock do logger para evitar importar @sentry/react-native
const originalRequire = Module.prototype.require;
Module.prototype.require = function (id) {
  if (id === '../../utils/logger' || id.endsWith('utils/logger')) {
    return require('./simple-logger');
  }
  return originalRequire.apply(this, arguments);
};

// Registrar ts-node para importar TypeScript
require('ts-node').register({
  project: path.join(__dirname, 'tsconfig.runner.json'),
  transpileOnly: true,
});

const { CodeQualityMCPServer } = require('../../../scripts/mcp-servers/CodeQualityMCPServer');

// Criar instância do servidor
const server = new CodeQualityMCPServer();

// Inicializar servidor
(async () => {
  try {
    await server.initialize();
    console.error('[code-quality-runner] Servidor inicializado com sucesso');

    // Processar requests do stdin (MCP stdio protocol)
    let buffer = '';

    process.stdin.setEncoding('utf8');
    process.stdin.on('data', async (chunk) => {
      buffer += chunk;

      // Processar mensagens completas (separadas por newline)
      const lines = buffer.split('\n');
      buffer = lines.pop() || ''; // Guardar linha incompleta

      for (const line of lines) {
        if (!line.trim()) continue;

        try {
          const request = JSON.parse(line);
          console.error(`[code-quality-runner] Request recebido: ${request.method}`);

          const response = await server.handleRequest(request);

          // Enviar response para stdout (JSON + newline)
          process.stdout.write(JSON.stringify(response) + '\n');
          console.error(`[code-quality-runner] Response enviada`);
        } catch (error) {
          console.error('[code-quality-runner] Erro ao processar request:', error);

          // Enviar erro como response
          const errorResponse = {
            jsonrpc: '2.0',
            id: null,
            error: {
              code: 'PARSE_ERROR',
              message: error.message || 'Erro ao processar request',
              details: error.stack,
            },
          };
          process.stdout.write(JSON.stringify(errorResponse) + '\n');
        }
      }
    });

    process.stdin.on('end', async () => {
      console.error('[code-quality-runner] stdin closed, shutting down...');
      await server.shutdown();
      process.exit(0);
    });

    // Handlers de erro
    process.on('SIGINT', async () => {
      console.error('[code-quality-runner] SIGINT recebido, shutting down...');
      await server.shutdown();
      process.exit(0);
    });

    process.on('SIGTERM', async () => {
      console.error('[code-quality-runner] SIGTERM recebido, shutting down...');
      await server.shutdown();
      process.exit(0);
    });

    process.on('uncaughtException', async (error) => {
      console.error('[code-quality-runner] Uncaught exception:', error);
      await server.shutdown();
      process.exit(1);
    });

    process.on('unhandledRejection', async (reason, promise) => {
      console.error('[code-quality-runner] Unhandled rejection at:', promise, 'reason:', reason);
      await server.shutdown();
      process.exit(1);
    });
  } catch (error) {
    console.error('[code-quality-runner] Falha ao inicializar servidor:', error);
    process.exit(1);
  }
})();
