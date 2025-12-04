-- =============================================================================
-- STEP 2: CREATE FUNCTIONS (execute AFTER STEP1)
-- =============================================================================

-- =============================================================================
-- TRIGGERS
-- =============================================================================

CREATE OR REPLACE FUNCTION update_crisis_timestamp()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  NEW.last_modified_by = auth.uid();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_crisis_updated_at ON crisis_interventions;
CREATE TRIGGER trg_crisis_updated_at BEFORE UPDATE ON crisis_interventions FOR EACH ROW EXECUTE FUNCTION update_crisis_timestamp();

CREATE OR REPLACE FUNCTION set_crisis_priority()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.priority := CASE NEW.level
    WHEN 'critical' THEN 1
    WHEN 'severe' THEN 2
    WHEN 'moderate' THEN 5
    WHEN 'low' THEN 8
    ELSE 5
  END;
  IF 'suicidal_ideation' = ANY(NEW.types) THEN NEW.priority := LEAST(NEW.priority, 1);
  ELSIF 'self_harm' = ANY(NEW.types) THEN NEW.priority := LEAST(NEW.priority, 2);
  ELSIF 'domestic_violence' = ANY(NEW.types) THEN NEW.priority := LEAST(NEW.priority, 2);
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_crisis_priority ON crisis_interventions;
CREATE TRIGGER trg_crisis_priority BEFORE INSERT OR UPDATE OF level, types ON crisis_interventions FOR EACH ROW EXECUTE FUNCTION set_crisis_priority();

CREATE OR REPLACE FUNCTION schedule_crisis_follow_up()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.follow_up_needed = TRUE AND NEW.follow_up_scheduled_at IS NULL THEN
    NEW.follow_up_scheduled_at := CASE NEW.level
      WHEN 'critical' THEN NOW() + INTERVAL '2 hours'
      WHEN 'severe' THEN NOW() + INTERVAL '6 hours'
      WHEN 'moderate' THEN NOW() + INTERVAL '24 hours'
      ELSE NOW() + INTERVAL '72 hours'
    END;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_crisis_follow_up ON crisis_interventions;
CREATE TRIGGER trg_crisis_follow_up BEFORE INSERT ON crisis_interventions FOR EACH ROW EXECUTE FUNCTION schedule_crisis_follow_up();

CREATE OR REPLACE FUNCTION update_moderation_timestamp()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_mod_queue_updated ON moderation_queue;
CREATE TRIGGER trg_mod_queue_updated BEFORE UPDATE ON moderation_queue FOR EACH ROW EXECUTE FUNCTION update_moderation_timestamp();

DROP TRIGGER IF EXISTS trg_moderators_updated ON moderators;
CREATE TRIGGER trg_moderators_updated BEFORE UPDATE ON moderators FOR EACH ROW EXECUTE FUNCTION update_moderation_timestamp();

DROP TRIGGER IF EXISTS trg_mod_metrics_updated ON moderation_metrics;
CREATE TRIGGER trg_mod_metrics_updated BEFORE UPDATE ON moderation_metrics FOR EACH ROW EXECUTE FUNCTION update_moderation_timestamp();

CREATE OR REPLACE FUNCTION calculate_queue_time()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF OLD.status = 'pending' AND NEW.status != 'pending' AND NEW.time_in_queue_ms IS NULL THEN
    NEW.time_in_queue_ms := EXTRACT(EPOCH FROM (NOW() - OLD.created_at)) * 1000;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_mod_queue_time ON moderation_queue;
CREATE TRIGGER trg_mod_queue_time BEFORE UPDATE ON moderation_queue FOR EACH ROW EXECUTE FUNCTION calculate_queue_time();

-- =============================================================================
-- DASHBOARD FUNCTIONS
-- =============================================================================

CREATE OR REPLACE FUNCTION get_crisis_daily_stats(p_days INTEGER DEFAULT 30)
RETURNS TABLE (
  date DATE,
  total_count BIGINT,
  critical_count BIGINT,
  severe_count BIGINT,
  moderate_count BIGINT,
  low_count BIGINT,
  cvv_contacts BIGINT
) LANGUAGE plpgsql SECURITY DEFINER AS $$
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

CREATE OR REPLACE FUNCTION get_crisis_type_distribution(
  p_start_date TIMESTAMPTZ DEFAULT NOW() - INTERVAL '30 days',
  p_end_date TIMESTAMPTZ DEFAULT NOW()
)
RETURNS TABLE (
  crisis_type TEXT,
  count BIGINT,
  percentage DECIMAL(5,2)
) LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_total BIGINT;
BEGIN
  SELECT COUNT(*) INTO v_total
  FROM crisis_interventions
  WHERE detected_at BETWEEN p_start_date AND p_end_date
    AND deleted_at IS NULL AND anonymized_at IS NULL;

  RETURN QUERY
  SELECT
    unnest(ci.types)::TEXT as crisis_type,
    COUNT(*) as count,
    CASE WHEN v_total > 0 THEN ROUND((COUNT(*)::decimal / v_total) * 100, 2) ELSE 0 END as percentage
  FROM crisis_interventions ci
  WHERE ci.detected_at BETWEEN p_start_date AND p_end_date
    AND ci.deleted_at IS NULL AND ci.anonymized_at IS NULL
  GROUP BY unnest(ci.types)
  ORDER BY count DESC;
END;
$$;

CREATE OR REPLACE FUNCTION get_cvv_click_stats()
RETURNS TABLE (
  today_count BIGINT,
  yesterday_count BIGINT,
  variation_percent DECIMAL(5,2),
  alert_threshold_exceeded BOOLEAN
) LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_today BIGINT;
  v_yesterday BIGINT;
  v_variation DECIMAL(5,2);
BEGIN
  SELECT COUNT(*) INTO v_today FROM crisis_interventions
  WHERE status = 'contacted_cvv' AND DATE(detected_at) = CURRENT_DATE AND deleted_at IS NULL AND anonymized_at IS NULL;

  SELECT COUNT(*) INTO v_yesterday FROM crisis_interventions
  WHERE status = 'contacted_cvv' AND DATE(detected_at) = CURRENT_DATE - 1 AND deleted_at IS NULL AND anonymized_at IS NULL;

  IF v_yesterday > 0 THEN
    v_variation := ROUND(((v_today - v_yesterday)::decimal / v_yesterday) * 100, 2);
  ELSE
    v_variation := CASE WHEN v_today > 0 THEN 100.00 ELSE 0.00 END;
  END IF;

  RETURN QUERY SELECT v_today, v_yesterday, v_variation, (v_variation > 20);
END;
$$;

CREATE OR REPLACE FUNCTION get_moderation_queue_stats()
RETURNS TABLE (
  pending_count BIGINT,
  high_priority_count BIGINT,
  avg_queue_latency_ms DECIMAL(10,2),
  oldest_pending_minutes INTEGER
) LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*) FILTER (WHERE mq.status = 'pending') as pending_count,
    COUNT(*) FILTER (WHERE mq.status = 'pending' AND mq.priority <= 3) as high_priority_count,
    COALESCE(AVG(mq.time_in_queue_ms) FILTER (WHERE mq.status != 'pending' AND mq.time_in_queue_ms IS NOT NULL), 0) as avg_queue_latency_ms,
    COALESCE(EXTRACT(EPOCH FROM (NOW() - MIN(mq.created_at) FILTER (WHERE mq.status = 'pending'))) / 60, 0)::INTEGER as oldest_pending_minutes
  FROM moderation_queue mq
  WHERE mq.deleted_at IS NULL;
END;
$$;

CREATE OR REPLACE FUNCTION register_crisis_intervention(
  p_user_id UUID,
  p_level crisis_level,
  p_types crisis_type[],
  p_trigger_message TEXT DEFAULT NULL,
  p_matched_patterns TEXT[] DEFAULT NULL,
  p_session_id UUID DEFAULT NULL
) RETURNS UUID LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_id UUID;
BEGIN
  INSERT INTO crisis_interventions (user_id, level, types, trigger_message, matched_patterns, session_id, created_by)
  VALUES (p_user_id, p_level, p_types, p_trigger_message, p_matched_patterns, p_session_id, auth.uid())
  RETURNING id INTO v_id;
  RETURN v_id;
END;
$$;

CREATE OR REPLACE FUNCTION update_crisis_status(
  p_intervention_id UUID,
  p_status intervention_status,
  p_resources_shown TEXT[] DEFAULT NULL,
  p_action JSONB DEFAULT NULL
) RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_actions JSONB;
BEGIN
  SELECT user_actions INTO v_actions FROM crisis_interventions WHERE id = p_intervention_id;
  IF p_action IS NOT NULL THEN v_actions := COALESCE(v_actions, '[]'::jsonb) || p_action; END IF;

  UPDATE crisis_interventions SET
    status = p_status,
    resources_shown = COALESCE(p_resources_shown, resources_shown),
    user_actions = v_actions,
    acknowledged_at = CASE WHEN p_status = 'user_acknowledged' AND acknowledged_at IS NULL THEN NOW() ELSE acknowledged_at END,
    resolved_at = CASE WHEN p_status IN ('resolved', 'follow_up_completed') AND resolved_at IS NULL THEN NOW() ELSE resolved_at END
  WHERE id = p_intervention_id;
  RETURN FOUND;
END;
$$;

CREATE OR REPLACE FUNCTION get_pending_follow_ups()
RETURNS TABLE (
  id UUID, user_id UUID, level crisis_level, types crisis_type[],
  detected_at TIMESTAMPTZ, follow_up_scheduled_at TIMESTAMPTZ, priority INTEGER, hours_overdue NUMERIC
) LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY
  SELECT ci.id, ci.user_id, ci.level, ci.types, ci.detected_at, ci.follow_up_scheduled_at, ci.priority,
    EXTRACT(EPOCH FROM (NOW() - ci.follow_up_scheduled_at)) / 3600 as hours_overdue
  FROM crisis_interventions ci
  WHERE ci.follow_up_needed = TRUE AND ci.follow_up_completed_at IS NULL AND ci.deleted_at IS NULL AND ci.follow_up_scheduled_at <= NOW()
  ORDER BY ci.priority ASC, ci.follow_up_scheduled_at ASC;
END;
$$;

CREATE OR REPLACE FUNCTION queue_for_moderation(
  p_content_id UUID, p_content_type content_type, p_content_text TEXT, p_author_id UUID,
  p_source moderation_source, p_auto_flags TEXT[] DEFAULT NULL, p_ai_score DECIMAL DEFAULT NULL, p_ai_analysis JSONB DEFAULT NULL
) RETURNS UUID LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_id UUID;
BEGIN
  INSERT INTO moderation_queue (content_id, content_type, content_text, author_id, author_trust_score, source, auto_filter_flags, ai_safety_score, ai_analysis)
  VALUES (p_content_id, p_content_type, p_content_text, p_author_id, 5.0, p_source, COALESCE(p_auto_flags, ARRAY[]::TEXT[]), p_ai_score, p_ai_analysis)
  RETURNING id INTO v_id;
  RETURN v_id;
END;
$$;

CREATE OR REPLACE FUNCTION assign_moderation_item(p_item_id UUID DEFAULT NULL, p_moderator_id UUID DEFAULT NULL)
RETURNS UUID LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_item_id UUID;
  v_mod_id UUID;
BEGIN
  v_mod_id := COALESCE(p_moderator_id, auth.uid());
  IF NOT EXISTS (SELECT 1 FROM moderators WHERE user_id = v_mod_id AND active = TRUE) THEN
    RAISE EXCEPTION 'User is not an active moderator';
  END IF;

  IF p_item_id IS NULL THEN
    SELECT id INTO v_item_id FROM moderation_queue WHERE status = 'pending' AND deleted_at IS NULL ORDER BY priority ASC, created_at ASC LIMIT 1 FOR UPDATE SKIP LOCKED;
  ELSE
    v_item_id := p_item_id;
  END IF;

  IF v_item_id IS NULL THEN RETURN NULL; END IF;

  UPDATE moderation_queue SET status = 'assigned', assigned_to = v_mod_id, assigned_at = NOW(), assignment_expires_at = NOW() + INTERVAL '15 minutes' WHERE id = v_item_id AND status = 'pending';
  RETURN v_item_id;
END;
$$;

-- =============================================================================
-- MATERIALIZED VIEW
-- =============================================================================

DROP MATERIALIZED VIEW IF EXISTS mv_dashboard_crisis_summary;
CREATE MATERIALIZED VIEW mv_dashboard_crisis_summary AS
SELECT
  COUNT(*) FILTER (WHERE DATE(detected_at) = CURRENT_DATE) as crises_today,
  COUNT(*) FILTER (WHERE DATE(detected_at) = CURRENT_DATE AND level IN ('critical', 'severe')) as critical_today,
  COUNT(*) FILTER (WHERE detected_at >= NOW() - INTERVAL '7 days') as crises_7d,
  COUNT(*) FILTER (WHERE status = 'contacted_cvv' AND DATE(detected_at) = CURRENT_DATE) as cvv_contacts_today,
  COUNT(*) FILTER (WHERE follow_up_needed = TRUE AND follow_up_completed_at IS NULL) as pending_followups,
  NOW() as refreshed_at
FROM crisis_interventions
WHERE deleted_at IS NULL AND anonymized_at IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_dashboard_crisis_summary ON mv_dashboard_crisis_summary(refreshed_at);

CREATE OR REPLACE FUNCTION refresh_dashboard_cache() RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_dashboard_crisis_summary;
END;
$$;

-- =============================================================================
-- COMMENTS
-- =============================================================================

COMMENT ON TABLE crisis_interventions IS 'Registros de intervencoes de crise - LGPD compliant';
COMMENT ON TABLE moderation_queue IS 'Fila de moderacao para Super Mamas';
COMMENT ON TABLE moderators IS 'Super Mamas moderadoras';
COMMENT ON FUNCTION get_crisis_daily_stats IS 'Stats diarias para graficos';
COMMENT ON FUNCTION get_cvv_click_stats IS 'Cliques CVV com variacao';
COMMENT ON FUNCTION get_moderation_queue_stats IS 'Stats da fila de moderacao';

SELECT 'STEP 2 COMPLETE - Functions created!' as status;
