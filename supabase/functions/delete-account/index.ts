/**
 * Edge Function: Delete Account (LGPD Compliant)
 *
 * ÚNICA fonte de verdade para deleção permanente de conta.
 * Chamada exclusivamente pelo app via userDataService.deleteAccount()
 *
 * Conformidade: LGPD Art. 18 (Direito ao esquecimento)
 *
 * @requires Authorization Bearer token (JWT do usuário)
 * @returns { success: true } ou { success: false, error: string }
 *
 * REGRAS DE LOGGING:
 * ✅ PODE logar: userId, nomes de tabelas, contagem de registros
 * ❌ NÃO pode logar: conteúdo de mensagens, notas, dados emocionais
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Criar cliente Supabase com service role key (permite deletar dados do usuário)
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Obter token de autenticação do header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Token de autenticação não fornecido' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Verificar usuário autenticado
    const token = authHeader.replace('Bearer ', '');
    const {
      data: { user },
      error: userError,
    } = await supabaseAdmin.auth.getUser(token);

    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Usuário não autenticado' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const userId = user.id;

    console.log(`[delete-account] Iniciando deleção da conta ${userId}`);

    // ================================================================
    // DELEÇÃO EM ORDEM SEGURA (respeitando foreign keys)
    // ================================================================

    // 1. Chat: messages primeiro (FK para conversations), depois conversations
    const { error: msgError } = await supabaseAdmin
      .from('chat_messages')
      .delete()
      .eq('user_id', userId);
    if (msgError) console.warn('[delete-account] chat_messages:', msgError.message);

    const { error: chatError } = await supabaseAdmin
      .from('chat_conversations')
      .delete()
      .eq('user_id', userId);
    if (chatError) console.warn('[delete-account] chat_conversations:', chatError.message);

    // 2. Check-ins (logs emocionais)
    const { error: checkInError } = await supabaseAdmin
      .from('check_in_logs')
      .delete()
      .eq('user_id', userId);
    if (checkInError) console.warn('[delete-account] check_in_logs:', checkInError.message);

    // 3. Hábitos: habit_logs tem FK para user_habits, deletar user_habits depois
    // Nota: habit_logs.user_habit_id referencia user_habits, não user_id diretamente
    // Precisamos deletar via join ou deletar user_habits que cascateia
    const { error: userHabitError } = await supabaseAdmin
      .from('user_habits')
      .delete()
      .eq('user_id', userId);
    if (userHabitError) console.warn('[delete-account] user_habits:', userHabitError.message);

    // 4. Milestones do bebê
    const { error: milestoneError } = await supabaseAdmin
      .from('user_baby_milestones')
      .delete()
      .eq('user_id', userId);
    if (milestoneError) console.warn('[delete-account] user_baby_milestones:', milestoneError.message);

    // 5. Interações com conteúdo
    const { error: interactionError } = await supabaseAdmin
      .from('user_content_interactions')
      .delete()
      .eq('user_id', userId);
    if (interactionError) console.warn('[delete-account] user_content_interactions:', interactionError.message);

    // 6. Comunidade: comments/likes primeiro, depois posts
    const { error: commentError } = await supabaseAdmin
      .from('community_comments')
      .delete()
      .eq('user_id', userId);
    if (commentError) console.warn('[delete-account] community_comments:', commentError.message);

    const { error: likeError } = await supabaseAdmin
      .from('community_likes')
      .delete()
      .eq('user_id', userId);
    if (likeError) console.warn('[delete-account] community_likes:', likeError.message);

    const { error: postError } = await supabaseAdmin
      .from('community_posts')
      .delete()
      .eq('user_id', userId);
    if (postError) console.warn('[delete-account] community_posts:', postError.message);

    // 7. Dados de sono
    const { error: sleepError } = await supabaseAdmin
      .from('sleep_logs')
      .delete()
      .eq('user_id', userId);
    if (sleepError) console.warn('[delete-account] sleep_logs:', sleepError.message);

    // 8. Sessões de amamentação
    const { error: breastfeedingError } = await supabaseAdmin
      .from('breastfeeding_sessions')
      .delete()
      .eq('user_id', userId);
    if (breastfeedingError) console.warn('[delete-account] breastfeeding_sessions:', breastfeedingError.message);

    // 9. Logs de uso de IA
    const { error: aiUsageError } = await supabaseAdmin
      .from('ai_usage_logs')
      .delete()
      .eq('user_id', userId);
    if (aiUsageError) console.warn('[delete-account] ai_usage_logs:', aiUsageError.message);

    // 10. Intervenções de crise (dados ultra-sensíveis)
    const { error: crisisError } = await supabaseAdmin
      .from('crisis_interventions')
      .delete()
      .eq('user_id', userId);
    if (crisisError) console.warn('[delete-account] crisis_interventions:', crisisError.message);

    // 11. Aceitações legais
    const { error: legalError } = await supabaseAdmin
      .from('legal_acceptances')
      .delete()
      .eq('user_id', userId);
    if (legalError) console.warn('[delete-account] legal_acceptances:', legalError.message);

    // 12. Sessões do usuário (retenção)
    const { error: userSessionsError } = await supabaseAdmin
      .from('user_sessions')
      .delete()
      .eq('user_id', userId);
    if (userSessionsError) console.warn('[delete-account] user_sessions:', userSessionsError.message);

    // 13. Consentimentos LGPD (importante para auditoria, mas usuário pediu exclusão)
    const { error: consentError } = await supabaseAdmin
      .from('user_consents')
      .delete()
      .eq('user_id', userId);
    if (consentError) console.warn('[delete-account] user_consents:', consentError.message);

    // 14. Entradas de diário
    const { error: diaryError } = await supabaseAdmin
      .from('diary_entries')
      .delete()
      .eq('user_id', userId);
    if (diaryError) console.warn('[delete-account] diary_entries:', diaryError.message);

    // 15. Anonimizar funnel_events (LGPD Art. 5 - permite analytics anonimizado)
    const { error: funnelError } = await supabaseAdmin
      .from('funnel_events')
      .update({ user_id: null })
      .eq('user_id', userId);
    if (funnelError) console.warn('[delete-account] funnel_events (anonimização):', funnelError.message);

    // 16. Deletar avatar do storage (se existir)
    try {
      const profile = await supabaseAdmin
        .from('profiles')
        .select('avatar_url')
        .eq('id', userId)
        .single();

      if (profile?.data?.avatar_url) {
        // Extrair path do avatar
        const avatarPath = profile.data.avatar_url.split('/').slice(-2).join('/');
        await supabaseAdmin.storage.from('avatars').remove([avatarPath]);
      }
    } catch (storageError) {
      console.warn('[delete-account] Erro ao deletar avatar:', storageError);
      // Continuar mesmo se falhar
    }

    // 17. Deletar perfil
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .delete()
      .eq('id', userId);
    if (profileError) console.warn('[delete-account] profiles:', profileError.message);

    // 18. Deletar conta de autenticação (remove auth.users)
    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId);

    if (authError) {
      console.error('[delete-account] Erro ao deletar usuário auth:', authError.message);
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Não foi possível completar a exclusão. Tente novamente.',
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    console.log(`[delete-account] Conta ${userId} deletada com sucesso`);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Conta deletada permanentemente',
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    // Logar apenas o tipo do erro, não detalhes sensíveis
    console.error('[delete-account] Erro inesperado:', error instanceof Error ? error.message : 'Unknown');
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Erro interno ao deletar conta. Tente novamente mais tarde.',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
