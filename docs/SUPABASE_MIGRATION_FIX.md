# 🔧 Como Corrigir Histórico de Migrações Supabase

## Problema

Ao executar `supabase db pull`, você recebe o erro:

```
The remote database's migration history does not match local files in supabase\migrations directory.
```

Isso acontece quando o histórico de migrações no banco remoto não corresponde aos arquivos locais.

---

## ✅ Solução Rápida (Recomendada)

### Método 1: Script PowerShell Automático

```powershell
# Execute o script de reparo
.\scripts\fix-supabase-migrations.ps1

# Se der timeout, tente com mais delay:
.\scripts\fix-supabase-migrations.ps1 -DelaySeconds 5

# Após sucesso, sincronize:
supabase db pull
```

**O que o script faz:**

- Marca migrações antigas como `reverted` (não existem mais localmente)
- Marca migrações atuais como `applied` (existem localmente e no remoto)
- Retry automático em caso de timeout
- Delay entre comandos para evitar sobrecarga

---

### Método 2: SQL Manual (Se o script falhar)

1. **Acesse o Supabase Dashboard:**
   - Vá para: https://app.supabase.com/project/[seu-project-ref]
   - Clique em **SQL Editor** > **New Query**

2. **Execute o SQL de reparo:**
   - Abra o arquivo: `scripts/fix-migrations-manual.sql`
   - Copie TODO o conteúdo
   - Cole no SQL Editor
   - Execute (Run ou Ctrl+Enter)

3. **Volte ao terminal:**
   ```powershell
   supabase db pull
   ```

---

## 📋 Migrações Atuais do Projeto

### Migrações Locais (devem estar como APPLIED):

- `20250101000000_create_profiles_table.sql`
- `20250126_check_in_logs.sql`
- `20250126000000_add_onboarding_fields.sql`
- `20250127_sleep_logs.sql`
- `20250127000000_create_legal_acceptances.sql`
- `20251202000000_lgpd_user_consents_audit_logs.sql`

### Migrações Antigas (devem estar como REVERTED):

- `001`, `002`
- `20250103`, `20250104`, `20250105`, `20250106`
- `20251116211817`, `20251117005207`

---

## 🔍 Verificar Estado Atual

### Ver migrações no banco remoto:

```sql
SELECT version, name, inserted_at
FROM supabase_migrations.schema_migrations
ORDER BY version;
```

### Ver migrações locais:

```powershell
Get-ChildItem supabase\migrations\*.sql | Select-Object Name
```

---

## ⚠️ Troubleshooting

### Erro: "timeout: context canceled"

**Causa:** Conexão lenta ou instável com o banco remoto.

**Soluções:**

1. Aumente o delay entre comandos:

   ```powershell
   .\scripts\fix-supabase-migrations.ps1 -DelaySeconds 10
   ```

2. Use o método SQL manual (mais confiável):
   - Execute `scripts/fix-migrations-manual.sql` no Dashboard

3. Verifique sua conexão:
   ```powershell
   supabase status
   ping [seu-project-ref].supabase.co
   ```

---

### Erro: "failed to update migration table"

**Causa:** Permissões ou bloqueio na tabela de migrações.

**Soluções:**

1. Verifique se você está logado:

   ```powershell
   supabase login
   ```

2. Verifique se o projeto está linkado:

   ```powershell
   supabase link --project-ref [seu-project-ref]
   ```

3. Use o método SQL manual (bypassa o CLI)

---

### Erro: "migration history does not match" (mesmo após reparo)

**Causa:** Migrações locais foram renomeadas ou removidas.

**Soluções:**

1. Verifique se todos os arquivos em `supabase/migrations/` correspondem ao histórico:

   ```powershell
   # Listar migrações locais
   Get-ChildItem supabase\migrations\*.sql | ForEach-Object {
       $_.Name -replace '\.sql$', ''
   }
   ```

2. Se uma migração foi renomeada, você precisa:
   - Ou renomear o arquivo local para corresponder ao histórico
   - Ou atualizar o histórico para corresponder ao arquivo local

---

## 🎯 Fluxo Completo Recomendado

```powershell
# 1. Verificar estado atual
supabase db pull --dry-run

# 2. Reparar histórico (escolha um método)
# Opção A: Script automático
.\scripts\fix-supabase-migrations.ps1

# Opção B: SQL manual (mais confiável)
# Execute scripts/fix-migrations-manual.sql no Dashboard

# 3. Sincronizar após reparo
supabase db pull

# 4. Verificar resultado
supabase migration list
```

---

## 📚 Referências

- [Supabase Migration Repair Docs](https://supabase.com/docs/guides/cli/local-development#migration-repair)
- [Supabase Migration History](https://supabase.com/docs/guides/cli/local-development#migration-history)

---

## ✅ Checklist Pós-Reparo

- [ ] Script/SQL executado com sucesso
- [ ] `supabase db pull` funciona sem erros
- [ ] Migrações locais correspondem ao histórico remoto
- [ ] Novas migrações podem ser criadas normalmente
- [ ] `supabase db push` funciona corretamente

---

**Última atualização:** 2025-12-02
