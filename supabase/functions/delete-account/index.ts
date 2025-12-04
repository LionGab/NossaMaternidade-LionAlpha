/**
 * Edge Function: Delete Account
 * Deleta permanentemente a conta do usuário e todos os dados associados
 * Conforme LGPD - Direito ao esquecimento
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

    // 1. Deletar dados relacionados (em ordem para respeitar foreign keys)
    // Chat conversations e messages (cascata via ON DELETE CASCADE)
    const { error: chatError } = await supabaseAdmin
      .from('chat_conversations')
      .delete()
      .eq('user_id', userId);

    if (chatError) {
      console.error('[delete-account] Erro ao deletar conversas:', chatError);
    }

    // User habits e logs
    await supabaseAdmin.from('habit_logs').delete().eq('user_id', userId);
    await supabaseAdmin.from('user_habits').delete().eq('user_id', userId);

    // Milestones
    await supabaseAdmin.from('user_baby_milestones').delete().eq('user_id', userId);

    // Content interactions
    await supabaseAdmin.from('user_content_interactions').delete().eq('user_id', userId);

    // Community posts e comments
    await supabaseAdmin.from('community_comments').delete().eq('user_id', userId);
    await supabaseAdmin.from('community_likes').delete().eq('user_id', userId);
    await supabaseAdmin.from('community_posts').delete().eq('user_id', userId);

    // 2. Deletar avatar do storage (se existir)
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

    // 3. Deletar perfil (ON DELETE CASCADE deve deletar outras dependências)
    const { error: profileError } = await supabaseAdmin.from('profiles').delete().eq('id', userId);

    if (profileError) {
      console.error('[delete-account] Erro ao deletar perfil:', profileError);
    }

    // 4. Deletar conta de autenticação (isso deleta auth.users que cascata para profiles)
    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId);

    if (authError) {
      console.error('[delete-account] Erro ao deletar usuário auth:', authError);
      return new Response(
        JSON.stringify({
          error: 'Erro ao deletar conta de autenticação',
          details: authError.message,
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
    console.error('[delete-account] Erro inesperado:', error);
    return new Response(
      JSON.stringify({
        error: 'Erro interno ao deletar conta',
        details: error instanceof Error ? error.message : 'Erro desconhecido',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
