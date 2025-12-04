# Guia Completo do Design System - Nossa Maternidade

## Introdução

Este é o guia completo do sistema de design para iOS e Android do app Nossa Maternidade. Este documento consolida todas as informações necessárias para usar o design system de forma eficaz.

## Índice

1. [Instalação e Setup](#instalação-e-setup)
2. [Tokens e Fundamentos](#tokens-e-fundamentos)
3. [Componentes Primitivos](#componentes-primitivos)
4. [Layout e Navegação](#layout-e-navegação)
5. [Acessibilidade](#acessibilidade)
6. [Plataformas Específicas](#plataformas-específicas)
7. [Validação e Testes](#validação-e-testes)
8. [Deploy](#deploy)
9. [Troubleshooting](#troubleshooting)

## Instalação e Setup

### Pré-requisitos

- Node.js 20+
- Expo CLI
- EAS CLI (para builds)

### Instalação

```bash
npm install
```

### Configuração

O design system já está configurado. Apenas importe os componentes:

```typescript
import { Button, Text, Box } from '@/components/primitives';
import { SafeAreaContainer } from '@/components/layout';
import { useThemeColors } from '@/theme';
```

## Tokens e Fundamentos

### Cores

```typescript
import { useThemeColors } from '@/theme';

const colors = useThemeColors();

// Usar cores do tema
<View style={{ backgroundColor: colors.background.canvas }} />
```

### Tipografia

```typescript
import { getFontFamily, getScaledFontSize } from '@/theme/platform';

const fontFamily = getFontFamily('semibold');
const fontSize = getScaledFontSize(16);
```

### Spacing

```typescript
import { Tokens } from '@/theme/tokens';

<View style={{ padding: Tokens.spacing['4'] }} />
```

## Componentes Primitivos

Ver [COMPONENT_LIBRARY.md](./design/COMPONENT_LIBRARY.md) para documentação completa.

## Layout e Navegação

Ver [DESIGN_SYSTEM_IOS_ANDROID.md](./design/DESIGN_SYSTEM_IOS_ANDROID.md) para detalhes.

## Acessibilidade

### WCAG AAA Compliance

- Contraste mínimo: 7:1 (texto normal)
- Touch targets: 44pt (iOS) / 48dp (Android)
- Accessibility labels obrigatórios

### Dynamic Type / Text Scaling

```typescript
<Text allowFontScaling={true}>
  Texto que ajusta automaticamente
</Text>
```

## Plataformas Específicas

Ver [PLATFORM_GUIDELINES.md](./design/PLATFORM_GUIDELINES.md) para diretrizes detalhadas.

## Validação e Testes

### Scripts Disponíveis

```bash
npm run validate:design      # Valida design tokens
npm run validate:platform    # Valida iOS/Android
npm run validate:pre-deploy # Validação completa
```

## Deploy

Ver [DESIGN_SYSTEM_CHECKLIST.md](./deploy/DESIGN_SYSTEM_CHECKLIST.md) para checklist completo.

## Troubleshooting

### Problema: Cores não aparecem corretamente

**Solução:** Verifique se está usando `useThemeColors()` em vez de cores hardcoded.

### Problema: Safe areas não funcionam

**Solução:** Use `SafeAreaContainer` em vez de `SafeAreaView` diretamente.

### Problema: Haptic feedback não funciona

**Solução:** Verifique se `expo-haptics` está instalado e use `triggerPlatformHaptic()`.

## Recursos Adicionais

- [DESIGN_SYSTEM_IOS_ANDROID.md](./design/DESIGN_SYSTEM_IOS_ANDROID.md)
- [PLATFORM_GUIDELINES.md](./design/PLATFORM_GUIDELINES.md)
- [COMPONENT_LIBRARY.md](./design/COMPONENT_LIBRARY.md)
- [IOS_DEPLOY_GUIDE.md](./deploy/IOS_DEPLOY_GUIDE.md)
- [ANDROID_DEPLOY_GUIDE.md](./deploy/ANDROID_DEPLOY_GUIDE.md)
