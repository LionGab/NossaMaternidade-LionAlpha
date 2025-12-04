-- =============================================================================
-- PASSO 1/3: CRIAR TYPES (execute PRIMEIRO)
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

SELECT 'PASSO 1 COMPLETE - Types criados!' as status;
