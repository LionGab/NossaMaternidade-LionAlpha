# Variáveis de Ambiente - Nossa Maternidade

Este arquivo documenta todas as variáveis de ambiente necessárias para o projeto.

## Como Configurar

1. **Copie o template:** `cp env.template .env` (ou no Windows: `copy env.template .env`)
2. **Preencha os valores reais** no arquivo `.env`
3. **NUNCA commite o arquivo `.env`** (ele está no `.gitignore`)

## Variáveis Públicas (EXPO*PUBLIC*\*)

Estas variáveis são **seguras** para serem incluídas no bundle do app. Elas são acessadas via `process.env.EXPO_PUBLIC_*` no código.

### Obrigatórias

```env
# Supabase - URL do projeto
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co

# Supabase - Chave anônima (pública, segura para o app)
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Supabase - URL das Edge Functions
EXPO_PUBLIC_SUPABASE_FUNCTIONS_URL=https://your-project.supabase.co/functions/v1

# Google Gemini - API Key para IA
# Obtenha em: https://makersuite.google.com/app/apikey
EXPO_PUBLIC_GEMINI_API_KEY=your_gemini_api_key_here
```

### Opcionais (IA Multi-Provider)

```env
# Anthropic Claude - API Key
EXPO_PUBLIC_CLAUDE_API_KEY=your_claude_api_key_here

# OpenAI - API Key (recomendado para crise emocional)
EXPO_PUBLIC_OPENAI_API_KEY=your_openai_api_key_here

# Perplexity - API Key
EXPO_PUBLIC_PERPLEXITY_API_KEY=your_perplexity_api_key_here

# MCP Brave Search
BRAVE_API_KEY=your_brave_api_key_here
```

### Opcionais (Monitoramento e Features)

```env
# Sentry - Error tracking (recomendado para produção)
# Crie uma conta em: https://sentry.io
EXPO_PUBLIC_SENTRY_DSN=https://xxx@sentry.io/xxx

# Feature Flags
EXPO_PUBLIC_ENABLE_AI_FEATURES=true
EXPO_PUBLIC_ENABLE_ANALYTICS=false
```

## Variáveis Privadas (Backend/Server-Side)

⚠️ **ATENÇÃO:** Estas variáveis **NÃO devem** ser usadas no código do app mobile. Use apenas em Edge Functions Supabase ou backend.

```env
# Supabase Service Role Key (NUNCA expor no cliente)
# SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Google Gemini API Key (para Edge Functions apenas)
# GEMINI_API_KEY=your_gemini_api_key_here

# PostgreSQL Connection String (apenas para migrações/admin)
# POSTGRES_CONNECTION_STRING=postgresql://postgres:password@db.your-project.supabase.co:5432/postgres
```

## Como Funciona no Expo

### 1. Variáveis EXPO*PUBLIC*\*

Estas variáveis são automaticamente incluídas no bundle quando você roda:

```bash
npm start
```

Elas são acessadas no código via:

```typescript
process.env.EXPO_PUBLIC_SUPABASE_URL;
// ou
Constants.expoConfig?.extra?.supabaseUrl;
```

### 2. Variáveis Sem EXPO*PUBLIC*\*

Variáveis sem o prefixo `EXPO_PUBLIC_` **não são acessíveis** no código do app. Use apenas em:

- Edge Functions Supabase
- Scripts de migração
- Backend/server-side

## Importante

- ✅ Todas as variáveis públicas devem usar o prefixo `EXPO_PUBLIC_`
- ✅ Após criar ou modificar o arquivo `.env`, **reinicie o servidor Expo** (`npm start -- --clear`)
- ✅ O arquivo `.env` **não deve ser commitado** no Git (já está no `.gitignore`)
- ✅ Use `env.template` como referência (este arquivo pode ser commitado)
- ⚠️ **NUNCA** commite chaves de API reais

## Troubleshooting

### Variáveis não carregam?

1. **Reinicie o servidor Expo:**

   ```bash
   npm start -- --clear
   ```

2. **Verifique o formato:**
   - Variáveis devem começar com `EXPO_PUBLIC_`
   - Sem espaços antes ou depois do `=`
   - Sem aspas nos valores

3. **Verifique o arquivo .env:**
   - Deve estar na raiz do projeto
   - Deve ter extensão `.env` (sem `.local` ou outra extensão)

## Referências

- Template completo: `env.template` (na raiz do projeto)
- Documentação detalhada: `docs/setup-env.md`
- Arquitetura IA: `docs/AI_ROUTER_STRATEGY.md`
