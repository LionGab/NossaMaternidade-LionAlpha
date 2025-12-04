# Padrões de Componentes - Nossa Maternidade

**Versão:** 1.0.0  
**Última Atualização:** Janeiro 2025  
**Status:** ✅ Estabelecido e Definitivo

---

## 🎯 Objetivo

Este documento estabelece os padrões obrigatórios para criação e uso de componentes no Nossa Maternidade. Seguir estes padrões garante consistência, acessibilidade e manutenibilidade.

**IMPORTANTE:** Todos os componentes devem seguir estes padrões. Não há exceções.

---

## 🏗️ Estrutura Atomic Design

O Nossa Maternidade segue **Atomic Design** com 4 níveis:

### 1. Primitives (Átomos)

**Localização:** `src/components/primitives/`

Componentes básicos e indivisíveis:

- `Box` - Container de layout
- `Text` - Texto com variants
- `Heading` - Títulos hierárquicos
- `Button` - Botões interativos
- `HapticButton` - Botão com feedback háptico
- `Input` - Campos de entrada
- `SearchBarPill` - Barra de busca

**Características:**

- Não dependem de outros componentes
- Altamente reutilizáveis
- Props tipadas com TypeScript
- Suporte completo a dark mode
- Acessibilidade WCAG AAA

### 2. Molecules (Moléculas)

**Localização:** `src/components/molecules/` (se existir) ou `src/components/`

Componentes compostos por primitives:

- `Avatar` - Foto de perfil
- `Badge` - Etiquetas e tags
- `Card` - Cards básicos
- `EmotionalPrompt` - Seletor de emoção

**Características:**

- Compostos por 2+ primitives
- Lógica de estado simples
- Props tipadas

### 3. Organisms (Organismos)

**Localização:** `src/components/organisms/`

Componentes complexos compostos por molecules/primitives:

- `MaternalCard` - Cards com variantes (hero, insight, action, etc.)
- `ListingCard` - Cards de listagem
- `ImageGrid` - Grid de imagens
- `CategoryTabs` - Tabs de categorias

**Características:**

- Compostos por múltiplos primitives/molecules
- Lógica de estado complexa
- Podem ter sub-componentes

### 4. Templates (Templates)

**Localização:** `src/components/templates/`

Layouts de tela completos:

- `ScreenLayout` - Layout padrão de tela
- `SectionLayout` - Layout de seção

**Características:**

- Estrutura de layout
- Não contém dados específicos
- Reutilizável em múltiplas telas

---

## ✅ Padrões Obrigatórios

### 1. TypeScript Strict

**Obrigatório:**

- Zero `any` types
- Props tipadas com interfaces
- JSDoc para props públicas
- Type exports para reutilização

```typescript
// ✅ CORRETO
export interface ButtonProps {
  /** Texto do botão */
  title: string;
  /** Handler de clique */
  onPress?: () => void;
  /** Variante visual */
  variant?: 'primary' | 'secondary';
}

export const Button: React.FC<ButtonProps> = ({ title, onPress, variant = 'primary' }) => {
  // ...
};

// ❌ ERRADO
export const Button = ({ title, onPress, variant }: any) => {
  // ...
};
```

### 2. React.memo para Performance

**Obrigatório para:**

- Componentes pesados (com lógica complexa)
- Componentes renderizados frequentemente
- Componentes em listas (FlatList)

```typescript
// ✅ CORRETO
export const Button = React.memo<ButtonProps>(({ title, onPress }) => {
  // ...
});

// Ou com nome para debugging
export const Button = React.memo(function Button({ title, onPress }: ButtonProps) {
  // ...
});
```

### 3. Acessibilidade WCAG AAA

**Obrigatório em todos os componentes interativos:**

```typescript
// ✅ CORRETO
<TouchableOpacity
  onPress={handlePress}
  accessibilityLabel="Botão de ação principal"
  accessibilityHint="Toque duas vezes para executar ação"
  accessibilityRole="button"
  accessibilityState={{ disabled: isDisabled }}
>
  <Text>Botão</Text>
</TouchableOpacity>
```

**Props obrigatórias:**

- `accessibilityLabel` - Descrição do elemento
- `accessibilityRole` - Tipo do elemento (button, text, image, etc.)
- `accessibilityHint` - Quando necessário (ações complexas)
- `accessibilityState` - Estados (disabled, selected, etc.)

### 4. Dark Mode Suporte

**Obrigatório:** Todos os componentes devem suportar dark mode:

```typescript
// ✅ CORRETO
import { useThemeColors } from '@/theme';

function MyComponent() {
  const colors = useThemeColors();

  return (
    <View style={{ backgroundColor: colors.background.card }}>
      <Text style={{ color: colors.text.primary }}>
        Texto
      </Text>
    </View>
  );
}

// ❌ ERRADO
<View style={{ backgroundColor: '#FFFFFF' }}>
  <Text style={{ color: '#000000' }}>
    Texto
  </Text>
</View>
```

### 5. Touch Targets Mínimos

**Obrigatório:**

- Mínimo: **44pt (iOS) / 48dp (Android)**
- Recomendado: **48pt+** para ações principais

```typescript
// ✅ CORRETO
<TouchableOpacity
  style={{
    minHeight: 44,  // iOS mínimo
    minWidth: 44,
    padding: Tokens.spacing['3'],  // 12px
  }}
>
  <Text>Botão</Text>
</TouchableOpacity>
```

### 6. Design Tokens

**Obrigatório:** Sempre usar tokens do design system:

```typescript
// ✅ CORRETO
import { Tokens, TextStyles, Spacing, Radius } from '@/theme/tokens';
import { useThemeColors } from '@/theme';

const colors = useThemeColors();

style={{
  padding: Spacing['4'],           // 16px
  borderRadius: Radius.lg,          // 12px
  backgroundColor: colors.background.card,
}}

// ❌ ERRADO
style={{
  padding: 16,
  borderRadius: 12,
  backgroundColor: '#FFFFFF',
}}
```

---

## 📝 Exemplos de Código

### Criando um Button

```typescript
import React from 'react';
import { Pressable, ActivityIndicator, ViewStyle } from 'react-native';
import { Tokens, TextStyles } from '@/theme/tokens';
import { useThemeColors } from '@/theme';
import { Text } from '@/components/primitives/Text';
import { triggerPlatformHaptic } from '@/theme/platform';

export interface ButtonProps {
  title: string;
  onPress?: () => void;
  variant?: 'primary' | 'secondary';
  loading?: boolean;
  disabled?: boolean;
  accessibilityLabel?: string;
}

export const Button = React.memo<ButtonProps>(function Button({
  title,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  accessibilityLabel,
}) {
  const colors = useThemeColors();

  const handlePress = () => {
    if (disabled || loading) return;
    triggerPlatformHaptic('light');
    onPress?.();
  };

  const backgroundColor = variant === 'primary'
    ? colors.primary.main
    : colors.secondary.main;

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled || loading}
      style={{
        backgroundColor,
        padding: Tokens.spacing['4'],
        borderRadius: Radius.lg,
        minHeight: Tokens.touchTargets.min,  // 44pt
        justifyContent: 'center',
        alignItems: 'center',
        opacity: disabled ? 0.5 : 1,
      }}
      accessibilityLabel={accessibilityLabel || title}
      accessibilityRole="button"
      accessibilityState={{ disabled: disabled || loading }}
    >
      {loading ? (
        <ActivityIndicator color={colors.text.inverse} />
      ) : (
        <Text
          style={TextStyles.button}
          color="inverse"
        >
          {title}
        </Text>
      )}
    </Pressable>
  );
});
```

### Criando um Card

```typescript
import React from 'react';
import { View, ViewStyle } from 'react-native';
import { Tokens, Shadows, Radius, Spacing } from '@/theme/tokens';
import { useThemeColors } from '@/theme';
import { Box } from '@/components/primitives/Box';
import { Text } from '@/components/primitives/Text';

export interface CardProps {
  title: string;
  children: React.ReactNode;
  onPress?: () => void;
}

export const Card = React.memo<CardProps>(function Card({
  title,
  children,
  onPress,
}) {
  const colors = useThemeColors();

  return (
    <Box
      bg="card"
      p="4"
      rounded="2xl"
      shadow="card"
      onPress={onPress}
      accessibilityRole={onPress ? "button" : undefined}
      accessibilityLabel={onPress ? `Card: ${title}` : undefined}
    >
      <Text style={Tokens.textStyles.titleMedium} color="primary">
        {title}
      </Text>
      <Box mt="2">
        {children}
      </Box>
    </Box>
  );
});
```

### Criando uma Screen

```typescript
import React from 'react';
import { SafeAreaView, ScrollView } from 'react-native';
import { ScreenLayout } from '@/components/templates/ScreenLayout';
import { Box } from '@/components/primitives/Box';
import { Text } from '@/components/primitives/Text';
import { TextStyles } from '@/theme/tokens';

export const HomeScreen: React.FC = () => {
  return (
    <ScreenLayout>
      <ScrollView>
        <Box p="4">
          <Text style={TextStyles.displayMedium}>
            Bem-vinda!
          </Text>
          <Box mt="4">
            {/* Conteúdo */}
          </Box>
        </Box>
      </ScrollView>
    </ScreenLayout>
  );
};
```

---

## 🎨 Estados de Componentes

### Loading State

```typescript
{loading ? (
  <ActivityIndicator
    color={colors.primary.main}
    size="large"
    accessibilityLabel="Carregando"
    accessibilityRole="progressbar"
  />
) : (
  <Content />
)}
```

### Error State

```typescript
{error ? (
  <Box p="4" bg="card" rounded="lg">
    <Text color="error" style={TextStyles.bodyMedium}>
      {error.message}
    </Text>
  </Box>
) : (
  <Content />
)}
```

### Empty State

```typescript
{items.length === 0 ? (
  <Box p="6" align="center">
    <Text color="tertiary" style={TextStyles.bodyMedium}>
      Nenhum item encontrado
    </Text>
  </Box>
) : (
  <ItemList items={items} />
)}
```

### Disabled State

```typescript
<Pressable
  disabled={isDisabled}
  style={{
    opacity: isDisabled ? 0.5 : 1,
  }}
  accessibilityState={{ disabled: isDisabled }}
>
  <Text>Botão</Text>
</Pressable>
```

---

## ✅ Checklist de Componente

Antes de considerar um componente "pronto":

- [ ] ✅ TypeScript strict (zero `any`)
- [ ] ✅ Props tipadas com interface
- [ ] ✅ JSDoc em props públicas
- [ ] ✅ `React.memo` se necessário
- [ ] ✅ `accessibilityLabel` em elementos interativos
- [ ] ✅ `accessibilityRole` apropriado
- [ ] ✅ Suporte a dark mode via `useThemeColors()`
- [ ] ✅ Touch targets >= 44pt
- [ ] ✅ Design tokens (não hardcoded)
- [ ] ✅ Estados (loading, error, empty, disabled)
- [ ] ✅ Testado em iOS e Android
- [ ] ✅ Performance otimizada

---

## 📖 Referências

- **Primitives:** `src/components/primitives/`
- **Organisms:** `src/components/organisms/`
- **Templates:** `src/components/templates/`
- **Sistema de Design:** `docs/design/DESIGN_SYSTEM_REFERENCE.md`
- **Princípios:** `docs/design/DESIGN_PRINCIPLES.md`

---

**Este documento estabelece os padrões obrigatórios para todos os componentes. Quando criar um novo componente, siga estes padrões.**
