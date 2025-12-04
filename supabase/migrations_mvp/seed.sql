-- =============================================================================
-- NOSSA MATERNIDADE - MVP SEEDS
-- Arquivo: seed.sql
-- Descrição: Dados de desenvolvimento para testar todas as funcionalidades
-- Uso: supabase db reset (aplica automaticamente) ou \i seed.sql
-- =============================================================================

-- NOTA: Os UUIDs abaixo são fixos para facilitar testes.
-- Em produção, os usuários são criados via auth.users (signup)

-- =============================================================================
-- USUÁRIAS DE TESTE
-- =============================================================================

-- NOTA: Em ambiente real, usuários são criados via Supabase Auth.
-- Para testes locais, usamos UUIDs fixos que simulam auth.uid()

-- IDs fixos para testes (use estes em mocks de autenticação)
-- Usuária 1: Maria (gestante, 32 semanas)
-- UUID: 11111111-1111-1111-1111-111111111111

-- Usuária 2: Ana (pós-parto, bebê de 3 meses)
-- UUID: 22222222-2222-2222-2222-222222222222

-- Usuária 3: Julia (moderadora)
-- UUID: 33333333-3333-3333-3333-333333333333

-- Inserir perfis (assumindo que auth.users já existe ou será mockado)
INSERT INTO profiles (id, email, name, full_name, avatar_url, phase, pregnancy_week, due_date, baby_name, baby_birth_date, onboarding_completed, current_emotion, city, state)
VALUES
  (
    '11111111-1111-1111-1111-111111111111',
    'maria.teste@nossaMaternidade.app',
    'Maria',
    'Maria Silva Santos',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Maria',
    'gestacao',
    32,
    CURRENT_DATE + INTERVAL '8 weeks',
    NULL,
    NULL,
    TRUE,
    'ansiosa',
    'São Paulo',
    'SP'
  ),
  (
    '22222222-2222-2222-2222-222222222222',
    'ana.teste@nossamaternidade.app',
    'Ana',
    'Ana Carolina Oliveira',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Ana',
    'pos_parto',
    NULL,
    NULL,
    'Miguel',
    CURRENT_DATE - INTERVAL '3 months',
    TRUE,
    'cansada',
    'Rio de Janeiro',
    'RJ'
  ),
  (
    '33333333-3333-3333-3333-333333333333',
    'julia.moderadora@nossamaternidade.app',
    'Julia',
    'Julia Fernandes Costa',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Julia',
    'maternidade',
    NULL,
    NULL,
    'Sofia',
    CURRENT_DATE - INTERVAL '2 years',
    TRUE,
    'bem',
    'Belo Horizonte',
    'MG'
  )
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  full_name = EXCLUDED.full_name,
  phase = EXCLUDED.phase;

-- =============================================================================
-- FEATURE FLAGS (Moderadora)
-- =============================================================================

INSERT INTO user_feature_flags (user_id, flag_name, flag_value, source, enabled)
VALUES
  ('33333333-3333-3333-3333-333333333333', 'moderator', 'true'::jsonb, 'manual', TRUE),
  ('33333333-3333-3333-3333-333333333333', 'beta_features', 'true'::jsonb, 'beta', TRUE)
ON CONFLICT (user_id, flag_name) DO NOTHING;

-- =============================================================================
-- HÁBITOS E LOGS
-- =============================================================================

-- Hábitos da Maria (gestante)
INSERT INTO habits (id, user_id, name, description, icon, color, frequency, target_days, reminder_time, active, current_streak, total_completions)
VALUES
  (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    '11111111-1111-1111-1111-111111111111',
    'Exercícios leves',
    'Caminhada de 20 minutos ou yoga',
    'walking',
    '#4CAF50',
    'daily',
    ARRAY[1,2,3,4,5,6,7],
    '08:00:00',
    TRUE,
    5,
    23
  ),
  (
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    '11111111-1111-1111-1111-111111111111',
    'Vitaminas',
    'Tomar ácido fólico e vitaminas pré-natal',
    'pill',
    '#FF9800',
    'daily',
    ARRAY[1,2,3,4,5,6,7],
    '09:00:00',
    TRUE,
    32,
    45
  ),
  (
    'cccccccc-cccc-cccc-cccc-cccccccccccc',
    '11111111-1111-1111-1111-111111111111',
    'Hidratação',
    'Beber 2L de água por dia',
    'water',
    '#2196F3',
    'daily',
    ARRAY[1,2,3,4,5,6,7],
    NULL,
    TRUE,
    3,
    18
  )
ON CONFLICT (id) DO NOTHING;

-- Hábitos da Ana (pós-parto)
INSERT INTO habits (id, user_id, name, description, icon, color, frequency, target_days, reminder_time, active, current_streak, total_completions)
VALUES
  (
    'dddddddd-dddd-dddd-dddd-dddddddddddd',
    '22222222-2222-2222-2222-222222222222',
    'Amamentação',
    'Registrar sessões de amamentação',
    'baby-bottle',
    '#E91E63',
    'daily',
    ARRAY[1,2,3,4,5,6,7],
    NULL,
    TRUE,
    90,
    270
  ),
  (
    'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
    '22222222-2222-2222-2222-222222222222',
    'Descanso',
    'Tirar pelo menos uma soneca quando o bebê dormir',
    'moon',
    '#9C27B0',
    'daily',
    ARRAY[1,2,3,4,5,6,7],
    NULL,
    TRUE,
    2,
    15
  )
ON CONFLICT (id) DO NOTHING;

-- Logs de hábitos (últimos 7 dias)
INSERT INTO habit_logs (habit_id, user_id, completed_at, notes, mood)
SELECT
  h.id,
  h.user_id,
  NOW() - (n || ' days')::INTERVAL + (RANDOM() * INTERVAL '12 hours'),
  CASE
    WHEN RANDOM() > 0.7 THEN 'Me senti bem hoje!'
    WHEN RANDOM() > 0.4 THEN NULL
    ELSE 'Um pouco difícil, mas consegui'
  END,
  (ARRAY['great', 'good', 'neutral', 'bad'])[FLOOR(RANDOM() * 4 + 1)]
FROM habits h
CROSS JOIN generate_series(0, 6) AS n
WHERE RANDOM() > 0.3; -- ~70% de conclusão

-- =============================================================================
-- SESSÕES DE CHAT E MENSAGENS
-- =============================================================================

-- Sessões da Maria
INSERT INTO chat_sessions (id, user_id, title, model, message_count, started_at, updated_at)
VALUES
  (
    'ffffffff-ffff-ffff-ffff-ffffffffffff',
    '11111111-1111-1111-1111-111111111111',
    'Dúvidas sobre o terceiro trimestre',
    'gemini-pro',
    6,
    NOW() - INTERVAL '2 days',
    NOW() - INTERVAL '2 days'
  ),
  (
    '00000000-0000-0000-0000-000000000001',
    '11111111-1111-1111-1111-111111111111',
    'Preparando o enxoval',
    'gemini-pro',
    4,
    NOW() - INTERVAL '5 hours',
    NOW() - INTERVAL '5 hours'
  )
ON CONFLICT (id) DO NOTHING;

-- Mensagens da primeira sessão
INSERT INTO chat_messages (conversation_id, user_id, role, content, created_at)
VALUES
  ('ffffffff-ffff-ffff-ffff-ffffffffffff', '11111111-1111-1111-1111-111111111111', 'user', 'Oi NathIA, estou com 32 semanas e sentindo muita azia. É normal?', NOW() - INTERVAL '2 days'),
  ('ffffffff-ffff-ffff-ffff-ffffffffffff', '11111111-1111-1111-1111-111111111111', 'assistant', 'Olá, querida! Sim, a azia é muito comum no terceiro trimestre. Acontece porque o útero crescendo pressiona o estômago. Algumas dicas: comer em porções menores, evitar deitar logo após as refeições, e manter a cabeceira da cama elevada. Se estiver muito incômodo, converse com seu obstetra sobre antiácidos seguros na gravidez. 💜', NOW() - INTERVAL '2 days' + INTERVAL '30 seconds'),
  ('ffffffff-ffff-ffff-ffff-ffffffffffff', '11111111-1111-1111-1111-111111111111', 'user', 'Obrigada! E sobre o sono, tenho acordado muito de noite...', NOW() - INTERVAL '2 days' + INTERVAL '2 minutes'),
  ('ffffffff-ffff-ffff-ffff-ffffffffffff', '11111111-1111-1111-1111-111111111111', 'assistant', 'Entendo perfeitamente! Dormir no final da gravidez é um desafio. O bebê crescendo, a vontade de fazer xixi, as posições desconfortáveis... Experimente usar um travesseiro de corpo, dormir do lado esquerdo, e fazer uma rotina relaxante antes de dormir. Chás de camomila (moderadamente) podem ajudar. E lembre-se: isso é temporário, logo logo você vai conhecer seu bebê! 🌙', NOW() - INTERVAL '2 days' + INTERVAL '2 minutes 30 seconds')
ON CONFLICT DO NOTHING;

-- =============================================================================
-- POSTS E COMENTÁRIOS DA COMUNIDADE
-- =============================================================================

-- Posts aprovados
INSERT INTO community_posts (id, author_id, title, content, category, tags, status, like_count, comment_count, published_at, created_at)
VALUES
  (
    '11111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    '11111111-1111-1111-1111-111111111111',
    'Minha experiência com exercícios na gestação',
    'Oi mamães! Queria compartilhar como tem sido fazer exercícios no terceiro trimestre. No começo eu tinha muito medo, mas minha médica liberou caminhadas leves e yoga. Tem me ajudado muito com as dores nas costas e o inchaço nas pernas. Quem mais está se exercitando? 🤰',
    'saude',
    ARRAY['exercicios', 'terceiro-trimestre', 'bem-estar'],
    'approved',
    12,
    3,
    NOW() - INTERVAL '3 days',
    NOW() - INTERVAL '3 days'
  ),
  (
    '22222222-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    '22222222-2222-2222-2222-222222222222',
    'Dicas para a amamentação nos primeiros dias',
    'Mães de primeira viagem, vim trazer algumas dicas que aprendi nos primeiros dias amamentando o Miguel. A pega correta faz TODA diferença - procurem um consultora de amamentação se possível. E tenham paciência, leva um tempinho para vocês duas (ou dois) entrarem no ritmo. Vocês conseguem! 💪',
    'amamentacao',
    ARRAY['amamentacao', 'recem-nascido', 'dicas'],
    'approved',
    28,
    7,
    NOW() - INTERVAL '1 day',
    NOW() - INTERVAL '1 day'
  ),
  (
    '33333333-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    '33333333-3333-3333-3333-333333333333',
    'Sobre a importância do autocuidado materno',
    'Como mãe de uma criança de 2 anos, preciso falar sobre algo que demorei para entender: cuidar de si mesma não é egoísmo, é necessidade. Quando estamos bem, cuidamos melhor dos nossos filhos. Tirem 10 minutinhos por dia só para vocês, mesmo que seja para tomar um café em paz. Vocês merecem! ☕️',
    'autocuidado',
    ARRAY['autocuidado', 'saude-mental', 'maternidade-real'],
    'approved',
    45,
    12,
    NOW() - INTERVAL '12 hours',
    NOW() - INTERVAL '12 hours'
  )
ON CONFLICT (id) DO NOTHING;

-- Post pendente (para testar moderação)
INSERT INTO community_posts (id, author_id, title, content, category, tags, status, created_at)
VALUES
  (
    '44444444-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    '11111111-1111-1111-1111-111111111111',
    'Alguém sabe onde comprar...?',
    'Oi gente, estou procurando onde comprar um berço específico, alguém tem recomendação de lojas online?',
    'geral',
    ARRAY['compras', 'enxoval'],
    'pending',
    NOW() - INTERVAL '1 hour'
  )
ON CONFLICT (id) DO NOTHING;

-- Comentários
INSERT INTO community_comments (id, post_id, author_id, content, status, like_count, created_at)
VALUES
  (
    '11111111-cccc-cccc-cccc-cccccccccccc',
    '11111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    '22222222-2222-2222-2222-222222222222',
    'Que legal! Eu também fazia yoga durante a gravidez, ajudou muito no parto!',
    'approved',
    3,
    NOW() - INTERVAL '2 days 23 hours'
  ),
  (
    '22222222-cccc-cccc-cccc-cccccccccccc',
    '22222222-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    '11111111-1111-1111-1111-111111111111',
    'Obrigada pelas dicas! Estou com 32 semanas e já estou me preparando. Vou procurar uma consultora!',
    'approved',
    5,
    NOW() - INTERVAL '23 hours'
  ),
  (
    '33333333-cccc-cccc-cccc-cccccccccccc',
    '33333333-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    '22222222-2222-2222-2222-222222222222',
    'Precisava ler isso hoje. Obrigada! 💜',
    'approved',
    8,
    NOW() - INTERVAL '6 hours'
  )
ON CONFLICT (id) DO NOTHING;

-- Likes
INSERT INTO community_likes (user_id, post_id, created_at)
VALUES
  ('11111111-1111-1111-1111-111111111111', '22222222-aaaa-aaaa-aaaa-aaaaaaaaaaaa', NOW() - INTERVAL '20 hours'),
  ('11111111-1111-1111-1111-111111111111', '33333333-aaaa-aaaa-aaaa-aaaaaaaaaaaa', NOW() - INTERVAL '10 hours'),
  ('22222222-2222-2222-2222-222222222222', '11111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa', NOW() - INTERVAL '2 days'),
  ('22222222-2222-2222-2222-222222222222', '33333333-aaaa-aaaa-aaaa-aaaaaaaaaaaa', NOW() - INTERVAL '8 hours'),
  ('33333333-3333-3333-3333-333333333333', '11111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa', NOW() - INTERVAL '2 days'),
  ('33333333-3333-3333-3333-333333333333', '22222222-aaaa-aaaa-aaaa-aaaaaaaaaaaa', NOW() - INTERVAL '22 hours')
ON CONFLICT DO NOTHING;

-- =============================================================================
-- CONSENTIMENTOS LGPD
-- =============================================================================

-- Maria aceitou todos os termos
INSERT INTO user_consents (user_id, terms_version_id, consent_type, status, granted_at, collection_method, ip_address, user_agent)
SELECT
  '11111111-1111-1111-1111-111111111111',
  ctv.id,
  ctv.consent_type,
  'granted',
  NOW() - INTERVAL '30 days',
  'onboarding',
  '177.92.45.123'::INET,
  'NossaMaternidade/1.0.0 (iOS 17.0)'
FROM consent_terms_versions ctv
WHERE ctv.is_current = TRUE
ON CONFLICT DO NOTHING;

-- Ana aceitou alguns termos
INSERT INTO user_consents (user_id, terms_version_id, consent_type, status, granted_at, collection_method, ip_address, user_agent)
SELECT
  '22222222-2222-2222-2222-222222222222',
  ctv.id,
  ctv.consent_type,
  'granted',
  NOW() - INTERVAL '90 days',
  'onboarding',
  '189.45.123.78'::INET,
  'NossaMaternidade/1.0.0 (Android 14)'
FROM consent_terms_versions ctv
WHERE ctv.is_current = TRUE
  AND ctv.consent_type IN ('essential', 'ai_processing', 'health_data')
ON CONFLICT DO NOTHING;

-- =============================================================================
-- INTERVENÇÕES DE CRISE (para testar dashboard)
-- =============================================================================

INSERT INTO crisis_interventions (id, user_id, level, types, status, trigger_message, matched_patterns, resources_shown, priority, detected_at, resolved_at)
VALUES
  (
    '11111111-cris-cris-cris-111111111111',
    '22222222-2222-2222-2222-222222222222',
    'moderate',
    ARRAY['postpartum_depression', 'overwhelm']::crisis_type[],
    'resolved',
    'Me sinto muito cansada, acho que não estou dando conta de nada...',
    ARRAY['não estou dando conta', 'muito cansada'],
    ARRAY['cvv_188', 'caps_localizador', 'artigo_depressao_pos_parto'],
    5,
    NOW() - INTERVAL '7 days',
    NOW() - INTERVAL '6 days'
  ),
  (
    '22222222-cris-cris-cris-222222222222',
    '11111111-1111-1111-1111-111111111111',
    'low',
    ARRAY['anxiety_attack']::crisis_type[],
    'resolved',
    'Estou muito ansiosa com a chegada do bebê, não consigo dormir pensando se vou ser uma boa mãe',
    ARRAY['muito ansiosa', 'não consigo dormir'],
    ARRAY['tecnicas_respiracao', 'artigo_ansiedade_gestacao'],
    7,
    NOW() - INTERVAL '5 days',
    NOW() - INTERVAL '5 days'
  )
ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- FILA DE MODERAÇÃO (para testar)
-- =============================================================================

INSERT INTO moderation_queue (id, content_id, content_type, content_text, author_id, source, status, priority, auto_filter_flags, created_at)
VALUES
  (
    '11111111-mod-mod-mod-111111111111',
    '44444444-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'post',
    'Oi gente, estou procurando onde comprar um berço específico, alguém tem recomendação de lojas online?',
    '11111111-1111-1111-1111-111111111111',
    'auto_filter',
    'pending',
    5,
    ARRAY['possible_spam', 'contains_shopping_intent'],
    NOW() - INTERVAL '1 hour'
  )
ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- VERIFICAÇÃO FINAL
-- =============================================================================

DO $$
DECLARE
  profile_count INTEGER;
  habit_count INTEGER;
  post_count INTEGER;
  session_count INTEGER;
  consent_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO profile_count FROM profiles;
  SELECT COUNT(*) INTO habit_count FROM habits;
  SELECT COUNT(*) INTO post_count FROM community_posts;
  SELECT COUNT(*) INTO session_count FROM chat_sessions;
  SELECT COUNT(*) INTO consent_count FROM user_consents;

  RAISE NOTICE 'Seeds aplicados: % perfis, % hábitos, % posts, % sessões de chat, % consentimentos',
    profile_count, habit_count, post_count, session_count, consent_count;
END $$;
