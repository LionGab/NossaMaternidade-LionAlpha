# Resumo do Alinhamento de Tabelas: Código ↔ Banco

**Data:** 2025-01-28  
**Status:** Migrations criadas - Pronto para aplicação

---

## Objetivo

Alinhar os nomes das tabelas do Supabase com o código do app, garantindo que todas as referências no código (`src/services`, `src/hooks`) apontem para tabelas que realmente existem no banco.

---

## Migrations Criadas

### 1. Renames de Tabelas Existentes

| Migration | Ação | Status |
|-----------|------|--------|
| `20250128_rename_user_profiles_to_profiles.sql` | Renomeia `user_profiles` → `profiles` | ✅ Criada |
| `20250128_rename_posts_to_community_posts.sql` | Renomeia `posts` → `community_posts` | ✅ Criada |
| `20250128_rename_content_favorites_to_user_content_interactions.sql` | Renomeia `content_favorites` → `user_content_interactions` | ✅ Criada |

### 2. Criação de Tabelas Faltantes

| Migration | Ação | Status |
|-----------|------|--------|
| `20250128_create_user_habits.sql` | Cria tabela `user_habits` | ✅ Criada |
| `20250128_create_content_items.sql` | Cria tabela `content_items` | ✅ Criada |

### 3. Atualização de RLS e Funções

| Migration | Ação | Status |
|-----------|------|--------|
| `20250128_update_rls_after_renames.sql` | Atualiza RLS policies e funções após renames | ✅ Criada |

---

## Ordem de Aplicação das Migrations

1. **Primeiro:** Renames de tabelas
   ```sql
   -- Aplicar nesta ordem:
   20250128_rename_user_profiles_to_profiles.sql
   20250128_rename_posts_to_community_posts.sql
   20250128_rename_content_favorites_to_user_content_interactions.sql
   ```

2. **Segundo:** Criação de tabelas faltantes
   ```sql
   20250128_create_user_habits.sql
   20250128_create_content_items.sql
   ```

3. **Terceiro:** Atualização de RLS e funções
   ```sql
   20250128_update_rls_after_renames.sql
   ```

---

## Tabelas Finais Após Migrations

### ✅ Core MVP (6 tabelas)
- `chat_conversations` ✅
- `chat_messages` ✅
- `habits` ✅
- `habit_logs` ✅
- `crisis_interventions` ✅
- `moderation_queue` ✅

### ✅ LGPD Obrigatório (2 tabelas)
- `consent_terms_versions` ✅
- `user_consents` ✅

### ✅ Comunidade (3 tabelas)
- `community_comments` ✅
- `community_likes` ✅
- `community_posts` ✅ (renomeado de `posts`)

### ✅ Perfil/Usuária (1 tabela)
- `profiles` ✅ (renomeado de `user_profiles`)

### ✅ Conteúdo/Feed (2 tabelas)
- `content_items` ✅ (criado)
- `user_content_interactions` ✅ (renomeado de `content_favorites`)

### ✅ Hábitos (1 tabela)
- `user_habits` ✅ (criado)

### ✅ Moderação/Analytics (3 tabelas)
- `moderation_metrics` ✅
- `moderators` ✅
- `post_reactions` ✅ (existe mas não usado ainda)

**Total:** 18 tabelas essenciais

---

## Impacto no Código

### ✅ Código JÁ está correto

Após aplicar as migrations, o código não precisa ser alterado porque:

1. **ProfileService** já usa `profiles` ✅
2. **CommunityService** já usa `community_posts` ✅
3. **FeedService** já usa `user_content_interactions` ✅
4. **HabitsService** já usa `user_habits` ✅ (tabela será criada)
5. **FeedService** já usa `content_items` ✅ (tabela será criada)

### ⚠️ Verificações Necessárias

Após aplicar as migrations, verificar:

1. **TypeScript types:** Regenerar tipos do Supabase se aplicável
2. **Testes:** Rodar `npm test` para garantir que mocks estão corretos
3. **Type-check:** Rodar `npm run type-check` para garantir que não há erros

---

## Próximos Passos

1. ✅ **Concluído:** Mapeamento completo de tabelas
2. ✅ **Concluído:** Migrations de rename criadas
3. ✅ **Concluído:** Migrations de criação de tabelas criadas
4. ✅ **Concluído:** Migration de atualização de RLS criada
5. ⏳ **Próximo:** Aplicar migrations no ambiente de desenvolvimento
6. ⏳ **Depois:** Validar com type-check e testes
7. ⏳ **Depois:** Aplicar em produção (após validação completa)

---

## Notas Importantes

- Todas as migrations são **idempotentes** (usam `IF EXISTS` quando apropriado)
- Renames preservam **índices**, **constraints** e **FKs** automaticamente
- RLS policies são **recriadas** com nomes atualizados
- Funções são **atualizadas** para usar nomes corretos de tabelas
- Views materializadas podem precisar de **recriação manual** (verificar logs da migration)

---

## Rollback (se necessário)

Se precisar reverter as migrations:

1. Renomear tabelas de volta:
   - `profiles` → `user_profiles`
   - `community_posts` → `posts`
   - `user_content_interactions` → `content_favorites`

2. Dropar tabelas criadas:
   - `DROP TABLE IF EXISTS user_habits;`
   - `DROP TABLE IF EXISTS content_items;`

3. Recriar RLS policies com nomes antigos

**⚠️ Atenção:** Rollback pode causar perda de dados se houver dados nas tabelas renomeadas. Sempre fazer backup antes de aplicar migrations em produção.

