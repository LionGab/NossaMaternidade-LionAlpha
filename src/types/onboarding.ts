/**
 * Onboarding Types
 * Tipos para o fluxo de onboarding de 9 etapas
 */

// Fase da vida
export enum UserLifeStage {
  PREGNANT = 'pregnant',
  NEW_MOTHER = 'new-mother',
  EXPERIENCED_MOTHER = 'experienced-mother',
  TRYING = 'trying',
}

export const LifeStageLabels: Record<UserLifeStage, string> = {
  [UserLifeStage.PREGNANT]: 'Grávida',
  [UserLifeStage.NEW_MOTHER]: 'Mãe de primeira viagem',
  [UserLifeStage.EXPERIENCED_MOTHER]: 'Mãe experiente',
  [UserLifeStage.TRYING]: 'Tentando engravidar',
};

// Emoções
export enum UserEmotion {
  ANXIOUS = 'anxious',
  TIRED = 'tired',
  GUILTY = 'guilty',
  HAPPY = 'happy',
  CONFUSED = 'confused',
  OVERWHELMED = 'overwhelmed',
}

export const EmotionLabels: Record<UserEmotion, string> = {
  [UserEmotion.ANXIOUS]: 'Ansiosa',
  [UserEmotion.TIRED]: 'Cansada',
  [UserEmotion.GUILTY]: 'Culpada',
  [UserEmotion.HAPPY]: 'Feliz',
  [UserEmotion.CONFUSED]: 'Confusa',
  [UserEmotion.OVERWHELMED]: 'Sobrecarregada',
};

// Desafios
export enum UserChallenge {
  SLEEP = 'sleep',
  BREASTFEEDING = 'breastfeeding',
  ANXIETY = 'anxiety',
  RELATIONSHIPS = 'relationships',
  WORK = 'work',
  LONELINESS = 'loneliness',
  CURIOSITY = 'curiosity',
  POSTPARTUM_BODY = 'postpartum-body',
  TIME_MANAGEMENT = 'time-management',
}

export const ChallengeLabels: Record<UserChallenge, string> = {
  [UserChallenge.SLEEP]: 'Sono',
  [UserChallenge.BREASTFEEDING]: 'Amamentação',
  [UserChallenge.ANXIETY]: 'Ansiedade',
  [UserChallenge.RELATIONSHIPS]: 'Relacionamentos',
  [UserChallenge.WORK]: 'Trabalho',
  [UserChallenge.LONELINESS]: 'Solidão',
  [UserChallenge.CURIOSITY]: 'Curiosidade',
  [UserChallenge.POSTPARTUM_BODY]: 'Corpo no pós-parto',
  [UserChallenge.TIME_MANAGEMENT]: 'Gestão de tempo',
};

// Rede de apoio
export enum SupportLevel {
  STRONG = 'strong',
  MODERATE = 'moderate',
  WEAK = 'weak',
  NONE = 'none',
}

export const SupportLevelLabels: Record<SupportLevel, string> = {
  [SupportLevel.STRONG]: 'Tenho boa rede de apoio',
  [SupportLevel.MODERATE]: 'Tenho algum apoio',
  [SupportLevel.WEAK]: 'Tenho pouco apoio',
  [SupportLevel.NONE]: 'Não tenho apoio',
};

// Necessidades primárias
export enum UserNeed {
  CHAT = 'chat',
  LEARNING = 'learning',
  CALMING = 'calming',
  COMMUNITY = 'community',
  TRACKING = 'tracking',
}

export const NeedLabels: Record<UserNeed, string> = {
  [UserNeed.CHAT]: 'Conversar com alguém',
  [UserNeed.LEARNING]: 'Aprender sobre maternidade',
  [UserNeed.CALMING]: 'Técnicas de calma',
  [UserNeed.COMMUNITY]: 'Conectar com outras mães',
  [UserNeed.TRACKING]: 'Acompanhar meu progresso',
};

// Timeline (tempo de gestação ou pós-parto)
export interface Timeline {
  type: 'pregnancy' | 'postpartum' | 'trying' | 'other';
  value?: number; // Semanas de gestação ou meses pós-parto
  unit: 'weeks' | 'months';
}

// Perfil completo do usuário
export interface UserProfile {
  // Step 1: Nome
  name: string;

  // Step 2: Fase da vida
  lifeStage: UserLifeStage;

  // Step 3: Timeline
  timeline?: Timeline;

  // Step 4: Emoção atual
  emotion: UserEmotion;

  // Step 5: Desafios principais (múltipla escolha)
  challenges: UserChallenge[];

  // Step 6: Rede de apoio
  supportLevel: SupportLevel;

  // Step 7: Necessidades primárias
  primaryNeeds: UserNeed[];

  // Step 8: Preferências de notificação
  notifications: {
    enabled: boolean;
    dailyReminders: boolean;
    contentUpdates: boolean;
    communityActivity: boolean;
  };

  // Step 9: Termos e privacidade
  agreedToTerms: boolean;
  agreedToPrivacy: boolean;

  // Metadata
  createdAt: number;
  updatedAt: number;
  version: string;
}

// Estado do onboarding
export interface OnboardingState {
  currentStep: number;
  totalSteps: number;
  completed: boolean;
  profile: Partial<UserProfile>;
}

// Props para cada step do onboarding
export interface OnboardingStepProps<T = Partial<UserProfile>> {
  onNext: (data: T) => void;
  onBack?: () => void;
  initialData?: T;
}

// Validação de steps
export const validateStep = (step: number, data: Partial<UserProfile>): boolean => {
  switch (step) {
    case 1: // Nome
      return typeof data.name === 'string' && data.name.trim().length > 0;

    case 2: // Fase da vida
      return data.lifeStage !== undefined && Object.values(UserLifeStage).includes(data.lifeStage);

    case 3: // Timeline (opcional para algumas fases)
      return true; // Timeline é opcional

    case 4: // Emoção
      return data.emotion !== undefined && Object.values(UserEmotion).includes(data.emotion);

    case 5: // Desafios
      return (
        Array.isArray(data.challenges) &&
        data.challenges.length > 0 &&
        data.challenges.every((c: unknown) =>
          Object.values(UserChallenge).includes(c as UserChallenge)
        )
      );

    case 6: // Rede de apoio
      return (
        data.supportLevel !== undefined && Object.values(SupportLevel).includes(data.supportLevel)
      );

    case 7: // Necessidades
      return (
        Array.isArray(data.primaryNeeds) &&
        data.primaryNeeds.length > 0 &&
        data.primaryNeeds.every((n: unknown) => Object.values(UserNeed).includes(n as UserNeed))
      );

    case 8: // Notificações
      return typeof data.notifications === 'object' && data.notifications !== null;

    case 9: // Termos
      return data.agreedToTerms === true && data.agreedToPrivacy === true;

    default:
      return false;
  }
};

// Helper para criar perfil inicial
export const createInitialProfile = (): Partial<UserProfile> => ({
  notifications: {
    enabled: true,
    dailyReminders: true,
    contentUpdates: true,
    communityActivity: false,
  },
  challenges: [],
  primaryNeeds: [],
  createdAt: Date.now(),
  version: '1.0.0',
});
