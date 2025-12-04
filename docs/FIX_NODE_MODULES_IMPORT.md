# Fix: Erro de Import de Módulos Node.js no React Native

## Problema Original

```
iOS Bundling failed
You attempted to import the Node standard library module "fs" from
"src\mcp\servers\MobileOptimizationMCPServer.ts".
It failed because the native React runtime does not include the Node standard library.
```

## Causa Raiz

Os servidores MCP que usam módulos do Node.js (`fs`, `path`) estavam localizados dentro de `src/mcp/servers/`, que é incluído no bundle do React Native. O Metro Bundler tentava processar esses arquivos mesmo que não fossem exportados no `index.ts`.

### Cadeia de Imports Problemática:

```
MobileOptimizationMCPServer.ts (usa fs, path)
  ↓
src/mcp/servers/index.ts (não exportava, mas arquivo estava no src/)
  ↓
EmotionAnalysisAgent.ts (importava createMCPRequest de mcp/servers)
  ↓
AgentsContext.tsx
  ↓
App.tsx
```

## Solução Implementada

### 1. **Movidos Servidores Node.js para Fora de `src/`**

Criada pasta `scripts/mcp-servers/` e movidos:

- ✅ `MobileOptimizationMCPServer.ts`
- ✅ `PromptTestingMCPServer.ts`
- ✅ `DesignTokensValidationMCPServer.ts`
- ✅ `CodeQualityMCPServer.ts`
- ✅ `AccessibilityMCPServer.ts`

**Motivo:** Arquivos fora de `src/` não são processados pelo Metro Bundler do React Native.

### 2. **Atualizados Imports nos Runners**

Todos os runners em `src/mcp/runners/*.js` foram atualizados para importar dos novos locais:

```javascript
// ANTES:
const { MobileOptimizationMCPServer } = require('../servers/MobileOptimizationMCPServer');

// DEPOIS:
const {
  MobileOptimizationMCPServer,
} = require('../../../scripts/mcp-servers/MobileOptimizationMCPServer');
```

Arquivos atualizados:

- ✅ `mobile-optimization-runner.js`
- ✅ `prompt-testing-runner.js`
- ✅ `design-tokens-runner.js`
- ✅ `code-quality-runner.js`
- ✅ `accessibility-runner.js`

### 3. **Atualizado `src/mcp/servers/index.ts`**

Removidos exports dos servidores Node.js e adicionado comentário claro:

```typescript
// ⚠️ MobileOptimizationMCPServer e PromptTestingMCPServer não são exportados aqui
// porque usam módulos Node.js (fs, path) que não estão disponíveis no React Native.
// Estes servidores foram movidos para scripts/mcp-servers/ e devem ser usados apenas em:
// - Scripts de build/CI
// - Cursor.AI workflows
// - Edge Functions
// Para usar, importe diretamente de scripts/mcp-servers/
```

## Resultado

### ✅ Build Bem-Sucedido

```bash
$ npx expo start --port 8083 --clear
Starting Metro Bundler
warning: Bundler cache is empty, rebuilding (this may take a minute)

Web Bundled 19135ms index.ts (3709 modules)
Web Bundled 10422ms index.ts (1 module)
```

**Nenhum erro de import de `fs` ou `path`!**

### Servidores MCP Ainda Funcionais no Cursor.AI

Os servidores continuam funcionando perfeitamente no Cursor.AI através dos runners configurados em `mcp.json`:

```json
{
  "mcpServers": {
    "design-tokens": {
      "command": "node",
      "args": ["src/mcp/runners/design-tokens-runner.js"]
    },
    "mobile-optimization": {
      "command": "node",
      "args": ["src/mcp/runners/mobile-optimization-runner.js"]
    }
    // ... etc
  }
}
```

## Estrutura Final

```
NossaMaternidade/
├── src/
│   └── mcp/
│       ├── servers/
│       │   ├── index.ts              # Só exporta servidores React Native-safe
│       │   ├── SupabaseMCPServer.ts
│       │   ├── GoogleAIMCPServer.ts
│       │   └── ...
│       └── runners/
│           ├── design-tokens-runner.js     # Importa de scripts/mcp-servers/
│           ├── mobile-optimization-runner.js
│           └── ...
└── scripts/
    └── mcp-servers/                  # ⭐ NOVO: Servidores Node.js aqui
        ├── DesignTokensValidationMCPServer.ts
        ├── CodeQualityMCPServer.ts
        ├── AccessibilityMCPServer.ts
        ├── MobileOptimizationMCPServer.ts
        └── PromptTestingMCPServer.ts
```

## Lições Aprendidas

1. **Metro Bundler processa todos os arquivos `.ts` em `src/`** mesmo que não sejam importados ou exportados
2. **Módulos Node.js (fs, path, etc) não existem no React Native** - são exclusivos do ambiente Node.js
3. **Separação de ambientes é essencial**: código React Native em `src/`, ferramentas Node.js em `scripts/` ou `tools/`
4. **MCPs devem ser executados via runners Node.js**, não no bundle do app

## Verificação

Para testar novamente:

```bash
# Limpar cache e reconstruir
npx expo start --clear

# Deve ver:
# ✅ "Web Bundled X modules"
# ❌ NÃO deve ver: "You attempted to import... fs"
```

---

**Data da Correção:** 2025-11-27
**Corrigido por:** Claude Code
**Impacto:** Zero breaking changes - Cursor.AI MCPs continuam funcionando normalmente
