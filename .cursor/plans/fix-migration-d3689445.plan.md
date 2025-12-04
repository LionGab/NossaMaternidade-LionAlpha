<!-- d3689445-5d23-4d42-84a7-f2b4224c9b31 ad1ad3d2-1ad7-4c79-a70e-794e9e64f98b -->
# Fix Migration Duplicates

## Problema
A migration `20251203100000_crisis_monitoring_dashboard.sql` está tentando criar tabelas que já existem nas migrations anteriores:
- `crisis_interventions` (já existe em `20251203000001`)
- `moderation_queue` (já existe em `20251203000002`)

Isso causará erro: `relation already exists` ao rodar as migrations em ordem.

## Solução

### 1. Refatorar [supabase/migrations/20251203100000_crisis_monitoring_dashboard.sql](supabase/migrations/20251203100000_crisis_monitoring_dashboard.sql)

**Remover (linhas 1-165):**
- ✂️ ENUMs duplicados: `intervention_type`, `crisis_level`, `crisis_outcome`
- ✂️ `CREATE TABLE crisis_interventions` (linha 46-85)
- ✂️ `CREATE TABLE moderation_queue` (linha 89-123)
- ✂️ Índices duplicados (linhas 128-158)
- ✂️ RLS policies duplicadas (linhas 160-200)

**Manter:**
- ✅ Functions de dashboard (linhas 204-345):
  - `get_crisis_daily_stats()`
  - `get_crisis_type_distribution()`
  - `get_cvv_click_stats()`
  - `get_moderation_queue_stats()`
- ✅ Materialized view `mv_dashboard_crisis_summary` (linha 370)
- ✅ Function `refresh_dashboard_cache()` (linha 395)
- ✅ Triggers `update_updated_at_column()` (se não estiverem nas migrations anteriores)
- ⚠️ Seed data (comentar ou remover, já tem nas outras migrations)

### 2. Estrutura Final do Arquivo

Após refatoração, o arquivo deve conter APENAS:

```sql
-- =============================================================================
-- CRISIS MONITORING DASHBOARD - INCREMENTAL FUNCTIONS
-- Adiciona functions de analytics sobre tabelas existentes
-- Depende de: 20251203000001, 20251203000002
-- =============================================================================

-- 1. FUNCTION: Crises por dia (gráfico de linha)
CREATE OR REPLACE FUNCTION get_crisis_daily_stats(...) ...

-- 2. FUNCTION: Tipos de crise (pie chart)
CREATE OR REPLACE FUNCTION get_crisis_type_distribution(...) ...

-- 3. FUNCTION: Cliques CVV com variação
CREATE OR REPLACE FUNCTION get_cvv_click_stats(...) ...

-- 4. FUNCTION: Fila de moderação stats
CREATE OR REPLACE FUNCTION get_moderation_queue_stats(...) ...

-- 5. MATERIALIZED VIEW: Dashboard cache
CREATE MATERIALIZED VIEW mv_dashboard_crisis_summary ...

-- 6. FUNCTION: Refresh cache
CREATE OR REPLACE FUNCTION refresh_dashboard_cache() ...

-- 7. COMMENTS
COMMENT ON FUNCTION get_crisis_daily_stats IS ...
```

### 3. Validação

Após a correção:

```bash
# Testar ordem das migrations
supabase db reset --local
supabase db push --local

# Verificar tabelas
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';

# Verificar functions
SELECT routine_name FROM information_schema.routines WHERE routine_schema = 'public';
```

### 4. Atualizar [docs/SUPABASE_MIGRATIONS_GUIDE.md](docs/SUPABASE_MIGRATIONS_GUIDE.md)

Adicionar nota sobre ordem de execução:

```markdown
## Ordem das Migrações

1. ✅ `20251203000000_create_funnel_events.sql` (tabela + functions)
2. ✅ `20251203000001_create_crisis_interventions.sql` (tabela + functions)
3. ✅ `20251203000002_create_moderation_queue.sql` (tabela + functions)
4. ✅ `20251203100000_crisis_monitoring_dashboard.sql` (APENAS functions de dashboard)

⚠️ **Importante:** Rodar na ordem exata. A migration #4 depende das tabelas criadas nas #1, #2, #3.
```

## Resultado Esperado

- ✅ 0 erros ao rodar `supabase db push`
- ✅ 4 tabelas criadas: `funnel_events`, `crisis_interventions`, `moderation_queue`, `moderators`, `moderation_metrics`
- ✅ 1 materialized view: `mv_dashboard_crisis_summary`
- ✅ 12+ functions disponíveis para analytics
- ✅ Seed data opcional (apenas dev)
