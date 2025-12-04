// components/onboarding/OnboardingFlow.tsx
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useCallback, useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';

import { useOnboardingFlow } from '@/hooks/useOnboardingFlow';
import { useOnboardingStorage } from '@/hooks/useOnboardingStorage';
import { useResponsive } from '@/hooks/useResponsive';
import type { RootStackParamList } from '@/navigation/types';
import { UserStage, UserEmotion, UserChallenge, UserSupport } from '@/types/user';
import { logger } from '@/utils/logger';

// Steps
import { ChallengeStep } from './steps/ChallengeStep';
import { FeelingStep } from './steps/FeelingStep';
import { NameStep } from './steps/NameStep';
import { NeedStep } from './steps/NeedStep';
import { StageStep } from './steps/StageStep';
import { SupportStep } from './steps/SupportStep';
import { TermsStep } from './steps/TermsStep';
import { TimelineStep } from './steps/TimelineStep';
import { WelcomeStep } from './steps/WelcomeStep';

type OnboardingNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Onboarding'>;

export default function OnboardingFlow() {
  const navigation = useNavigation<OnboardingNavigationProp>();
  const { isSmallScreen } = useResponsive();
  const [isLoading, setIsLoading] = useState(true);

  const {
    step,
    formData,
    sliderValue,
    termsAccepted,
    privacyAccepted,
    TOTAL_STEPS,
    nextStep,
    prevStep,
    updateData,
    setSliderValue,
    toggleTerms,
    togglePrivacy,
    canProceed,
    progress,
    loadProfile,
  } = useOnboardingFlow();

  const { saveUserProfile, saveAcceptanceTimestamps, getUserProfile, isOnboardingCompleted } =
    useOnboardingStorage();

  // Carregar perfil existente ao montar (para retomar onboarding)
  useEffect(() => {
    const loadExistingProfile = async () => {
      try {
        const existing = await getUserProfile();
        const completed = await isOnboardingCompleted();

        if (completed) {
          // Onboarding já completo - navegar direto para Main
          logger.info('Onboarding já completo, navegando para Main');
          navigation.navigate('Main' as never);
          return;
        }

        if (existing) {
          // Retomar onboarding com dados existentes
          loadProfile(existing);
          logger.info('Perfil existente carregado, retomando onboarding', {
            step: existing.onboarding_step || 1,
          });
        }
      } catch (error) {
        logger.error('Erro ao carregar perfil existente', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadExistingProfile();
  }, [getUserProfile, isOnboardingCompleted, loadProfile, navigation]);

  const handleFinish = useCallback(async () => {
    if (!canProceed) {
      logger.warn('Tentativa de finalizar onboarding sem aceitar termos');
      return;
    }

    try {
      setIsLoading(true);

      // 1. Salvar timestamps de aceitação (LGPD compliance)
      await saveAcceptanceTimestamps();

      // 2. Salvar perfil completo (Supabase ou local)
      const success = await saveUserProfile({
        ...formData,
        onboarding_completed: true,
        onboarding_step: TOTAL_STEPS,
      });

      if (success) {
        logger.info('Onboarding completado com sucesso', {
          name: formData.name,
          stage: formData.stage,
        });

        // Navegar para Main após pequeno delay (UX)
        setTimeout(() => {
          navigation.navigate('Main' as never);
        }, 300);
      } else {
        logger.error('Falha ao salvar perfil no final do onboarding');
        // TODO: Mostrar erro ao usuário
      }
    } catch (error) {
      logger.error('Erro ao finalizar onboarding', error);
      // TODO: Mostrar erro ao usuário
    } finally {
      setIsLoading(false);
    }
  }, [canProceed, formData, saveUserProfile, saveAcceptanceTimestamps, navigation, TOTAL_STEPS]);

  // Loading state
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // Renderiza step atual
  switch (step) {
    case 1:
      return <WelcomeStep onNext={nextStep} isSmallScreen={isSmallScreen} />;

    case 2:
      return (
        <NameStep
          name={formData.name}
          onChangeName={(text) => updateData('name', text)}
          onNext={nextStep}
          onBack={prevStep}
          step={step}
          totalSteps={TOTAL_STEPS}
          progress={progress}
          isSmallScreen={isSmallScreen}
        />
      );

    case 3:
      return (
        <StageStep
          stage={formData.stage}
          onSelectStage={(stage) => updateData('stage', stage as UserStage)}
          onNext={nextStep}
          onBack={prevStep}
          step={step}
          totalSteps={TOTAL_STEPS}
          progress={progress}
          name={formData.name}
          isSmallScreen={isSmallScreen}
        />
      );

    case 4:
      return (
        <TimelineStep
          stage={formData.stage}
          sliderValue={sliderValue}
          onChangeSlider={setSliderValue}
          onNext={(value) => {
            updateData('timelineInfo', value);
            nextStep();
          }}
          onBack={prevStep}
          step={step}
          totalSteps={TOTAL_STEPS}
          progress={progress}
          isSmallScreen={isSmallScreen}
        />
      );

    case 5:
      return (
        <FeelingStep
          currentFeeling={formData.currentFeeling}
          onSelectFeeling={(feeling) => updateData('currentFeeling', feeling as UserEmotion)}
          onNext={nextStep}
          onBack={prevStep}
          step={step}
          totalSteps={TOTAL_STEPS}
          progress={progress}
          isSmallScreen={isSmallScreen}
        />
      );

    case 6:
      return (
        <ChallengeStep
          biggestChallenge={formData.biggestChallenge}
          onSelectChallenge={(challenge) =>
            updateData('biggestChallenge', challenge as UserChallenge)
          }
          onNext={nextStep}
          onBack={prevStep}
          step={step}
          totalSteps={TOTAL_STEPS}
          progress={progress}
          isSmallScreen={isSmallScreen}
        />
      );

    case 7:
      return (
        <SupportStep
          supportLevel={formData.supportLevel}
          onSelectSupport={(support) => updateData('supportLevel', support as UserSupport)}
          onNext={nextStep}
          onBack={prevStep}
          step={step}
          totalSteps={TOTAL_STEPS}
          progress={progress}
          isSmallScreen={isSmallScreen}
        />
      );

    case 8:
      return (
        <NeedStep
          primaryNeed={formData.primaryNeed}
          onSelectNeed={(need) => updateData('primaryNeed', need)}
          onNext={nextStep}
          onBack={prevStep}
          step={step}
          totalSteps={TOTAL_STEPS}
          progress={progress}
          isSmallScreen={isSmallScreen}
        />
      );

    case 9:
      return (
        <TermsStep
          name={formData.name}
          biggestChallenge={formData.biggestChallenge}
          termsAccepted={termsAccepted}
          privacyAccepted={privacyAccepted}
          notificationsEnabled={formData.notificationsEnabled || false}
          onToggleTerms={toggleTerms}
          onTogglePrivacy={togglePrivacy}
          onToggleNotifications={(value) => updateData('notificationsEnabled', value)}
          onFinish={handleFinish}
          canProceed={canProceed}
          isSmallScreen={isSmallScreen}
          isLoading={isLoading}
        />
      );

    default:
      return null;
  }
}
