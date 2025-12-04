# PLANO DE MIGRAÇÃO: Web Design → Mobile App

**Data**: 2025-12-04
**Status**: PAUSADO - Aguardando continuação

---

## OBJETIVO

Migrar design e features do **app-redesign-studio** (web) para **NossaMaternidade-LionAlpha** (mobile Expo) para publicar nas stores iOS/Android.

---

## PROJETOS ENVOLVIDOS

### Origem (Web - Design Reference)
```
Path: C:\Users\User\Downloads\app-redesign-studio-ab40635e\app-redesign-studio-ab40635e-2
Stack: Vite + React + TypeScript + shadcn/ui + Tailwind
Status: Funcionando (dev server)
```

### Destino (Mobile - Production)
```
Path: C:\Users\User\Downloads\NM-gl\NossaMaternidade-LionAlpha
Stack: Expo SDK 54 + React Native + NativeWind + Supabase
Status: 84% pronto para stores
```

---

## FEATURES A MIGRAR

### Novas Telas (criar do zero)

| Tela | Arquivo Web | Prioridade |
|------|-------------|------------|
| DesculpaHoje | `src/pages/DesculpaHoje.tsx` | ALTA |
| Ritual | `src/pages/Ritual.tsx` | ALTA |
| SOS Mãe | `src/pages/SOSMae.tsx` | ALTA |

### Telas Existentes (atualizar design)

| Tela | Arquivo Mobile | Ação |
|------|----------------|------|
| Chat | `src/screens/ChatScreen.tsx` | Atualizar UI |
| Community | `src/screens/CommunityScreen.tsx` | Atualizar UI |
| Habits | `src/screens/HabitsScreen.tsx` | Atualizar UI |
| Home | `src/screens/HomeScreen.tsx` | Atualizar UI |

---

## DESIGN TOKENS A COPIAR

### Cores (Web → Mobile)

```typescript
// Copiar para: src/design-system/colors.ts

// Rosa Maternal (Primary)
PRIMARY: {
  50: '#FFF5F8',
  100: '#FFE8F0',
  200: '#FFB3D9',
  300: '#FF85B3',
  400: '#FF6B9D',  // Principal
  500: '#EC4899',
  600: '#DB2777',
  700: '#BE185D',
  800: '#9D174D',
  900: '#831843',
}

// Azul Pastel (Secondary)
SECONDARY: {
  50: '#EDF5FB',
  100: '#DBEAFE',
  200: '#BFDBFE',
  300: '#93C5FD',
  400: '#7DD3FC',  // Principal
  500: '#60A5FA',
  600: '#3B82F6',
}

// Background
BACKGROUND: {
  light: '#FFF8FA',
  dark: '#1F1F2E',
}
```

### Tipografia

```typescript
// Copiar para: src/design-system/typography.ts

FONTS: {
  display: 'Fraunces',      // Títulos (orgânica)
  body: 'Nunito',           // Corpo (acolhedora)
}

SIZES: {
  display: 36,  // 2.25rem
  h1: 28,       // 1.75rem
  h2: 22,       // 1.375rem
  h3: 18,       // 1.125rem
  body: 17,     // 1.0625rem (otimizado mobile)
  small: 14,    // 0.875rem
  caption: 12,  // 0.75rem
}
```

---

## COMPONENTES A ADAPTAR

### Do Web (shadcn) → Mobile (React Native)

| Componente Web | Adaptação Mobile |
|----------------|------------------|
| `BreathingGuide.tsx` | Usar `Animated` ou `Reanimated` |
| `GuiltSelector.tsx` | `FlatList` + `Pressable` |
| `EmotionCheckIn.tsx` | `Pressable` com emojis |
| `SOSFloatingButton.tsx` | `FAB` posicionado absolute |
| `ValidationEngine.tsx` | Componente RN puro |
| `BadgeUnlocker.tsx` | Modal com animação |

### Animações

| Web (Framer Motion) | Mobile (Reanimated) |
|---------------------|---------------------|
| `animate={{ scale }}` | `useAnimatedStyle` |
| `motion.div` | `Animated.View` |
| `variants` | `withSpring`, `withTiming` |

---

## HOOKS/SERVICES (Copiar direto)

### Hooks (100% compatíveis)
```
src/hooks/useChat.ts
src/hooks/useHabits.ts
src/hooks/useRitual.ts
src/hooks/useEmotionTracking.ts
src/hooks/useCommunity.ts
src/hooks/useSupabaseHealth.ts
```

### Services (100% compatíveis)
```
src/services/ai/GeminiService.ts
src/services/ai/ClaudeService.ts
src/services/ai/ElevenLabsService.ts
src/services/supabase/*.ts (todos)
```

### Types (100% compatíveis)
```
src/types/guilt.ts
src/types/ritual.ts
src/types/sos.ts
src/types/supabase.ts
```

---

## NAVEGAÇÃO (Adicionar rotas)

```typescript
// Adicionar em src/navigation/

// Stack Navigator
<Stack.Screen name="DesculpaHoje" component={DesculpaHojeScreen} />
<Stack.Screen name="Ritual" component={RitualScreen} />
<Stack.Screen name="SOSMae" component={SOSMaeScreen} />

// Tab Navigator (se aplicável)
// Ou FAB flutuante para SOS
```

---

## ORDEM DE EXECUÇÃO

### Fase 1: Preparação (30 min)
- [ ] Atualizar cores em `src/design-system/colors.ts`
- [ ] Atualizar tipografia em `src/design-system/typography.ts`
- [ ] Copiar hooks do web → mobile
- [ ] Copiar services do web → mobile
- [ ] Copiar types do web → mobile

### Fase 2: DesculpaHoje (2h)
- [ ] Criar `src/screens/DesculpaHojeScreen.tsx`
- [ ] Criar `src/components/guilt/GuiltSelector.tsx`
- [ ] Criar `src/components/guilt/ValidationEngine.tsx`
- [ ] Criar `src/components/guilt/BadgeUnlocker.tsx`
- [ ] Adicionar rota na navegação

### Fase 3: Ritual (2h)
- [ ] Criar `src/screens/RitualScreen.tsx`
- [ ] Criar `src/components/ritual/BreathingGuide.tsx`
- [ ] Criar `src/components/ritual/EmotionCheckIn.tsx`
- [ ] Criar `src/components/ritual/AmbientSound.tsx`
- [ ] Adicionar rota na navegação

### Fase 4: SOS Mãe (2h)
- [ ] Criar `src/screens/SOSMaeScreen.tsx`
- [ ] Criar `src/components/sos/SentimentAnalyzer.tsx`
- [ ] Criar `src/components/sos/EmpathyAudioPlayer.tsx`
- [ ] Criar `src/components/sos/CommunityTestimonial.tsx`
- [ ] Criar `src/components/SOSFloatingButton.tsx`
- [ ] Adicionar rota + FAB

### Fase 5: Atualizar telas existentes (2h)
- [ ] Atualizar HomeScreen com novo design
- [ ] Atualizar ChatScreen com novo design
- [ ] Atualizar CommunityScreen com novo design
- [ ] Atualizar HabitsScreen com novo design

### Fase 6: Testes e ajustes (2h)
- [ ] Testar em iOS simulator
- [ ] Testar em Android emulator
- [ ] Ajustar responsividade
- [ ] Verificar dark mode

---

## PRÉ-REQUISITOS PARA STORES

### Apple App Store
- [ ] Apple Developer Account ($99/ano)
- [ ] App ID criado no App Store Connect
- [ ] Certificates configurados
- [ ] ascAppId em eas.json

### Google Play Store
- [ ] Google Play Console ($25 único)
- [ ] App criado no console
- [ ] google-play-service-account.json
- [ ] Signing key configurada

---

## COMANDOS ÚTEIS

```bash
# Desenvolvimento
cd /c/Users/User/Downloads/NM-gl/NossaMaternidade-LionAlpha
npm install
npm start

# Verificação
npm run lint:fix
npm run type-check

# Build para stores
npm run build:ios
npm run build:android

# Submeter
npm run submit:ios
npm run submit:android
```

---

## NOTAS

- O projeto mobile já tem 84% pronto
- ESLint tem 1480 errors (rodar `npm run lint:fix`)
- Design atual é roxo/dourado, vai mudar para rosa/azul
- Supabase já está configurado e funcionando
- IA (Gemini) já integrada

---

**Para continuar**: Diga "continuar migração" ou "iniciar fase X"
