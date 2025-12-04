-- =============================================================================
-- NOSSA MATERNIDADE - MVP SCHEMA
-- Arquivo: 03_lgpd_flags_screenings.sql
-- Descrição: LGPD compliance, feature flags e screenings de saúde mental
-- Tabelas: consent_terms_versions, user_consents, user_feature_flags, postpartum_screenings
-- Ordem: Executar DEPOIS de 02_community_reactions.sql
-- =============================================================================

-- =============================================================================
-- TABELA: consent_terms_versions
-- Descrição: Versionamento dos termos de uso e políticas (LGPD)
-- Permite auditar qual versão de termos a usuária aceitou
-- =============================================================================

CREATE TABLE IF NOT EXISTS consent_terms_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Identificação da versão
  version VARCHAR(20) NOT NULL,              -- Ex: "1.0.0", "2.0.0"
  consent_type consent_type NOT NULL,        -- Tipo do consentimento (ENUM)

  -- Conteúdo dos termos
  title TEXT NOT NULL,                       -- Título curto
  summary TEXT NOT NULL,                     -- Resumo em linguagem simples
  full_text TEXT NOT NULL,                   -- Texto completo legal

  -- Metadados
  is_current BOOLEAN DEFAULT FALSE,          -- Versão atual ativa
  is_breaking BOOLEAN DEFAULT FALSE,         -- Requer novo consentimento
  effective_from TIMESTAMPTZ NOT NULL,       -- Data de vigência

  -- Hash para integridade
  content_hash VARCHAR(64) NOT NULL,         -- SHA-256 do full_text

  -- Controle
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),

  -- Constraint: versão única por tipo
  UNIQUE(consent_type, version)
);

-- Índices para consent_terms_versions
CREATE INDEX IF NOT EXISTS idx_terms_current ON consent_terms_versions(consent_type, is_current) WHERE is_current = TRUE;
CREATE INDEX IF NOT EXISTS idx_terms_effective ON consent_terms_versions(effective_from DESC);

COMMENT ON TABLE consent_terms_versions IS 'Versões dos termos de consentimento (LGPD Art. 8§2)';

-- =============================================================================
-- TABELA: user_consents
-- Descrição: Registro de consentimentos por usuário (append-only)
-- LGPD: Registro imutável de aceites/revogações
-- =============================================================================

CREATE TABLE IF NOT EXISTS user_consents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Relacionamentos
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  terms_version_id UUID NOT NULL REFERENCES consent_terms_versions(id),

  -- Estado do consentimento
  consent_type consent_type NOT NULL,
  status consent_status NOT NULL DEFAULT 'granted',

  -- Prova de consentimento (LGPD Art. 8§2)
  granted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  revoked_at TIMESTAMPTZ,                    -- NULL se ainda ativo

  -- Contexto da coleta (para prova legal)
  ip_address INET,                           -- IP no momento do aceite
  user_agent TEXT,                           -- Browser/App info
  device_id VARCHAR(255),                    -- Device fingerprint
  collection_method VARCHAR(50) NOT NULL,    -- 'onboarding', 'settings', 'prompt'

  -- Metadados
  metadata JSONB DEFAULT '{}'::jsonb,

  -- Referência ao registro anterior (para histórico)
  previous_consent_id UUID REFERENCES user_consents(id),

  -- Controle
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para user_consents
CREATE INDEX IF NOT EXISTS idx_consents_user ON user_consents(user_id);
CREATE INDEX IF NOT EXISTS idx_consents_user_type ON user_consents(user_id, consent_type);
CREATE INDEX IF NOT EXISTS idx_consents_status ON user_consents(user_id, status) WHERE status = 'granted';
CREATE INDEX IF NOT EXISTS idx_consents_type_status ON user_consents(consent_type, status);
CREATE INDEX IF NOT EXISTS idx_consents_granted ON user_consents(granted_at DESC);

-- Constraint: apenas um consentimento ativo por tipo por usuário
CREATE UNIQUE INDEX IF NOT EXISTS idx_consents_active_unique ON user_consents(user_id, consent_type) WHERE status = 'granted';

COMMENT ON TABLE user_consents IS 'Consentimentos das usuárias (append-only, LGPD)';

-- =============================================================================
-- TABELA: user_feature_flags
-- Descrição: Feature flags por usuário para rollout gradual e A/B tests
-- =============================================================================

CREATE TABLE IF NOT EXISTS user_feature_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Usuária
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Feature flag
  flag_name TEXT NOT NULL,
  flag_value JSONB NOT NULL DEFAULT 'true'::jsonb, -- Pode ser boolean, string, ou objeto

  -- Origem da flag
  source TEXT DEFAULT 'manual' CHECK (source IN ('manual', 'experiment', 'rollout', 'beta', 'override')),
  experiment_id TEXT, -- ID do experimento/teste A/B se aplicável

  -- Validade
  enabled BOOLEAN DEFAULT TRUE,
  expires_at TIMESTAMPTZ,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraint: uma flag por usuário
  UNIQUE(user_id, flag_name)
);

-- Índices para user_feature_flags
CREATE INDEX IF NOT EXISTS idx_feature_flags_user ON user_feature_flags(user_id);
CREATE INDEX IF NOT EXISTS idx_feature_flags_flag ON user_feature_flags(flag_name);
CREATE INDEX IF NOT EXISTS idx_feature_flags_user_enabled ON user_feature_flags(user_id) WHERE enabled = TRUE AND (expires_at IS NULL OR expires_at > NOW());
CREATE INDEX IF NOT EXISTS idx_feature_flags_experiment ON user_feature_flags(experiment_id) WHERE experiment_id IS NOT NULL;

-- Trigger updated_at
DROP TRIGGER IF EXISTS update_user_feature_flags_updated_at ON user_feature_flags;
CREATE TRIGGER update_user_feature_flags_updated_at
  BEFORE UPDATE ON user_feature_flags
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE user_feature_flags IS 'Feature flags por usuário para rollout gradual e A/B tests';

-- =============================================================================
-- TABELA: postpartum_screenings
-- Descrição: Resultados de screenings de saúde mental pós-parto
-- Suporta EPDS, PHQ-9, GAD-7 e questionários customizados
-- =============================================================================

CREATE TABLE IF NOT EXISTS postpartum_screenings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Usuária
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Tipo de screening
  screening_type screening_type NOT NULL,

  -- Respostas e pontuação
  responses JSONB NOT NULL,                  -- Array de respostas individuais
  total_score INTEGER NOT NULL,              -- Pontuação total calculada
  max_possible_score INTEGER NOT NULL,       -- Pontuação máxima possível

  -- Resultado e interpretação
  result screening_result NOT NULL,
  risk_level INTEGER CHECK (risk_level BETWEEN 1 AND 5), -- 1=baixo, 5=crítico
  interpretation TEXT,                       -- Texto explicativo do resultado

  -- Flags de alerta
  critical_items INTEGER[] DEFAULT ARRAY[]::INTEGER[], -- IDs das questões críticas marcadas
  requires_followup BOOLEAN DEFAULT FALSE,
  followup_scheduled_at TIMESTAMPTZ,
  followup_completed_at TIMESTAMPTZ,

  -- Contexto
  administered_by TEXT DEFAULT 'self' CHECK (administered_by IN ('self', 'healthcare_provider', 'nathia')),
  session_id UUID,                           -- Sessão de chat se aplicável

  -- Timestamps
  completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  anonymized_at TIMESTAMPTZ
);

-- Índices para postpartum_screenings
CREATE INDEX IF NOT EXISTS idx_screenings_user ON postpartum_screenings(user_id);
CREATE INDEX IF NOT EXISTS idx_screenings_user_type ON postpartum_screenings(user_id, screening_type);
CREATE INDEX IF NOT EXISTS idx_screenings_result ON postpartum_screenings(result) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_screenings_high_risk ON postpartum_screenings(completed_at DESC) WHERE result IN ('moderate_risk', 'high_risk') AND deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_screenings_followup ON postpartum_screenings(followup_scheduled_at) WHERE requires_followup = TRUE AND followup_completed_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_screenings_recent ON postpartum_screenings(user_id, completed_at DESC) WHERE deleted_at IS NULL;

COMMENT ON TABLE postpartum_screenings IS 'Resultados de screenings de saúde mental pós-parto (EPDS, PHQ-9, etc)';

-- =============================================================================
-- FUNÇÕES AUXILIARES PARA LGPD
-- =============================================================================

-- Função para verificar consentimentos ativos de uma usuária
CREATE OR REPLACE FUNCTION get_user_active_consents(p_user_id UUID)
RETURNS TABLE (
  consent_type consent_type,
  status consent_status,
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
  FROM user_consents uc
  JOIN consent_terms_versions ctv ON uc.terms_version_id = ctv.id
  WHERE uc.user_id = p_user_id
    AND uc.status = 'granted'
  ORDER BY uc.consent_type;
END;
$$;

-- Função para verificar se usuária tem consentimento específico ativo
CREATE OR REPLACE FUNCTION has_active_consent(p_user_id UUID, p_consent_type consent_type)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
DECLARE
  v_has_consent BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1
    FROM user_consents
    WHERE user_id = p_user_id
      AND consent_type = p_consent_type
      AND status = 'granted'
  ) INTO v_has_consent;

  RETURN v_has_consent;
END;
$$;

-- Função para verificar se usuária tem flag ativa
CREATE OR REPLACE FUNCTION has_feature_flag(p_user_id UUID, p_flag_name TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
DECLARE
  v_has_flag BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1
    FROM user_feature_flags
    WHERE user_id = p_user_id
      AND flag_name = p_flag_name
      AND enabled = TRUE
      AND (expires_at IS NULL OR expires_at > NOW())
  ) INTO v_has_flag;

  RETURN v_has_flag;
END;
$$;

-- Função para obter valor de feature flag
CREATE OR REPLACE FUNCTION get_feature_flag_value(p_user_id UUID, p_flag_name TEXT, p_default JSONB DEFAULT 'false'::jsonb)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
DECLARE
  v_value JSONB;
BEGIN
  SELECT flag_value INTO v_value
  FROM user_feature_flags
  WHERE user_id = p_user_id
    AND flag_name = p_flag_name
    AND enabled = TRUE
    AND (expires_at IS NULL OR expires_at > NOW());

  RETURN COALESCE(v_value, p_default);
END;
$$;

-- =============================================================================
-- DADOS INICIAIS: Versões dos termos
-- =============================================================================

INSERT INTO consent_terms_versions (
  version, consent_type, title, summary, full_text,
  is_current, is_breaking, effective_from, content_hash
) VALUES
-- Essential
(
  '1.0.0', 'essential',
  'Termos Essenciais',
  'Permissões mínimas para funcionamento do app: armazenamento local de dados, sincronização com nuvem.',
  'Ao usar o Nossa Maternidade, você concorda com o armazenamento seguro dos seus dados em nossos servidores para sincronização entre dispositivos. Estes dados incluem seu perfil, preferências e atividades no app. Você pode solicitar a exclusão dos seus dados a qualquer momento através das configurações do app ou entrando em contato conosco.',
  TRUE, FALSE, NOW(),
  encode(digest('essential_1.0.0_nossa_maternidade', 'sha256'), 'hex')
),
-- AI Processing
(
  '1.0.0', 'ai_processing',
  'Processamento por IA (NathIA)',
  'Suas mensagens serão processadas pela NathIA para fornecer respostas personalizadas. Dados são anonimizados após 30 dias.',
  'Para oferecer suporte personalizado, suas mensagens são processadas por nossa assistente virtual NathIA, baseada em inteligência artificial. A NathIA analisa suas mensagens para entender seu contexto e fornecer respostas relevantes. Suas conversas são armazenadas por 30 dias para continuidade do atendimento, após o qual são anonimizadas. Você pode solicitar a exclusão imediata através das configurações.',
  TRUE, FALSE, NOW(),
  encode(digest('ai_processing_1.0.0_nossa_maternidade', 'sha256'), 'hex')
),
-- Analytics
(
  '1.0.0', 'analytics',
  'Analytics e Melhorias',
  'Coletamos dados de uso anonimizados para melhorar o app. Nenhum dado pessoal identificável é compartilhado.',
  'Para melhorar continuamente o Nossa Maternidade, coletamos métricas de uso anonimizadas como: telas visitadas, tempo de uso, funcionalidades mais utilizadas e padrões gerais de navegação. Estes dados são agregados e não permitem identificar usuárias individuais. Usamos estas informações exclusivamente para melhorar a experiência do app.',
  TRUE, FALSE, NOW(),
  encode(digest('analytics_1.0.0_nossa_maternidade', 'sha256'), 'hex')
),
-- Marketing
(
  '1.0.0', 'marketing',
  'Comunicações',
  'Receba dicas, novidades e conteúdo personalizado por email ou push. Pode desativar a qualquer momento.',
  'Gostaríamos de enviar comunicações personalizadas sobre sua jornada maternal, incluindo: dicas baseadas na fase do seu bebê, novidades do app, conteúdos educativos e ofertas especiais. As comunicações são enviadas por email e/ou notificações push. Você pode cancelar a qualquer momento nas configurações do app ou clicando no link de descadastro nos emails.',
  TRUE, FALSE, NOW(),
  encode(digest('marketing_1.0.0_nossa_maternidade', 'sha256'), 'hex')
),
-- Health Data
(
  '1.0.0', 'health_data',
  'Dados de Saúde',
  'Dados sensíveis de saúde (sintomas, humor, amamentação) são protegidos com criptografia adicional. LGPD Art. 11.',
  'Seus dados de saúde são considerados dados sensíveis pela LGPD (Art. 11) e recebem proteções extras: são criptografados em trânsito e em repouso, acessíveis apenas por você e pela NathIA para fornecer suporte, nunca compartilhados com terceiros sem seu consentimento explícito, e podem ser excluídos permanentemente a qualquer momento. Estes dados incluem: registros de humor, sintomas, amamentação, sono do bebê e resultados de questionários de saúde mental.',
  TRUE, FALSE, NOW(),
  encode(digest('health_data_1.0.0_nossa_maternidade', 'sha256'), 'hex')
),
-- Data Sharing
(
  '1.0.0', 'data_sharing',
  'Compartilhamento de Dados',
  'Permite compartilhar dados anonimizados para pesquisas sobre saúde materna. Totalmente opcional.',
  'Ao aceitar este consentimento, você permite que dados completamente anonimizados do seu uso do app sejam utilizados em pesquisas acadêmicas sobre saúde materna. Os dados compartilhados nunca incluem informações que possam identificar você. Esta participação é totalmente voluntária e não afeta o funcionamento do app. Você pode revogar este consentimento a qualquer momento.',
  TRUE, FALSE, NOW(),
  encode(digest('data_sharing_1.0.0_nossa_maternidade', 'sha256'), 'hex')
)
ON CONFLICT (consent_type, version) DO NOTHING;

-- =============================================================================
-- Verificação
-- =============================================================================

DO $$
DECLARE
  table_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO table_count
  FROM information_schema.tables
  WHERE table_schema = 'public'
    AND table_name IN ('consent_terms_versions', 'user_consents', 'user_feature_flags', 'postpartum_screenings');

  RAISE NOTICE '03_lgpd_flags_screenings.sql: % tabelas criadas/verificadas', table_count;
END $$;
