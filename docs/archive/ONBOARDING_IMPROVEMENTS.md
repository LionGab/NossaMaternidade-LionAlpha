# 🎯 Melhorias do Onboarding Flow

## Status Atual

O arquivo `src/screens/onboarding/OnboardingFlowNew.tsx` está funcional com 9 etapas implementadas. Este documento detalha as melhorias para integração completa com a arquitetura de Agentes IA e MCPs.

---

## ✅ O que já está implementado

1. ✅ 9 etapas do onboarding
2. ✅ Validação de etapas
3. ✅ Skip condicional da timeline
4. ✅ P66ersistência em AsyncStorage
5. ✅ UI/UX mobile-first
6. ✅ Dark mode support
7. ✅ Aceite de termos e privacidade

---

## 🔧 Melhorias Necessárias

### 1. Integração com AgentsContext

**Arquivo**: `src/screens/onboarding/OnboardingFlowNew.tsx`

#### Adicionar imports:

```typescript
import * as Haptics from 'expo-haptics';
import { useAgents } from '../../contexts/AgentsContext';
import { ActivityIndicator } from 'react-native';
```

#### Adicionar no componente:

```typescript
export default function OnboardingFlow() {
  const navigation = useNavigation<any>();
  const { isDark, toggleTheme, colors } = useTheme();
  const { initialized: agentsInitialized, orchestrator } = useAgents(); // NOVO

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<UserProfile>({});
  const [sliderValue, setSliderValue] = useState(20);
  const [isProcessing, setIsProcessing] = useState(false); // NOVO

  // ... resto do código
}
```

---

### 2. Analytics Tracking em cada Step

#### Atualizar função `nextStep`:

```typescript
const nextStep = async () => {
  let next = step + 1;

  // Track step completion com Analytics MCP
  if (agentsInitialized && orchestrator) {
    try {
      await orchestrator.callMCP('analytics', 'event.track', {
        name: 'onboarding_step_completed',
        properties: {
          step,
          totalSteps: TOTAL_STEPS,
          timestamp: Date.now(),
        },
      });
    } catch (error) {
      console.warn('⚠️ Analytics tracking failed:', error);
    }
  }

  // Skip Timeline (Step 4) if not applicable
  if (step === 3) {
    const needsTimeline =
      formData.stage === UserStage.PREGNANT || formData.stage === UserStage.NEW_MOM;
    if (!needsTimeline) next = 5;
  }

  // Haptic feedback
  await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

  setStep(next);
};
```

---

### 3. Melhorar função `handleFinish`

```typescript
const handleFinish = async () => {
  try {
    setIsProcessing(true);

    // 1. Salvar perfil do usuário
    const userProfileData = {
      ...formData,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      version: '1.0.0',
    };

    await AsyncStorage.setItem('nath_user', JSON.stringify(userProfileData));
    await AsyncStorage.setItem('@onboarding_completed', 'true');

    // 2. Track onboarding completion com Analytics MCP
    if (agentsInitialized && orchestrator) {
      try {
        await orchestrator.callMCP('analytics', 'event.track', {
          name: 'onboarding_completed',
          properties: {
            stage: formData.stage,
            challenge: formData.biggestChallenge,
            supportLevel: formData.supportLevel,
            primaryNeed: formData.primaryNeed,
            timestamp: Date.now(),
          },
        });

        // 3. Identificar usuário no Analytics
        const userId = `user_${Date.now()}`;
        await orchestrator.callMCP('analytics', 'user.identify', {
          userId,
          traits: {
            stage: formData.stage,
            challenge: formData.biggestChallenge,
            name: formData.name,
          },
        });

        console.log('✅ Onboarding tracked successfully');
      } catch (error) {
        console.warn('⚠️ Analytics tracking failed:', error);
      }
    }

    // 4. Haptic feedback
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    // 5. Navegar para Main
    navigation.navigate('Main');
  } catch (error) {
    console.error('❌ Erro ao salvar dados do usuário:', error);
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  } finally {
    setIsProcessing(false);
  }
};
```

---

### 4. Adicionar Haptic Feedback em `updateData`

```typescript
const updateData = (key: keyof UserProfile, value: any) => {
  setFormData((prev) => ({ ...prev, [key]: value }));
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
};
```

---

### 5. Melhorar Step 1 (Welcome) com status dos agentes

```typescript
// No Step 1, após o botão "Começar"
{__DEV__ && (
  <View className="mt-4 px-4 py-2 rounded-lg" style={{
    backgroundColor: agentsInitialized ? colors.raw.success[100] : colors.raw.warning[100]
  }}>
    <Text className="text-xs text-center" style={{
      color: agentsInitialized ? colors.raw.success[700] : colors.raw.warning[700]
    }}>
      {agentsInitialized ? '✅ Agentes IA Prontos' : '⏳ Inicializando Agentes...'}
    </Text>
  </View>
)}
```

---

### 6. Melhorar Step 9 (Final) com loading state

```typescript
// No Step 9, atualizar o botão final:
<TouchableOpacity
  onPress={handleFinishWithAcceptance}
  disabled={!canProceed || isProcessing}
  className="w-full py-4 rounded-xl shadow-lg flex-row items-center justify-center gap-2"
  style={{
    backgroundColor: canProceed && !isProcessing ? colors.primary.main : colors.border.medium,
    opacity: canProceed && !isProcessing ? 1 : 0.5
  }}
  activeOpacity={0.9}
>
  {isProcessing ? (
    <>
      <ActivityIndicator color="#FFFFFF" size="small" />
      <Text className="text-white font-bold text-base">Preparando seu refúgio...</Text>
    </>
  ) : (
    <>
      <Text className="text-white font-bold text-base">Entrar no meu refúgio</Text>
      <Shield size={18} color="#FFFFFF" />
    </>
  )}
</TouchableOpacity>
```

---

## 🎨 Melhorias de UX

### 1. Adicionar animações de transição

```typescript
// Instalar: expo install react-native-reanimated

import Animated, { FadeIn, FadeOut, SlideInRight } from 'react-native-reanimated';

// Envolver cada step com Animated.View
<Animated.View
  entering={SlideInRight.duration(300)}
  exiting={FadeOut.duration(200)}
>
  {/* Conteúdo do step */}
</Animated.View>
```

### 2. Adicionar progress animation

```typescript
// No Header component
<Animated.View
  className="h-1.5 rounded-full"
  style={{
    width: animatedWidth, // usar Animated.Value
    backgroundColor: colors.primary.main,
  }}
/>
```

---

## 📊 Eventos Analytics a Trackear

### Eventos Importantes:

```typescript
// 1. Início do onboarding
orchestrator.callMCP('analytics', 'event.track', {
  name: 'onboarding_started',
  properties: { timestamp: Date.now() },
});

// 2. Cada step completado
orchestrator.callMCP('analytics', 'event.track', {
  name: 'onboarding_step_completed',
  properties: { step, totalSteps: 9 },
});

// 3. Step abandonado (usuário volta)
orchestrator.callMCP('analytics', 'event.track', {
  name: 'onboarding_step_back',
  properties: { from: step, to: step - 1 },
});

// 4. Onboarding completo
orchestrator.callMCP('analytics', 'event.track', {
  name: 'onboarding_completed',
  properties: {
    stage: formData.stage,
    challenge: formData.biggestChallenge,
    duration: endTime - startTime,
  },
});

// 5. Perfil do usuário
orchestrator.callMCP('analytics', 'user.identify', {
  userId: `user_${Date.now()}`,
  traits: {
    name: formData.name,
    stage: formData.stage,
    challenge: formData.biggestChallenge,
    supportLevel: formData.supportLevel,
    primaryNeed: formData.primaryNeed,
  },
});
```

---

## 🔒 Segurança e Validação

### 1. Validação de cada step

```typescript
const validateStep = (step: number): boolean => {
  switch (step) {
    case 2: // Nome
      return !!formData.name && formData.name.trim().length > 0;

    case 3: // Stage
      return !!formData.stage;

    case 4: // Timeline (condicional)
      const needsTimeline =
        formData.stage === UserStage.PREGNANT || formData.stage === UserStage.NEW_MOM;
      return !needsTimeline || !!formData.timelineInfo;

    case 5: // Feeling
      return !!formData.currentFeeling;

    case 6: // Challenge
      return !!formData.biggestChallenge;

    case 7: // Support
      return !!formData.supportLevel;

    case 8: // Primary Need
      return !!formData.primaryNeed;

    case 9: // Terms
      return termsAccepted && privacyAccepted;

    default:
      return true;
  }
};

// Usar na função nextStep:
const nextStep = async () => {
  if (!validateStep(step)) {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    return;
  }
  // ... resto do código
};
```

---

## 🧪 Testes

### Testar manualmente:

1. ✅ Navegação entre steps (frente e trás)
2. ✅ Skip do timeline quando não aplicável
3. ✅ Validação de campos obrigatórios
4. ✅ Aceite de termos e privacidade
5. ✅ Persistência dos dados
6. ✅ Analytics tracking
7. ✅ Haptic feedback
8. ✅ Dark mode
9. ✅ Loading states

---

## 📱 Compatibilidade

### iOS:

- ✅ Safe Area support
- ✅ Haptic feedback (UIImpactFeedbackGenerator)
- ✅ ScrollView keyboard handling
- ✅ Dark mode

### Android:

- ✅ Safe Area support
- ✅ Vibration (Haptics API)
- ✅ Keyboard avoidance
- ✅ Dark mode

---

## 🚀 Próximos Passos

1. **Implementar as melhorias acima**
   - Adicionar imports necessários
   - Atualizar funções nextStep, handleFinish, updateData
   - Adicionar tracking de analytics

2. **Testar em dispositivos reais**
   - iOS físico
   - Android físico
   - Diferentes tamanhos de tela

3. **Otimizar performance**
   - Lazy load de imagens
   - Memoization de componentes pesados
   - Debounce em inputs

4. **Adicionar animações**
   - Transições entre steps
   - Progress bar animada
   - Micro-interactions

5. **Preparar para stores**
   - Screenshots dos steps
   - App Store Connect
   - Google Play Console

---

## 📝 Código Completo de Exemplo

```typescript
/**
 * OnboardingFlowNew - Versão Melhorada
 * Com integração completa de Agentes IA e Analytics
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Switch,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import {
  ArrowRight,
  Check,
  Sun,
  ArrowLeft,
  Heart,
  Baby,
  Users,
  Brain,
  Bell,
  Shield,
} from 'lucide-react-native';
import {
  UserEmotion,
  UserStage,
  UserProfile,
  UserChallenge,
  UserSupport,
  UserNeed,
} from '../../types/user';
import { Colors } from '../../constants/Colors';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../theme/ThemeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { useAgents } from '../../contexts/AgentsContext';

export default function OnboardingFlow() {
  const navigation = useNavigation<any>();
  const { isDark, toggleTheme, colors } = useTheme();
  const { initialized: agentsInitialized, orchestrator } = useAgents();

  // Estados
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<UserProfile>({});
  const [sliderValue, setSliderValue] = useState(20);
  const [isProcessing, setIsProcessing] = useState(false);
  const [startTime] = useState(Date.now());

  const TOTAL_STEPS = 9;

  // Funções melhoradas
  const updateData = (key: keyof UserProfile, value: any) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const nextStep = async () => {
    // Validação
    if (!validateStep(step)) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    // Analytics tracking
    if (agentsInitialized && orchestrator) {
      try {
        await orchestrator.callMCP('analytics', 'event.track', {
          name: 'onboarding_step_completed',
          properties: { step, totalSteps: TOTAL_STEPS, timestamp: Date.now() },
        });
      } catch (error) {
        console.warn('Analytics tracking failed:', error);
      }
    }

    let next = step + 1;

    // Skip timeline se não aplicável
    if (step === 3) {
      const needsTimeline =
        formData.stage === UserStage.PREGNANT || formData.stage === UserStage.NEW_MOM;
      if (!needsTimeline) next = 5;
    }

    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setStep(next);
  };

  const handleFinish = async () => {
    try {
      setIsProcessing(true);

      // 1. Salvar perfil
      const userProfileData = {
        ...formData,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        version: '1.0.0',
      };

      await AsyncStorage.setItem('nath_user', JSON.stringify(userProfileData));
      await AsyncStorage.setItem('@onboarding_completed', 'true');

      // 2. Analytics tracking
      if (agentsInitialized && orchestrator) {
        try {
          // Completion event
          await orchestrator.callMCP('analytics', 'event.track', {
            name: 'onboarding_completed',
            properties: {
              stage: formData.stage,
              challenge: formData.biggestChallenge,
              supportLevel: formData.supportLevel,
              primaryNeed: formData.primaryNeed,
              duration: Date.now() - startTime,
              timestamp: Date.now(),
            },
          });

          // User identification
          const userId = `user_${Date.now()}`;
          await orchestrator.callMCP('analytics', 'user.identify', {
            userId,
            traits: {
              stage: formData.stage,
              challenge: formData.biggestChallenge,
              name: formData.name,
            },
          });

          console.log('✅ Onboarding tracked successfully');
        } catch (error) {
          console.warn('⚠️ Analytics tracking failed:', error);
        }
      }

      // 3. Success feedback
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      // 4. Navigate
      navigation.navigate('Main');
    } catch (error) {
      console.error('❌ Erro ao salvar dados:', error);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsProcessing(false);
    }
  };

  const validateStep = (step: number): boolean => {
    // ... implementação da validação
    return true;
  };

  // ... resto dos componentes
}
```

---

## 🎯 Resultado Esperado

Após implementar essas melhorias:

✅ **Analytics completo** de cada etapa do onboarding
✅ **Haptic feedback** em todas as interações
✅ **Loading states** claros
✅ **Validação robusta** de dados
✅ **Integração perfeita** com Agentes IA
✅ **UX premium** para iOS/Android
✅ **Production-ready** para stores

---

**Status**: Documento de melhorias pronto para implementação 🚀
