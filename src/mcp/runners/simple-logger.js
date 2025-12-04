/**
 * Logger simplificado para MCP Runners (Node.js)
 * Substitui o logger React Native que usa Sentry
 */

class SimpleLogger {
  debug(message, ...args) {
    console.error(`🔍 [DEBUG] ${message}`, ...args);
  }

  info(message, ...args) {
    console.error(`ℹ️  [INFO] ${message}`, ...args);
  }

  warn(message, ...args) {
    console.error(`⚠️  [WARN] ${message}`, ...args);
  }

  error(message, ...args) {
    console.error(`❌ [ERROR] ${message}`, ...args);
  }

  setSessionId() {
    // No-op for runners
  }
}

module.exports = { logger: new SimpleLogger() };
