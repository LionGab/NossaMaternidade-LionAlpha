# Configuração de Variáveis de Ambiente - MVP 48h

## ⚠️ SEGURANÇA CRÍTICA

**NUNCA** commite keys privadas no Git:

- `SUPABASE_SERVICE_ROLE_KEY` - Acesso total ao banco
- `GEMINI_API_KEY`, `CLAUDE_API_KEY`, etc - Keys privadas de APIs
- Keys devem estar apenas no arquivo `.env` local (já está no .gitignore)

## Estrutura do `.env`

Crie um arquivo `.env` na raiz do projeto com a estrutura abaixo.

### ⚠️ IMPORTANTE:

- Use apenas `EXPO_PUBLIC_*` para valores que podem ser expostos no cliente
- Keys privadas (API keys) devem ser usadas apenas em Edge Functions (não no cliente)

```env
# ============================================
# SUPABASE (OBRIGATÓRIO)
# ============================================

# URLs e keys públicas (podem ser expostas no cliente)
EXPO_PUBLIC_SUPABASE_URL=https://bbcwitnbnosyfpfjtzkr.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=sua_anon_key_aqui
EXPO_PUBLIC_SUPABASE_FUNCTIONS_URL=https://bbcwitnbnosyfpfjtzkr.supabase.co/functions/v1

# Service Role Key (NUNCA expor no cliente - usar apenas Edge Functions/server-side)
SUPABASE_SERVICE_ROLE_KEY=sua_service_role_key_aqui

# ============================================
# APIs DE IA (Edge Functions apenas - NÃO usar EXPO_PUBLIC_*)
# ============================================
# Essas keys devem ser configuradas como SECRETS no Supabase Edge Functions
# NÃO colocar no cliente - risco de uso não autorizado e custos

GEMINI_API_KEY=sua_gemini_key_aqui
CLAUDE_API_KEY=sua_claude_key_aqui
OPENAI_API_KEY=sua_openai_key_aqui
PERPLEXITY_API_KEY=sua_perplexity_key_aqui

# ============================================
# FEATURE FLAGS
# ============================================
USE_MOCKS=false
ENABLE_AI=true
ENABLE_GAMIFICATION=true
ENABLE_ANALYTICS=true

# ============================================
# STRIPE (OPCIONAL)
# ============================================
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=sua_stripe_key_aqui

# ============================================
# MONITORAMENTO (OPCIONAL)
# ============================================
EXPO_PUBLIC_SENTRY_DSN=
EXPO_PUBLIC_ONESIGNAL_APP_ID=
```

## Estratégia de IA (MVP)

- **NathIA Chat**: Gemini Flash (latência < 2s, barato)
- **MãeValente Q&A**: Perplexity (fontes reais) com cache
- **Análise de Sentimento**: Claude (precisão)
- **Moderação**: Gemini (barato)

## Configuração no Supabase

### 1. Configurar Secrets nas Edge Functions

As API keys de IA devem ser configuradas como **secrets** nas Edge Functions (NÃO no cliente):

```bash
# Via Supabase CLI
supabase secrets set GEMINI_API_KEY=AIzaSy...
supabase secrets set CLAUDE_API_KEY=sk-ant...
supabase secrets set OPENAI_API_KEY=sk-proj...
supabase secrets set PERPLEXITY_API_KEY=pplx-...
```

Ou via Dashboard do Supabase:

- Vá em **Edge Functions** > **Settings** > **Secrets**

### 2. Verificar Segurança

Execute para verificar se há keys expostas:

```bash
# Verificar se há service role keys no código
grep -r "service_role" --exclude-dir=node_modules --exclude="*.md" .

# Verificar se há API keys privadas com EXPO_PUBLIC_
grep -r "EXPO_PUBLIC.*API_KEY" --exclude-dir=node_modules --exclude="*.md" .
```

## Como Configurar

1. Copie o template acima para `.env` na raiz
2. Substitua `sua_*_aqui` pelas keys reais
3. **Verifique que `.env` está no `.gitignore`**
4. Reinicie o servidor: `npm start`

## Nota sobre Gemini API Key

⚠️ **ATENÇÃO**: Atualmente o `geminiService.ts` usa `EXPO_PUBLIC_GEMINI_API_KEY` diretamente no cliente. Para produção, recomenda-se:

1. **Migrar para Edge Functions** - Criar uma Edge Function que faz as chamadas ao Gemini
2. **Manter no cliente apenas para MVP** - Se necessário para desenvolvimento rápido, mas entender o risco de uso não autorizado
