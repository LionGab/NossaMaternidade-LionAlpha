-- =============================================================================
-- Migration: 20251204000000_create_ai_usage_logs.sql
-- Tabela para rastreamento de custos de uso de IA
-- Nossa Maternidade
-- =============================================================================

-- Criar tabela ai_usage_logs
CREATE TABLE IF NOT EXISTS ai_usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  profile TEXT NOT NULL, -- 'chat', 'analysis', 'moderation', 'crisis', etc
  provider TEXT NOT NULL CHECK (provider IN ('gemini', 'openai', 'anthropic')),
  model_name TEXT NOT NULL,
  input_tokens INTEGER DEFAULT 0,
  output_tokens INTEGER DEFAULT 0,
  total_tokens INTEGER DEFAULT 0,
  estimated_cost_usd DECIMAL(10,6) DEFAULT 0,
  latency_ms INTEGER,
  success BOOLEAN DEFAULT TRUE,
  error_message TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Comentarios nas colunas
COMMENT ON TABLE ai_usage_logs IS 'Rastreamento de uso de APIs de IA para controle de custos';
COMMENT ON COLUMN ai_usage_logs.profile IS 'Perfil/contexto de uso: chat, analysis, moderation, crisis';
COMMENT ON COLUMN ai_usage_logs.provider IS 'Provider de IA: gemini, openai, anthropic';
COMMENT ON COLUMN ai_usage_logs.estimated_cost_usd IS 'Custo estimado em dolares americanos';
COMMENT ON COLUMN ai_usage_logs.latency_ms IS 'Tempo de resposta em milissegundos';

-- Indices para performance
CREATE INDEX IF NOT EXISTS idx_ai_usage_logs_user_id ON ai_usage_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_usage_logs_created_at ON ai_usage_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_usage_logs_provider ON ai_usage_logs(provider);
CREATE INDEX IF NOT EXISTS idx_ai_usage_logs_user_created ON ai_usage_logs(user_id, created_at DESC);

-- Habilitar RLS
ALTER TABLE ai_usage_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Usuarios podem ver seus proprios logs
CREATE POLICY "Users can view own AI usage"
  ON ai_usage_logs FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Usuarios podem inserir seus proprios logs
CREATE POLICY "Users can insert own AI usage"
  ON ai_usage_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Service role tem acesso total (para analytics e admin)
CREATE POLICY "Service role full access"
  ON ai_usage_logs FOR ALL
  USING (
    auth.jwt() IS NOT NULL AND
    (auth.jwt() ->> 'role' = 'service_role' OR auth.jwt() ->> 'role' = 'authenticated')
  );

-- =============================================================================
-- Funcao auxiliar para calcular custos agregados
-- =============================================================================

CREATE OR REPLACE FUNCTION get_ai_usage_stats(
  p_user_id UUID DEFAULT NULL,
  p_start_date TIMESTAMPTZ DEFAULT (NOW() - INTERVAL '30 days'),
  p_end_date TIMESTAMPTZ DEFAULT NOW()
)
RETURNS TABLE (
  total_calls BIGINT,
  total_tokens BIGINT,
  total_cost_usd DECIMAL(12,4),
  by_provider JSONB,
  avg_latency_ms DECIMAL(10,2),
  success_rate DECIMAL(5,4)
) AS $$
BEGIN
  RETURN QUERY
  WITH stats AS (
    SELECT
      COUNT(*) as calls,
      COALESCE(SUM(total_tokens), 0) as tokens,
      COALESCE(SUM(estimated_cost_usd), 0) as cost,
      COALESCE(AVG(latency_ms), 0) as avg_latency,
      CASE WHEN COUNT(*) > 0
        THEN SUM(CASE WHEN success THEN 1 ELSE 0 END)::DECIMAL / COUNT(*)
        ELSE 0
      END as success_pct
    FROM ai_usage_logs
    WHERE (p_user_id IS NULL OR user_id = p_user_id)
      AND created_at >= p_start_date
      AND created_at <= p_end_date
  ),
  provider_stats AS (
    SELECT
      jsonb_object_agg(
        provider,
        jsonb_build_object(
          'calls', provider_calls,
          'cost', provider_cost
        )
      ) as by_prov
    FROM (
      SELECT
        provider,
        COUNT(*) as provider_calls,
        COALESCE(SUM(estimated_cost_usd), 0) as provider_cost
      FROM ai_usage_logs
      WHERE (p_user_id IS NULL OR user_id = p_user_id)
        AND created_at >= p_start_date
        AND created_at <= p_end_date
      GROUP BY provider
    ) sub
  )
  SELECT
    s.calls::BIGINT,
    s.tokens::BIGINT,
    s.cost::DECIMAL(12,4),
    COALESCE(ps.by_prov, '{}'::jsonb),
    s.avg_latency::DECIMAL(10,2),
    s.success_pct::DECIMAL(5,4)
  FROM stats s, provider_stats ps;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant para usuarios autenticados
GRANT EXECUTE ON FUNCTION get_ai_usage_stats TO authenticated;

-- =============================================================================
-- Verificacao
-- =============================================================================

DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'ai_usage_logs') THEN
    RAISE NOTICE 'Tabela ai_usage_logs criada com sucesso!';
  ELSE
    RAISE EXCEPTION 'Falha ao criar tabela ai_usage_logs';
  END IF;
END $$;
