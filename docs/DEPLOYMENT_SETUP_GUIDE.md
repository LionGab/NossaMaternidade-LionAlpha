# Guia Completo de Setup para Deployment MVP

## ✅ Status Atual

### Implementado

- ✅ Sistema de sessões robusto (Fase 1-4 completa)
- ✅ LGPD compliance (Export Data, Delete Account)
- ✅ UI de Settings com funcionalidades LGPD
- ✅ Edge Function para delete-account
- ✅ Documentação completa

### Pendente (Ações Necessárias)

1. **Criar arquivo `.env`** ⚠️ CRÍTICO
2. **Aplicar schema SQL no Supabase**
3. **Deploy da Edge Function**
4. **Testar funcionalidades**

---

## 📋 Passo a Passo Completo

### 1. Configurar Variáveis de Ambiente

**Criar arquivo `.env` na raiz do projeto:**

```bash
# Copiar template
cp docs/ENV_SETUP_MVP.md .env

# Ou criar manualmente com as keys fornecidas
```

**Importante:** Verifique que `.env` está no `.gitignore` antes de commitar!

### 2. Aplicar Schema SQL no Supabase

**Opção A: Via Dashboard (Recomendado)**

1. Acesse: https://app.supabase.com/project/bbcwitnbnosyfpfjtzkr/sql
2. Clique em **New Query**
3. Copie TODO o conteúdo de `supabase/schema.sql`
4. Cole no editor e clique **Run**
5. Aguarde execução (10-30 segundos)
6. Verifique em **Table Editor** que as tabelas foram criadas

**Opção B: Via CLI**

```bash
# Instalar Supabase CLI
npm install -g supabase

# Login
supabase login

# Link ao projeto
supabase link --project-ref bbcwitnbnosyfpfjtzkr

# Aplicar schema
supabase db execute -f supabase/schema.sql

# Aplicar seed (opcional - dados iniciais)
supabase db execute -f supabase/seed.sql
```

### 3. Deploy da Edge Function

**Via Supabase CLI:**

```bash
# Deploy da função delete-account
supabase functions deploy delete-account

# Configurar secrets (API keys devem estar aqui, não no .env do app)
supabase secrets set GEMINI_API_KEY=AIzaSy...
supabase secrets set CLAUDE_API_KEY=sk-ant...
# etc...
```

**Via Dashboard:**

- Vá em **Edge Functions** > **Create Function**
- Nome: `delete-account`
- Cole o conteúdo de `supabase/functions/delete-account/index.ts`
- Salve e deploy

### 4. Testar Funcionalidades

#### Testar Export Data

1. Abra o app
2. Faça login
3. Vá em **Home** > **⚙️ Settings** (ícone no header)
4. Clique em **Exportar Meus Dados**
5. Verifique que arquivo JSON é gerado/compartilhado

#### Testar Delete Account

1. Em **Settings**, clique em **Deletar Minha Conta**
2. Confirme a deleção
3. Verifique que logout acontece
4. Verifique que não consegue mais fazer login

---

## 🔍 Verificação de Setup

### Checklist Pré-Deployment

- [ ] Arquivo `.env` criado com todas as keys
- [ ] Schema SQL aplicado no Supabase
- [ ] Tabelas criadas e visíveis no Table Editor
- [ ] RLS policies ativas (verificar em cada tabela)
- [ ] Edge Function `delete-account` deployada
- [ ] Storage buckets criados (avatars, content, community)
- [ ] Testes de export/delete funcionando

### Verificar RLS Policies

Execute no SQL Editor:

```sql
-- Verificar quais tabelas têm RLS
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public' AND rowsecurity = true;

-- Verificar policies criadas
SELECT schemaname, tablename, policyname
FROM pg_policies
WHERE schemaname = 'public';
```

### Verificar Storage Buckets

1. Vá em **Storage** no dashboard
2. Verifique que existem:
   - `avatars` (público)
   - `content` (público)
   - `community` (público)

---

## 🚀 Deploy para Stores

### EAS Build (Produção)

```bash
# Configurar EAS (primeira vez)
eas init

# Build iOS
eas build --platform ios --profile production

# Build Android
eas build --platform android --profile production
```

### Submit para Stores

```bash
# iOS (requer Apple Developer account)
eas submit --platform ios

# Android (requer Google Play Console)
eas submit --platform android
```

---

## 📚 Documentação de Referência

- **Environment Setup**: `docs/ENV_SETUP_MVP.md`
- **Schema SQL**: `supabase/schema.sql`
- **Aplicar Schema**: `supabase/APPLY_SCHEMA.md`
- **Deployment Status**: `docs/DEPLOYMENT_STATUS.md`

---

## 🆘 Troubleshooting

### Erro: "Supabase não configurado"

- Verifique que `.env` existe e tem `EXPO_PUBLIC_SUPABASE_URL` e `EXPO_PUBLIC_SUPABASE_ANON_KEY`
- Reinicie o servidor Expo (`npm start`)

### Erro: "relation does not exist"

- Schema SQL não foi aplicado
- Execute `supabase/schema.sql` no SQL Editor

### Erro: "permission denied"

- RLS policies podem estar bloqueando
- Verifique policies em cada tabela
- Teste com service_role_key temporariamente

### Edge Function não funciona

- Verifique que função foi deployada
- Verifique logs em **Edge Functions** > **Logs**
- Confirme que Authorization header está sendo enviado
