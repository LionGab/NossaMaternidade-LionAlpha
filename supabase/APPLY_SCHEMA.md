# Como Aplicar o Schema SQL no Supabase

## Método 1: Via Dashboard (Mais Fácil) ⭐

### Passo a Passo

1. **Acesse o Dashboard do Supabase**
   - Vá para: https://app.supabase.com/project/bbcwitnbnosyfpfjtzkr
   - Ou acesse pelo seu projeto específico

2. **Abra o SQL Editor**
   - No menu lateral, clique em **SQL Editor**
   - Clique em **New Query**

3. **Copie e Cole o Schema**
   - Abra o arquivo `supabase/schema.sql`
   - Copie **TODO** o conteúdo
   - Cole no editor SQL do Supabase

4. **Execute o SQL**
   - Clique no botão **Run** (ou pressione Ctrl+Enter)
   - Aguarde a execução (pode levar 10-30 segundos)

5. **Verifique o Resultado**
   - Deve aparecer "Success. No rows returned"
   - Verifique se as tabelas foram criadas:
     - Vá em **Table Editor** no menu lateral
     - Você deve ver: `profiles`, `chat_conversations`, `chat_messages`, etc.

6. **Aplicar Seed (Dados Iniciais - Opcional)**
   - Repita o processo com o arquivo `supabase/seed.sql`
   - Isso popula o banco com dados de exemplo

## Método 2: Via Supabase CLI (Recomendado para Devs)

### Pré-requisitos

```bash
# Instalar Supabase CLI
npm install -g supabase

# Ou via Homebrew (macOS)
brew install supabase/tap/supabase

# Ou via Scoop (Windows)
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase
```

### Passo a Passo

1. **Login no Supabase**

```bash
supabase login
```

2. **Link ao Projeto**

```bash
# Usar o project ref do seu projeto
supabase link --project-ref bbcwitnbnosyfpfjtzkr
```

3. **Aplicar Schema**

```bash
# Opção A: Aplicar arquivo SQL direto
supabase db execute -f supabase/schema.sql

# Opção B: Usar migrations (recomendado para produção)
supabase migration new initial_schema
# Copie o conteúdo de schema.sql para o arquivo criado em supabase/migrations/
supabase db push
```

4. **Aplicar Seed (Opcional)**

```bash
supabase db execute -f supabase/seed.sql
```

## Verificação Pós-Aplicação

Execute estas queries no SQL Editor para verificar:

```sql
-- Verificar se tabelas foram criadas
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

-- Verificar se RLS está habilitado
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public';

-- Verificar policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE schemaname = 'public';
```

## Troubleshooting

### Erro: "relation already exists"

- As tabelas já existem. Você pode:
  1. Deletar e recriar (perde dados)
  2. Usar `CREATE TABLE IF NOT EXISTS` (já está no schema)
  3. Aplicar apenas as migrations que faltam

### Erro: "permission denied"

- Verifique se está usando a conta admin do projeto
- Service role key tem todas as permissões necessárias

### Erro: "extension uuid-ossp does not exist"

- Execute primeiro: `CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`
- Isso já está no início do schema.sql

## Próximos Passos

Após aplicar o schema:

1. ✅ Verificar RLS policies estão ativas
2. ✅ Testar autenticação
3. ✅ Testar criação de perfil
4. ✅ Verificar storage buckets foram criados
