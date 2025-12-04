-- ============================================
-- NOSSA MATERNIDADE - LGPD COMPLIANCE SCHEMA
-- Migration: user_consents & audit_logs
-- Versão: 1.0.0
-- Data: 2025-12-02
-- ============================================

-- Extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pgcrypto; -- para digest()/sha-256

-- ============================================
-- ENUM TYPES
-- ============================================

-- Tipos de consentimento (granular, LGPD Art. 8§4)
-- Usar DO block para criar apenas se não existir
DO $$ BEGIN
  CREATE TYPE public.consent_type AS ENUM (
    'essential',      -- Funcionamento básico (não pode recusar)
    'ai_processing',  -- Processamento IA (NathIA) - LGPD Art. 7 I
    'analytics',      -- Analytics e métricas de uso
    'marketing',      -- Comunicações de marketing
    'data_sharing',   -- Compartilhamento com terceiros
    'health_data'     -- Dados sensíveis de saúde (LGPD Art. 11)
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Status do consentimento
DO $$ BEGIN
  CREATE TYPE public.consent_status AS ENUM (
    'granted',        -- Consentimento ativo
    'revoked',        -- Revogado pelo usuário
    'expired',        -- Expirado (nova versão de termos)
    'pending'         -- Aguardando decisão
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Categorias de eventos de auditoria
DO $$ BEGIN
  CREATE TYPE public.audit_event_category AS ENUM (
    'consent',        -- Eventos de consentimento
    'auth',           -- Autenticação
    'data_access',    -- Acesso a dados pessoais
    'data_export',    -- Portabilidade (LGPD Art. 18 V)
    'data_deletion',  -- Exclusão (LGPD Art. 18 VI)
    'ai_interaction', -- Interações com NathIA
    'security'        -- Eventos de segurança
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- ============================================
-- TABELA: consent_terms_versions
-- Propósito: Versionamento dos termos de uso e políticas
-- ============================================

CREATE TABLE IF NOT EXISTS public.consent_terms_versions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Identificação da versão
  version VARCHAR(20) NOT NULL,           -- Ex: "1.0.0", "2.0.0"
  consent_type public.consent_type NOT NULL,

  -- Conteúdo dos termos
  title TEXT NOT NULL,                    -- Título curto
  summary TEXT NOT NULL,                  -- Resumo em linguagem simples
  full_text TEXT NOT NULL,                -- Texto completo legal

  -- Metadados
  is_current BOOLEAN DEFAULT false,       -- Versão atual ativa
  is_breaking BOOLEAN DEFAULT false,      -- Requer novo consentimento
  effective_from TIMESTAMPTZ NOT NULL,    -- Data de vigência

  -- Controle
  created_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),

  -- Hash para integridade
  content_hash VARCHAR(64) NOT NULL,      -- SHA-256 do full_text

  UNIQUE(consent_type, version)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_terms_current
  ON public.consent_terms_versions (consent_type, is_current)
  WHERE is_current = true;

CREATE INDEX IF NOT EXISTS idx_terms_effective
  ON public.consent_terms_versions (effective_from DESC);

-- ============================================
-- TABELA: user_consents
-- Propósito: Registro de consentimentos por usuário
-- Imutabilidade: Append-only (revogação = novo registro / expiração)
-- ============================================

CREATE TABLE IF NOT EXISTS public.user_consents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Relacionamentos
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  terms_version_id UUID NOT NULL REFERENCES public.consent_terms_versions(id),

  -- Estado do consentimento
  consent_type public.consent_type NOT NULL,
  status public.consent_status NOT NULL DEFAULT 'granted',

  -- Prova de consentimento (LGPD Art. 8§2)
  granted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  revoked_at TIMESTAMPTZ,                 -- NULL se ainda ativo

  -- Contexto da coleta (para prova legal)
  ip_address INET,                        -- IP no momento do aceite
  user_agent TEXT,                        -- Browser/App info
  device_id VARCHAR(255),                 -- Device fingerprint
  collection_method VARCHAR(50) NOT NULL, -- 'onboarding', 'settings', 'prompt'

  -- Metadados
  metadata JSONB DEFAULT '{}'::jsonb,     -- Contexto adicional

  -- Referência ao registro anterior (para histórico)
  previous_consent_id UUID REFERENCES public.user_consents(id),

  -- Controle
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Índices para queries frequentes
CREATE INDEX IF NOT EXISTS idx_consents_user
  ON public.user_consents (user_id);

CREATE INDEX IF NOT EXISTS idx_consents_user_type
  ON public.user_consents (user_id, consent_type);

CREATE INDEX IF NOT EXISTS idx_consents_status
  ON public.user_consents (user_id, status)
  WHERE status = 'granted';

CREATE INDEX IF NOT EXISTS idx_consents_type_status
  ON public.user_consents (consent_type, status);

CREATE INDEX IF NOT EXISTS idx_consents_granted
  ON public.user_consents (granted_at DESC);

-- Constraint: apenas um consentimento ativo por tipo por usuário
CREATE UNIQUE INDEX IF NOT EXISTS idx_consents_active_unique
  ON public.user_consents (user_id, consent_type)
  WHERE status = 'granted';

-- ============================================
-- TABELA: audit_logs
-- Propósito: Trilha de auditoria imutável (LGPD Art. 37)
-- Imutabilidade: TOTAL - sem UPDATE, sem DELETE
-- Retenção: 5 anos mínimo
-- ============================================

CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Identificação do evento
  event_id VARCHAR(100) NOT NULL,         -- Ex: 'consent.granted', 'ai.chat.request'
  category public.audit_event_category NOT NULL,

  -- Quem (pode ser NULL para eventos de sistema)
  user_id UUID REFERENCES auth.users(id),
  session_id VARCHAR(255),                -- ID da sessão

  -- Quando (timestamp preciso)
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- O quê (detalhes do evento)
  action VARCHAR(100) NOT NULL,           -- 'create', 'read', 'update', 'delete', 'grant', 'revoke'
  resource_type VARCHAR(100),             -- 'consent', 'profile', 'chat_message', etc.
  resource_id VARCHAR(255),               -- ID do recurso afetado

  -- Contexto
  ip_address INET,
  user_agent TEXT,
  device_id VARCHAR(255),
  geo_location JSONB,                     -- { country, region, city } - aproximado

  -- Detalhes do evento (estruturado)
  details JSONB NOT NULL DEFAULT '{}'::jsonb,

  -- Dados anteriores (para audit de mudanças)
  previous_state JSONB,
  new_state JSONB,

  -- Integridade (hash encadeado)
  previous_log_id UUID REFERENCES public.audit_logs(id),
  hash_chain VARCHAR(64) NOT NULL,        -- SHA-256(previous_hash + event_data)

  -- Retenção
  retention_until TIMESTAMPTZ NOT NULL,   -- Data mínima de retenção
  archived_at TIMESTAMPTZ,                -- Se foi arquivado

  -- Metadados
  app_version VARCHAR(20),
  environment VARCHAR(20) DEFAULT 'production'
);

-- Índices para queries de auditoria
CREATE INDEX IF NOT EXISTS idx_audit_user
  ON public.audit_logs (user_id, occurred_at DESC);

CREATE INDEX IF NOT EXISTS idx_audit_event
  ON public.audit_logs (event_id, occurred_at DESC);

CREATE INDEX IF NOT EXISTS idx_audit_category
  ON public.audit_logs (category, occurred_at DESC);

CREATE INDEX IF NOT EXISTS idx_audit_resource
  ON public.audit_logs (resource_type, resource_id);

CREATE INDEX IF NOT EXISTS idx_audit_occurred
  ON public.audit_logs (occurred_at DESC);

CREATE INDEX IF NOT EXISTS idx_audit_retention
  ON public.audit_logs (retention_until)
  WHERE archived_at IS NULL;

-- ============================================
-- TABELA: audit_archive
-- Propósito: Armazenamento de logs arquivados (cold storage)
-- ============================================

CREATE TABLE IF NOT EXISTS public.audit_archive (
  id UUID PRIMARY KEY,
  original_occurred_at TIMESTAMPTZ NOT NULL,
  archived_at TIMESTAMPTZ DEFAULT now(),

  -- Dados compactados
  event_data JSONB NOT NULL,              -- Log completo serializado

  -- Integridade
  original_hash VARCHAR(64) NOT NULL,

  -- Metadados de arquivamento
  archive_batch_id UUID,
  retention_until TIMESTAMPTZ NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_archive_user
  ON public.audit_archive ((event_data->>'user_id'));

CREATE INDEX IF NOT EXISTS idx_archive_retention
  ON public.audit_archive (retention_until);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.consent_terms_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_consents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_archive ENABLE ROW LEVEL SECURITY;

-- --------------------------------------------------------
-- POLICIES: consent_terms_versions
-- Leitura: todos autenticados podem ler termos atuais
-- Escrita: apenas service_role (admin)
-- --------------------------------------------------------

DROP POLICY IF EXISTS "Authenticated users can read terms" ON public.consent_terms_versions;
DROP POLICY IF EXISTS "Only service role can manage terms" ON public.consent_terms_versions;

CREATE POLICY "Authenticated users can read terms"
  ON public.consent_terms_versions
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Only service role can manage terms"
  ON public.consent_terms_versions
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- --------------------------------------------------------
-- POLICIES: user_consents
-- Leitura: usuário lê apenas próprios consentimentos
-- Inserção: usuário pode inserir próprios consentimentos
-- Update/Delete: PROIBIDO para authenticated (append-only)
-- Service role tem acesso completo (para expirar/revogar)
-- --------------------------------------------------------

DROP POLICY IF EXISTS "Users can read own consents" ON public.user_consents;
DROP POLICY IF EXISTS "Users can insert own consents" ON public.user_consents;
DROP POLICY IF EXISTS "Service role full access to consents" ON public.user_consents;

CREATE POLICY "Users can read own consents"
  ON public.user_consents
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own consents"
  ON public.user_consents
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Service role full access to consents"
  ON public.user_consents
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- --------------------------------------------------------
-- POLICIES: audit_logs
-- IMPORTANTE: NÃO EXPOR audit_logs para o client
-- Leitura/Escrita: apenas service_role (Edge Functions / backend)
-- Nenhuma policy para "authenticated"
-- --------------------------------------------------------

DROP POLICY IF EXISTS "Users can read own audit logs" ON public.audit_logs;
DROP POLICY IF EXISTS "Service role can insert audit logs" ON public.audit_logs;
DROP POLICY IF EXISTS "Service role can read all audit logs" ON public.audit_logs;

CREATE POLICY "Service role can insert audit logs"
  ON public.audit_logs
  FOR INSERT
  TO service_role
  WITH CHECK (true);

CREATE POLICY "Service role can read all audit logs"
  ON public.audit_logs
  FOR SELECT
  TO service_role
  USING (true);

-- Nenhuma policy de UPDATE/DELETE -> bloqueado por padrão

-- --------------------------------------------------------
-- POLICIES: audit_archive
-- Leitura/Escrita: apenas service_role (compliance interno)
-- --------------------------------------------------------

DROP POLICY IF EXISTS "Service role full access to archive" ON public.audit_archive;

CREATE POLICY "Service role full access to archive"
  ON public.audit_archive
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================
-- FUNÇÕES AUXILIARES
-- ============================================

-- Função para calcular hash de integridade (SHA-256)
CREATE OR REPLACE FUNCTION public.calculate_audit_hash(
  p_previous_hash VARCHAR(64),
  p_event_data JSONB
) RETURNS VARCHAR(64)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN encode(
    digest(
      (COALESCE(p_previous_hash, 'GENESIS') || p_event_data::TEXT)::bytea,
      'sha256'
    ),
    'hex'
  );
END;
$$;

-- Função para inserir log de auditoria (com hash encadeado)
CREATE OR REPLACE FUNCTION public.insert_audit_log(
  p_event_id VARCHAR(100),
  p_category public.audit_event_category,
  p_user_id UUID,
  p_action VARCHAR(100),
  p_resource_type VARCHAR(100),
  p_resource_id VARCHAR(255),
  p_details JSONB DEFAULT '{}'::jsonb,
  p_previous_state JSONB DEFAULT NULL,
  p_new_state JSONB DEFAULT NULL,
  p_ip_address INET DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL,
  p_device_id VARCHAR(255) DEFAULT NULL,
  p_session_id VARCHAR(255) DEFAULT NULL,
  p_app_version VARCHAR(20) DEFAULT NULL
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_previous_log_id UUID;
  v_previous_hash VARCHAR(64);
  v_new_hash VARCHAR(64);
  v_log_id UUID;
  v_event_data JSONB;
  v_retention_years INT := 5;
BEGIN
  -- Buscar último log para encadeamento
  SELECT id, hash_chain
  INTO v_previous_log_id, v_previous_hash
  FROM public.audit_logs
  ORDER BY occurred_at DESC
  LIMIT 1;

  -- Montar dados do evento para hash
  v_event_data := jsonb_build_object(
    'event_id', p_event_id,
    'category', p_category,
    'user_id', p_user_id,
    'action', p_action,
    'resource_type', p_resource_type,
    'resource_id', p_resource_id,
    'details', p_details,
    'occurred_at', now()
  );

  -- Calcular hash encadeado
  v_new_hash := public.calculate_audit_hash(v_previous_hash, v_event_data);

  -- Inserir log
  INSERT INTO public.audit_logs (
    event_id, category, user_id, action,
    resource_type, resource_id, details,
    previous_state, new_state,
    ip_address, user_agent, device_id, session_id,
    previous_log_id, hash_chain,
    retention_until, app_version
  ) VALUES (
    p_event_id, p_category, p_user_id, p_action,
    p_resource_type, p_resource_id, p_details,
    p_previous_state, p_new_state,
    p_ip_address, p_user_agent, p_device_id, p_session_id,
    v_previous_log_id, v_new_hash,
    now() + (v_retention_years || ' years')::INTERVAL, p_app_version
  )
  RETURNING id INTO v_log_id;

  RETURN v_log_id;
END;
$$;

-- Função para registrar consentimento com auditoria automática
CREATE OR REPLACE FUNCTION public.grant_consent(
  p_user_id UUID,
  p_consent_type public.consent_type,
  p_terms_version_id UUID,
  p_ip_address INET,
  p_user_agent TEXT,
  p_device_id VARCHAR(255),
  p_collection_method VARCHAR(50)
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_previous_consent_id UUID;
  v_consent_id UUID;
BEGIN
  -- Expirar consentimento anterior se existir
  UPDATE public.user_consents
  SET status = 'expired',
      revoked_at = now()
  WHERE user_id = p_user_id
    AND consent_type = p_consent_type
    AND status = 'granted'
  RETURNING id INTO v_previous_consent_id;

  -- Inserir novo consentimento
  INSERT INTO public.user_consents (
    user_id, consent_type, terms_version_id, status,
    ip_address, user_agent, device_id, collection_method,
    previous_consent_id
  ) VALUES (
    p_user_id, p_consent_type, p_terms_version_id, 'granted',
    p_ip_address, p_user_agent, p_device_id, p_collection_method,
    v_previous_consent_id
  )
  RETURNING id INTO v_consent_id;

  -- Registrar na auditoria
  PERFORM public.insert_audit_log(
    'consent.granted',
    'consent',
    p_user_id,
    'grant',
    'consent',
    v_consent_id::VARCHAR,
    jsonb_build_object(
      'consent_type', p_consent_type,
      'terms_version_id', p_terms_version_id,
      'collection_method', p_collection_method,
      'previous_consent_id', v_previous_consent_id
    ),
    NULL,
    jsonb_build_object('status', 'granted'),
    p_ip_address,
    p_user_agent,
    p_device_id
  );

  RETURN v_consent_id;
END;
$$;

-- Função para revogar consentimento
CREATE OR REPLACE FUNCTION public.revoke_consent(
  p_user_id UUID,
  p_consent_type public.consent_type,
  p_ip_address INET DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL,
  p_device_id VARCHAR(255) DEFAULT NULL,
  p_revocation_reason TEXT DEFAULT NULL
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_consent_id UUID;
BEGIN
  -- Marcar como revogado
  UPDATE public.user_consents
  SET status = 'revoked',
      revoked_at = now(),
      metadata = metadata || jsonb_build_object('revocation_reason', p_revocation_reason)
  WHERE user_id = p_user_id
    AND consent_type = p_consent_type
    AND status = 'granted'
  RETURNING id INTO v_consent_id;

  IF v_consent_id IS NULL THEN
    RETURN FALSE;
  END IF;

  -- Registrar na auditoria
  PERFORM public.insert_audit_log(
    'consent.revoked',
    'consent',
    p_user_id,
    'revoke',
    'consent',
    v_consent_id::VARCHAR,
    jsonb_build_object(
      'consent_type', p_consent_type,
      'revocation_reason', p_revocation_reason
    ),
    jsonb_build_object('status', 'granted'),
    jsonb_build_object('status', 'revoked'),
    p_ip_address,
    p_user_agent,
    p_device_id
  );

  RETURN TRUE;
END;
$$;

-- Função para verificar consentimentos ativos
CREATE OR REPLACE FUNCTION public.get_user_consents(p_user_id UUID)
RETURNS TABLE (
  consent_type public.consent_type,
  status public.consent_status,
  granted_at TIMESTAMPTZ,
  terms_version VARCHAR(20),
  is_current_terms BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
BEGIN
  RETURN QUERY
  SELECT
    uc.consent_type,
    uc.status,
    uc.granted_at,
    ctv.version AS terms_version,
    ctv.is_current AS is_current_terms
  FROM public.user_consents uc
  JOIN public.consent_terms_versions ctv ON uc.terms_version_id = ctv.id
  WHERE uc.user_id = p_user_id
    AND uc.status = 'granted'
  ORDER BY uc.consent_type;
END;
$$;

-- ============================================
-- TRIGGERS PARA IMUTABILIDADE DE AUDIT_LOGS
-- ============================================

-- Impedir UPDATE em audit_logs
CREATE OR REPLACE FUNCTION public.prevent_audit_update()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  RAISE EXCEPTION 'Audit logs are immutable. UPDATE not allowed.';
END;
$$;

DROP TRIGGER IF EXISTS trigger_prevent_audit_update ON public.audit_logs;

CREATE TRIGGER trigger_prevent_audit_update
  BEFORE UPDATE ON public.audit_logs
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_audit_update();

-- Impedir DELETE em audit_logs
CREATE OR REPLACE FUNCTION public.prevent_audit_delete()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  RAISE EXCEPTION 'Audit logs cannot be deleted. Use archival process instead.';
END;
$$;

DROP TRIGGER IF EXISTS trigger_prevent_audit_delete ON public.audit_logs;

CREATE TRIGGER trigger_prevent_audit_delete
  BEFORE DELETE ON public.audit_logs
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_audit_delete();

-- ============================================
-- DADOS INICIAIS: Versões dos termos
-- ============================================

-- Inserir apenas se não existirem (usar ON CONFLICT DO NOTHING)
INSERT INTO public.consent_terms_versions (
  version, consent_type, title, summary, full_text,
  is_current, is_breaking, effective_from, content_hash
) VALUES
-- Essential
(
  '1.0.0', 'essential',
  'Termos Essenciais',
  'Permissões mínimas para funcionamento do app: armazenamento local de dados, sincronização com nuvem.',
  'Ao usar o Nossa Maternidade, você concorda com o armazenamento seguro dos seus dados...',
  true, false, now(),
  encode(digest('essential_1.0.0', 'sha256'), 'hex')
),
-- AI Processing
(
  '1.0.0', 'ai_processing',
  'Processamento por IA (NathIA)',
  'Suas mensagens serão processadas pela NathIA para fornecer respostas personalizadas. Dados são anonimizados.',
  'Para oferecer suporte personalizado, suas mensagens são processadas por nossa assistente NathIA...',
  true, false, now(),
  encode(digest('ai_processing_1.0.0', 'sha256'), 'hex')
),
-- Analytics
(
  '1.0.0', 'analytics',
  'Analytics e Melhorias',
  'Coletamos dados de uso anonimizados para melhorar o app. Nenhum dado pessoal é compartilhado.',
  'Para melhorar continuamente o Nossa Maternidade, coletamos métricas de uso anonimizadas...',
  true, false, now(),
  encode(digest('analytics_1.0.0', 'sha256'), 'hex')
),
-- Marketing
(
  '1.0.0', 'marketing',
  'Comunicações',
  'Receba dicas, novidades e conteúdo personalizado por email ou push. Pode desativar a qualquer momento.',
  'Gostaríamos de enviar comunicações personalizadas sobre sua jornada maternal...',
  true, false, now(),
  encode(digest('marketing_1.0.0', 'sha256'), 'hex')
),
-- Health Data
(
  '1.0.0', 'health_data',
  'Dados de Saúde',
  'Dados sensíveis de saúde (peso, pressão, sintomas) são protegidos com criptografia adicional.',
  'Seus dados de saúde são considerados dados sensíveis pela LGPD (Art. 11). Aplicamos proteções extras...',
  true, false, now(),
  encode(digest('health_data_1.0.0', 'sha256'), 'hex')
)
ON CONFLICT (consent_type, version) DO NOTHING;

-- Comentários para documentação
COMMENT ON TABLE public.consent_terms_versions IS 'Versões dos termos de consentimento (LGPD compliance)';
COMMENT ON TABLE public.user_consents IS 'Consentimentos das usuárias (append-only, imutável)';
COMMENT ON TABLE public.audit_logs IS 'Trilha de auditoria imutável (LGPD Art. 37) - apenas service_role';
COMMENT ON TABLE public.audit_archive IS 'Logs arquivados para retenção de longo prazo (5 anos)';

