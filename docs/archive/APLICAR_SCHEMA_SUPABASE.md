# 🗄️ Guia: Aplicar Schema SQL no Supabase

Este guia mostra como aplicar o schema do banco de dados no Supabase para tornar o app funcional.

## ⚠️ IMPORTANTE

Este processo precisa ser feito **manualmente** no dashboard do Supabase. Não é possível automatizar via código.

---

## 📋 Pré-requisitos

- ✅ Conta Supabase criada
- ✅ Projeto Supabase criado
- ✅ URL do projeto: `https://bbcwitnbnosyfpfjtzkr.supabase.co`
- ✅ Acesso ao SQL Editor do Supabase

---

## 🚀 Passo a Passo

### 1. Acessar o SQL Editor

1. Acesse: https://app.supabase.com/project/bbcwitnbnosyfpfjtzkr/sql/new
2. Ou navegue: **Dashboard** → **SQL Editor** → **New Query**

### 2. Copiar o Schema SQL

1. Abra o arquivo `supabase/schema.sql` no projeto
2. Selecione **TODO o conteúdo** (Ctrl+A / Cmd+A)
3. Copie (Ctrl+C / Cmd+C)

### 3. Colar e Executar

1. Cole o conteúdo no SQL Editor do Supabase
2. Clique em **Run** (ou pressione Ctrl+Enter / Cmd+Enter)
3. Aguarde 10-30 segundos para execução

### 4. Verificar Tabelas Criadas

1. Vá em **Table Editor** no menu lateral
2. Verifique se as seguintes tabelas foram criadas:
   - ✅ `profiles`
   - ✅ `chat_conversations`
   - ✅ `chat_messages`
   - ✅ `habits`
   - ✅ `habits_log`
   - ✅ `content`
   - ✅ `community_posts`
   - ✅ `comments`
   - ✅ `milestones`
   - ✅ `user_milestones`
   - ✅ `user_sessions`

### 5. Verificar RLS (Row Level Security)

1. Vá em **Authentication** → **Policies**
2. Verifique se as políticas RLS foram criadas para cada tabela
3. Todas as tabelas devem ter políticas que permitem:
   - Usuários verem apenas seus próprios dados
   - Usuários atualizarem apenas seus próprios dados

---

## ✅ Validação

Após aplicar o schema, execute este SQL para validar:

```sql
-- Verificar se todas as tabelas existem
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- Verificar RLS habilitado
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN (
    'profiles',
    'chat_conversations',
    'chat_messages',
    'habits',
    'habits_log',
    'content',
    'community_posts',
    'comments',
    'milestones',
    'user_milestones',
    'user_sessions'
  );
```

**Resultado esperado:**

- Todas as tabelas listadas devem existir
- `rowsecurity` deve ser `true` para todas

---

## 🐛 Troubleshooting

### Erro: "relation already exists"

**Causa:** Tabela já existe no banco  
**Solução:** O schema usa `CREATE TABLE IF NOT EXISTS`, então é seguro executar novamente

### Erro: "permission denied"

**Causa:** Usuário sem permissões adequadas  
**Solução:** Verifique se está usando a conta de owner do projeto

### Erro: "extension uuid-ossp does not exist"

**Causa:** Extensão não habilitada  
**Solução:** Execute primeiro:

```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

### Tabelas não aparecem no Table Editor

**Causa:** Cache do dashboard  
**Solução:** Recarregue a página (F5)

---

## 📝 Notas Importantes

1. **Backup:** O Supabase faz backup automático, mas é recomendado fazer backup antes de aplicar mudanças grandes
2. **RLS:** Todas as tabelas têm Row Level Security habilitado por padrão
3. **Triggers:** O schema inclui triggers para `updated_at` automático
4. **Índices:** Índices foram criados para otimizar queries frequentes

---

## 🎯 Próximos Passos

Após aplicar o schema:

1. ✅ Testar login/registro no app
2. ✅ Testar criação de perfil no onboarding
3. ✅ Testar chat com IA
4. ✅ Verificar se dados estão sendo salvos corretamente

---

## 📚 Referências

- [Documentação Supabase SQL](https://supabase.com/docs/guides/database)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Schema do Projeto](./supabase/schema.sql)
