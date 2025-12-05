# Supabase Migrations - Nossa Maternidade

> Schema consolidado com 16 tabelas (migrado de migrations_mvp em 2025-12-05)
>
> Backup das migrations antigas: `migrations-backup-2025-12-05/` (ignorado pelo git)

---

## Arquivos

| # | Arquivo | Conteúdo |
|---|---------|----------|
| 0 | `00_types.sql` | ENUMs e funções helper |
| 1 | `01_core_tables.sql` | profiles, community_posts, chat_sessions, chat_messages, habits, habit_logs |
| 2 | `02_community_reactions.sql` | community_comments, community_likes, post_reactions, content_favorites |
| 3 | `03_lgpd_flags_screenings.sql` | consent_terms_versions, user_consents, user_feature_flags, postpartum_screenings |
| 4 | `04_crisis_moderation.sql` | crisis_interventions, moderation_queue |
| 5 | `05_rls_policies.sql` | RLS policies para todas as 16 tabelas |
| - | `seed.sql` | Dados de desenvolvimento |

---

## Como Usar

### Opção 1: Reset completo (recomendado para dev)

```bash
# Copia os arquivos para a pasta de migrations oficial
# Renomeia com timestamp

# 1. Backup das migrations antigas (se quiser)
mv supabase/migrations supabase/migrations_old

# 2. Cria nova pasta
mkdir supabase/migrations

# 3. Copia com timestamps
cp migrations_mvp/00_types.sql migrations/20251204000000_types.sql
cp migrations_mvp/01_core_tables.sql migrations/20251204000001_core_tables.sql
cp migrations_mvp/02_community_reactions.sql migrations/20251204000002_community_reactions.sql
cp migrations_mvp/03_lgpd_flags_screenings.sql migrations/20251204000003_lgpd_flags_screenings.sql
cp migrations_mvp/04_crisis_moderation.sql migrations/20251204000004_crisis_moderation.sql
cp migrations_mvp/05_rls_policies.sql migrations/20251204000005_rls_policies.sql
cp migrations_mvp/seed.sql supabase/seed.sql

# 4. Reset o banco
supabase db reset
```

### Opção 2: Aplicar manualmente no Supabase Dashboard

1. Acesse https://app.supabase.com
2. Vá para SQL Editor
3. Execute os arquivos na ordem (00 → 05)
4. Execute seed.sql para dados de teste

---

## Notas Importantes

### Sobre chat_conversations → chat_sessions

A tabela foi renomeada de `chat_conversations` para `chat_sessions`, mas o código TypeScript ainda usa `conversation_id` nas mensagens. Isso é intencional para manter compatibilidade.

O código em `src/services/chatService.ts` usa:
- `.from('chat_conversations')` → precisa atualizar para `.from('chat_sessions')`

### Sobre profiles vs user_profiles

Mantido como `profiles` (não `user_profiles`) para compatibilidade com o código existente.

### Sobre posts vs community_posts

Mantido como `community_posts` (não `posts`) para compatibilidade com o código existente.

---

## Usuários de Teste (seed.sql)

| UUID | Nome | Perfil |
|------|------|--------|
| `11111111-1111-1111-1111-111111111111` | Maria | Gestante 32 semanas |
| `22222222-2222-2222-2222-222222222222` | Ana | Pós-parto, bebê 3 meses |
| `33333333-3333-3333-3333-333333333333` | Julia | Moderadora |

Para testar com estes usuários, configure mock de autenticação com estes UUIDs.

---

## Próximos Passos Após Aplicar

1. **Atualizar código TypeScript:**
   ```bash
   # Buscar referências a chat_conversations
   grep -r "chat_conversations" src/

   # Atualizar para chat_sessions
   ```

2. **Regenerar tipos:**
   ```bash
   supabase gen types typescript --local > src/types/supabase.ts
   ```

3. **Testar localmente:**
   ```bash
   npm run dev
   ```

---

*Gerado em: Dezembro 2025*
