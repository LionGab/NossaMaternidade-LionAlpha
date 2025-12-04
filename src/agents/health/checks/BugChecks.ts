/**
 * Bug Checks
 * Verificações específicas para bugs conhecidos do projeto
 */

import * as fs from 'fs';
import * as path from 'path';

import { logger } from '../../../utils/logger';
import type { BugStatus } from '../types';

export class BugChecks {
  private projectRoot: string;

  constructor(projectRoot: string) {
    this.projectRoot = projectRoot;
  }

  /**
   * Verifica todos os bugs conhecidos
   */
  async checkAllBugs(): Promise<BugStatus[]> {
    const checks = [
      this.checkAnalyticsBlocking(),
      this.checkFilterTagsEmpty(),
      this.checkHabitsSorting(),
      this.checkPrivacyPolicyTodo(),
      this.checkStreakDuplicated(),
      this.checkJsonParseUnsafe(),
      this.checkUseCallbackMissing(),
    ];

    const results = await Promise.all(checks);
    return results;
  }

  /**
   * Bug: Analytics bloqueando chat
   * Arquivo: MaternalChatAgent.ts
   * Verificação: trackEventSafely existe
   */
  private async checkAnalyticsBlocking(): Promise<BugStatus> {
    const filePath = path.join(this.projectRoot, 'src/agents/maternal/MaternalChatAgent.ts');

    try {
      if (!fs.existsSync(filePath)) {
        return {
          bug: 'Analytics bloqueando chat',
          file: 'MaternalChatAgent.ts',
          verification: 'trackEventSafely existe',
          fixed: false,
          details: 'Arquivo não encontrado',
        };
      }

      const content = fs.readFileSync(filePath, 'utf-8');
      const hasTrackEventSafely = content.includes('trackEventSafely');

      return {
        bug: 'Analytics bloqueando chat',
        file: 'MaternalChatAgent.ts',
        verification: 'trackEventSafely existe',
        fixed: hasTrackEventSafely,
        details: hasTrackEventSafely
          ? 'trackEventSafely encontrado'
          : 'trackEventSafely não encontrado',
      };
    } catch (error) {
      logger.error('[BugChecks] Erro ao verificar analytics bug', error);
      return {
        bug: 'Analytics bloqueando chat',
        file: 'MaternalChatAgent.ts',
        verification: 'trackEventSafely existe',
        fixed: false,
        details: `Erro: ${error instanceof Error ? error.message : 'Unknown'}`,
      };
    }
  }

  /**
   * Bug: Filtro tags vazio
   * Arquivo: ContentRecommendationAgent.ts
   * Verificação: Check de length > 0
   */
  private async checkFilterTagsEmpty(): Promise<BugStatus> {
    const filePath = path.join(
      this.projectRoot,
      'src/agents/content/ContentRecommendationAgent.ts'
    );

    try {
      if (!fs.existsSync(filePath)) {
        return {
          bug: 'Filtro tags vazio',
          file: 'ContentRecommendationAgent.ts',
          verification: 'Check de length > 0',
          fixed: false,
          details: 'Arquivo não encontrado',
        };
      }

      const content = fs.readFileSync(filePath, 'utf-8');
      // Procurar por padrões de validação de tags vazias
      const hasLengthCheck =
        content.includes('tags.length > 0') ||
        content.includes('tags?.length') ||
        content.includes('tags && tags.length');

      return {
        bug: 'Filtro tags vazio',
        file: 'ContentRecommendationAgent.ts',
        verification: 'Check de length > 0',
        fixed: hasLengthCheck,
        details: hasLengthCheck
          ? 'Validação de tags encontrada'
          : 'Validação de tags não encontrada',
      };
    } catch (error) {
      logger.error('[BugChecks] Erro ao verificar tags filter bug', error);
      return {
        bug: 'Filtro tags vazio',
        file: 'ContentRecommendationAgent.ts',
        verification: 'Check de length > 0',
        fixed: false,
        details: `Erro: ${error instanceof Error ? error.message : 'Unknown'}`,
      };
    }
  }

  /**
   * Bug: Ordenação de hábitos
   * Arquivo: HabitsAnalysisAgent.ts
   * Verificação: .sort() por data
   */
  private async checkHabitsSorting(): Promise<BugStatus> {
    const filePath = path.join(this.projectRoot, 'src/agents/habits/HabitsAnalysisAgent.ts');

    try {
      if (!fs.existsSync(filePath)) {
        return {
          bug: 'Ordenação de hábitos',
          file: 'HabitsAnalysisAgent.ts',
          verification: '.sort() por data',
          fixed: false,
          details: 'Arquivo não encontrado (pode estar desabilitado no MVP)',
        };
      }

      const content = fs.readFileSync(filePath, 'utf-8');
      const hasSortByDate =
        content.includes('.sort(') && (content.includes('date') || content.includes('timestamp'));

      return {
        bug: 'Ordenação de hábitos',
        file: 'HabitsAnalysisAgent.ts',
        verification: '.sort() por data',
        fixed: hasSortByDate,
        details: hasSortByDate ? 'Ordenação encontrada' : 'Ordenação não encontrada',
      };
    } catch (error) {
      logger.error('[BugChecks] Erro ao verificar habits sorting bug', error);
      return {
        bug: 'Ordenação de hábitos',
        file: 'HabitsAnalysisAgent.ts',
        verification: '.sort() por data',
        fixed: false,
        details: `Erro: ${error instanceof Error ? error.message : 'Unknown'}`,
      };
    }
  }

  /**
   * Bug: Privacy Policy TODO
   * Arquivo: ConsentScreen.tsx
   * Verificação: Navega para PrivacyPolicy
   */
  private async checkPrivacyPolicyTodo(): Promise<BugStatus> {
    const filePath = path.join(this.projectRoot, 'src/screens/onboarding/ConsentScreen.tsx');

    try {
      if (!fs.existsSync(filePath)) {
        // Tentar caminho alternativo
        const altPath = path.join(this.projectRoot, 'src/screens/ConsentScreen.tsx');
        if (!fs.existsSync(altPath)) {
          return {
            bug: 'Privacy Policy TODO',
            file: 'ConsentScreen.tsx',
            verification: 'Navega para PrivacyPolicy',
            fixed: false,
            details: 'Arquivo não encontrado',
          };
        }
      }

      const content = fs.readFileSync(filePath, 'utf-8');
      const hasPrivacyNavigation =
        content.includes("navigate('PrivacyPolicy')") ||
        content.includes('PrivacyPolicy') ||
        content.includes('privacy-policy');

      return {
        bug: 'Privacy Policy TODO',
        file: 'ConsentScreen.tsx',
        verification: 'Navega para PrivacyPolicy',
        fixed: hasPrivacyNavigation,
        details: hasPrivacyNavigation
          ? 'Navegação para Privacy Policy encontrada'
          : 'TODO ainda presente',
      };
    } catch (error) {
      logger.error('[BugChecks] Erro ao verificar privacy policy bug', error);
      return {
        bug: 'Privacy Policy TODO',
        file: 'ConsentScreen.tsx',
        verification: 'Navega para PrivacyPolicy',
        fixed: false,
        details: `Erro: ${error instanceof Error ? error.message : 'Unknown'}`,
      };
    }
  }

  /**
   * Bug: Streak duplicado
   * Arquivo: WellnessContext.tsx
   * Verificação: Usa new Set() para datas únicas
   */
  private async checkStreakDuplicated(): Promise<BugStatus> {
    const filePath = path.join(
      this.projectRoot,
      'src/features/wellness/context/WellnessContext.tsx'
    );

    try {
      if (!fs.existsSync(filePath)) {
        return {
          bug: 'Streak duplicado',
          file: 'WellnessContext.tsx',
          verification: 'Usa new Set() para datas únicas',
          fixed: false,
          details: 'Arquivo não encontrado',
        };
      }

      const content = fs.readFileSync(filePath, 'utf-8');
      // Verificar se usa Set para remover duplicatas
      const hasSetForUniqueDates = content.includes('new Set(') && content.includes('checkIns.map');

      return {
        bug: 'Streak duplicado',
        file: 'WellnessContext.tsx',
        verification: 'Usa new Set() para datas únicas',
        fixed: hasSetForUniqueDates,
        details: hasSetForUniqueDates ? 'Set para datas únicas encontrado' : 'Set não encontrado',
      };
    } catch (error) {
      logger.error('[BugChecks] Erro ao verificar streak bug', error);
      return {
        bug: 'Streak duplicado',
        file: 'WellnessContext.tsx',
        verification: 'Usa new Set() para datas únicas',
        fixed: false,
        details: `Erro: ${error instanceof Error ? error.message : 'Unknown'}`,
      };
    }
  }

  /**
   * Bug: JSON.parse inseguro
   * Arquivo: WellnessContext.tsx
   * Verificação: Try/catch individual para cada parse
   */
  private async checkJsonParseUnsafe(): Promise<BugStatus> {
    const filePath = path.join(
      this.projectRoot,
      'src/features/wellness/context/WellnessContext.tsx'
    );

    try {
      if (!fs.existsSync(filePath)) {
        return {
          bug: 'JSON.parse inseguro',
          file: 'WellnessContext.tsx',
          verification: 'Try/catch individual',
          fixed: false,
          details: 'Arquivo não encontrado',
        };
      }

      const content = fs.readFileSync(filePath, 'utf-8');
      // Verificar se há try/catch em torno de JSON.parse e se há mensagens de erro específicas
      const hasProfileSafeParse =
        content.includes('try {') &&
        content.includes('JSON.parse(profileData)') &&
        content.includes('Perfil corrompido');

      const hasCheckInsSafeParse =
        content.includes('try {') &&
        content.includes('JSON.parse(checkInsData)') &&
        content.includes('Check-ins corrompidos');

      const fixed = hasProfileSafeParse && hasCheckInsSafeParse;

      return {
        bug: 'JSON.parse inseguro',
        file: 'WellnessContext.tsx',
        verification: 'Try/catch individual',
        fixed,
        details: fixed
          ? 'Parse seguro encontrado para profile e check-ins'
          : `Profile safe: ${hasProfileSafeParse}, CheckIns safe: ${hasCheckInsSafeParse}`,
      };
    } catch (error) {
      logger.error('[BugChecks] Erro ao verificar JSON parse bug', error);
      return {
        bug: 'JSON.parse inseguro',
        file: 'WellnessContext.tsx',
        verification: 'Try/catch individual',
        fixed: false,
        details: `Erro: ${error instanceof Error ? error.message : 'Unknown'}`,
      };
    }
  }

  /**
   * Bug: useCallback faltando
   * Arquivo: AgentsContext.tsx
   * Verificação: Funções estão memoizadas
   */
  private async checkUseCallbackMissing(): Promise<BugStatus> {
    const filePath = path.join(this.projectRoot, 'src/contexts/AgentsContext.tsx');

    try {
      if (!fs.existsSync(filePath)) {
        return {
          bug: 'useCallback faltando',
          file: 'AgentsContext.tsx',
          verification: 'Funções memoizadas',
          fixed: false,
          details: 'Arquivo não encontrado',
        };
      }

      const content = fs.readFileSync(filePath, 'utf-8');

      // Verificar importação de useCallback
      const hasUseCallbackImport = content.includes('useCallback');

      // Verificar se initializeAgent usa useCallback
      const initializeAgentPattern = /const\s+initializeAgent\s*=\s*useCallback/;
      const hasInitializeAgentCallback = initializeAgentPattern.test(content);

      // Verificar se isAgentReady usa useCallback
      const isAgentReadyPattern = /const\s+isAgentReady\s*=\s*useCallback/;
      const hasIsAgentReadyCallback = isAgentReadyPattern.test(content);

      const fixed = hasUseCallbackImport && hasInitializeAgentCallback && hasIsAgentReadyCallback;

      return {
        bug: 'useCallback faltando',
        file: 'AgentsContext.tsx',
        verification: 'Funções memoizadas',
        fixed,
        details: fixed
          ? 'useCallback encontrado em todas as funções'
          : `Import: ${hasUseCallbackImport}, initializeAgent: ${hasInitializeAgentCallback}, isAgentReady: ${hasIsAgentReadyCallback}`,
      };
    } catch (error) {
      logger.error('[BugChecks] Erro ao verificar useCallback bug', error);
      return {
        bug: 'useCallback faltando',
        file: 'AgentsContext.tsx',
        verification: 'Funções memoizadas',
        fixed: false,
        details: `Erro: ${error instanceof Error ? error.message : 'Unknown'}`,
      };
    }
  }
}
