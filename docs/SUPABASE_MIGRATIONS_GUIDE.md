# Guia de Migrações Supabase

> Nossa Maternidade - Dezembro 2025

---

## Resumo das Tabelas Criadas

| Tabela | Propósito | LGPD |
|--------|-----------|------|
| `funnel_events` | Rastrear jornada do usuário | ✅ Anonimizável |
| `crisis_interventions` | Registrar intervenções de crise | ✅ Sensível, criptografado |
| `moderation_queue` | Fila de moderação de conteúdo | ✅ Soft delete |
| `moderators` | Super Mamas moderadoras | ✅ RLS |
| `moderation_metrics` | Métricas diárias agregadas | N/A |

---

## Ordem das Migrações

⚠️ **IMPORTANTE:** Rodar as migrations na ordem exata abaixo. A migration #4 depende das tabelas criadas nas #1, #2, #3.

1. ✅ `20251203000000_create_funnel_events.sql` (tabela `funnel_events` + functions)
2. ✅ `20251203000001_create_crisis_interventions.sql` (tabela `crisis_interventions` + functions)
3. ✅ `20251203000002_create_moderation_queue.sql` (tabelas `moderation_queue`, `moderators`, `moderation_metrics` + functions)
4. ✅ `20251203100000_crisis_monitoring_dashboard.sql` (**APENAS** functions de dashboard + materialized view)

**Nota:** A migration #4 não cria tabelas, apenas adiciona functions incrementais de analytics que dependem das tabelas criadas nas migrations anteriores.

---

## 1. Como Rodar as Migrações

### Opção A: Via Supabase CLI (Recomendado)

```bash
# 1. Instalar Supabase CLI (se não tiver)
npm install -g supabase

# 2. Login no Supabase
supabase login

# 3. Linkar projeto
cd /c/Users/User/Downloads/NM-gl/NossaMaternidade-1
supabase link --project-ref <SEU_PROJECT_REF>

# 4. Verificar status das migrações
supabase migration list

# 5. Rodar migrações (push para produção)
supabase db push

# 6. Verificar se rodou
supabase migration list
```

### Opção B: Via Dashboard Supabase

1. Acesse: https://supabase.com/dashboard
2. Selecione seu projeto
3. Vá em **SQL Editor**
4. Para cada arquivo **na ordem exata**:
   - `20251203000000_create_funnel_events.sql`
   - `20251203000001_create_crisis_interventions.sql`
   - `20251203000002_create_moderation_queue.sql`
   - `20251203100000_crisis_monitoring_dashboard.sql` (apenas functions, não cria tabelas)
5. Cole o conteúdo e clique **Run**

### Opção C: Via psql Direto

```bash
# Conectar ao banco
psql "postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres"

# Rodar cada migração na ordem
\i supabase/migrations/20251203000000_create_funnel_events.sql
\i supabase/migrations/20251203000001_create_crisis_interventions.sql
\i supabase/migrations/20251203000002_create_moderation_queue.sql
\i supabase/migrations/20251203100000_crisis_monitoring_dashboard.sql
```

---

## 2. Verificar se Funcionou

### Verificar tabelas criadas:

```sql
-- Listar todas as tabelas novas
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN (
  'funnel_events',
  'crisis_interventions',
  'moderation_queue',
  'moderators',
  'moderation_metrics'
);
```

### Verificar ENUMs criados:

```sql
-- Listar todos os tipos enum
SELECT typname
FROM pg_type
WHERE typtype = 'e'
AND typname IN (
  'funnel_stage',
  'crisis_level',
  'crisis_type',
  'intervention_status',
  'moderation_status',
  'content_type',
  'moderation_source',
  'rejection_reason'
);
```

### Verificar RLS habilitado:

```sql
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN (
  'funnel_events',
  'crisis_interventions',
  'moderation_queue',
  'moderators',
  'moderation_metrics'
);
```

---

## 3. Testar Cada Tabela

### 3.1 Testar `funnel_events`

```sql
-- Inserir evento de teste (anônimo)
INSERT INTO funnel_events (stage, session_id, device_fingerprint, metadata)
VALUES (
  'app_opened',
  gen_random_uuid(),
  'test-device-123',
  '{"source": "test", "device": "web"}'::jsonb
);

-- Verificar inserção
SELECT * FROM funnel_events ORDER BY created_at DESC LIMIT 5;

-- Testar função de métricas
SELECT * FROM calculate_funnel_metrics(
  NOW() - INTERVAL '30 days',
  NOW()
);

-- Testar análise de dropoff
SELECT * FROM get_dropoff_analysis(NOW() - INTERVAL '7 days');
```

### 3.2 Testar `crisis_interventions`

```sql
-- ⚠️ IMPORTANTE: Precisa de um user_id válido
-- Substitua pelo ID de um usuário de teste

-- Registrar intervenção via função
SELECT register_crisis_intervention(
  '<USER_ID_AQUI>'::uuid,       -- user_id
  'moderate'::crisis_level,     -- level
  ARRAY['overwhelm']::crisis_type[], -- types
  'Mensagem de teste',          -- trigger_message
  ARRAY['teste', 'cansada'],    -- matched_patterns
  gen_random_uuid()             -- session_id
);

-- Verificar inserção
SELECT id, level, types, status, priority, follow_up_scheduled_at
FROM crisis_interventions
ORDER BY created_at DESC
LIMIT 5;

-- Testar atualização de status
SELECT update_crisis_status(
  '<INTERVENTION_ID>'::uuid,
  'resources_shown'::intervention_status,
  ARRAY['cvv_188', 'breathing_exercise'],
  '{"action": "viewed_resources", "timestamp": "2025-12-03T10:00:00Z"}'::jsonb
);

-- Buscar crises recentes
SELECT * FROM get_recent_crises('<USER_ID>'::uuid, 24);

-- Buscar follow-ups pendentes
SELECT * FROM get_pending_follow_ups();

-- Métricas de crise
SELECT * FROM get_crisis_metrics();
```

### 3.3 Testar `moderation_queue`

```sql
-- Adicionar item à fila via função
SELECT queue_for_moderation(
  gen_random_uuid(),            -- content_id (ID do post)
  'post'::content_type,
  'Este é um post de teste para moderação',
  '<AUTHOR_USER_ID>'::uuid,     -- author_id
  'ai_review'::moderation_source,
  ARRAY['medical_keyword']::TEXT[],
  0.55,                         -- ai_safety_score
  '{"category": "medical", "confidence": 0.85}'::jsonb
);

-- Verificar fila
SELECT id, content_text, status, priority, ai_safety_score
FROM moderation_queue
ORDER BY priority ASC, created_at ASC
LIMIT 10;

-- Dashboard da fila
SELECT * FROM get_moderation_dashboard();

-- ⚠️ Para testar atribuição, primeiro crie uma moderadora:
INSERT INTO moderators (user_id, tier, compensation_brl)
VALUES ('<MODERATOR_USER_ID>'::uuid, 'base', 300.00);

-- Atribuir próximo item (como moderadora logada)
-- SET LOCAL ROLE authenticated;
-- SET LOCAL request.jwt.claim.sub = '<MODERATOR_USER_ID>';
SELECT assign_moderation_item();

-- Tomar decisão
SELECT decide_moderation(
  '<QUEUE_ITEM_ID>'::uuid,
  'approved'::moderation_status,
  NULL,  -- reason (só para rejeição)
  'Conteúdo seguro, aprovado'
);
```

### 3.4 Testar Functions de Dashboard (20251203100000)

```sql
-- ⚠️ IMPORTANTE: Estas functions dependem das tabelas criadas nas migrations anteriores

-- 1. Estatísticas diárias de crises (últimos 30 dias)
SELECT * FROM get_crisis_daily_stats(30);

-- 2. Distribuição de tipos de crise (pie chart)
SELECT * FROM get_crisis_type_distribution(
  NOW() - INTERVAL '30 days',
  NOW()
);

-- 3. Estatísticas de cliques no CVV (com alerta se aumento > 20%)
SELECT * FROM get_cvv_click_stats();

-- 4. Estatísticas da fila de moderação
SELECT * FROM get_moderation_queue_stats();

-- 5. Dashboard cache (view materializada)
SELECT * FROM mv_dashboard_crisis_summary;

-- 6. Refresh do cache (executar via cron a cada 5 minutos)
SELECT refresh_dashboard_cache();
```

---

## 4. Queries Úteis para Produção

### Dashboard de Funil

```sql
-- Conversão completa do funil
WITH funnel AS (
  SELECT
    stage,
    COUNT(DISTINCT COALESCE(user_id::text, device_fingerprint)) as users
  FROM funnel_events
  WHERE created_at >= NOW() - INTERVAL '30 days'
    AND deleted_at IS NULL
  GROUP BY stage
)
SELECT
  stage,
  users,
  ROUND(users * 100.0 / FIRST_VALUE(users) OVER (ORDER BY
    CASE stage
      WHEN 'app_opened' THEN 1
      WHEN 'onboarding_complete' THEN 5
      WHEN 'aha_moment_nathia' THEN 6
      WHEN 'subscription_started' THEN 11
    END
  ), 2) as conversion_pct
FROM funnel
ORDER BY
  CASE stage
    WHEN 'app_opened' THEN 1
    WHEN 'onboarding_started' THEN 2
    WHEN 'onboarding_complete' THEN 5
    WHEN 'subscription_started' THEN 11
  END;
```

### Alerta de Crises Críticas

```sql
-- Crises críticas nas últimas 24h (para notificação)
SELECT
  ci.id,
  ci.user_id,
  ci.level,
  ci.types,
  ci.detected_at,
  ci.status,
  p.full_name as user_name
FROM crisis_interventions ci
LEFT JOIN profiles p ON p.id = ci.user_id
WHERE ci.level IN ('severe', 'critical')
  AND ci.detected_at >= NOW() - INTERVAL '24 hours'
  AND ci.deleted_at IS NULL
ORDER BY ci.priority ASC, ci.detected_at DESC;
```

### Saúde da Moderação

```sql
-- Status atual da moderação
SELECT
  COUNT(*) FILTER (WHERE status = 'pending') as pending,
  COUNT(*) FILTER (WHERE status = 'pending' AND created_at < NOW() - INTERVAL '30 minutes') as overdue,
  COUNT(*) FILTER (WHERE status = 'escalated') as escalated,
  ROUND(AVG(time_in_queue_ms) / 60000.0, 2) as avg_wait_minutes,
  COUNT(DISTINCT assigned_to) as active_moderators
FROM moderation_queue
WHERE deleted_at IS NULL
  AND created_at >= NOW() - INTERVAL '24 hours';
```

---

## 5. LGPD: Anonimização de Dados

### Anonimizar dados de um usuário específico

```sql
-- Quando usuária solicitar exclusão (LGPD Art. 18)

-- 1. Anonimizar funnel events
SELECT anonymize_funnel_events('<USER_ID>'::uuid);

-- 2. Anonimizar crisis interventions
SELECT anonymize_crisis_interventions('<USER_ID>'::uuid);

-- 3. Verificar anonimização
SELECT
  'funnel_events' as table_name,
  COUNT(*) FILTER (WHERE anonymized_at IS NOT NULL) as anonymized,
  COUNT(*) FILTER (WHERE anonymized_at IS NULL) as not_anonymized
FROM funnel_events
WHERE user_id = '<USER_ID>'::uuid

UNION ALL

SELECT
  'crisis_interventions',
  COUNT(*) FILTER (WHERE anonymized_at IS NOT NULL),
  COUNT(*) FILTER (WHERE anonymized_at IS NULL)
FROM crisis_interventions
WHERE user_id = '<USER_ID>'::uuid;
```

### Limpeza automática (CRON job)

```sql
-- Anonimizar dados com mais de 2 anos (executar mensalmente)
DO $$
DECLARE
  v_cutoff TIMESTAMPTZ := NOW() - INTERVAL '2 years';
BEGIN
  -- Funnel events
  UPDATE funnel_events
  SET
    user_id = NULL,
    device_fingerprint = 'ANONYMIZED-' || id::text,
    metadata = metadata - 'ip_address' - 'user_agent',
    anonymized_at = NOW()
  WHERE created_at < v_cutoff
    AND anonymized_at IS NULL;

  -- Crisis interventions (manter por mais tempo por razões médicas)
  UPDATE crisis_interventions
  SET
    trigger_message = '[RETIDO POR RAZÕES MÉDICAS]',
    matched_patterns = ARRAY['[ANONYMIZED]'],
    anonymized_at = NOW()
  WHERE created_at < v_cutoff - INTERVAL '3 years' -- 5 anos total
    AND anonymized_at IS NULL;
END $$;
```

---

## 6. Troubleshooting

### Erro: "permission denied"

```sql
-- Verificar se RLS está bloqueando
-- Temporariamente desabilitar para debug (⚠️ apenas em dev)
ALTER TABLE funnel_events DISABLE ROW LEVEL SECURITY;
-- Lembrar de reabilitar!
ALTER TABLE funnel_events ENABLE ROW LEVEL SECURITY;
```

### Erro: "duplicate key value violates unique constraint"

```sql
-- Verificar se enum já existe
SELECT typname FROM pg_type WHERE typname = 'funnel_stage';

-- Se precisar recriar, dropar primeiro
DROP TYPE IF EXISTS funnel_stage CASCADE;
```

### Performance lenta

```sql
-- Verificar se índices existem
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'funnel_events';

-- Analisar plano de execução
EXPLAIN ANALYZE
SELECT * FROM funnel_events
WHERE user_id = '<UUID>'
AND deleted_at IS NULL
ORDER BY created_at DESC
LIMIT 10;

-- Reindexar se necessário
REINDEX TABLE funnel_events;
```

---

## 7. Próximos Passos

1. **[ ] Configurar CRON jobs** para:
   - `update_daily_moderation_metrics()` - diário às 00:05
   - Limpeza LGPD - mensal

2. **[ ] Criar Edge Functions** para:
   - Notificação de crises críticas (webhook)
   - Alerta de fila de moderação cheia

3. **[ ] Integrar no App**:
   - `retentionService.ts` → `funnel_events`
   - `CrisisDetectionService.ts` → `crisis_interventions`
   - `communityModerationService.ts` → `moderation_queue`

---

*Última atualização: 3 de dezembro de 2025*
*Autor: Claude*
