# Referência Rápida de Design - Nossa Maternidade

**Versão:** 1.0.0  
**Última Atualização:** Janeiro 2025  
**Status:** ✅ Cheat Sheet Definitivo

---

## 🎯 Objetivo

Este documento é um **cheat sheet rápido** para desenvolvimento. Use como referência rápida durante o desenvolvimento.

**IMPORTANTE:** Para detalhes completos, consulte os outros documentos de design.

---

## 📥 Imports Essenciais

```typescript
// Tokens e tema
import { Tokens, ColorTokens, TextStyles, Spacing, Radius, Shadows } from '@/theme/tokens';
import { useThemeColors, useTheme } from '@/theme';

// Componentes primitivos
import { Box, Text, Heading, Button } from '@/components/primitives';

// Helpers
import { getPlatformShadow } from '@/theme/platform';
import { triggerPlatformHaptic } from '@/theme/platform';
```

---

## 🎨 Cores - Copy & Paste

### Hook de Cores

```typescript
const colors = useThemeColors();

// Backgrounds
backgroundColor: colors.background.canvas;
backgroundColor: colors.background.card;
backgroundColor: colors.background.elevated;

// Texto
color: colors.text.primary;
color: colors.text.secondary;
color: colors.text.tertiary;

// Status
color: colors.status.success;
color: colors.status.error;
color: colors.status.warning;

// Primárias
backgroundColor: colors.primary.main;
backgroundColor: colors.secondary.main;
```

### Cores Raw (Avançado)

```typescript
import { ColorTokens } from '@/theme/tokens';

// Escalas
ColorTokens.primary[500]; // #007AFF
ColorTokens.secondary[400]; // #A78BFA
ColorTokens.success[500]; // #10B981
ColorTokens.error[500]; // #EF4444

// Overlays
ColorTokens.overlay.light;
ColorTokens.overlay.medium;
ColorTokens.overlay.dark;
ColorTokens.overlay.backdrop;
```

---

## 📏 Espaçamento - Copy & Paste

```typescript
import { Spacing } from '@/theme/tokens';

// Padding/Margin
padding: Spacing['0']; // 0px
padding: Spacing['1']; // 4px
padding: Spacing['2']; // 8px (gap padrão)
padding: Spacing['4']; // 16px (padding padrão) ✅
padding: Spacing['6']; // 24px
padding: Spacing['8']; // 32px

// Ou usando Tokens
padding: Tokens.spacing['4'];
```

---

## ✍️ Tipografia - Copy & Paste

```typescript
import { TextStyles } from '@/theme/tokens';

// Displays
<Text style={TextStyles.displayLarge}>Hero</Text>
<Text style={TextStyles.displayMedium}>Título Grande</Text>
<Text style={TextStyles.displaySmall}>Título Médio</Text>

// Titles
<Text style={TextStyles.titleLarge}>Seção</Text>
<Text style={TextStyles.titleMedium}>Subseção</Text>
<Text style={TextStyles.titleSmall}>Card Title</Text>

// Body
<Text style={TextStyles.bodyLarge}>Parágrafo</Text>
<Text style={TextStyles.bodyMedium}>Texto</Text>
<Text style={TextStyles.bodySmall}>Pequeno</Text>

// Labels
<Text style={TextStyles.labelLarge}>Botão</Text>
<Text style={TextStyles.labelMedium}>Chip</Text>
```

---

## 🔲 Bordas - Copy & Paste

```typescript
import { Radius } from '@/theme/tokens';

// Radius
borderRadius: Radius.sm; // 4px
borderRadius: Radius.md; // 8px
borderRadius: Radius.lg; // 12px (padrão) ✅
borderRadius: Radius.xl; // 16px
borderRadius: Radius['2xl']; // 20px (cards) ✅
borderRadius: Radius.full; // 9999 (pills)

// Aliases
borderRadius: Radius.card; // 20px
borderRadius: Radius.input; // 12px
borderRadius: Radius.pill; // 9999
```

---

## 🌑 Sombras - Copy & Paste

```typescript
import { Shadows } from '@/theme/tokens';

// Aplicar shadow
style={Shadows.sm}
style={Shadows.md}
style={Shadows.lg}
style={Shadows.card}      // Cards ✅
style={Shadows.cardHover} // Cards hover
style={Shadows.soft}      // Suave

// Com helper de plataforma
import { getPlatformShadow } from '@/theme/platform';
style={getPlatformShadow(Shadows.card)}
```

---

## 🎬 Animações - Copy & Paste

```typescript
import { Animations } from '@/theme/tokens';

// Durações
duration: Animations.duration.fast; // 150ms
duration: Animations.duration.normal; // 300ms ✅
duration: Animations.duration.slow; // 500ms

// Easing
easing: Animations.easing.easeOut; // Padrão ✅
easing: Animations.easing.spring; // Físico
```

---

## 📱 Touch Targets - Copy & Paste

```typescript
import { TouchTargets } from '@/theme/tokens';

// Mínimo
minHeight: TouchTargets.min; // 44pt
minWidth: TouchTargets.min; // 44pt

// Ou hardcoded (aceitável para touch targets)
minHeight: 44;
minWidth: 44;
```

---

## 🎯 Acessibilidade - Copy & Paste

```typescript
// Elemento interativo básico
<TouchableOpacity
  onPress={handlePress}
  accessibilityLabel="Descrição do elemento"
  accessibilityRole="button"
  accessibilityState={{ disabled: isDisabled }}
>
  <Text>Botão</Text>
</TouchableOpacity>

// Com hint (quando necessário)
<TouchableOpacity
  accessibilityLabel="Botão de ação"
  accessibilityHint="Toque duas vezes para executar"
  accessibilityRole="button"
>
  <Text>Ação</Text>
</TouchableOpacity>
```

---

## 🎨 Componente Box - Copy & Paste

```typescript
import { Box } from '@/components/primitives/Box';

// Box básico
<Box bg="card" p="4" rounded="lg" shadow="card">
  Conteúdo
</Box>

// Box com flex
<Box direction="row" align="center" justify="space-between" gap="2">
  <Text>Item 1</Text>
  <Text>Item 2</Text>
</Box>
```

---

## 🎨 Componente Text - Copy & Paste

```typescript
import { Text } from '@/components/primitives/Text';

// Text básico
<Text variant="body" color="primary">
  Texto
</Text>

// Text com estilo semântico
<Text style={TextStyles.titleMedium} color="primary">
  Título
</Text>
```

---

## 🎨 Componente Button - Copy & Paste

```typescript
import { Button } from '@/components/primitives/Button';

// Button básico
<Button
  title="Ação"
  onPress={handlePress}
  variant="primary"
  accessibilityLabel="Executar ação"
/>

// Button com loading
<Button
  title="Salvar"
  onPress={handleSave}
  loading={isSaving}
  disabled={isSaving}
/>
```

---

## ✅ Checklist Rápido

Antes de commitar, verifique:

- [ ] ✅ `useThemeColors()` para cores
- [ ] ✅ `Tokens.spacing.*` para espaçamento
- [ ] ✅ `TextStyles.*` para tipografia
- [ ] ✅ `Radius.*` para bordas
- [ ] ✅ `Shadows.*` para sombras
- [ ] ✅ Touch targets >= 44pt
- [ ] ✅ `accessibilityLabel` em interativos
- [ ] ✅ Dark mode testado
- [ ] ❌ Nenhum valor hardcoded

---

## 🚫 O Que NUNCA Fazer

```typescript
// ❌ Cores hardcoded
backgroundColor: '#FFFFFF';
color: '#000000';

// ❌ Espaçamento hardcoded
padding: 16;
margin: 8;

// ❌ Tipografia hardcoded
fontSize: 16;
fontWeight: '600';

// ❌ Bordas hardcoded
borderRadius: 12;
borderColor: '#E5E5E5';

// ❌ Sistema legado
import { COLORS } from '@/design-system/colors';
```

---

## 📖 Documentos Completos

Para detalhes completos, consulte:

1. **Princípios:** `docs/design/DESIGN_PRINCIPLES.md`
2. **Sistema:** `docs/design/DESIGN_SYSTEM_REFERENCE.md`
3. **Componentes:** `docs/design/COMPONENT_PATTERNS.md`
4. **Decisões:** `docs/design/DESIGN_DECISIONS.md`

---

## 🔍 Comandos de Validação

```bash
# Validar design tokens
npm run validate:design

# Type check
npm run type-check

# Lint
npm run lint
```

---

**Use este documento como referência rápida durante o desenvolvimento. Para detalhes completos, consulte os outros documentos de design.**
