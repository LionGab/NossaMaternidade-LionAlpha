# 🚀 Quick Start - MVP 48h

## ✅ Passo 1: Variáveis de Ambiente

**Arquivo `.env` já foi criado!** ✓

Verifique se as variáveis estão corretas e reinicie o servidor:

```bash
# Parar servidor atual (Ctrl+C)
# Reiniciar
npm start
```

---

## ✅ Passo 2: Aplicar Schema SQL

### Método Rápido (Dashboard)

1. **Acesse o SQL Editor:**
   - https://app.supabase.com/project/bbcwitnbnosyfpfjtzkr/sql

2. **Crie uma nova query:**
   - Clique em **New Query**

3. **Copie e cole o schema:**
   - Abra o arquivo `supabase/schema.sql`
   - Copie **TODO** o conteúdo (Ctrl+A, Ctrl+C)
   - Cole no editor SQL (Ctrl+V)

4. **Execute:**
   - Clique em **Run** (ou Ctrl+Enter)
   - Aguarde 10-30 segundos
   - Deve aparecer: "Success. No rows returned"

5. **Verificar:**
   - Vá em **Table Editor** no menu lateral
   - Você deve ver todas as tabelas criadas:
     - ✅ profiles
     - ✅ chat_conversations
     - ✅ chat_messages
     - ✅ user_habits
     - ✅ etc...

### Método Alternativo (CLI)

```bash
# Instalar Supabase CLI (se não tiver)
npm install -g supabase

# Login
supabase login

# Link ao projeto
supabase link --project-ref bbcwitnbnosyfpfjtzkr

# Aplicar schema
supabase db execute -f supabase/schema.sql
```

---

## ✅ Passo 3: Deploy Edge Function (Opcional)

A Edge Function `delete-account` já está criada, mas precisa ser deployada:

```bash
# Via CLI
supabase functions deploy delete-account

# Ou via Dashboard:
# Edge Functions > Create Function > delete-account
# Cole o conteúdo de supabase/functions/delete-account/index.ts
```

**Nota:** A app funciona sem a Edge Function (usa fallback), mas é recomendado deployar para segurança completa.

---

## ✅ Passo 4: Testar o App

### Iniciar o App

```bash
npm start
```

### Testar Funcionalidades

1. **Login/Registro:**
   - Criar uma conta nova
   - Ou fazer login com conta existente

2. **Export Data (LGPD):**
   - Home → ⚙️ Settings (ícone no header)
   - "Exportar Meus Dados"
   - Verificar que JSON é gerado/compartilhado

3. **Delete Account (LGPD):**
   - Settings → "Deletar Minha Conta"
   - Confirmar duas vezes
   - Verificar logout automático

---

## 🔍 Verificações Rápidas

### Verificar se .env está configurado

```bash
# Windows (PowerShell)
cat .env | Select-String "EXPO_PUBLIC_SUPABASE_URL"

# Deve mostrar a URL do Supabase
```

### Verificar se Supabase está conectado

No app, ao fazer login, verifique se:

- ✅ Login funciona
- ✅ Dados são salvos no perfil
- ✅ Chat funciona

### Verificar Schema no Supabase

1. Acesse: https://app.supabase.com/project/bbcwitnbnosyfpfjtzkr/editor
2. Verifique que existem tabelas criadas
3. Teste inserir um registro manualmente (opcional)

---

## ⚠️ Problemas Comuns

### "Supabase não configurado"

**Solução:**

1. Verifique que `.env` existe na raiz
2. Verifique que tem `EXPO_PUBLIC_SUPABASE_URL` e `EXPO_PUBLIC_SUPABASE_ANON_KEY`
3. Reinicie o servidor: `npm start`

### "relation does not exist"

**Solução:**

- Schema SQL não foi aplicado
- Execute `supabase/schema.sql` no SQL Editor

### Erro ao fazer login

**Solução:**

1. Verifique a URL e key do Supabase no `.env`
2. Verifique no dashboard do Supabase se o projeto está ativo
3. Teste criar um usuário manualmente no dashboard

---

## 📚 Próximos Passos

Após verificar que tudo está funcionando:

1. ✅ Customizar Privacy Policy e Terms of Service
2. ✅ Criar screenshots para as stores
3. ✅ Configurar EAS para builds de produção
4. ✅ Testar build de produção
5. ✅ Submeter para stores

---

## 📞 Ajuda

- **Documentação completa**: `docs/DEPLOYMENT_SETUP_GUIDE.md`
- **Status de deployment**: `docs/DEPLOYMENT_STATUS.md`
- **Environment setup**: `docs/ENV_SETUP_MVP.md`

---

## 🎉 Pronto!

Tudo configurado! O app está pronto para desenvolvimento e testes.
