-- =============================================================================
-- CRISIS MONITORING DASHBOARD - INCREMENTAL FUNCTIONS
-- Adiciona functions de analytics sobre tabelas existentes
-- Depende de: 20251203000001_create_crisis_interventions.sql
--            20251203000002_create_moderation_queue.sql
-- =============================================================================

-- 1. FUNCTION: Crises por dia (gráfico de linha)
-- Retorna estatísticas diárias de crises para os últimos N dias
CREATE OR REPLACE FUNCTION get_crisis_daily_stats(
  p_days INTEGER DEFAULT 30
)
RETURNS TABLE (
  date DATE,
  total_count BIGINT,
  critical_count BIGINT,
  severe_count BIGINT,
  moderate_count BIGINT,
  low_count BIGINT,
  cvv_contacts BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    DATE(ci.detected_at) as date,
    COUNT(*) as total_count,
    COUNT(*) FILTER (WHERE ci.level = 'critical') as critical_count,
    COUNT(*) FILTER (WHERE ci.level = 'severe') as severe_count,
    COUNT(*) FILTER (WHERE ci.level = 'moderate') as moderate_count,
    COUNT(*) FILTER (WHERE ci.level = 'low') as low_count,
    COUNT(*) FILTER (WHERE ci.status = 'contacted_cvv') as cvv_contacts
  FROM crisis_interventions ci
  WHERE ci.detected_at >= NOW() - (p_days || ' days')::INTERVAL
    AND ci.deleted_at IS NULL
    AND ci.anonymized_at IS NULL
  GROUP BY DATE(ci.detected_at)
  ORDER BY date DESC;
END;
$$;

-- 2. FUNCTION: Tipos de crise (pie chart)
-- Retorna distribuição de tipos de crise para gráfico de pizza
CREATE OR REPLACE FUNCTION get_crisis_type_distribution(
  p_start_date TIMESTAMPTZ DEFAULT NOW() - INTERVAL '30 days',
  p_end_date TIMESTAMPTZ DEFAULT NOW()
)
RETURNS TABLE (
  crisis_type TEXT,
  count BIGINT,
  percentage DECIMAL(5,2)
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_total BIGINT;
BEGIN
  -- Total para calcular porcentagem
  SELECT COUNT(*) INTO v_total
  FROM crisis_interventions
  WHERE detected_at BETWEEN p_start_date AND p_end_date
    AND deleted_at IS NULL
    AND anonymized_at IS NULL;

  RETURN QUERY
  SELECT
    unnest(ci.types)::TEXT as crisis_type,
    COUNT(*) as count,
    CASE
      WHEN v_total > 0
      THEN ROUND((COUNT(*)::decimal / v_total) * 100, 2)
      ELSE 0
    END as percentage
  FROM crisis_interventions ci
  WHERE ci.detected_at BETWEEN p_start_date AND p_end_date
    AND ci.deleted_at IS NULL
    AND ci.anonymized_at IS NULL
  GROUP BY unnest(ci.types)
  ORDER BY count DESC;
END;
$$;

-- 3. FUNCTION: Cliques no CVV (com variação % dia anterior)
-- Retorna estatísticas de cliques no CVV com alerta se aumento > 20%
CREATE OR REPLACE FUNCTION get_cvv_click_stats()
RETURNS TABLE (
  today_count BIGINT,
  yesterday_count BIGINT,
  variation_percent DECIMAL(5,2),
  alert_threshold_exceeded BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_today BIGINT;
  v_yesterday BIGINT;
  v_variation DECIMAL(5,2);
BEGIN
  -- Cliques hoje (status = 'contacted_cvv')
  SELECT COUNT(*) INTO v_today
  FROM crisis_interventions
  WHERE status = 'contacted_cvv'
    AND DATE(detected_at) = CURRENT_DATE
    AND deleted_at IS NULL
    AND anonymized_at IS NULL;

  -- Cliques ontem
  SELECT COUNT(*) INTO v_yesterday
  FROM crisis_interventions
  WHERE status = 'contacted_cvv'
    AND DATE(detected_at) = CURRENT_DATE - 1
    AND deleted_at IS NULL
    AND anonymized_at IS NULL;

  -- Calcular variação
  IF v_yesterday > 0 THEN
    v_variation := ROUND(((v_today - v_yesterday)::decimal / v_yesterday) * 100, 2);
  ELSE
    v_variation := CASE WHEN v_today > 0 THEN 100.00 ELSE 0.00 END;
  END IF;

  RETURN QUERY
  SELECT
    v_today,
    v_yesterday,
    v_variation,
    (v_variation > 20); -- Alert if > 20% increase
END;
$$;

-- 4. FUNCTION: Fila de moderação stats
-- Retorna estatísticas da fila de moderação para dashboard
CREATE OR REPLACE FUNCTION get_moderation_queue_stats()
RETURNS TABLE (
  pending_count BIGINT,
  high_priority_count BIGINT,
  avg_queue_latency_ms DECIMAL(10,2),
  oldest_pending_minutes INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*) FILTER (WHERE mq.status = 'pending') as pending_count,
    COUNT(*) FILTER (WHERE mq.status = 'pending' AND mq.priority <= 3) as high_priority_count,
    COALESCE(AVG(mq.time_in_queue_ms) FILTER (WHERE mq.status != 'pending' AND mq.time_in_queue_ms IS NOT NULL), 0) as avg_queue_latency_ms,
    COALESCE(
      EXTRACT(EPOCH FROM (NOW() - MIN(mq.created_at) FILTER (WHERE mq.status = 'pending'))) / 60,
      0
    )::INTEGER as oldest_pending_minutes
  FROM moderation_queue mq
  WHERE mq.deleted_at IS NULL;
END;
$$;

-- 5. MATERIALIZED VIEW: Dashboard summary (cache de 5 min)
-- View materializada para cache rápido do dashboard
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_dashboard_crisis_summary AS
SELECT
  -- Crises hoje
  COUNT(*) FILTER (WHERE DATE(detected_at) = CURRENT_DATE) as crises_today,
  COUNT(*) FILTER (WHERE DATE(detected_at) = CURRENT_DATE AND level IN ('critical', 'severe')) as critical_today,

  -- Crises últimos 7 dias
  COUNT(*) FILTER (WHERE detected_at >= NOW() - INTERVAL '7 days') as crises_7d,

  -- Contatos CVV hoje
  COUNT(*) FILTER (WHERE status = 'contacted_cvv' AND DATE(detected_at) = CURRENT_DATE) as cvv_contacts_today,

  -- Follow-ups pendentes
  COUNT(*) FILTER (WHERE follow_up_needed = TRUE AND follow_up_completed_at IS NULL) as pending_followups,

  -- Última atualização
  NOW() as refreshed_at
FROM crisis_interventions
WHERE deleted_at IS NULL
  AND anonymized_at IS NULL;

-- Index para refresh rápido
CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_dashboard_crisis_summary
  ON mv_dashboard_crisis_summary(refreshed_at);

-- 6. FUNCTION: Refresh cache
-- Função para refresh automático da view materializada (chamada via cron ou realtime)
CREATE OR REPLACE FUNCTION refresh_dashboard_cache()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_dashboard_crisis_summary;
END;
$$;

-- 7. COMMENTS
COMMENT ON FUNCTION get_crisis_daily_stats IS 'Retorna estatísticas diárias de crises para gráficos de linha. Usa detected_at e status da tabela crisis_interventions.';
COMMENT ON FUNCTION get_crisis_type_distribution IS 'Retorna distribuição de tipos de crise para pie chart. Agrupa por array types.';
COMMENT ON FUNCTION get_cvv_click_stats IS 'Retorna cliques no CVV com variação percentual. Alerta se aumento > 20%.';
COMMENT ON FUNCTION get_moderation_queue_stats IS 'Retorna estatísticas da fila de moderação. Usa time_in_queue_ms e priority da tabela moderation_queue.';
COMMENT ON MATERIALIZED VIEW mv_dashboard_crisis_summary IS 'Cache do dashboard de crises. Refresh via refresh_dashboard_cache() a cada 5 minutos.';
COMMENT ON FUNCTION refresh_dashboard_cache IS 'Refresh automático da view materializada. Chamar via cron job ou Supabase Edge Function.';
