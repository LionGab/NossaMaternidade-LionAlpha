-- ============================================
-- Tabela: legal_acceptances
-- Armazena aceitações de termos e privacidade (LGPD compliance)
-- ============================================

-- Tabela para armazenar aceitações de termos e privacidade (LGPD compliance)
CREATE TABLE IF NOT EXISTS public.legal_acceptances (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  terms_accepted_at TIMESTAMP WITH TIME ZONE,
  privacy_accepted_at TIMESTAMP WITH TIME ZONE,
  terms_version TEXT, -- Versão dos termos aceitos
  privacy_version TEXT, -- Versão da política aceita
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE public.legal_acceptances ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Usuárias podem ver suas próprias aceitações" ON public.legal_acceptances;
DROP POLICY IF EXISTS "Usuárias podem atualizar suas próprias aceitações" ON public.legal_acceptances;
DROP POLICY IF EXISTS "Usuárias podem criar suas próprias aceitações" ON public.legal_acceptances;

CREATE POLICY "Usuárias podem ver suas próprias aceitações"
  ON public.legal_acceptances FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Usuárias podem atualizar suas próprias aceitações"
  ON public.legal_acceptances FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Usuárias podem criar suas próprias aceitações"
  ON public.legal_acceptances FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_legal_acceptances_updated_at ON public.legal_acceptances;
CREATE TRIGGER update_legal_acceptances_updated_at
  BEFORE UPDATE ON public.legal_acceptances
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_legal_acceptances_user_id ON public.legal_acceptances(user_id);
CREATE INDEX IF NOT EXISTS idx_legal_acceptances_terms_accepted_at ON public.legal_acceptances(terms_accepted_at);
CREATE INDEX IF NOT EXISTS idx_legal_acceptances_privacy_accepted_at ON public.legal_acceptances(privacy_accepted_at);

-- Comentários
COMMENT ON TABLE public.legal_acceptances IS 'Registros de aceitação de termos e privacidade (LGPD compliance)';
COMMENT ON COLUMN public.legal_acceptances.user_id IS 'ID do usuário (referência auth.users)';
COMMENT ON COLUMN public.legal_acceptances.terms_accepted_at IS 'Data/hora de aceitação dos termos de serviço';
COMMENT ON COLUMN public.legal_acceptances.privacy_accepted_at IS 'Data/hora de aceitação da política de privacidade';

