/**
 * Community Moderation Service - Moderação Automática de 3 Camadas
 *
 * CAMADA 1: Filtro automático (IA) - Bloqueia conteúdo claramente inapropriado
 * CAMADA 2: Pre-aprovação IA - Aprova conteúdo seguro automaticamente
 * CAMADA 3: Fila para moderação humana - Envia para Super Mamas Moderators
 *
 * @version 1.0.0
 */

import { MedicalModerationService } from '@/ai/moderation/MedicalModerationService';
import type { CommunityPost } from '@/types/community';
import { logger } from '@/utils/logger';

import { supabase } from './supabase';

export type ModerationAction = 'block' | 'approve' | 'queue';
export type ModerationReason = 'auto-filter' | 'safe-content' | 'needs-review';

export interface ModerationFlags {
  spam: boolean;
  hateSpeech: boolean;
  medicalDanger: boolean;
  nsfw: boolean;
  violence: boolean;
  selfHarm: boolean;
}

export interface ModerationResult {
  action: ModerationAction;
  reason: ModerationReason;
  flags?: ModerationFlags;
  safetyScore?: number; // 0-1 (1 = mais seguro)
  needsHumanReview?: boolean;
  queuedAt?: string; // ISO timestamp quando entrou na fila
}

/**
 * Serviço de moderação de comunidade
 */
export class CommunityModerationService {
  /**
   * CAMADA 1: Filtro automático (IA)
   * Detecta e bloqueia conteúdo claramente inapropriado
   */
  async autoModerate(post: CommunityPost): Promise<ModerationResult> {
    const flags: ModerationFlags = {
      spam: this.detectSpam(post.content),
      hateSpeech: this.detectHateSpeech(post.content),
      medicalDanger: this.detectDangerousMedicalAdvice(post.content),
      nsfw: this.detectNSFW(post.content),
      violence: this.detectViolence(post.content),
      selfHarm: this.detectSelfHarm(post.content),
    };

    // Se qualquer flag crítica for detectada, bloquear imediatamente
    if (Object.values(flags).some((f) => f)) {
      logger.warn('[CommunityModeration] Post bloqueado por filtro automático', {
        postId: post.id,
        flags,
      });

      return {
        action: 'block',
        reason: 'auto-filter',
        flags,
        needsHumanReview: false,
      };
    }

    // CAMADA 2: Pre-aprovação IA para posts seguros
    const safetyScore = await this.calculateSafetyScore(post);

    // Threshold ajustado: 0.75 (era 0.9 - muito restritivo)
    if (safetyScore > 0.75) {
      logger.info('[CommunityModeration] Post pré-aprovado automaticamente', {
        postId: post.id,
        safetyScore,
      });

      return {
        action: 'approve',
        reason: 'safe-content',
        safetyScore,
        needsHumanReview: false,
      };
    }

    // CAMADA 3: Fila para moderação humana
    const queuedAt = new Date().toISOString();
    logger.info('[CommunityModeration] Post enviado para fila de moderação humana', {
      postId: post.id,
      safetyScore,
      queuedAt,
    });

    return {
      action: 'queue',
      reason: 'needs-review',
      safetyScore,
      needsHumanReview: true,
      queuedAt,
    };
  }

  /**
   * Detecta spam (repetição, links suspeitos, etc.)
   */
  private detectSpam(content: string): boolean {
    const lowerContent = content.toLowerCase();

    // Muitos links suspeitos
    const linkCount = (content.match(/https?:\/\//g) || []).length;
    if (linkCount > 3) return true;

    // Repetição excessiva de caracteres
    const repeatedChars = /(.)\1{10,}/.test(content);
    if (repeatedChars) return true;

    // Palavras-chave de spam
    const spamKeywords = [
      'clique aqui',
      'ganhe dinheiro',
      'oferta imperdível',
      'compre agora',
      'promoção exclusiva',
    ];
    const hasSpamKeyword = spamKeywords.some((keyword) => lowerContent.includes(keyword));
    if (hasSpamKeyword && linkCount > 0) return true;

    // Texto muito curto com muitos números (possível spam)
    if (content.length < 20 && /\d{5,}/.test(content)) return true;

    return false;
  }

  /**
   * Detecta hate speech
   * Nota: "odeio acordar cedo" ≠ "odeio você" - verificar contexto
   */
  private detectHateSpeech(content: string): boolean {
    const lowerContent = content.toLowerCase();

    // Palavras que são hate speech SOMENTE se direcionadas a pessoas
    const directedHateKeywords = [
      'nojenta',
      'ridícula',
      'burra',
      'idiota',
      'imbecil',
      'você é uma',
      'vocês são',
      'todas vocês',
    ];

    // "Odeio" só é problemático se direcionado a pessoas
    const odeioPhrases = [
      'odeio você',
      'odeio vocês',
      'te odeio',
      'odeio essa mãe',
      'odeio essas mães',
    ];

    // Verificar hate speech direcionado
    const hasDirectedHate = directedHateKeywords.some((keyword) => lowerContent.includes(keyword));
    const hasOdeioPeople = odeioPhrases.some((phrase) => lowerContent.includes(phrase));

    // Verificar padrões de insultos
    const insultPatterns = [
      /você (é|são) (uma|umas?) (.*?) (burra|idiota|nojenta)/i,
      /(todas|vocês) (são|é) (.*?) (ridículas|nojentas)/i,
      /sua (idiota|burra|nojenta|imbecil)/i,
    ];

    const hasInsultPattern = insultPatterns.some((pattern) => pattern.test(content));

    return hasDirectedHate || hasOdeioPeople || hasInsultPattern;
  }

  /**
   * Detecta conselhos médicos perigosos
   */
  private detectDangerousMedicalAdvice(content: string): boolean {
    // Usar MedicalModerationService para detectar conselhos médicos
    const moderationResult = MedicalModerationService.moderateResponse(content, '');

    return (
      moderationResult.severity === 'critical' ||
      moderationResult.severity === 'blocked' ||
      moderationResult.categories.includes('medical_advice') ||
      moderationResult.categories.includes('medication') ||
      moderationResult.categories.includes('diagnosis')
    );
  }

  /**
   * Detecta conteúdo NSFW (Not Safe For Work)
   */
  private detectNSFW(content: string): boolean {
    const lowerContent = content.toLowerCase();

    const nsfwKeywords = ['sexo', 'sexual', 'nude', 'nua', 'pornografia', 'erótico', 'sensual'];

    // Verificar se há palavras-chave NSFW em contexto inapropriado
    const hasNsfwKeyword = nsfwKeywords.some((keyword) => lowerContent.includes(keyword));

    // Se tiver keyword NSFW e não for contexto médico/educacional, bloquear
    if (hasNsfwKeyword) {
      const educationalContext =
        lowerContent.includes('consulta') ||
        lowerContent.includes('médico') ||
        lowerContent.includes('educação');
      return !educationalContext;
    }

    return false;
  }

  /**
   * Detecta violência
   */
  private detectViolence(content: string): boolean {
    const lowerContent = content.toLowerCase();

    const violenceKeywords = [
      'machucar',
      'bater',
      'agredir',
      'violência',
      'agressão',
      'fazer mal',
      'machucar o bebê',
      'fazer mal ao bebê',
    ];

    return violenceKeywords.some((keyword) => lowerContent.includes(keyword));
  }

  /**
   * Detecta auto-dano ou ideação suicida
   */
  private detectSelfHarm(content: string): boolean {
    const lowerContent = content.toLowerCase();

    const selfHarmKeywords = [
      'me matar',
      'suicídio',
      'acabar com tudo',
      'não aguento mais viver',
      'quero morrer',
      'me cortar',
      'me machucar',
      'auto-lesão',
    ];

    return selfHarmKeywords.some((keyword) => lowerContent.includes(keyword));
  }

  /**
   * CAMADA 2: Calcula score de segurança (0-1)
   * Score > 0.9 = pré-aprovado automaticamente
   */
  private async calculateSafetyScore(post: CommunityPost): Promise<number> {
    let score = 1.0; // Começa com score máximo

    const content = post.content.toLowerCase();

    // Penalizar por palavras-chave sensíveis (mas não críticas)
    // Penalidade reduzida: 0.05 (era 0.1 - muito agressivo)
    const sensitiveKeywords = ['medicamento', 'remédio', 'tratamento', 'sintoma', 'diagnóstico'];
    const sensitiveCount = sensitiveKeywords.filter((kw) => content.includes(kw)).length;
    score -= sensitiveCount * 0.05; // -0.05 por keyword sensível (era 0.1)

    // Penalizar por texto muito curto (possível spam ou conteúdo vazio)
    if (post.content.length < 20) {
      score -= 0.2;
    }

    // Penalizar por muitos caracteres especiais ou emojis excessivos
    const emojiCount = (post.content.match(/[\u{1F300}-\u{1F9FF}]/gu) || []).length;
    if (emojiCount > 10) {
      score -= 0.1;
    }

    // Bonus por texto bem estruturado (parágrafos, pontuação)
    const hasParagraphs = post.content.includes('\n') || post.content.length > 100;
    if (hasParagraphs) {
      score += 0.05;
    }

    // Garantir que score está entre 0 e 1
    return Math.max(0, Math.min(1, score));
  }

  /**
   * CAMADA 3: Delegar para Super Mamas Moderators
   * Envia post para 2-3 moderadoras de confiança
   */
  async delegateToTrustedUsers(postId: string): Promise<void> {
    try {
      const moderators = await this.getTrustedModerators();

      if (moderators.length === 0) {
        logger.warn('[CommunityModeration] Nenhuma moderadora encontrada', { postId });
        return;
      }

      // Criar notificação para moderadoras
      await this.notifyModerators(moderators, postId);

      logger.info('[CommunityModeration] Post delegado para moderadoras', {
        postId,
        moderatorCount: moderators.length,
      });
    } catch (error) {
      logger.error('[CommunityModeration] Erro ao delegar para moderadoras', error, {
        postId,
      });
    }
  }

  /**
   * Busca moderadoras de confiança (Super Mamas Moderators)
   */
  private async getTrustedModerators(): Promise<string[]> {
    try {
      // Buscar usuárias com role de moderadora ou alta confiança
      const { data, error } = await supabase
        .from('profiles')
        .select('id')
        .eq('is_moderator', true)
        .limit(5);

      if (error) {
        logger.error('[CommunityModeration] Erro ao buscar moderadoras', error);
        return [];
      }

      return (data || []).map((p) => p.id);
    } catch (error) {
      logger.error('[CommunityModeration] Erro inesperado ao buscar moderadoras', error);
      return [];
    }
  }

  /**
   * Notifica moderadoras sobre post pendente
   */
  private async notifyModerators(moderatorIds: string[], postId: string): Promise<void> {
    // TODO: Implementar sistema de notificações
    // Por enquanto, apenas logar
    logger.info('[CommunityModeration] Notificando moderadoras', {
      moderatorIds,
      postId,
    });

    // Futuro: Criar notificações no Supabase ou via push notifications
    // await supabase.from('moderation_queue').insert({
    //   post_id: postId,
    //   moderator_ids: moderatorIds,
    //   status: 'pending',
    // });
  }

  /**
   * Aplica moderação completa a um post
   * Retorna o resultado da moderação
   */
  async moderatePost(post: CommunityPost): Promise<ModerationResult> {
    const result = await this.autoModerate(post);

    // Se precisa de revisão humana, delegar para moderadoras
    if (result.action === 'queue' && result.needsHumanReview) {
      await this.delegateToTrustedUsers(post.id);
    }

    // Atualizar status do post no banco
    await this.updatePostStatus(post.id, result);

    return result;
  }

  /**
   * Atualiza status do post no banco de dados
   */
  private async updatePostStatus(postId: string, result: ModerationResult): Promise<void> {
    try {
      const updateData: Record<string, unknown> = {
        is_approved: result.action === 'approve',
        updated_at: new Date().toISOString(),
      };

      // Adicionar metadata de moderação
      if (result.safetyScore !== undefined) {
        updateData.moderation_score = result.safetyScore;
      }

      if (result.flags) {
        updateData.moderation_flags = Object.entries(result.flags)
          .filter(([_, value]) => value)
          .map(([key]) => key);
      }

      // Rastrear tempo de fila (queue_latency_ms)
      if (result.queuedAt) {
        updateData.queued_at = result.queuedAt;
      }

      const { error } = await supabase.from('community_posts').update(updateData).eq('id', postId);

      if (error) {
        logger.error('[CommunityModeration] Erro ao atualizar status do post', error, {
          postId,
        });
      }
    } catch (error) {
      logger.error('[CommunityModeration] Erro inesperado ao atualizar status', error, {
        postId,
      });
    }
  }

  /**
   * Calcula latência da fila de moderação (para métricas)
   */
  async getQueueLatencyStats(): Promise<{ avgMs: number; maxMs: number; pendingCount: number }> {
    try {
      const { data, error } = await supabase
        .from('community_posts')
        .select('queued_at, updated_at')
        .eq('is_approved', true)
        .not('queued_at', 'is', null)
        .order('updated_at', { ascending: false })
        .limit(100);

      if (error || !data || data.length === 0) {
        return { avgMs: 0, maxMs: 0, pendingCount: 0 };
      }

      const latencies = data.map((post) => {
        const queuedAt = new Date(post.queued_at).getTime();
        const approvedAt = new Date(post.updated_at).getTime();
        return approvedAt - queuedAt;
      });

      const avgMs = latencies.reduce((a, b) => a + b, 0) / latencies.length;
      const maxMs = Math.max(...latencies);

      // Contar posts pendentes
      const { count } = await supabase
        .from('community_posts')
        .select('*', { count: 'exact', head: true })
        .eq('is_approved', false)
        .not('queued_at', 'is', null);

      logger.info('[CommunityModeration] Estatísticas de fila', {
        avgLatencyMs: Math.round(avgMs),
        maxLatencyMs: Math.round(maxMs),
        pendingCount: count || 0,
      });

      return {
        avgMs: Math.round(avgMs),
        maxMs: Math.round(maxMs),
        pendingCount: count || 0,
      };
    } catch (error) {
      logger.error('[CommunityModeration] Erro ao calcular latência', error);
      return { avgMs: 0, maxMs: 0, pendingCount: 0 };
    }
  }
}

export const communityModerationService = new CommunityModerationService();
