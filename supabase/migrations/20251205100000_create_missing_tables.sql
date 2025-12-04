-- =============================================================================
-- Migration: 20251205100000_create_missing_tables.sql
-- Data: 2025-12-05
-- Objetivo: Criar as 8 tabelas faltantes para MVP funcionar
--
-- TABELAS CRIADAS:
-- 1. check_in_logs      - Check-ins emocionais diários
-- 2. sleep_logs         - Registro de sono
-- 3. breastfeeding_sessions - Sessões de amamentação
-- 4. legal_acceptances  - Aceite de termos LGPD
-- 5. user_sessions      - Métricas de retenção D1/D7/D30
-- 6. ai_usage_logs      - Rastreamento de custo de IA
-- 7. funnel_events      - Funil de conversão
-- 8. user_baby_milestones - Marcos do bebê (+ baby_milestones catalog)
--
-- PRE-REQUISITOS:
-- - auth.users existe (Supabase Auth)
-- - user_profiles existe (tabela principal de perfis)
-- =============================================================================

-- Garantir que temos a função update_updated_at_column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- 1. CHECK_IN_LOGS - Check-ins emocionais diários (Home → MoodSelector)
-- =============================================================================
CREATE TABLE IF NOT EXISTS check_in_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  emotion TEXT NOT NULL CHECK (emotion IN ('bem', 'triste', 'ansiosa', 'cansada', 'calma')),
  intensity INTEGER CHECK (intensity BETWEEN 1 AND 5),
  notes TEXT,
  factors TEXT[],
  logged_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE check_in_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own check-ins" ON check_in_logs;
CREATE POLICY "Users can view own check-ins" ON check_in_logs 
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own check-ins" ON check_in_logs;
CREATE POLICY "Users can insert own check-ins" ON check_in_logs 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own check-ins" ON check_in_logs;
CREATE POLICY "Users can update own check-ins" ON check_in_logs 
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own check-ins" ON check_in_logs;
CREATE POLICY "Users can delete own check-ins" ON check_in_logs 
  FOR DELETE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Service role full access check_in_logs" ON check_in_logs;
CREATE POLICY "Service role full access check_in_logs" ON check_in_logs 
  FOR ALL TO service_role USING (TRUE) WITH CHECK (TRUE);

CREATE INDEX IF NOT EXISTS idx_check_in_logs_user_id ON check_in_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_check_in_logs_created_at ON check_in_logs(user_id, created_at DESC);

DROP TRIGGER IF EXISTS update_check_in_logs_updated_at ON check_in_logs;
CREATE TRIGGER update_check_in_logs_updated_at 
  BEFORE UPDATE ON check_in_logs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- 2. SLEEP_LOGS - Registro de sono (Home → SleepPromptCard)
-- =============================================================================
CREATE TABLE IF NOT EXISTS sleep_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  duration_hours DECIMAL(4,2) NOT NULL,
  quality INTEGER CHECK (quality BETWEEN 1 AND 5),
  baby_wakeups INTEGER DEFAULT 0,
  notes TEXT,
  logged_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE sleep_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own sleep logs" ON sleep_logs;
CREATE POLICY "Users can view own sleep logs" ON sleep_logs 
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own sleep logs" ON sleep_logs;
CREATE POLICY "Users can insert own sleep logs" ON sleep_logs 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own sleep logs" ON sleep_logs;
CREATE POLICY "Users can update own sleep logs" ON sleep_logs 
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own sleep logs" ON sleep_logs;
CREATE POLICY "Users can delete own sleep logs" ON sleep_logs 
  FOR DELETE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Service role full access sleep_logs" ON sleep_logs;
CREATE POLICY "Service role full access sleep_logs" ON sleep_logs 
  FOR ALL TO service_role USING (TRUE) WITH CHECK (TRUE);

CREATE INDEX IF NOT EXISTS idx_sleep_logs_user_id ON sleep_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_sleep_logs_logged_at ON sleep_logs(user_id, logged_at DESC);

DROP TRIGGER IF EXISTS update_sleep_logs_updated_at ON sleep_logs;
CREATE TRIGGER update_sleep_logs_updated_at 
  BEFORE UPDATE ON sleep_logs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- 3. BREASTFEEDING_SESSIONS - Sessões de amamentação
-- =============================================================================
CREATE TABLE IF NOT EXISTS breastfeeding_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  duration_minutes INTEGER,
  side TEXT CHECK (side IN ('left', 'right', 'both')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE breastfeeding_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own breastfeeding sessions" ON breastfeeding_sessions;
CREATE POLICY "Users can view own breastfeeding sessions" ON breastfeeding_sessions 
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own breastfeeding sessions" ON breastfeeding_sessions;
CREATE POLICY "Users can insert own breastfeeding sessions" ON breastfeeding_sessions 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own breastfeeding sessions" ON breastfeeding_sessions;
CREATE POLICY "Users can update own breastfeeding sessions" ON breastfeeding_sessions 
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own breastfeeding sessions" ON breastfeeding_sessions;
CREATE POLICY "Users can delete own breastfeeding sessions" ON breastfeeding_sessions 
  FOR DELETE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Service role full access breastfeeding_sessions" ON breastfeeding_sessions;
CREATE POLICY "Service role full access breastfeeding_sessions" ON breastfeeding_sessions 
  FOR ALL TO service_role USING (TRUE) WITH CHECK (TRUE);

CREATE INDEX IF NOT EXISTS idx_breastfeeding_sessions_user_id ON breastfeeding_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_breastfeeding_sessions_started_at ON breastfeeding_sessions(user_id, started_at DESC);

DROP TRIGGER IF EXISTS update_breastfeeding_sessions_updated_at ON breastfeeding_sessions;
CREATE TRIGGER update_breastfeeding_sessions_updated_at 
  BEFORE UPDATE ON breastfeeding_sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- 4. LEGAL_ACCEPTANCES - Aceite de termos LGPD (Onboarding)
-- =============================================================================
CREATE TABLE IF NOT EXISTS legal_acceptances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  terms_accepted_at TIMESTAMPTZ,
  privacy_accepted_at TIMESTAMPTZ,
  ai_consent_accepted_at TIMESTAMPTZ,
  marketing_consent BOOLEAN DEFAULT FALSE,
  terms_version TEXT DEFAULT '1.0',
  privacy_version TEXT DEFAULT '1.0',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE legal_acceptances ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own legal acceptances" ON legal_acceptances;
CREATE POLICY "Users can view own legal acceptances" ON legal_acceptances 
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own legal acceptances" ON legal_acceptances;
CREATE POLICY "Users can insert own legal acceptances" ON legal_acceptances 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own legal acceptances" ON legal_acceptances;
CREATE POLICY "Users can update own legal acceptances" ON legal_acceptances 
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own legal acceptances" ON legal_acceptances;
CREATE POLICY "Users can delete own legal acceptances" ON legal_acceptances 
  FOR DELETE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Service role full access legal_acceptances" ON legal_acceptances;
CREATE POLICY "Service role full access legal_acceptances" ON legal_acceptances 
  FOR ALL TO service_role USING (TRUE) WITH CHECK (TRUE);

CREATE INDEX IF NOT EXISTS idx_legal_acceptances_user_id ON legal_acceptances(user_id);

DROP TRIGGER IF EXISTS update_legal_acceptances_updated_at ON legal_acceptances;
CREATE TRIGGER update_legal_acceptances_updated_at 
  BEFORE UPDATE ON legal_acceptances
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- 5. USER_SESSIONS - Métricas de retenção D1/D7/D30 (Analytics)
-- =============================================================================
CREATE TABLE IF NOT EXISTS user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  first_seen TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_seen TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  session_count INTEGER DEFAULT 1,
  total_duration_minutes INTEGER DEFAULT 0,
  device_info JSONB DEFAULT '{}'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own sessions" ON user_sessions;
CREATE POLICY "Users can view own sessions" ON user_sessions 
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own sessions" ON user_sessions;
CREATE POLICY "Users can insert own sessions" ON user_sessions 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own sessions" ON user_sessions;
CREATE POLICY "Users can update own sessions" ON user_sessions 
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own sessions" ON user_sessions;
CREATE POLICY "Users can delete own sessions" ON user_sessions 
  FOR DELETE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Service role full access user_sessions" ON user_sessions;
CREATE POLICY "Service role full access user_sessions" ON user_sessions 
  FOR ALL TO service_role USING (TRUE) WITH CHECK (TRUE);

CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_last_seen ON user_sessions(last_seen DESC);

DROP TRIGGER IF EXISTS update_user_sessions_updated_at ON user_sessions;
CREATE TRIGGER update_user_sessions_updated_at 
  BEFORE UPDATE ON user_sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- 6. AI_USAGE_LOGS - Rastreamento de custo de IA (Observability)
-- =============================================================================
CREATE TABLE IF NOT EXISTS ai_usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  profile TEXT NOT NULL, -- 'chat', 'analysis', 'moderation', 'crisis'
  provider TEXT NOT NULL, -- 'gemini', 'openai', 'anthropic'
  model_name TEXT NOT NULL,
  input_tokens INTEGER DEFAULT 0,
  output_tokens INTEGER DEFAULT 0,
  total_tokens INTEGER GENERATED ALWAYS AS (input_tokens + output_tokens) STORED,
  estimated_cost_usd DECIMAL(10,6) DEFAULT 0,
  latency_ms INTEGER,
  success BOOLEAN DEFAULT TRUE,
  error_type TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE ai_usage_logs ENABLE ROW LEVEL SECURITY;

-- Usuários só podem ver seus próprios logs
DROP POLICY IF EXISTS "Users can view own AI usage" ON ai_usage_logs;
CREATE POLICY "Users can view own AI usage" ON ai_usage_logs 
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own AI usage" ON ai_usage_logs;
CREATE POLICY "Users can insert own AI usage" ON ai_usage_logs 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Service role tem acesso total (para analytics e admin)
DROP POLICY IF EXISTS "Service role full access ai_usage_logs" ON ai_usage_logs;
CREATE POLICY "Service role full access ai_usage_logs" ON ai_usage_logs 
  FOR ALL TO service_role USING (TRUE) WITH CHECK (TRUE);

CREATE INDEX IF NOT EXISTS idx_ai_usage_logs_user_id ON ai_usage_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_usage_logs_created_at ON ai_usage_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_usage_logs_provider ON ai_usage_logs(provider);

-- =============================================================================
-- 7. FUNNEL_EVENTS - Funil de conversão (Analytics)
-- =============================================================================

-- Criar tipo ENUM se não existir
DO $$ BEGIN
  CREATE TYPE funnel_stage AS ENUM (
    'app_open',
    'onboarding_start',
    'onboarding_name',
    'onboarding_stage',
    'onboarding_complete',
    'home_view',
    'chat_open',
    'chat_first_message',
    'check_in_complete',
    'habit_created',
    'content_viewed',
    'community_post',
    'subscription_view',
    'subscription_start',
    'subscription_complete'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS funnel_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  stage TEXT NOT NULL, -- Usando TEXT ao invés de ENUM para flexibilidade
  previous_stage TEXT,
  session_id UUID,
  device_fingerprint TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  anonymized_at TIMESTAMPTZ
);

ALTER TABLE funnel_events ENABLE ROW LEVEL SECURITY;

-- Usuários só podem ver seus próprios eventos (não eventos anônimos)
DROP POLICY IF EXISTS "Users can view own funnel events" ON funnel_events;
CREATE POLICY "Users can view own funnel events" ON funnel_events 
  FOR SELECT USING (auth.uid() = user_id);

-- Qualquer um pode inserir eventos (para tracking anônimo)
DROP POLICY IF EXISTS "Anyone can insert funnel events" ON funnel_events;
CREATE POLICY "Anyone can insert funnel events" ON funnel_events 
  FOR INSERT WITH CHECK (user_id IS NULL OR auth.uid() = user_id);

-- Service role tem acesso total
DROP POLICY IF EXISTS "Service role full access funnel_events" ON funnel_events;
CREATE POLICY "Service role full access funnel_events" ON funnel_events 
  FOR ALL TO service_role USING (TRUE) WITH CHECK (TRUE);

CREATE INDEX IF NOT EXISTS idx_funnel_events_user_id ON funnel_events(user_id);
CREATE INDEX IF NOT EXISTS idx_funnel_events_stage ON funnel_events(stage);
CREATE INDEX IF NOT EXISTS idx_funnel_events_timestamp ON funnel_events(timestamp DESC);

-- =============================================================================
-- 8. BABY_MILESTONES + USER_BABY_MILESTONES - Marcos do bebê
-- =============================================================================

-- Catálogo de marcos (tabela de referência)
CREATE TABLE IF NOT EXISTS baby_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN ('motor', 'cognitivo', 'linguagem', 'social', 'sensorial')),
  age_months INTEGER NOT NULL,
  tips JSONB DEFAULT '[]'::jsonb,
  icon TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE baby_milestones ENABLE ROW LEVEL SECURITY;

-- Milestones são públicos (catálogo)
DROP POLICY IF EXISTS "Anyone can view milestones" ON baby_milestones;
CREATE POLICY "Anyone can view milestones" ON baby_milestones 
  FOR SELECT USING (TRUE);

-- Só service_role pode modificar catálogo
DROP POLICY IF EXISTS "Service role manages milestones" ON baby_milestones;
CREATE POLICY "Service role manages milestones" ON baby_milestones 
  FOR ALL TO service_role USING (TRUE) WITH CHECK (TRUE);

CREATE INDEX IF NOT EXISTS idx_baby_milestones_age_months ON baby_milestones(age_months);
CREATE INDEX IF NOT EXISTS idx_baby_milestones_category ON baby_milestones(category);

-- Progresso da usuária nos marcos
CREATE TABLE IF NOT EXISTS user_baby_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  milestone_id UUID NOT NULL REFERENCES baby_milestones(id) ON DELETE CASCADE,
  is_completed BOOLEAN DEFAULT FALSE,
  completed_at DATE,
  notes TEXT,
  photo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, milestone_id)
);

ALTER TABLE user_baby_milestones ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own baby milestones" ON user_baby_milestones;
CREATE POLICY "Users can view own baby milestones" ON user_baby_milestones 
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own baby milestones" ON user_baby_milestones;
CREATE POLICY "Users can insert own baby milestones" ON user_baby_milestones 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own baby milestones" ON user_baby_milestones;
CREATE POLICY "Users can update own baby milestones" ON user_baby_milestones 
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own baby milestones" ON user_baby_milestones;
CREATE POLICY "Users can delete own baby milestones" ON user_baby_milestones 
  FOR DELETE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Service role full access user_baby_milestones" ON user_baby_milestones;
CREATE POLICY "Service role full access user_baby_milestones" ON user_baby_milestones 
  FOR ALL TO service_role USING (TRUE) WITH CHECK (TRUE);

CREATE INDEX IF NOT EXISTS idx_user_baby_milestones_user_id ON user_baby_milestones(user_id);
CREATE INDEX IF NOT EXISTS idx_user_baby_milestones_milestone_id ON user_baby_milestones(milestone_id);

DROP TRIGGER IF EXISTS update_user_baby_milestones_updated_at ON user_baby_milestones;
CREATE TRIGGER update_user_baby_milestones_updated_at 
  BEFORE UPDATE ON user_baby_milestones
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- SEED DATA: Marcos do bebê (catálogo inicial)
-- =============================================================================
INSERT INTO baby_milestones (title, description, category, age_months, tips, icon) VALUES
  ('Segura a cabeça', 'Bebê consegue sustentar a cabeça por alguns segundos', 'motor', 2, '["Faça tummy time diariamente", "Apoie o pescoço ao segurar"]', '👶'),
  ('Sorri socialmente', 'Primeiro sorriso em resposta a você', 'social', 2, '["Converse olhando nos olhos", "Sorria de volta sempre"]', '😊'),
  ('Segue objetos com os olhos', 'Acompanha brinquedos em movimento', 'sensorial', 2, '["Use brinquedos coloridos", "Mova lentamente"]', '👀'),
  ('Rola de barriga para cima', 'Primeiro rolamento', 'motor', 4, '["Incentive com brinquedos", "Supervisione sempre"]', '🔄'),
  ('Ri alto', 'Primeira gargalhada', 'social', 4, '["Faça cócegas leves", "Brinque de esconde-esconde"]', '😂'),
  ('Senta com apoio', 'Consegue sentar apoiado', 'motor', 5, '["Use almofadas de apoio", "Sente junto com o bebê"]', '🪑'),
  ('Balbucia', 'Primeiros sons como "ba-ba" ou "ma-ma"', 'linguagem', 6, '["Repita os sons", "Converse muito"]', '🗣️'),
  ('Senta sem apoio', 'Senta sozinho por alguns segundos', 'motor', 6, '["Fique por perto", "Deixe brinquedos ao alcance"]', '🧘'),
  ('Engatinha', 'Primeiro engatinhar', 'motor', 8, '["Deixe espaço livre", "Incentive com brinquedos"]', '🐛'),
  ('Fala "mama" ou "papa"', 'Primeira palavra com significado', 'linguagem', 10, '["Repita "mama" e "papa"", "Comemore muito"]', '💬'),
  ('Fica em pé com apoio', 'Levanta segurando em algo', 'motor', 10, '["Deixe móveis seguros", "Fique por perto"]', '🧍'),
  ('Primeiros passos', 'Anda segurando ou sozinho', 'motor', 12, '["Incentive com braços abertos", "Deixe pés descalços"]', '👣'),
  ('Aponta para objetos', 'Usa o dedo para indicar', 'cognitivo', 12, '["Nomeie o que aponta", "Siga o interesse"]', '👆'),
  ('Entende "não"', 'Reage quando você diz não', 'cognitivo', 12, '["Seja consistente", "Use tom firme mas amoroso"]', '🚫'),
  ('Empilha blocos', 'Coloca um bloco sobre outro', 'motor', 15, '["Ofereça blocos grandes", "Demonstre primeiro"]', '🧱')
ON CONFLICT DO NOTHING;

-- =============================================================================
-- VERIFICAÇÃO FINAL
-- =============================================================================
DO $$
DECLARE
  tables_created TEXT[] := ARRAY[
    'check_in_logs', 'sleep_logs', 'breastfeeding_sessions', 
    'legal_acceptances', 'user_sessions', 'ai_usage_logs',
    'funnel_events', 'baby_milestones', 'user_baby_milestones'
  ];
  t TEXT;
BEGIN
  FOREACH t IN ARRAY tables_created LOOP
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = t) THEN
      RAISE NOTICE '✅ Tabela % criada com sucesso', t;
    ELSE
      RAISE WARNING '❌ Tabela % NÃO foi criada', t;
    END IF;
  END LOOP;
END $$;

SELECT 'Migration 20251205100000_create_missing_tables executada!' AS status;

