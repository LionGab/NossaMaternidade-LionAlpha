# Status de Deployment - MVP 48h

## ✅ Implementado (Crítico)

### 1. Sistema de Sessões Robusto (Fase 1-4 Completa)

- ✅ SecureStore para tokens (LGPD/GDPR compliant)
- ✅ Session Manager unificado
- ✅ Session Validator com retry logic
- ✅ Persistência de sessões de chat no Supabase
- ✅ Network Monitor para offline
- ✅ Logger estruturado

### 2. LGPD Compliance

- ✅ **Export User Data** - `src/services/userDataService.ts`
  - Exporta todos os dados do usuário em JSON
  - Inclui: perfil, conversas, hábitos, marcos, interações
- ✅ **Delete Account** - `src/services/userDataService.ts`
  - Hard delete (via Edge Function recomendado)
  - Soft delete (requestAccountDeletion) - marca para deleção após 30 dias

### 3. Configuração de Ambiente

- ✅ Documentação completa em `docs/ENV_SETUP_MVP.md`
- ⚠️ **AÇÃO NECESSÁRIA**: Criar arquivo `.env` local com as keys fornecidas

## ⚠️ Ações Necessárias para MVP

### 1. Criar arquivo `.env` (URGENTE)

Crie um arquivo `.env` na raiz com as variáveis fornecidas:

```bash
# Copiar estrutura de docs/ENV_SETUP_MVP.md
# Preencher com as keys reais fornecidas
```

**⚠️ CRÍTICO**: Verificar que `.env` está no `.gitignore` antes de commitar.

### 2. Verificar Supabase Schema

Execute o schema SQL em `supabase/schema.sql` no seu projeto Supabase:

- Acesse: https://bbcwitnbnosyfpfjtzkr.supabase.co
- Vá em **SQL Editor** > **New Query**
- Cole o conteúdo de `supabase/schema.sql`
- Execute

### 3. Configurar Edge Functions (Recomendado)

Para segurança das API keys:

```bash
# Instalar Supabase CLI se não tiver
npm install -g supabase

# Login
supabase login

# Link ao projeto
supabase link --project-ref bbcwitnbnosyfpfjtzkr

# Configurar secrets
supabase secrets set GEMINI_API_KEY=YOUR_GEMINI_API_KEY_HERE
supabase secrets set CLAUDE_API_KEY=sk-ant-api03-...
supabase secrets set OPENAI_API_KEY=sk-proj-...
supabase secrets set PERPLEXITY_API_KEY=pplx-...
```

### 4. Criar Edge Function para Delete Account

Criar `supabase/functions/delete-account/index.ts`:

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  const { userId } = await req.json();

  // Deletar todos os dados relacionados
  await supabaseAdmin.from('chat_conversations').delete().eq('user_id', userId);
  await supabaseAdmin.from('profiles').delete().eq('id', userId);
  await supabaseAdmin.auth.admin.deleteUser(userId);

  return new Response(JSON.stringify({ success: true }), {
    headers: { 'Content-Type': 'application/json' },
  });
});
```

## 📋 Checklist de Deployment

### Legal (Obrigatório para Stores)

- [ ] Privacy Policy (template em docs/PRIVACY_POLICY_TEMPLATE.md)
- [ ] Terms of Service (template em docs/TERMS_OF_SERVICE_TEMPLATE.md)
- [ ] Política de retenção de dados definida

### Backend

- [x] Schema SQL criado
- [ ] Schema aplicado no Supabase
- [ ] RLS policies verificadas
- [ ] Edge Functions configuradas (se usando)

### Segurança

- [x] SecureStore implementado
- [x] Session validation implementado
- [ ] Rate limiting (futuro)
- [ ] Input validation completa (parcial)

### LGPD Compliance

- [x] Export Data implementado
- [x] Delete Account implementado
- [ ] UI para acessar essas funcionalidades (criar telas)

### Store Assets

- [ ] Screenshots iOS (5 tamanhos)
- [ ] Screenshots Android (8+ telas)
- [ ] Feature Graphic (Android)
- [ ] App Store Preview Video (opcional)

### Testing

- [ ] Testes básicos de autenticação
- [ ] Testes de sessão
- [ ] Testes de export/delete data

### Deploy

- [ ] EAS Project configurado
- [ ] Apple Developer Account configurado
- [ ] Google Play Console configurado
- [ ] Build de produção testado

## 🚀 Próximos Passos Imediatos

1. **Criar `.env`** com as keys fornecidas
2. **Aplicar schema SQL** no Supabase
3. **Testar funcionalidades LGPD** (export/delete)
4. **Criar telas de configurações** com opções de export/delete
5. **Revisar RLS policies** no Supabase

## 📝 Notas Importantes

- ⚠️ **API Keys no Cliente**: Atualmente `EXPO_PUBLIC_GEMINI_API_KEY` está sendo usada diretamente no cliente. Para produção, migrar para Edge Functions.

- ⚠️ **Service Role Key**: NUNCA usar no cliente. Apenas em Edge Functions ou server-side.

- 🔒 **LGPD**: Funcionalidades de export/delete estão implementadas, mas precisam de UI para o usuário acessar.
