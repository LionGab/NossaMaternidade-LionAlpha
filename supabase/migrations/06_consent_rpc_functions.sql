-- =============================================================================
-- NOSSA MATERNIDADE - MVP SCHEMA
-- Arquivo: 06_consent_rpc_functions.sql
-- Descrição: Funções RPC para gerenciamento de consentimentos (LGPD)
-- Funções: grant_consent, revoke_consent, get_user_consents
-- Ordem: Executar DEPOIS de 03_lgpd_flags_screenings.sql
-- =============================================================================

-- =============================================================================
-- FUNÇÃO: grant_consent
-- Descrição: Conceder consentimento e registrar auditoria
-- Retorna: UUID do consentimento criado
-- =============================================================================

CREATE OR REPLACE FUNCTION grant_consent(
  p_user_id UUID,
  p_consent_type consent_type,
  p_terms_version_id UUID,
  p_ip_address INET DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL,
  p_device_id TEXT DEFAULT NULL,
  p_collection_method TEXT DEFAULT 'settings'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_consent_id UUID;
  v_existing_consent_id UUID;
BEGIN
  -- Verificar se já existe consentimento ativo para este tipo
  SELECT id INTO v_existing_consent_id
  FROM user_consents
  WHERE user_id = p_user_id
    AND consent_type = p_consent_type
    AND status = 'granted';

  -- Se já existe, revogar o anterior (soft)
  IF v_existing_consent_id IS NOT NULL THEN
    UPDATE user_consents
    SET status = 'revoked',
        revoked_at = NOW()
    WHERE id = v_existing_consent_id;
  END IF;

  -- Criar novo consentimento
  INSERT INTO user_consents (
    user_id,
    terms_version_id,
    consent_type,
    status,
    granted_at,
    ip_address,
    user_agent,
    device_id,
    collection_method,
    previous_consent_id
  ) VALUES (
    p_user_id,
    p_terms_version_id,
    p_consent_type,
    'granted',
    NOW(),
    p_ip_address,
    p_user_agent,
    p_device_id,
    p_collection_method,
    v_existing_consent_id
  )
  RETURNING id INTO v_consent_id;

  RETURN v_consent_id;
END;
$$;

COMMENT ON FUNCTION grant_consent IS 'Concede consentimento LGPD e registra auditoria';

-- =============================================================================
-- FUNÇÃO: revoke_consent
-- Descrição: Revogar consentimento ativo
-- Retorna: TRUE se revogou, FALSE se não havia consentimento ativo
-- =============================================================================

CREATE OR REPLACE FUNCTION revoke_consent(
  p_user_id UUID,
  p_consent_type consent_type,
  p_ip_address INET DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL,
  p_device_id TEXT DEFAULT NULL,
  p_revocation_reason TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_updated INTEGER;
BEGIN
  -- Atualizar consentimento ativo para revogado
  UPDATE user_consents
  SET status = 'revoked',
      revoked_at = NOW(),
      metadata = jsonb_build_object(
        'revocation_reason', COALESCE(p_revocation_reason, 'Revogado pela usuária'),
        'revoked_ip', p_ip_address::TEXT,
        'revoked_user_agent', p_user_agent,
        'revoked_device_id', p_device_id
      )
  WHERE user_id = p_user_id
    AND consent_type = p_consent_type
    AND status = 'granted';

  GET DIAGNOSTICS v_updated = ROW_COUNT;

  RETURN v_updated > 0;
END;
$$;

COMMENT ON FUNCTION revoke_consent IS 'Revoga consentimento LGPD ativo';

-- =============================================================================
-- FUNÇÃO: get_user_consents
-- Descrição: Obter consentimentos ativos da usuária (formato compatível com app)
-- Retorna: Array de objetos JSON com consentimentos ativos
-- =============================================================================

CREATE OR REPLACE FUNCTION get_user_consents(p_user_id UUID)
RETURNS SETOF json
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
BEGIN
  RETURN QUERY
  SELECT json_build_object(
    'id', uc.id,
    'user_id', uc.user_id,
    'consent_type', uc.consent_type,
    'status', uc.status,
    'granted_at', uc.granted_at,
    'revoked_at', uc.revoked_at,
    'terms_version_id', uc.terms_version_id,
    'terms_version', ctv.version,
    'is_current_terms', ctv.is_current,
    'collection_method', uc.collection_method,
    'created_at', uc.created_at
  )
  FROM user_consents uc
  JOIN consent_terms_versions ctv ON uc.terms_version_id = ctv.id
  WHERE uc.user_id = p_user_id
    AND uc.status = 'granted'
  ORDER BY uc.consent_type;
END;
$$;

COMMENT ON FUNCTION get_user_consents IS 'Retorna consentimentos ativos da usuária em formato JSON';

-- =============================================================================
-- Verificação
-- =============================================================================

DO $$
DECLARE
  func_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO func_count
  FROM pg_proc
  WHERE proname IN ('grant_consent', 'revoke_consent', 'get_user_consents');

  RAISE NOTICE '06_consent_rpc_functions.sql: % funções RPC criadas/verificadas', func_count;
END $$;
