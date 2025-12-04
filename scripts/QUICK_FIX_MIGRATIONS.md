# ⚡ Correção Rápida de Migrações - Método SQL Manual

## ⚠️ Problema: Script PowerShell travando

Se o script `fix-supabase-migrations.ps1` está travando, use este método SQL manual que é **mais confiável**.

---

## ✅ Solução em 3 Passos

### Passo 1: Abrir Supabase Dashboard

1. Acesse: https://app.supabase.com/project/[seu-project-ref]
   - Substitua `[seu-project-ref]` pelo ID do seu projeto
   - Ou encontre o link no arquivo `.env` ou configuração do projeto

2. Faça login se necessário

---

### Passo 2: Executar SQL de Reparo

1. No menu lateral, clique em **SQL Editor**
2. Clique em **New Query** (ou `+ New Query`)
3. Abra o arquivo: `scripts/fix-migrations-manual.sql`
4. **Copie TODO o conteúdo** do arquivo
5. **Cole no editor SQL**
6. Clique em **Run** (ou pressione `Ctrl+Enter`)

**Aguarde alguns segundos** - você deve ver "Success" ou "No rows returned"

---

### Passo 3: Verificar e Sincronizar

Volte ao terminal PowerShell e execute:

```powershell
supabase db pull
```

Se funcionar sem erros, está tudo certo! ✅

---

## 🔍 Verificar se Funcionou

No Supabase Dashboard, execute esta query para ver o histórico:

```sql
SELECT version, name, inserted_at
FROM supabase_migrations.schema_migrations
ORDER BY version;
```

Você deve ver apenas estas 6 migrações:

- `20250101000000` - create_profiles_table
- `20250126` - check_in_logs
- `20250126000000` - add_onboarding_fields
- `20250127` - sleep_logs
- `20250127000000` - create_legal_acceptances
- `20251202000000` - lgpd_user_consents_audit_logs

---

## ❓ Problemas Comuns

### "Permission denied" ou erro de permissão

**Solução:** Certifique-se de estar logado como admin do projeto no Supabase Dashboard.

### "Table does not exist: supabase_migrations.schema_migrations"

**Solução:** Isso é raro, mas significa que o projeto não tem histórico de migrações. Neste caso, você pode criar a tabela manualmente ou usar `supabase migration new` para criar uma nova migração.

### `supabase db pull` ainda dá erro após executar SQL

**Solução:**

1. Verifique se todas as migrações foram inseridas corretamente (use a query de verificação acima)
2. Se faltar alguma, insira manualmente:
   ```sql
   INSERT INTO supabase_migrations.schema_migrations (version, name)
   VALUES ('20250101000000', 'create_profiles_table')
   ON CONFLICT (version) DO NOTHING;
   ```

---

## 📝 Arquivo SQL Completo

O arquivo `scripts/fix-migrations-manual.sql` contém:

- ✅ Verificação do estado atual
- ✅ Remoção de migrações antigas (reverted)
- ✅ Inserção de migrações atuais (applied)
- ✅ Verificação final do resultado

---

**Última atualização:** 2025-12-02
