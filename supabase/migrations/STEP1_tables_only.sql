-- =============================================================================
-- STEP 1: CREATE TABLES AND TYPES ONLY (no functions with dependencies)
-- Execute PRIMEIRO, depois execute STEP2
-- =============================================================================

-- =============================================================================
-- PARTE 1: TYPES
-- =============================================================================

DO $$ BEGIN
  CREATE TYPE crisis_level AS ENUM ('low', 'moderate', 'severe', 'critical');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE crisis_type AS ENUM (
    'suicidal_ideation', 'self_harm', 'postpartum_depression', 'anxiety_attack',
    'overwhelm', 'domestic_violence', 'baby_safety', 'other'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE intervention_status AS ENUM (
    'detected', 'resources_shown', 'user_acknowledged', 'contacted_cvv',
    'contacted_samu', 'contacted_caps', 'continued_chat', 'left_app',
    'resolved', 'escalated', 'follow_up_pending', 'follow_up_completed'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE moderation_status AS ENUM (
    'pending', 'assigned', 'in_review', 'approved', 'rejected',
    'escalated', 'appealed', 'appeal_approved', 'appeal_rejected'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE content_type AS ENUM (
    'post', 'comment', 'reply', 'profile_bio', 'profile_photo', 'message'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE moderation_source AS ENUM (
    'auto_filter', 'ai_review', 'user_report', 'manual', 'appeal'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE rejection_reason AS ENUM (
    'spam', 'hate_speech', 'harassment', 'nsfw', 'violence', 'self_harm',
    'medical_misinformation', 'personal_info', 'advertising', 'off_topic', 'duplicate', 'other'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- =============================================================================
-- PARTE 2: TABLES
-- =============================================================================

-- crisis_interventions
CREATE TABLE IF NOT EXISTS crisis_interventions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  level crisis_level NOT NULL,
  types crisis_type[] NOT NULL DEFAULT ARRAY['other']::crisis_type[],
  status intervention_status NOT NULL DEFAULT 'detected',
  trigger_message TEXT,
  matched_patterns TEXT[],
  context_summary TEXT,
  resources_shown TEXT[] DEFAULT ARRAY[]::TEXT[],
  user_actions JSONB DEFAULT '[]'::jsonb,
  follow_up_needed BOOLEAN DEFAULT TRUE,
  follow_up_scheduled_at TIMESTAMPTZ,
  follow_up_completed_at TIMESTAMPTZ,
  follow_up_notes TEXT,
  outcome_notes TEXT,
  resolution_type TEXT,
  session_id UUID,
  app_version TEXT,
  device_info JSONB,
  detected_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  acknowledged_at TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  anonymized_at TIMESTAMPTZ,
  created_by UUID REFERENCES auth.users(id),
  last_modified_by UUID REFERENCES auth.users(id),
  priority INTEGER DEFAULT 5 CHECK (priority BETWEEN 1 AND 10)
);

-- moderation_queue
CREATE TABLE IF NOT EXISTS moderation_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id UUID NOT NULL,
  content_type content_type NOT NULL,
  content_text TEXT NOT NULL,
  content_metadata JSONB DEFAULT '{}'::jsonb,
  author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  author_trust_score DECIMAL(3,2) DEFAULT 5.0,
  author_post_count INTEGER DEFAULT 0,
  author_report_count INTEGER DEFAULT 0,
  source moderation_source NOT NULL,
  status moderation_status NOT NULL DEFAULT 'pending',
  priority INTEGER NOT NULL DEFAULT 5 CHECK (priority BETWEEN 1 AND 10),
  auto_filter_flags TEXT[] DEFAULT ARRAY[]::TEXT[],
  ai_safety_score DECIMAL(3,2),
  ai_analysis JSONB,
  assigned_to UUID REFERENCES auth.users(id),
  assigned_at TIMESTAMPTZ,
  assignment_expires_at TIMESTAMPTZ,
  decision moderation_status,
  decision_reason rejection_reason,
  decision_notes TEXT,
  decided_at TIMESTAMPTZ,
  decided_by UUID REFERENCES auth.users(id),
  escalated_to UUID REFERENCES auth.users(id),
  escalated_at TIMESTAMPTZ,
  escalation_reason TEXT,
  appeal_text TEXT,
  appealed_at TIMESTAMPTZ,
  appeal_decision moderation_status,
  appeal_decided_at TIMESTAMPTZ,
  appeal_decided_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  time_in_queue_ms INTEGER,
  total_review_time_ms INTEGER
);

-- moderators
CREATE TABLE IF NOT EXISTS moderators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  tier TEXT NOT NULL DEFAULT 'base' CHECK (tier IN ('base', 'senior', 'lead', 'founder')),
  active BOOLEAN NOT NULL DEFAULT TRUE,
  verified_at TIMESTAMPTZ,
  verified_by UUID REFERENCES auth.users(id),
  compensation_brl DECIMAL(10,2) DEFAULT 300.00,
  payment_info JSONB,
  hours_per_week INTEGER DEFAULT 4,
  available_hours JSONB,
  timezone TEXT DEFAULT 'America/Sao_Paulo',
  stats JSONB DEFAULT '{"total_reviewed": 0, "approved": 0, "rejected": 0, "escalated": 0}'::jsonb,
  training_completed_at TIMESTAMPTZ,
  last_training_at TIMESTAMPTZ,
  certifications TEXT[],
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_active_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- moderation_metrics
CREATE TABLE IF NOT EXISTS moderation_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL DEFAULT CURRENT_DATE UNIQUE,
  total_posts INTEGER DEFAULT 0,
  total_queued INTEGER DEFAULT 0,
  auto_approved INTEGER DEFAULT 0,
  auto_blocked INTEGER DEFAULT 0,
  ai_approved INTEGER DEFAULT 0,
  ai_blocked INTEGER DEFAULT 0,
  ai_queued INTEGER DEFAULT 0,
  human_approved INTEGER DEFAULT 0,
  human_rejected INTEGER DEFAULT 0,
  escalated INTEGER DEFAULT 0,
  avg_queue_latency_ms INTEGER,
  p50_queue_latency_ms INTEGER,
  p95_queue_latency_ms INTEGER,
  p99_queue_latency_ms INTEGER,
  false_positive_count INTEGER DEFAULT 0,
  false_negative_count INTEGER DEFAULT 0,
  appeal_count INTEGER DEFAULT 0,
  appeal_success_count INTEGER DEFAULT 0,
  active_moderators INTEGER DEFAULT 0,
  moderator_hours_worked DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- PARTE 3: INDEXES
-- =============================================================================

CREATE INDEX IF NOT EXISTS idx_crisis_user_active ON crisis_interventions(user_id, detected_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_crisis_follow_up_pending ON crisis_interventions(follow_up_scheduled_at) WHERE follow_up_needed = TRUE AND follow_up_completed_at IS NULL AND deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_crisis_level_date ON crisis_interventions(level, detected_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_crisis_critical ON crisis_interventions(priority, detected_at DESC) WHERE level IN ('severe', 'critical') AND deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_crisis_status ON crisis_interventions(status) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_crisis_types ON crisis_interventions USING GIN(types);

CREATE INDEX IF NOT EXISTS idx_mod_queue_pending ON moderation_queue(priority ASC, created_at ASC) WHERE status = 'pending' AND deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_mod_queue_assigned ON moderation_queue(assigned_to, assignment_expires_at) WHERE status = 'assigned' AND deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_mod_queue_author ON moderation_queue(author_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_mod_queue_content ON moderation_queue(content_id, content_type);
CREATE INDEX IF NOT EXISTS idx_mod_queue_status_date ON moderation_queue(status, created_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_mod_queue_flags ON moderation_queue USING GIN(auto_filter_flags);
CREATE INDEX IF NOT EXISTS idx_moderators_active ON moderators(tier, last_active_at DESC) WHERE active = TRUE AND deleted_at IS NULL;

-- =============================================================================
-- PARTE 4: RLS
-- =============================================================================

ALTER TABLE crisis_interventions ENABLE ROW LEVEL SECURITY;
ALTER TABLE moderation_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE moderators ENABLE ROW LEVEL SECURITY;
ALTER TABLE moderation_metrics ENABLE ROW LEVEL SECURITY;

-- Crisis RLS
DROP POLICY IF EXISTS "Users can view own crisis" ON crisis_interventions;
CREATE POLICY "Users can view own crisis" ON crisis_interventions FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "System can insert crisis" ON crisis_interventions;
CREATE POLICY "System can insert crisis" ON crisis_interventions FOR INSERT WITH CHECK (auth.uid() = user_id OR auth.jwt()->>'role' = 'service_role');

DROP POLICY IF EXISTS "Users can update own crisis" ON crisis_interventions;
CREATE POLICY "Users can update own crisis" ON crisis_interventions FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Service role crisis" ON crisis_interventions;
CREATE POLICY "Service role crisis" ON crisis_interventions FOR ALL USING (auth.jwt()->>'role' = 'service_role');

-- Moderation Queue RLS
DROP POLICY IF EXISTS "Moderators can view queue" ON moderation_queue;
CREATE POLICY "Moderators can view queue" ON moderation_queue FOR SELECT USING (EXISTS (SELECT 1 FROM moderators WHERE user_id = auth.uid() AND active = TRUE));

DROP POLICY IF EXISTS "Authors can view own" ON moderation_queue;
CREATE POLICY "Authors can view own" ON moderation_queue FOR SELECT USING (author_id = auth.uid());

DROP POLICY IF EXISTS "Service role queue" ON moderation_queue;
CREATE POLICY "Service role queue" ON moderation_queue FOR ALL USING (auth.jwt()->>'role' = 'service_role');

-- Moderators RLS
DROP POLICY IF EXISTS "Moderators view self" ON moderators;
CREATE POLICY "Moderators view self" ON moderators FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Service role moderators" ON moderators;
CREATE POLICY "Service role moderators" ON moderators FOR ALL USING (auth.jwt()->>'role' = 'service_role');

-- Metrics RLS
DROP POLICY IF EXISTS "Moderators view metrics" ON moderation_metrics;
CREATE POLICY "Moderators view metrics" ON moderation_metrics FOR SELECT USING (EXISTS (SELECT 1 FROM moderators WHERE user_id = auth.uid() AND active = TRUE));

DROP POLICY IF EXISTS "Service role metrics" ON moderation_metrics;
CREATE POLICY "Service role metrics" ON moderation_metrics FOR ALL USING (auth.jwt()->>'role' = 'service_role');

-- Seed initial metrics
INSERT INTO moderation_metrics (date) VALUES (CURRENT_DATE) ON CONFLICT (date) DO NOTHING;

SELECT 'STEP 1 COMPLETE - Tables created!' as status;
