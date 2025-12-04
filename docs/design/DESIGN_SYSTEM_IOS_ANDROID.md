# Design System iOS/Android - Nossa Maternidade

## Visão Geral

Este documento descreve o sistema de design unificado para iOS e Android do app Nossa Maternidade. O sistema foi criado para garantir consistência visual e funcional entre ambas as plataformas, respeitando as diretrizes nativas de cada uma.

## Arquitetura

### Estrutura de Arquivos

```
src/
├── theme/
│   ├── tokens.ts          # Tokens base (cores, tipografia, spacing, etc)
│   ├── platform.ts        # Helpers específicos iOS/Android
│   ├── adapters/
│   │   ├── ios.ts         # Adapter iOS (SF Pro, shadows, haptics)
│   │   └── android.ts     # Adapter Android (Roboto, elevation, ripple)
│   └── ThemeContext.tsx   # Context de tema (Light/Dark mode)
└── components/
    ├── primitives/        # Componentes base (Button, Text, Box)
    └── layout/            # Componentes de layout (SafeArea, KeyboardAvoiding)
```

## Tokens Base

### Cores

O sistema de cores é unificado e adapta-se automaticamente para Light/Dark mode:

```typescript
import { useThemeColors } from '@/theme';

const colors = useThemeColors();

// Backgrounds
colors.background.canvas; // Fundo principal
colors.background.card; // Cards e superfícies
colors.background.elevated; // Superfícies elevadas

// Text
colors.text.primary; // Texto principal
colors.text.secondary; // Texto secundário
colors.text.tertiary; // Texto terciário

// Primary/Secondary
colors.primary.main; // Rosa maternal (#FF7A96)
colors.secondary.main; // Roxo espiritual (#A78BFA)
```

### Tipografia

Fontes nativas por plataforma:

- **iOS**: SF Pro (System font)
- **Android**: Roboto

```typescript
import { getFontFamily, getScaledFontSize } from '@/theme/platform';

// Obter font family baseado no weight
const fontFamily = getFontFamily('semibold'); // 'System' (iOS) ou 'Roboto-Medium' (Android)

// Font size com Dynamic Type/Text Scaling
const fontSize = getScaledFontSize(16); // Ajusta automaticamente
```

### Shadows/Elevation

Adaptação automática por plataforma:

- **iOS**: `shadowColor`, `shadowOffset`, `shadowOpacity`, `shadowRadius`
- **Android**: `elevation` (Material Design)

```typescript
import { getPlatformShadow } from '@/theme/platform';

const shadowStyle = getPlatformShadow('md');
// iOS: { shadowColor, shadowOffset, shadowOpacity, shadowRadius }
// Android: { elevation: 2 }
```

## Componentes Primitivos

### Button

Botão com haptic feedback e ripple effect (Android):

```typescript
import { Button } from '@/components/primitives/Button';

<Button
  title="Salvar"
  variant="primary"
  size="md"
  onPress={handleSave}
  accessibilityLabel="Salvar alterações"
/>
```

**Características:**

- Haptic feedback automático (iOS: light, Android: medium)
- Ripple effect no Android
- Touch target mínimo: 44pt (iOS) / 48dp (Android)
- Suporte a Dynamic Type/Text Scaling

### Text

Texto com suporte a Dynamic Type (iOS) e Text Scaling (Android):

```typescript
import { Text } from '@/components/primitives/Text';

<Text
  variant="body"
  size="md"
  color="primary"
  allowFontScaling={true}
>
  Olá, mãe!
</Text>
```

**Características:**

- Fontes nativas por plataforma
- Dynamic Type/Text Scaling suportado
- Contraste WCAG AAA (7:1 text, 4.5:1 large)

### Box

Container flexível com shadows/elevation adaptativos:

```typescript
import { Box } from '@/components/primitives/Box';

<Box
  bg="card"
  p="4"
  rounded="lg"
  shadow="card"
>
  Conteúdo
</Box>
```

## Componentes de Layout

### SafeAreaContainer

Container com safe area automática:

```typescript
import { SafeAreaContainer } from '@/components/layout';

<SafeAreaContainer edges={['top', 'bottom']}>
  <Text>Conteúdo seguro</Text>
</SafeAreaContainer>
```

**Comportamento:**

- **iOS**: Usa `SafeAreaView` nativo
- **Android**: Aplica padding manualmente baseado em insets

### KeyboardAvoidingContainer

Container que ajusta quando teclado aparece:

```typescript
import { KeyboardAvoidingContainer } from '@/components/layout';

<KeyboardAvoidingContainer keyboardVerticalOffset={100}>
  <TextInput placeholder="Digite algo" />
</KeyboardAvoidingContainer>
```

**Comportamento:**

- **iOS**: `behavior="padding"` (recomendado)
- **Android**: `behavior="height"` (mais compatível)

### PlatformScrollView

ScrollView otimizado por plataforma:

```typescript
import { PlatformScrollView } from '@/components/layout';

<PlatformScrollView bounces={true}>
  <Text>Conteúdo scrollável</Text>
</PlatformScrollView>
```

**Comportamento:**

- **iOS**: Bounce effect habilitado por padrão
- **Android**: Overscroll mode configurado

## Plataformas Específicas

### iOS

**Fontes:**

- SF Pro (System font) - automático

**Safe Areas:**

- Notch: 44pt top
- Home indicator: 34pt bottom

**Haptic Feedback:**

- Light para botões padrão
- Medium para ações importantes

**Shadows:**

- `shadowColor`, `shadowOffset`, `shadowOpacity`, `shadowRadius`

### Android

**Fontes:**

- Roboto (automático)
- Roboto-Medium para medium/semibold
- Roboto-Bold para bold

**Safe Areas:**

- Status bar: 24dp top
- Sem home indicator

**Haptic Feedback:**

- Medium para botões padrão
- Heavy para ações importantes

**Elevation:**

- Material Design elevation (0-24)
- Ripple effect em Pressable

## Acessibilidade

### WCAG AAA Compliance

- **Contraste texto**: 7:1 mínimo (texto normal)
- **Contraste texto grande**: 4.5:1 mínimo (18pt+)
- **Touch targets**: 44pt (iOS) / 48dp (Android) mínimo

### Dynamic Type / Text Scaling

Todos os componentes de texto suportam:

- **iOS**: Dynamic Type
- **Android**: Text Scaling

```typescript
<Text allowFontScaling={true}>
  Texto que ajusta automaticamente
</Text>
```

### Screen Readers

Todos os componentes interativos têm:

- `accessibilityLabel`
- `accessibilityRole`
- `accessibilityHint` (quando necessário)

## Validação

### Scripts de Validação

```bash
# Validar design tokens
npm run validate:design

# Validar platform design (iOS/Android)
npm run validate:platform

# Validação completa pré-deploy
npm run validate:pre-deploy
```

## Próximos Passos

1. Ver [PLATFORM_GUIDELINES.md](./PLATFORM_GUIDELINES.md) para diretrizes detalhadas
2. Ver [COMPONENT_LIBRARY.md](./COMPONENT_LIBRARY.md) para documentação completa de componentes
3. Ver [DESIGN_SYSTEM_COMPLETE_GUIDE.md](./DESIGN_SYSTEM_COMPLETE_GUIDE.md) para guia completo
