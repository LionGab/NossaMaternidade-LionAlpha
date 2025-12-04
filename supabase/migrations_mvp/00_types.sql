-- =============================================================================
-- NOSSA MATERNIDADE - MVP SCHEMA
-- Arquivo: 00_types.sql
-- Descrição: ENUMs e tipos customizados
-- Ordem: Executar PRIMEIRO (antes das tabelas)
-- =============================================================================

-- Extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================================================
-- ENUMS - Domínio: Crise e Moderação
-- =============================================================================

-- Nível de crise detectado
DO $$ BEGIN
  CREATE TYPE crisis_level AS ENUM (
    'low',        -- Baixo: desabafo leve
    'moderate',   -- Moderado: sinais de estresse
    'severe',     -- Severo: sinais de depressão/ansiedade significativa
    'critical'    -- Crítico: ideação suicida, automutilação, perigo imediato
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Tipos de crise
DO $$ BEGIN
  CREATE TYPE crisis_type AS ENUM (
    'suicidal_ideation',      -- Ideação suicida
    'self_harm',              -- Automutilação
    'postpartum_depression',  -- Depressão pós-parto
    'anxiety_attack',         -- Crise de ansiedade
    'overwhelm',              -- Sobrecarga emocional
    'domestic_violence',      -- Violência doméstica
    'baby_safety',            -- Preocupação com segurança do bebê
    'other'                   -- Outros
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Status da intervenção de crise
DO $$ BEGIN
  CREATE TYPE intervention_status AS ENUM (
    'detected',           -- Crise detectada
    'resources_shown',    -- Recursos de ajuda exibidos
    'user_acknowledged',  -- Usuária reconheceu
    'contacted_cvv',      -- Entrou em contato com CVV
    'contacted_samu',     -- Entrou em contato com SAMU
    'contacted_caps',     -- Entrou em contato com CAPS
    'continued_chat',     -- Continuou no chat
    'left_app',           -- Saiu do app
    'resolved',           -- Resolvido
    'escalated',          -- Escalado para humano
    'follow_up_pending',  -- Aguardando follow-up
    'follow_up_completed' -- Follow-up concluído
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Status de moderação
DO $$ BEGIN
  CREATE TYPE moderation_status AS ENUM (
    'pending',          -- Aguardando revisão
    'assigned',         -- Atribuído a moderador
    'in_review',        -- Em análise
    'approved',         -- Aprovado
    'rejected',         -- Rejeitado
    'escalated',        -- Escalado
    'appealed',         -- Em apelação
    'appeal_approved',  -- Apelação aprovada
    'appeal_rejected'   -- Apelação rejeitada
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Tipo de conteúdo para moderação
DO $$ BEGIN
  CREATE TYPE content_type AS ENUM (
    'post',          -- Post da comunidade
    'comment',       -- Comentário
    'reply',         -- Resposta a comentário
    'profile_bio',   -- Bio do perfil
    'profile_photo', -- Foto do perfil
    'message'        -- Mensagem de chat
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Origem da moderação
DO $$ BEGIN
  CREATE TYPE moderation_source AS ENUM (
    'auto_filter',  -- Filtro automático
    'ai_review',    -- Revisão por IA
    'user_report',  -- Denúncia de usuário
    'manual',       -- Revisão manual
    'appeal'        -- Apelação
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Motivo de rejeição
DO $$ BEGIN
  CREATE TYPE rejection_reason AS ENUM (
    'spam',                   -- Spam
    'hate_speech',            -- Discurso de ódio
    'harassment',             -- Assédio
    'nsfw',                   -- Conteúdo adulto
    'violence',               -- Violência
    'self_harm',              -- Automutilação
    'medical_misinformation', -- Desinformação médica
    'personal_info',          -- Informação pessoal exposta
    'advertising',            -- Publicidade
    'off_topic',              -- Fora do tema
    'duplicate',              -- Duplicado
    'other'                   -- Outros
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- =============================================================================
-- ENUMS - Domínio: LGPD / Consentimento
-- =============================================================================

-- Tipos de consentimento (granular, LGPD Art. 8§4)
DO $$ BEGIN
  CREATE TYPE consent_type AS ENUM (
    'essential',      -- Funcionamento básico (não pode recusar)
    'ai_processing',  -- Processamento IA (NathIA) - LGPD Art. 7 I
    'analytics',      -- Analytics e métricas de uso
    'marketing',      -- Comunicações de marketing
    'data_sharing',   -- Compartilhamento com terceiros
    'health_data'     -- Dados sensíveis de saúde (LGPD Art. 11)
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Status do consentimento
DO $$ BEGIN
  CREATE TYPE consent_status AS ENUM (
    'granted',  -- Consentimento ativo
    'revoked',  -- Revogado pelo usuário
    'expired',  -- Expirado (nova versão de termos)
    'pending'   -- Aguardando decisão
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- =============================================================================
-- ENUMS - Domínio: Analytics / Funil
-- =============================================================================

-- Estágio do funil de conversão
DO $$ BEGIN
  CREATE TYPE funnel_stage AS ENUM (
    'app_opened',           -- App aberto pela primeira vez
    'onboarding_started',   -- Onboarding iniciado
    'onboarding_profile',   -- Perfil preenchido
    'onboarding_baby',      -- Dados do bebê preenchidos
    'onboarding_complete',  -- Onboarding completo
    'aha_moment_nathia',    -- Primeira conversa com NathIA
    'aha_moment_tracker',   -- Primeiro registro de hábito
    'aha_moment_community', -- Primeira interação na comunidade
    'first_week_active',    -- Ativa na primeira semana
    'subscription_viewed',  -- Visualizou tela de assinatura
    'subscription_started', -- Iniciou assinatura
    'churned',              -- Churn
    'reactivated'           -- Reativada
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- =============================================================================
-- ENUMS - Domínio: Screening de Saúde Mental
-- =============================================================================

-- Tipo de screening
DO $$ BEGIN
  CREATE TYPE screening_type AS ENUM (
    'epds',       -- Edinburgh Postnatal Depression Scale
    'phq9',       -- Patient Health Questionnaire-9
    'gad7',       -- Generalized Anxiety Disorder-7
    'custom'      -- Questionário customizado
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Resultado do screening
DO $$ BEGIN
  CREATE TYPE screening_result AS ENUM (
    'low_risk',      -- Baixo risco
    'moderate_risk', -- Risco moderado
    'high_risk',     -- Alto risco
    'inconclusive'   -- Inconclusivo
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- =============================================================================
-- FUNÇÃO HELPER: updated_at automático
-- =============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- Verificação
-- =============================================================================

DO $$
DECLARE
  type_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO type_count
  FROM pg_type
  WHERE typname IN (
    'crisis_level', 'crisis_type', 'intervention_status',
    'moderation_status', 'content_type', 'moderation_source', 'rejection_reason',
    'consent_type', 'consent_status', 'funnel_stage',
    'screening_type', 'screening_result'
  );

  RAISE NOTICE '00_types.sql: % ENUMs criados/verificados', type_count;
END $$;
