# 🚀 Próximos Passos - Setup MVP

## ✅ O que já está pronto

- ✅ **Todas as funcionalidades implementadas** (LGPD, Settings, Edge Functions)
- ✅ **Documentação completa** criada
- ✅ **Scripts para criar .env** criados
- ✅ **`.gitignore` protegendo .env** ✓

---

## ⚡ Ações Necessárias (5 minutos)

### 1️⃣ Criar arquivo `.env`

**Windows:**

```bash
create-env.bat
```

**Linux/macOS:**

```bash
bash create-env.sh
```

**Ou criar manualmente:**

- Criar arquivo `.env` na raiz do projeto
- Copiar conteúdo de `docs/ENV_SETUP_MVP.md`
- Preencher com as keys fornecidas

**Verificar se criou:**

```bash
# PowerShell
Test-Path .env

# Deve retornar: True
```

---

### 2️⃣ Aplicar Schema SQL no Supabase

1. **Acesse:** https://app.supabase.com/project/bbcwitnbnosyfpfjtzkr/sql

2. **New Query** (botão verde no topo)

3. **Copie TODO o conteúdo** de `supabase/schema.sql`
   - Abra o arquivo `supabase/schema.sql`
   - Ctrl+A (selecionar tudo)
   - Ctrl+C (copiar)

4. **Cole no editor SQL** e clique **Run** (ou Ctrl+Enter)

5. **Aguarde 10-30 segundos**

6. **Verifique:** Vá em **Table Editor** → Deve ver todas as tabelas criadas

**Tempo:** 2-3 minutos

---

### 3️⃣ Reiniciar Servidor

Após criar `.env`:

```bash
# Se o servidor estiver rodando, pare (Ctrl+C)
# Depois reinicie:
npm start
```

**Verificar:** App deve conectar ao Supabase corretamente

---

### 4️⃣ (Opcional) Deploy Edge Function

```bash
# Instalar CLI (se não tiver)
npm install -g supabase

# Login
supabase login

# Link ao projeto
supabase link --project-ref bbcwitnbnosyfpfjtzkr

# Deploy
supabase functions deploy delete-account
```

**Tempo:** 5 minutos

**Nota:** App funciona sem isso (usa fallback), mas é recomendado para produção.

---

## 🧪 Testar

### Teste Rápido

1. **Login/Registro:**
   - Criar conta nova no app
   - Verificar que funciona

2. **Export Data:**
   - Home → ⚙️ Settings (ícone no header)
   - "Exportar Meus Dados"
   - Verificar JSON gerado

3. **Delete Account:**
   - Settings → "Deletar Minha Conta"
   - (Use conta de teste!)
   - Verificar logout automático

---

## 📚 Documentação

- **Quick Start**: `docs/QUICK_START.md` ⭐ **Comece aqui**
- **Environment Setup**: `docs/ENV_SETUP_MVP.md`
- **Deployment Guide**: `docs/DEPLOYMENT_SETUP_GUIDE.md`
- **Status**: `docs/DEPLOYMENT_STATUS.md`

---

## ⏱️ Tempo Total

- Criar `.env`: **1 minuto**
- Aplicar schema: **2-3 minutos**
- Reiniciar servidor: **1 minuto**
- Deploy Edge Function: **5 minutos** (opcional)

**Total: 4-10 minutos**

---

## 🎉 Pronto!

Após completar os passos acima, o app estará **100% funcional**!
