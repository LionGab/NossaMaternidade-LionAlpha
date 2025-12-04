# Platform Guidelines - iOS e Android

## Diretrizes por Plataforma

Este documento descreve as diretrizes específicas para iOS e Android no app Nossa Maternidade.

## iOS Guidelines

### Fontes

**Sempre use:**

- `PlatformFonts` ou `getFontFamily()` para obter fontes nativas
- `getScaledFontSize()` para suportar Dynamic Type

**Nunca use:**

- Fontes hardcoded (ex: `fontFamily: 'Arial'`)
- Tamanhos de fonte fixos sem scaling

### Safe Areas

**Sempre use:**

- `SafeAreaContainer` ou `SafeAreaView` em telas
- Respeitar notch (44pt top) e home indicator (34pt bottom)

**Exemplo:**

```typescript
<SafeAreaContainer edges={['top', 'bottom']}>
  <YourContent />
</SafeAreaContainer>
```

### Haptic Feedback

**Padrões:**

- Botões: `triggerPlatformHaptic('buttonPress')` - Light
- Seleções: `triggerPlatformHaptic('selection')`
- Ações importantes: `triggerPlatformHaptic('important')` - Medium

### Shadows

**Sempre use:**

- `getPlatformShadow()` ou `getIOSShadow()` para shadows iOS

**Nunca use:**

- `shadowColor`, `shadowOffset` diretamente (use helpers)

## Android Guidelines

### Fontes

**Sempre use:**

- `PlatformFonts` ou `getFontFamily()` para Roboto
- `getScaledFontSize()` para suportar Text Scaling

### Safe Areas

**Sempre use:**

- `SafeAreaContainer` que aplica padding baseado em insets
- Respeitar status bar (24dp top)

### Material Design

**Elevation:**

- Use `getPlatformShadow()` ou `getAndroidElevation()`
- Valores: 0-24 (Material Design 3)

**Ripple Effect:**

- Configure `android_ripple` em `Pressable`:

```typescript
<Pressable
  android_ripple={{
    color: colors.text.primary,
    borderless: false,
  }}
>
  <Text>Botão</Text>
</Pressable>
```

### Haptic Feedback

**Padrões:**

- Botões: `triggerPlatformHaptic('buttonPress')` - Medium
- Ações importantes: `triggerPlatformHaptic('important')` - Heavy

## Cross-Platform

### Touch Targets

**Mínimo:**

- iOS: 44pt
- Android: 48dp

**Validação:**

```typescript
import { getMinTouchTarget, hasValidTouchTarget } from '@/theme/platform';

const minSize = getMinTouchTarget(); // 44 (iOS) ou 48 (Android)
const isValid = hasValidTouchTarget(width, height);
```

### Acessibilidade

**Sempre inclua:**

- `accessibilityLabel` em componentes interativos
- `accessibilityRole` apropriado
- `accessibilityHint` quando necessário

**Dynamic Type / Text Scaling:**

- Sempre use `allowFontScaling={true}` em textos (exceto quando especificamente desabilitado)

### Performance

**Otimizações:**

- Use `React.memo` em componentes que não mudam frequentemente
- Use `useMemo` para estilos calculados
- Use `useCallback` para handlers

## Checklist Pré-Deploy

Antes de fazer deploy, verifique:

- [ ] Todos os componentes usam tokens do design system
- [ ] Safe areas respeitadas em todas as telas
- [ ] Haptic feedback implementado em interações
- [ ] Touch targets >= 44pt (iOS) / 48dp (Android)
- [ ] Dynamic Type/Text Scaling suportado
- [ ] Acessibilidade completa (labels, roles, hints)
- [ ] Validação passando (`npm run validate:pre-deploy`)
