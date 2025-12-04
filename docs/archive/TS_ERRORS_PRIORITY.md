# 📋 Categorização de Erros TypeScript - Prioridade

**Data:** 2025-11-29  
**Total de Erros:** 58

---

## 🔴 P0 - CRÍTICOS (Bloqueiam Builds) - 1 erro

### TS2339: Property does not exist

- `src/components/premium/PremiumCard.tsx(203,35)`: Property 'overlay' does not exist on type
  - **Ação:** Verificar se `COLORS.overlay` existe ou usar alternativa
  - **Prioridade:** ALTA - Quebra build

---

## 🟡 P1 - WARNINGS (Variáveis Não Usadas) - 57 erros

### TS6133: Variable is declared but never used

**Agents (8 erros):**

- `src/agents/content/ContentRecommendationAgent.ts(179,24)`: 'timeline'
- `src/agents/design/DesignQualityAgent.ts(161,59)`: 'params'
- `src/agents/emotion/EmotionAnalysisAgent.ts(203,5)`: 'dominantEmotion'
- `src/agents/emotion/EmotionAnalysisAgent.ts(235,5)`: 'riskLevel'
- `src/agents/emotion/EmotionAnalysisAgent.ts(349,50)`: 'currentState'
- `src/agents/nathia/NathiaPersonalityAgent.ts(54,20)`: 'NATHIA_VOICE_RULES'
- `src/agents/sleep/SleepAnalysisAgent.ts(206,5)`: 'deprivation'
- `src/agents/sleep/SleepAnalysisAgent.ts(321,48)`: 'currentState'

**Components (25 erros):**

- `src/components/charts/HabitsBarChart.tsx(78,18)`: 'opacity'
- `src/components/charts/MoodChart.tsx(60,17)`: 'opacity'
- `src/components/charts/MoodChart.tsx(73,18)`: 'opacity'
- `src/components/molecules/HeroBanner.tsx(34,9)`: 'isDark'
- `src/components/molecules/ThemeToggle.tsx(17,1)`: 'getShadowFromToken'
- `src/components/OnboardingCard.tsx(26,3)`: 'className'
- `src/components/organisms/MaternalCard.tsx(11,38)`: 'Image'
- `src/components/premium/PremiumButton.tsx(11,3)`: 'Platform'
- `src/components/premium/PremiumButton.tsx(16,71)`: 'ANIMATIONS'
- `src/components/premium/PremiumCard.tsx(3,3)`: 'View'
- `src/components/premium/PremiumInput.tsx(9,3)`: 'Platform'
- `src/components/primitives/Container.tsx(8,32)`: 'isSmallDevice'
- `src/components/primitives/Container.tsx(8,47)`: 'isMediumDevice'
- `src/components/primitives/Container.tsx(8,63)`: 'isLargeDevice'
- `src/components/primitives/Link.tsx(9,16)`: 'RNTextProps'
- `src/components/primitives/ProgressIndicator.tsx(19,10)`: 'Tokens'
- `src/components/primitives/ProgressIndicator.tsx(204,11)`: 'strokeDashoffset'
- `src/components/primitives/SafeAreaWrapper.tsx(48,9)`: 'insets'
- `src/components/ProgressIndicator.tsx(28,15)`: 'isCurrent'
- `src/components/Radio.tsx(16,19)`: 'Radius'

**Screens (19 erros):**

- `src/screens/ChatScreen.tsx(37,27)`: 'Shadows'
- `src/screens/ChatScreen.tsx(65,9)`: 'route'
- `src/screens/ChatScreen.tsx(79,10)`: 'selectedImage'
- `src/screens/FeedScreen.tsx(127,19)`: 'isDark'
- `src/screens/HabitsScreen.tsx(22,7)`: 'SCREEN_WIDTH'
- `src/screens/HabitsScreen.tsx(424,9)`: 'today'
- `src/screens/Onboarding/OnboardingFlowNew.tsx(1,27)`: 'useEffect'
- `src/screens/Onboarding/OnboardingFlowNew.tsx(2,103)`: 'Dimensions'
- `src/screens/Onboarding/OnboardingStep1.tsx(19,11)`: 'isDark'
- `src/screens/Onboarding/OnboardingStep2.tsx(17,19)`: 'isDark'
- `src/screens/Onboarding/OnboardingStep3.tsx(24,19)`: 'isDark'
- `src/screens/Onboarding/OnboardingStep4.tsx(25,9)`: '\_label'
- `src/screens/Onboarding/OnboardingStep5.tsx(25,19)`: 'isDark'
- `src/screens/Onboarding/OnboardingStep8.tsx(24,19)`: 'isDark'
- `src/screens/Onboarding/OnboardingStep9.tsx(18,19)`: 'isDark'
- `src/screens/ProfileScreen.tsx(21,37)`: 'ChevronRight'
- `src/screens/SettingsScreen.tsx(39,19)`: 'isDark'
- `src/screens/SplashScreen.tsx(22,19)`: 'isDark'

**Services (4 erros):**

- `src/services/aiRouter.ts(153,30)`: 'primaryModel'
- `src/services/aiTools/toolExecutor.ts(6,1)`: 'supabase'
- `src/services/chatService.ts(2,1)`: 'geminiService'
- `src/services/chatService.ts(313,15)`: 'toolResult'

**Utils (1 erro):**

- `src/utils/animationHelper.ts(35,3)`: 'value'
- `src/utils/animationHelper.ts(53,3)`: 'value'

**MCP (2 erros):**

- `src/mcp/servers/AnalyticsMCPServer.ts(31,11)`: 'UserIdentity' (TS6196)
- `src/mcp/servers/SupabaseMCPServer.ts(12,3)`: 'MCPError'

**Navigation (1 erro):**

- `src/navigation/TabNavigator.tsx(42,19)`: 'isDark'

**AI Moderation (1 erro):**

- `src/ai/moderation/MedicalModerationService.ts(205,17)`: 'patternName'

---

## 📊 RESUMO POR PRIORIDADE

| Prioridade       | Quantidade | Tipo          | Ação                        |
| ---------------- | ---------- | ------------- | --------------------------- |
| **P0 - Crítico** | 1          | TS2339        | Corrigir imediatamente      |
| **P1 - Warning** | 57         | TS6133/TS6196 | Prefixar com `_` ou remover |

---

## 🎯 PLANO DE CORREÇÃO

### Fase 1: Corrigir P0 (Crítico) - 5 min

- [ ] Corrigir `PremiumCard.tsx` linha 203 - Property 'overlay'

### Fase 2: Corrigir P1 (Warnings) - 2-3 horas

- [ ] Prefixar variáveis não usadas com `_` (padrão do projeto)
- [ ] Remover imports não utilizados
- [ ] Validar: `npm run type-check` deve retornar 0 erros

---

**Próxima ação:** Corrigir erro P0 em `PremiumCard.tsx`
