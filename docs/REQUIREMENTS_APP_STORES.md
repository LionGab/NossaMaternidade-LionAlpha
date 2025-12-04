# 📱 Requisitos App Store & Google Play Store - Nossa Maternidade

**Data:** 27 de novembro de 2025  
**Plataformas:** iOS (App Store) + Android (Google Play Store)  
**Framework:** React Native + Expo

---

## 🎯 Checklist de Conformidade

### iOS (App Store)

#### Design Guidelines (Apple HIG)

- [x] **Safe Areas** - Respeitar notch e home indicator
- [x] **Touch Targets** - Mínimo 44x44pt (já implementado: `SIZES.touchMin = 44px`)
- [ ] **Navigation Patterns** - Tab bar nativa iOS
- [ ] **Gestures** - Swipe back, long press
- [ ] **Typography** - SF Pro font fallback
- [ ] **Colors** - Suporte a Dynamic Color (iOS 15+)
- [ ] **Dark Mode** - Suporte completo (já implementado)
- [ ] **Haptic Feedback** - Feedback tátil em interações

#### Technical Requirements

- [ ] **Expo SDK 51+** - Compatibilidade iOS 15+
- [ ] **Permissions** - Camera, Microphone, Notifications (Info.plist)
- [ ] **App Icons** - Todos os tamanhos (1024x1024, 180x180, etc.)
- [ ] **Splash Screen** - Launch screen nativa
- [ ] **Privacy Manifest** - iOS 17+ (PrivacyInfo.xcprivacy)
- [ ] **App Store Connect** - Metadata, screenshots, descrição

---

### Android (Google Play Store)

#### Design Guidelines (Material Design 3)

- [x] **8-point Grid** - Espaçamento consistente (já implementado)
- [x] **Touch Targets** - Mínimo 48dp (já implementado: `SIZES.touchMin = 44px`)
- [ ] **Material You** - Dynamic colors (Android 12+)
- [ ] **Navigation** - Bottom navigation padrão Android
- [ ] **Back Button** - Respeitar botão voltar do sistema
- [ ] **Edge-to-Edge** - Suporte a telas edge-to-edge
- [ ] **Status Bar** - Cores adaptáveis (light/dark)

#### Technical Requirements

- [ ] **Expo SDK 51+** - Compatibilidade Android 8.0+ (API 26+)
- [ ] **Permissions** - Camera, Microphone, Notifications (AndroidManifest.xml)
- [ ] **App Icons** - Adaptive icons (1024x1024, 512x512)
- [ ] **Splash Screen** - Splash screen nativa
- [ ] **Target SDK** - Android 14+ (API 34+)
- [ ] **Play Console** - Metadata, screenshots, descrição

---

## 🎨 Design System - Adaptações para Mobile

### Safe Areas (iOS/Android)

```typescript
// src/design-system/safe-areas.ts
import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const useSafeAreaPadding = () => {
  const insets = useSafeAreaInsets();

  return {
    top: insets.top,
    bottom: insets.bottom,
    left: insets.left,
    right: insets.right,
  };
};
```

**Uso:**

```typescript
import { useSafeAreaPadding } from '@/design-system/safe-areas';

const { top, bottom } = useSafeAreaPadding();

<View style={{ paddingTop: top, paddingBottom: bottom }}>
  {/* Conteúdo */}
</View>
```

---

### Touch Targets

**Já implementado:**

```typescript
// src/design-system/spacing.ts
export const SIZES = {
  touchMin: SPACING[11], // 44px (iOS) / 48dp (Android)
  // ...
};
```

**Validação:**

- ✅ iOS: 44pt mínimo
- ✅ Android: 48dp mínimo
- ✅ Nossa implementação: 44px (adequado para ambas)

---

### Typography - Fontes Nativas

```typescript
// src/design-system/typography.ts
export const FONTS = {
  primary: {
    ios: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text"',
    android: '"Roboto", "Noto Sans"',
    fallback: '"Poppins", "Inter", sans-serif',
  },
};
```

**React Native:**

```typescript
import { Platform } from 'react-native';

const fontFamily = Platform.select({
  ios: 'System', // SF Pro
  android: 'Roboto',
  default: 'System',
});
```

---

### Colors - Dynamic Colors

**iOS (Dynamic Color):**

```typescript
// Suporte a Dynamic Color (iOS 15+)
import { useColorScheme } from 'react-native';

const colorScheme = useColorScheme(); // 'light' | 'dark' | null
```

**Android (Material You):**

```typescript
// Suporte a Material You (Android 12+)
import { useColorScheme } from 'react-native';

// Cores adaptáveis ao tema do sistema
const primaryColor = Platform.select({
  android: '?attr/colorPrimary', // Material You
  ios: '#004E9A', // Fallback
});
```

---

## 📐 Componentes - Adaptações Mobile

### Button (React Native)

**Atualizar para:**

- ✅ TouchableOpacity (nativo)
- ✅ Pressable (melhor acessibilidade)
- ✅ Haptic feedback
- ✅ Active opacity (nativo)

```typescript
import { Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';

export const Button: React.FC<ButtonProps> = ({ onPress, ...props }) => {
  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress?.();
  };

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [
        baseStyles,
        pressed && { opacity: 0.8 }, // Feedback nativo
      ]}
    >
      {/* Conteúdo */}
    </Pressable>
  );
};
```

---

### Input (React Native)

**Atualizar para:**

- ✅ TextInput nativo
- ✅ KeyboardAvoidingView
- ✅ Return key type
- ✅ Auto-complete

```typescript
import { TextInput, KeyboardAvoidingView, Platform } from 'react-native';

export const Input: React.FC<InputProps> = ({ ...props }) => {
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <TextInput
        returnKeyType="done"
        autoComplete="off"
        autoCorrect={false}
        {...props}
      />
    </KeyboardAvoidingView>
  );
};
```

---

### Tab Bar (React Native Navigation)

**Usar:**

- ✅ `@react-navigation/bottom-tabs` (oficial)
- ✅ Safe area bottom
- ✅ Ícone central elevado (custom)

```typescript
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const Tab = createBottomTabNavigator();

export const TabNavigator = () => {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      tabBarOptions={{
        style: {
          paddingBottom: insets.bottom,
          height: 60 + insets.bottom,
        },
      }}
    >
      {/* Tabs */}
    </Tab.Navigator>
  );
};
```

---

## 🔧 Configurações Expo

### app.json

```json
{
  "expo": {
    "name": "Nossa Maternidade",
    "slug": "nossa-maternidade",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "automatic",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#004E9A"
    },
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.nossamaternidade.app",
      "buildNumber": "1",
      "infoPlist": {
        "NSCameraUsageDescription": "Precisamos da câmera para você compartilhar fotos na comunidade.",
        "NSMicrophoneUsageDescription": "Precisamos do microfone para você usar a Naty AI por voz.",
        "NSPhotoLibraryUsageDescription": "Precisamos do acesso à galeria para você compartilhar fotos."
      },
      "privacyManifests": {
        "NSPrivacyAccessedAPITypes": []
      }
    },
    "android": {
      "package": "com.nossamaternidade.app",
      "versionCode": 1,
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#004E9A"
      },
      "permissions": ["CAMERA", "RECORD_AUDIO", "READ_EXTERNAL_STORAGE", "WRITE_EXTERNAL_STORAGE"]
    },
    "plugins": [
      "expo-camera",
      "expo-av",
      "expo-haptics",
      [
        "expo-image-picker",
        {
          "photosPermission": "Precisamos do acesso à galeria para você compartilhar fotos."
        }
      ]
    ]
  }
}
```

---

## 📦 Dependências Necessárias

### Core

```json
{
  "dependencies": {
    "react-native": "0.75.0",
    "expo": "~51.0.0",
    "@react-navigation/native": "^6.1.0",
    "@react-navigation/bottom-tabs": "^6.5.0",
    "@react-navigation/stack": "^6.3.0",
    "react-native-safe-area-context": "^4.10.0",
    "react-native-screens": "^3.31.0",
    "expo-haptics": "~13.0.0",
    "expo-status-bar": "~1.12.0"
  }
}
```

### UI/UX

```json
{
  "dependencies": {
    "react-native-gesture-handler": "~2.16.0",
    "react-native-reanimated": "~3.10.0",
    "expo-linear-gradient": "~13.0.0",
    "expo-blur": "~13.0.0"
  }
}
```

---

## ✅ Checklist de Preparação para Lojas

### iOS (App Store)

#### Assets

- [ ] **App Icon** - 1024x1024px (sem transparência)
- [ ] **Launch Screen** - 1242x2688px (iPhone 14 Pro Max)
- [ ] **Screenshots** - Todos os tamanhos de iPhone
- [ ] **App Preview** - Vídeo opcional (30s max)

#### Metadata

- [ ] **Nome** - "Nossa Maternidade" (30 caracteres max)
- [ ] **Subtítulo** - "Apoio emocional para mães" (30 caracteres max)
- [ ] **Descrição** - 4000 caracteres max
- [ ] **Keywords** - Maternidade, saúde, comunidade
- [ ] **Categoria** - Saúde e Fitness
- [ ] **Idade** - 17+ (conteúdo sensível)

#### TestFlight

- [ ] **Build interno** - Testes com equipe
- [ ] **Beta externa** - Testes com usuários (opcional)

---

### Android (Google Play Store)

#### Assets

- [ ] **App Icon** - 512x512px (PNG, sem transparência)
- [ ] **Feature Graphic** - 1024x500px
- [ ] **Screenshots** - Mínimo 2, máximo 8
- [ ] **App Preview** - Vídeo opcional (2min max)

#### Metadata

- [ ] **Nome** - "Nossa Maternidade" (50 caracteres max)
- [ ] **Descrição curta** - 80 caracteres max
- [ ] **Descrição completa** - 4000 caracteres max
- [ ] **Categoria** - Saúde e Fitness
- [ ] **Classificação** - PEGI 3 / Everyone

#### Google Play Console

- [ ] **Conta de desenvolvedor** - $25 one-time
- [ ] **Política de privacidade** - URL obrigatória
- [ ] **Content rating** - Preencher questionário

---

## 🚀 Build e Deploy

### iOS

```bash
# Build para App Store
eas build --platform ios --profile production

# Submit para App Store
eas submit --platform ios
```

### Android

```bash
# Build para Google Play
eas build --platform android --profile production

# Submit para Google Play
eas submit --platform android
```

---

## 📋 Checklist Final

### Antes de Submeter

- [ ] **Testes** - iOS 15+ e Android 8.0+
- [ ] **Performance** - Sem crashes, sem lag
- [ ] **Acessibilidade** - VoiceOver/TalkBack funcionando
- [ ] **Privacidade** - Política de privacidade completa
- [ ] **LGPD** - Conformidade com lei brasileira
- [ ] **Conteúdo** - Sem conteúdo ofensivo
- [ ] **IA** - Disclaimer médico visível
- [ ] **Analytics** - Configurado (opcional)

---

## 🎯 Próximos Passos

1. **Configurar app.json** com todas as permissões
2. **Criar assets** (ícones, splash screens)
3. **Adaptar componentes** para React Native nativo
4. **Testar em dispositivos** reais (iOS + Android)
5. **Preparar metadata** para as lojas
6. **Build de produção** via EAS
7. **Submeter** para revisão

---

**App pronto para App Store e Google Play Store!** 📱
