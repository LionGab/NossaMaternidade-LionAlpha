# MEMORY - Nossa Maternidade

> Contexto persistente para Claude Code

---

## Última Sessão: 03/12/2025

### O QUE FOI FEITO

Criado conjunto completo de migrations MVP em `supabase/migrations_mvp/`:

| Arquivo | Conteúdo |
|---------|----------|
| `00_types.sql` | 12 ENUMs (crisis_level, moderation_status, consent_type, etc) |
| `01_core_tables.sql` | profiles, community_posts, chat_sessions, chat_messages, habits, habit_logs |
| `02_community_reactions.sql` | community_comments, community_likes, post_reactions, content_favorites |
| `03_lgpd_flags_screenings.sql` | consent_terms_versions, user_consents, user_feature_flags, postpartum_screenings |
| `04_crisis_moderation.sql` | crisis_interventions, moderation_queue |
| `05_rls_policies.sql` | RLS para todas as 16 tabelas |
| `seed.sql` | 3 usuárias de teste, hábitos, posts, conversas |
| `README.md` | Instruções de uso |

Documentação criada: `docs/DATA_MODEL_MVP.md` com diagrama ER Mermaid.

### 16 TABELAS DO MVP

**Core (6):** profiles, community_posts, chat_sessions, chat_messages, habits, habit_logs

**Comunidade (4):** community_comments, community_likes, post_reactions, content_favorites

**LGPD (4):** consent_terms_versions, user_consents, user_feature_flags, postpartum_screenings

**Crise/Moderação (2):** crisis_interventions, moderation_queue

### DECISÕES DE COMPATIBILIDADE

| Pedido | Mantido | Motivo |
|--------|---------|--------|
| user_profiles | `profiles` | Código existente |
| posts | `community_posts` | Código existente |
| chat_conversations | `chat_sessions` | Renomeado, FK `conversation_id` mantida |

### PENDENTE

1. **Atualizar código para chat_sessions:**
   - `src/services/chatService.ts` - trocar `chat_conversations` → `chat_sessions`
   - `src/services/sessionPersistence.ts`
   - `src/services/userDataService.ts`

2. **Aplicar migrations:**
   ```bash
   cp supabase/migrations_mvp/*.sql supabase/migrations/
   supabase db reset
   ```

3. **Regenerar tipos:**
   ```bash
   supabase gen types typescript --local > src/types/supabase.ts
   ```

### USUÁRIOS DE TESTE (seed.sql)

| UUID | Nome | Perfil |
|------|------|--------|
| `11111111-1111-1111-1111-111111111111` | Maria | Gestante 32 semanas |
| `22222222-2222-2222-2222-222222222222` | Ana | Pós-parto, bebê 3 meses |
| `33333333-3333-3333-3333-333333333333` | Julia | Moderadora |

### CORREÇÕES FEITAS

- `.gitignore`: Alterado de `.claude/mcp.json` para `.claude/` (protege todas as credenciais)

---

## Estado do Banco

- Limpeza manual feita no Supabase Dashboard: 62 → 16 tabelas
- Migrations antigas em `supabase/migrations/` (bagunçado)
- Migrations novas em `supabase/migrations_mvp/` (limpo, versionado)

---

*Atualizado: 03/12/2025*
