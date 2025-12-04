/**
 * User Data Service
 * Funcionalidades de LGPD: Export Data e Delete Account
 */

import type { UserProfile } from '@/types/user';

import { consentManager } from '@/core/security/ConsentManager';
import { chatService, ChatConversation, ChatMessage } from './chatService';
import { profileService } from './profileService';
import { sessionManager } from './sessionManager';
import { supabase } from './supabase';
import { logger } from '../utils/logger';
import { clearAllLocalData } from '../utils/localStorageCleanup';

// Supabase database types
interface SupabaseHabit {
  id: string;
  name: string;
  description?: string;
  category?: string;
  icon?: string;
  created_at: string;
  updated_at?: string;
}

interface SupabaseUserHabit {
  id: string;
  user_id: string;
  habit_id: string;
  is_active: boolean;
  reminder_time?: string;
  created_at: string;
  updated_at?: string;
  habit?: SupabaseHabit;
}

interface SupabaseHabitLog {
  id: string;
  user_id: string;
  habit_id: string;
  completed_at: string;
  notes?: string;
  created_at: string;
}

interface SupabaseBabyMilestone {
  id: string;
  name: string;
  description?: string;
  category?: string;
  typical_age_months?: number;
  created_at: string;
}

interface SupabaseUserBabyMilestone {
  id: string;
  user_id: string;
  milestone_id: string;
  achieved_at?: string;
  notes?: string;
  created_at: string;
  milestone?: SupabaseBabyMilestone;
}

interface SupabaseUserContentInteraction {
  id: string;
  user_id: string;
  content_id: string;
  interaction_type: 'view' | 'like' | 'save' | 'share' | 'comment';
  created_at: string;
  metadata?: Record<string, unknown>;
}

interface SupabaseCommunityPost {
  id: string;
  user_id: string;
  title: string;
  content: string;
  category?: string;
  created_at: string;
  updated_at?: string;
  likes_count?: number;
  comments_count?: number;
}

interface SupabaseCommunityComment {
  id: string;
  user_id: string;
  post_id: string;
  content: string;
  parent_comment_id?: string;
  created_at: string;
  updated_at?: string;
  likes_count?: number;
}

export interface ExportedUserData {
  profile: UserProfile | Record<string, never>;
  chatConversations: Array<{
    conversation: ChatConversation;
    messages: ChatMessage[];
  }>;
  habits: Array<{
    type: 'user_habit' | 'habit_log';
    data: SupabaseUserHabit | SupabaseHabitLog;
  }>;
  milestones: SupabaseUserBabyMilestone[];
  interactions: SupabaseUserContentInteraction[];
  community?: {
    posts: SupabaseCommunityPost[];
    comments: SupabaseCommunityComment[];
  };
  exportedAt: string;
  version: string;
}

class UserDataService {
  /**
   * Exporta todos os dados do usuário (LGPD compliance)
   * Retorna JSON completo com todos os dados pessoais
   */
  async exportUserData(): Promise<{ data: ExportedUserData | null; error: string | Error | null }> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        return { data: null, error: 'Usuária não autenticada' };
      }

      logger.info('[UserDataService] Iniciando exportação de dados', { userId: user.id });

      // 1. Perfil
      const profile = await profileService.getCurrentProfile();

      // 2. Conversas de chat
      const conversations = await chatService.getConversations(1000); // Buscar todas
      const allMessages: ChatMessage[] = [];

      for (const conv of conversations) {
        const messages = await chatService.getMessages(conv.id, 1000);
        allMessages.push(...messages);
      }

      // 3. Hábitos
      const { data: userHabitsRaw } = await supabase
        .from('user_habits')
        .select('*, habit:habits(*)')
        .eq('user_id', user.id);
      const userHabits: SupabaseUserHabit[] | null = userHabitsRaw as SupabaseUserHabit[] | null;

      // 4. Logs de hábitos
      const { data: habitLogsRaw } = await supabase
        .from('habit_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('completed_at', { ascending: false });
      const habitLogs: SupabaseHabitLog[] | null = habitLogsRaw as SupabaseHabitLog[] | null;

      // 5. Marcos do bebê
      const { data: milestonesRaw } = await supabase
        .from('user_baby_milestones')
        .select('*, milestone:baby_milestones(*)')
        .eq('user_id', user.id);
      const milestones: SupabaseUserBabyMilestone[] | null = milestonesRaw as
        | SupabaseUserBabyMilestone[]
        | null;

      // 6. Interações com conteúdo
      const { data: interactionsRaw } = await supabase
        .from('user_content_interactions')
        .select('*')
        .eq('user_id', user.id);
      const interactions: SupabaseUserContentInteraction[] | null = interactionsRaw as
        | SupabaseUserContentInteraction[]
        | null;

      // 7. Posts da comunidade (se houver)
      const { data: communityPostsRaw } = await supabase
        .from('community_posts')
        .select('*')
        .eq('user_id', user.id);
      const communityPosts: SupabaseCommunityPost[] | null = communityPostsRaw as
        | SupabaseCommunityPost[]
        | null;

      // 8. Comentários
      const { data: commentsRaw } = await supabase
        .from('community_comments')
        .select('*')
        .eq('user_id', user.id);
      const comments: SupabaseCommunityComment[] | null = commentsRaw as
        | SupabaseCommunityComment[]
        | null;

      const exportedData: ExportedUserData = {
        profile: profile || {},
        chatConversations: conversations.map((conv) => ({
          conversation: conv,
          messages: allMessages.filter((m) => m.conversation_id === conv.id),
        })),
        habits: [
          ...(userHabits || []).map((h) => ({ type: 'user_habit' as const, data: h })),
          ...(habitLogs || []).map((l) => ({ type: 'habit_log' as const, data: l })),
        ],
        milestones: milestones || [],
        interactions: interactions || [],
        community: {
          posts: communityPosts || [],
          comments: comments || [],
        },
        exportedAt: new Date().toISOString(),
        version: '1.0.0',
      };

      logger.info('[UserDataService] Exportação concluída', {
        userId: user.id,
        conversationsCount: conversations.length,
        messagesCount: allMessages.length,
      });

      return { data: exportedData, error: null };
    } catch (error) {
      logger.error('[UserDataService] Erro ao exportar dados', error);
      return {
        data: null,
        error: error instanceof Error ? error : new Error(String(error)),
      };
    }
  }

  /**
   * Deleta permanentemente a conta e todos os dados (LGPD compliance)
   * ⚠️ ATENÇÃO: Esta operação é IRREVERSÍVEL
   *
   * Fluxo:
   * 1. Chama Edge Function delete-account (ÚNICA fonte de verdade)
   * 2. SOMENTE se servidor confirmar: faz signOut e limpa dados locais
   * 3. NÃO faz fallback inseguro - se Edge Function falhar, retorna erro
   */
  async deleteAccount(): Promise<{ success: boolean; error: string | null }> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        return { success: false, error: 'Usuária não autenticada' };
      }

      logger.warn('[UserDataService] Iniciando deleção de conta', { userId: user.id });

      // Obter token de sessão para autenticar na Edge Function
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        return { success: false, error: 'Sessão inválida. Faça login novamente.' };
      }

      // Chamar Edge Function (ÚNICA fonte de verdade para deleção)
      const { data, error: edgeFnError } = await supabase.functions.invoke('delete-account', {
        body: { userId: user.id },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      // Verificar resposta da Edge Function
      if (edgeFnError || !data?.success) {
        // Logar apenas código do erro, não detalhes sensíveis
        logger.warn('[UserDataService] Edge Function falhou', {
          errorCode: edgeFnError?.message ?? 'unknown',
        });

        // ❌ SEM FALLBACK INSEGURO - Retornar erro amigável
        return {
          success: false,
          error:
            'Não conseguimos completar a exclusão da sua conta agora. Verifique sua conexão e tente novamente. Se o problema persistir, entre em contato com o suporte.',
        };
      }

      // ================================================================
      // ✅ SERVIDOR CONFIRMOU - AGORA LIMPAR LOCALMENTE
      // ================================================================
      logger.info('[UserDataService] Deleção confirmada pelo servidor');

      // 1. SignOut do Supabase (invalida tokens remotos)
      await supabase.auth.signOut();

      // 2. Limpar sessões gerenciadas (auth, chat, analytics)
      await sessionManager.clearAllSessions();

      // 3. Limpar consentimentos LGPD locais
      await consentManager.clearAllConsents();

      // 4. Limpar TODOS os dados locais (AsyncStorage + SecureStore)
      await clearAllLocalData();

      logger.info('[UserDataService] Conta deletada com sucesso', { userId: user.id });

      return { success: true, error: null };
    } catch (error) {
      logger.error('[UserDataService] Erro inesperado na deleção', error);
      return {
        success: false,
        error: 'Ocorreu um erro inesperado. Por favor, tente novamente.',
      };
    }
  }

  /**
   * Request account deletion (soft delete - marca para deleção após período de retenção)
   * Mais seguro que hard delete imediato
   */
  async requestAccountDeletion(): Promise<{ success: boolean; error: string | Error | null }> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        return { success: false, error: 'Usuária não autenticada' };
      }

      // Marcar perfil para deleção (após 30 dias por padrão LGPD)
      const { error } = await supabase
        .from('profiles')
        .update({
          deleted_at: new Date().toISOString(),
          // Ou criar campo 'deletion_requested_at'
        })
        .eq('id', user.id);

      if (error) {
        logger.error('[UserDataService] Erro ao solicitar deleção', error);
        return { success: false, error };
      }

      logger.info('[UserDataService] Solicitação de deleção registrada', { userId: user.id });

      // Fazer logout imediatamente
      await supabase.auth.signOut();
      await sessionManager.clearAllSessions();

      return { success: true, error: null };
    } catch (error) {
      logger.error('[UserDataService] Erro ao solicitar deleção', error);
      return {
        success: false,
        error: error instanceof Error ? error : new Error(String(error)),
      };
    }
  }
}

export const userDataService = new UserDataService();
export default userDataService;
