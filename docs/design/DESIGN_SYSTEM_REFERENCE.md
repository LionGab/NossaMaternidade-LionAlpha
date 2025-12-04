# Sistema de Design - Guia Definitivo

**Versão:** 1.0.0  
**Última Atualização:** Janeiro 2025  
**Status:** ✅ Fonte Única da Verdade

---

## 🎯 Objetivo

Este documento é o **guia definitivo** do sistema de design do Nossa Maternidade. Ele elimina ambiguidades sobre qual sistema usar, como importar e quando usar cada token.

**IMPORTANTE:** Este documento estabelece decisões definitivas. Não há mais "adivinhar" - tudo está documentado aqui.

---

## 📦 Hierarquia de Sistemas

### ✅ Sistema MODERNO (Usar Sempre)

**Localização:** `src/theme/tokens.ts`

Este é o **único sistema** que deve ser usado em código novo. Ele contém:

- Tokens de cores (ColorTokens)
- Temas light/dark (LightTheme, DarkTheme)
- Tipografia (Typography, TextStyles)
- Espaçamento (Spacing)
- Bordas (Radius)
- Sombras (Shadows)
- Animações (Animations)
- E muito mais...

**Status:** ✅ Ativo e mantido

### ❌ Sistema LEGADO (Não Usar)

**Localização:** `src/design-system/`

Este sistema está **deprecated** e será removido no futuro.

**Status:** ⚠️ Deprecated - apenas para compatibilidade durante migração

**Ação:** Migrar código existente para o sistema moderno

---

## 📥 Padrões de Importação

### ✅ CORRETO - Sistema Moderno

```typescript
// Tokens completos
import { Tokens, ColorTokens } from '@/theme/tokens';

// Hooks de tema
import { useThemeColors, useTheme } from '@/theme';

// Tokens específicos
import { Spacing, Radius, Shadows, Typography, TextStyles } from '@/theme/tokens';
```

### ❌ ERRADO - Sistema Legado

```typescript
// ❌ NUNCA fazer isso
import { COLORS } from '@/design-system/colors';
import { SPACING } from '@/design-system/spacing';
import { TYPOGRAPHY } from '@/design-system/typography';
```

---

## 🎨 Uso de Cores

### Hook Obrigatório: `useThemeColors()`

**SEMPRE** use o hook `useThemeColors()` para cores theme-aware:

```typescript
import { useThemeColors } from '@/theme';

function MyComponent() {
  const colors = useThemeColors();

  return (
    <View style={{ backgroundColor: colors.background.card }}>
      <Text style={{ color: colors.text.primary }}>
        Texto principal
      </Text>
    </View>
  );
}
```

### Cores Semânticas

Use cores semânticas do tema:

```typescript
const colors = useThemeColors();

// Backgrounds
colors.background.canvas; // Fundo principal
colors.background.card; // Cards e superfícies
colors.background.elevated; // Superfícies elevadas

// Texto
colors.text.primary; // Texto principal
colors.text.secondary; // Texto secundário
colors.text.tertiary; // Texto terciário

// Status
colors.status.success; // Verde mint
colors.status.error; // Vermelho
colors.status.warning; // Laranja
colors.status.info; // Azul informativo

// Primárias
colors.primary.main; // Azul iOS System (#007AFF)
colors.secondary.main; // Roxo espiritual (#A78BFA)
```

### Cores Raw (Avançado)

Para cores específicas da paleta:

```typescript
import { ColorTokens } from '@/theme/tokens';

// Escalas completas
ColorTokens.primary[500]; // #007AFF (azul principal)
ColorTokens.secondary[400]; // #A78BFA (roxo principal)
ColorTokens.success[500]; // #10B981 (verde)
ColorTokens.error[500]; // #EF4444 (vermelho)

// Overlays
ColorTokens.overlay.light; // rgba(255, 255, 255, 0.25)
ColorTokens.overlay.medium; // rgba(0, 0, 0, 0.4)
ColorTokens.overlay.dark; // rgba(0, 0, 0, 0.6)
ColorTokens.overlay.backdrop; // rgba(0, 0, 0, 0.5)
```

### ❌ NUNCA Fazer

```typescript
// ❌ Cores hardcoded
backgroundColor: '#FFFFFF';
color: '#000000';
borderColor: 'rgba(0, 0, 0, 0.1)';

// ❌ Usar sistema legado
import { COLORS } from '@/design-system/colors';
backgroundColor: COLORS.background.light;
```

---

## 📏 Uso de Espaçamento

### Tokens de Espaçamento

**SEMPRE** use tokens de espaçamento:

```typescript
import { Tokens } from '@/theme/tokens';

// Espaçamento padrão
padding: Tokens.spacing['4']; // 16px
padding: Tokens.spacing['2']; // 8px
padding: Tokens.spacing['6']; // 24px

// Ou usando alias
import { Spacing } from '@/theme/tokens';
padding: Spacing['4']; // 16px
```

### Grid Base: 4px

Todos os espaçamentos são múltiplos de 4px:

| Token          | Valor | Uso Comum                |
| -------------- | ----- | ------------------------ |
| `Spacing['0']` | 0px   | Sem espaçamento          |
| `Spacing['1']` | 4px   | Espaçamento mínimo       |
| `Spacing['2']` | 8px   | Gap padrão               |
| `Spacing['4']` | 16px  | Padding padrão           |
| `Spacing['6']` | 24px  | Espaçamento entre seções |
| `Spacing['8']` | 32px  | Espaçamento grande       |

### ❌ NUNCA Fazer

```typescript
// ❌ Valores hardcoded
padding: 16;
margin: 8;
gap: 12; // Não é múltiplo de 4!

// ❌ Valores arbitrários
padding: 15; // Não segue grid
margin: 7; // Não segue grid
```

---

## ✍️ Uso de Tipografia

### TextStyles Semânticos

**SEMPRE** use `TextStyles.*` para tipografia:

```typescript
import { TextStyles } from '@/theme/tokens';

// Displays (títulos grandes)
<Text style={TextStyles.displayLarge}>Título Hero</Text>
<Text style={TextStyles.displayMedium}>Título Grande</Text>
<Text style={TextStyles.displaySmall}>Título Médio</Text>

// Titles (títulos de seção)
<Text style={TextStyles.titleLarge}>Seção</Text>
<Text style={TextStyles.titleMedium}>Subseção</Text>
<Text style={TextStyles.titleSmall}>Card Title</Text>

// Body (texto corrido)
<Text style={TextStyles.bodyLarge}>Parágrafo principal</Text>
<Text style={TextStyles.bodyMedium}>Parágrafo secundário</Text>
<Text style={TextStyles.bodySmall}>Texto pequeno</Text>

// Labels (botões, chips)
<Text style={TextStyles.labelLarge}>Botão</Text>
<Text style={TextStyles.labelMedium}>Chip</Text>
<Text style={TextStyles.labelSmall}>Badge</Text>
```

### Tokens de Tipografia (Avançado)

Para controle fino:

```typescript
import { Typography } from '@/theme/tokens';

// Tamanhos
fontSize: Typography.sizes.md; // 16px
fontSize: Typography.sizes.lg; // 18px
fontSize: Typography.sizes.xl; // 20px

// Pesos
fontWeight: Typography.weights.regular; // '400'
fontWeight: Typography.weights.medium; // '500'
fontWeight: Typography.weights.semibold; // '600'
fontWeight: Typography.weights.bold; // '700'

// Line heights
lineHeight: Typography.lineHeights.md; // 24px
lineHeight: Typography.lineHeights.lg; // 26px
```

### ❌ NUNCA Fazer

```typescript
// ❌ Valores hardcoded
fontSize: 16
fontSize: 18
fontWeight: '600'
lineHeight: 24

// ❌ Combinar valores arbitrários
style={{
  fontSize: 17,        // Não está no sistema
  fontWeight: '550',  // Não existe
  lineHeight: 23      // Não está no sistema
}}
```

---

## 🔲 Uso de Bordas

### Radius Tokens

**SEMPRE** use tokens de radius:

```typescript
import { Radius } from '@/theme/tokens';

// Bordas padrão
borderRadius: Radius.sm; // 4px
borderRadius: Radius.md; // 8px
borderRadius: Radius.lg; // 12px (padrão)
borderRadius: Radius.xl; // 16px
borderRadius: Radius['2xl']; // 20px (cards)
borderRadius: Radius.full; // 9999 (pill)

// Aliases
borderRadius: Radius.card; // 20px (mesmo que 2xl)
borderRadius: Radius.input; // 12px (mesmo que lg)
borderRadius: Radius.pill; // 9999 (mesmo que full)
```

### ❌ NUNCA Fazer

```typescript
// ❌ Valores hardcoded
borderRadius: 8;
borderRadius: 12;
borderRadius: 9999;

// ❌ Valores arbitrários
borderRadius: 10; // Não está no sistema
borderRadius: 15; // Não está no sistema
```

---

## 🌑 Uso de Sombras

### Shadow Tokens

**SEMPRE** use tokens de shadow:

```typescript
import { Shadows } from '@/theme/tokens';

// Sombras padrão
style={Shadows.sm}        // Sombra pequena
style={Shadows.md}        // Sombra média
style={Shadows.lg}        // Sombra grande
style={Shadows.xl}        // Sombra extra grande

// Sombras específicas
style={Shadows.card}      // Sombra de card
style={Shadows.cardHover} // Sombra de card hover
style={Shadows.soft}      // Sombra suave
style={Shadows.premium}   // Sombra premium (azul)
```

### Shadow Helper (Plataforma)

Para compatibilidade iOS/Android:

```typescript
import { getPlatformShadow } from '@/theme/platform';

const shadowStyle = getPlatformShadow(Shadows.card);
```

### ❌ NUNCA Fazer

```typescript
// ❌ Sombras hardcoded
shadowColor: '#000'
shadowOffset: { width: 0, height: 2 }
shadowOpacity: 0.1
shadowRadius: 4
elevation: 2

// ❌ Valores arbitrários
shadowOpacity: 0.15  // Use tokens
```

---

## 🎬 Uso de Animações

### Animation Tokens

```typescript
import { Animations } from '@/theme/tokens';

// Durações
duration: Animations.duration.fast; // 150ms
duration: Animations.duration.normal; // 300ms
duration: Animations.duration.slow; // 500ms

// Easing
easing: Animations.easing.easeOut; // [0, 0, 0.58, 1]
easing: Animations.easing.spring; // [0.25, 0.46, 0.45, 0.94]
```

---

## 📱 Componente Box (Helper)

O componente `Box` facilita o uso de tokens:

```typescript
import { Box } from '@/components/primitives/Box';

// Usando props semânticas
<Box
  bg="card"              // backgroundColor: colors.background.card
  p="4"                  // padding: Spacing['4'] (16px)
  rounded="lg"           // borderRadius: Radius.lg (12px)
  shadow="card"          // shadow: Shadows.card
>
  Conteúdo
</Box>
```

---

## ✅ Checklist de Uso Correto

Antes de commitar, verifique:

- [ ] ✅ Usa `useThemeColors()` para cores
- [ ] ✅ Usa `Tokens.spacing.*` para espaçamento
- [ ] ✅ Usa `TextStyles.*` para tipografia
- [ ] ✅ Usa `Radius.*` para bordas
- [ ] ✅ Usa `Shadows.*` para sombras
- [ ] ❌ Nenhuma cor hardcoded (#xxx, rgba)
- [ ] ❌ Nenhum valor de espaçamento hardcoded
- [ ] ❌ Nenhum tamanho de fonte hardcoded
- [ ] ❌ Nenhum import do sistema legado

---

## 📖 Referências

- **Tokens Completos:** `src/theme/tokens.ts`
- **Theme Context:** `src/theme/ThemeContext.tsx`
- **Princípios:** `docs/design/DESIGN_PRINCIPLES.md`
- **Padrões de Componentes:** `docs/design/COMPONENT_PATTERNS.md`
- **Decisões Estabelecidas:** `docs/design/DESIGN_DECISIONS.md`

---

**Este documento é a fonte única da verdade para o sistema de design. Quando houver dúvida sobre qual token usar, consulte este documento.**
