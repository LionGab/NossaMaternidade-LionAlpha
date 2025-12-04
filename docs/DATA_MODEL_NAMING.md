# Mapeamento de Tabelas: Código ↔ Banco de Dados

## Objetivo

Este documento mapeia todas as tabelas referenciadas no código do app (`src/services`, `src/hooks`) e compara com as tabelas que realmente existem no Supabase, definindo estratégias de alinhamento.

**Data:** 2025-01-28  
**Status:** Análise completa - Pronto para implementação

---

## Convenções de Nomenclatura Definidas

### Regras Gerais

1. **Tabelas de dados da usuária**: Prefixo `user_`
   - Exemplos: `user_profiles`, `user_consents`, `user_habits`, `user_content_interactions`
   - Justificativa: Dados pessoais/LGPD, facilita RLS policies

2. **Tabelas de relacionamento/comunidade**: Sem prefixo `user_`
   - Exemplos: `posts`, `community_comments`, `community_likes`
   - Justificativa: Conteúdo público/compartilhado

3. **Tabelas de logs/eventos**: Sufixos `*_logs` ou `*_events`
   - Exemplos: `habit_logs`, `funnel_events`, `check_in_logs`
   - Justificativa: Padrão claro para dados temporais/históricos

---

## Mapeamento Completo: Código ↔ Banco

### ✅ Tabelas que EXISTEM e estão CORRETAS (sem mudança)

| Tabela no Código | Tabela no Banco | Status | Uso Principal |
|------------------|-----------------|--------|---------------|
| `chat_conversations` | `chat_conversations` | ✅ OK | ChatService, SessionPersistence |
| `chat_messages` | `chat_messages` | ✅ OK | ChatService, SessionPersistence |
| `habits` | `habits` | ✅ OK | HabitsService |
| `habit_logs` | `habit_logs` | ✅ OK | HabitsService |
| `community_comments` | `community_comments` | ✅ OK | CommunityService |
| `community_likes` | `community_likes` | ✅ OK | CommunityService |
| `crisis_interventions` | `crisis_interventions` | ✅ OK | CrisisDetectionService |
| `moderation_queue` | `moderation_queue` | ✅ OK | CommunityModerationService |
| `user_consents` | `user_consents` | ✅ OK | ConsentManager (comentado) |
| `consent_terms_versions` | `consent_terms_versions` | ✅ OK | LGPD compliance |
| `moderation_metrics` | `moderation_metrics` | ✅ OK | Dashboard/analytics |
| `moderators` | `moderators` | ✅ OK | Sistema de moderação |

---

### 🔄 Tabelas que EXISTEM mas com NOME DIFERENTE (precisa renomear banco)

| Tabela no Código | Tabela no Banco | Ação | Motivo | Impacto |
|------------------|-----------------|------|--------|---------|
| `profiles` | `user_profiles` | Renomear banco: `user_profiles` → `profiles` **OU** atualizar código | Padronizar com prefixo `user_` | **ALTO** - Usado em ProfileService, CommunityService (joins) |
| `community_posts` | `posts` | Renomear banco: `posts` → `community_posts` **OU** atualizar código | Código espera `community_posts` | **ALTO** - Usado extensivamente em CommunityService |
| `user_content_interactions` | `content_favorites` | Renomear banco: `content_favorites` → `user_content_interactions` | Padronizar com prefixo `user_` + nome mais descritivo | **MÉDIO** - Usado em FeedService |

**DECISÃO:** Seguir estratégia de **renomear o banco** para alinhar com o código (mais seguro que mudar código em produção).

---

### ❌ Tabelas usadas no CÓDIGO mas NÃO EXISTEM no banco (precisa criar)

| Tabela no Código | Status | Uso Principal | Prioridade | Observações |
|------------------|--------|---------------|------------|-------------|
| `user_habits` | ❌ NÃO EXISTE | HabitsService, UserDataService | **ALTA** | Tabela de relacionamento usuário ↔ hábito (necessária para MVP) |
| `content_items` | ❌ NÃO EXISTE | FeedService, ContentRecommendationService | **ALTA** | Feed principal do app (conteúdo: vídeos, artigos, reels) |
| `user_baby_milestones` | ❌ NÃO EXISTE | MilestonesService, UserDataService | **MÉDIA** | Marcos do bebê da usuária (feature de diário) |
| `baby_milestones` | ❌ NÃO EXISTE | UserDataService (joins) | **MÉDIA** | Catálogo de marcos disponíveis |
| `check_in_logs` | ❌ NÃO EXISTE | CheckInService | **BAIXA** | Logs de check-in emocional (pode usar outra estrutura) |
| `sleep_logs` | ❌ NÃO EXISTE | SleepService | **BAIXA** | Logs de sono (feature futura) |
| `legal_acceptances` | ❌ NÃO EXISTE | useOnboardingStorage | **MÉDIA** | Aceite de termos legais (pode usar `user_consents`) |
| `funnel_events` | ❌ NÃO EXISTE | RetentionService (analytics) | **BAIXA** | Eventos de funil (analytics avançado) |
| `user_sessions` | ❌ NÃO EXISTE | RetentionService (analytics) | **BAIXA** | Sessões de usuário (analytics avançado) |
| `ai_usage_logs` | ❌ NÃO EXISTE | CostTracker (observability) | **BAIXA** | Logs de uso de IA (observability) |

**DECISÃO MVP:** Criar apenas as tabelas marcadas como **ALTA** prioridade (`user_habits`, `content_items`). As outras podem ser adiadas ou substituídas por estruturas existentes.

---

### ⚠️ Tabelas que EXISTEM no banco mas NÃO são usadas no código (avaliar)

| Tabela no Banco | Status | Observações | Ação Sugerida |
|-----------------|--------|-------------|---------------|
| `post_reactions` | ⚠️ NÃO USADA | Existe mas código usa `community_likes` | Verificar se é duplicação ou feature diferente |
| `content_favorites` | ⚠️ NÃO USADA | Código usa `user_content_interactions` | Renomear para `user_content_interactions` (já mapeado acima) |
| `postpartum_screenings` | ⚠️ NÃO USADA | Feature de triagem pós-parto | Manter para futuro ou remover se não planejado |
| `user_feature_flags` | ⚠️ NÃO USADA | Feature flags por usuário | Manter para futuro (útil para A/B testing) |

**DECISÃO:** Manter `postpartum_screenings` e `user_feature_flags` para features futuras. Investigar `post_reactions` vs `community_likes`.

---

## Resumo por Categoria

### Core MVP (6 tabelas) - ✅ Todas existem
- `chat_conversations` ✅
- `chat_messages` ✅
- `habits` ✅
- `habit_logs` ✅
- `crisis_interventions` ✅
- `moderation_queue` ✅

### LGPD Obrigatório (2 tabelas) - ✅ Todas existem
- `consent_terms_versions` ✅
- `user_consents` ✅

### Comunidade (3 tabelas) - ⚠️ 1 precisa renomear
- `community_comments` ✅
- `community_likes` ✅
- `community_posts` → `posts` (renomear banco)

### Perfil/Usuária (1 tabela) - ⚠️ Precisa renomear
- `profiles` → `user_profiles` (renomear banco)

### Conteúdo/Feed (2 tabelas) - ❌ 1 não existe, 1 precisa renomear
- `content_items` ❌ (CRIAR)
- `user_content_interactions` → `content_favorites` (renomear banco)

### Hábitos (1 tabela) - ❌ Não existe
- `user_habits` ❌ (CRIAR)

### Features Futuras (4 tabelas) - ❌ Não existem (baixa prioridade)
- `user_baby_milestones` ❌
- `baby_milestones` ❌
- `check_in_logs` ❌
- `sleep_logs` ❌

### Analytics/Observability (3 tabelas) - ❌ Não existem (baixa prioridade)
- `funnel_events` ❌
- `user_sessions` ❌
- `ai_usage_logs` ❌

---

## Plano de Ação Recomendado

### Fase 1: Renomear Tabelas Existentes (Alto Impacto, Baixo Risco)

1. **`user_profiles` → `profiles`**
   - Migration: `20250128_rename_user_profiles_to_profiles.sql`
   - Atualizar RLS policies
   - Atualizar FKs e índices

2. **`posts` → `community_posts`**
   - Migration: `20250128_rename_posts_to_community_posts.sql`
   - Atualizar RLS policies
   - Atualizar FKs e índices

3. **`content_favorites` → `user_content_interactions`**
   - Migration: `20250128_rename_content_favorites_to_user_content_interactions.sql`
   - Atualizar RLS policies
   - Verificar se estrutura de colunas está correta

### Fase 2: Criar Tabelas Essenciais Faltantes (MVP)

1. **`user_habits`**
   - Migration: `20250128_create_user_habits.sql`
   - Estrutura: `id`, `user_id`, `habit_id`, `custom_name`, `custom_target`, `is_active`, `created_at`, `updated_at`
   - FK: `user_id` → `auth.users`, `habit_id` → `habits`

2. **`content_items`**
   - Migration: `20250128_create_content_items.sql`
   - Estrutura: Baseada em `ContentItem` interface do FeedService
   - Campos principais: `id`, `title`, `description`, `type`, `category`, `thumbnail_url`, `video_url`, `audio_url`, `duration`, `author_name`, `tags`, `is_premium`, `is_exclusive`, `views_count`, `likes_count`, `is_published`, `published_at`, `created_at`, `updated_at`

### Fase 3: Features Futuras (Adiar para depois do MVP)

- `user_baby_milestones`
- `baby_milestones`
- `check_in_logs`
- `sleep_logs`
- `funnel_events`
- `user_sessions`
- `ai_usage_logs`

---

## Impacto por Service

### ProfileService
- **Afetado:** Usa `profiles` → precisa renomear para `user_profiles` OU atualizar código
- **Ação:** Renomear banco para `profiles` (mais simples)

### CommunityService
- **Afetado:** Usa `community_posts` e `profiles` (joins)
- **Ação:** Renomear `posts` → `community_posts` e `user_profiles` → `profiles`

### FeedService
- **Afetado:** Usa `content_items` (não existe) e `user_content_interactions` (existe como `content_favorites`)
- **Ação:** Criar `content_items` e renomear `content_favorites` → `user_content_interactions`

### HabitsService
- **Afetado:** Usa `user_habits` (não existe)
- **Ação:** Criar `user_habits`

### ChatService
- **Afetado:** Nenhum (todas as tabelas já existem)
- **Ação:** Nenhuma

### UserDataService
- **Afetado:** Usa várias tabelas que não existem (`user_habits`, `user_content_interactions`, `user_baby_milestones`)
- **Ação:** Criar tabelas essenciais, adiar as outras

---

## Próximos Passos

1. ✅ **Concluído:** Mapeamento completo de tabelas código ↔ banco
2. ⏳ **Próximo:** Criar migrations de rename (Fase 1)
3. ⏳ **Depois:** Criar migrations de criação de tabelas (Fase 2)
4. ⏳ **Depois:** Atualizar RLS policies para novas tabelas
5. ⏳ **Depois:** Validar com testes e type-check

---

## Notas Técnicas

- Todas as migrations devem ser **idempotentes** (usar `IF EXISTS` quando apropriado)
- Renames devem atualizar **índices**, **constraints**, **FKs** e **RLS policies**
- Após renames, **regenerar tipos TypeScript** do Supabase se aplicável
- Testar migrations em ambiente de desenvolvimento antes de aplicar em produção

