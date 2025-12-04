# Component Library - Nossa Maternidade

## Componentes Primitivos

### Button

Botão com variantes e suporte iOS/Android nativo.

**Props:**

```typescript
interface ButtonProps {
  title: string;
  onPress?: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  accessibilityLabel?: string;
  accessibilityHint?: string;
}
```

**Exemplo:**

```typescript
<Button
  title="Salvar"
  variant="primary"
  size="md"
  onPress={handleSave}
/>
```

**Características:**

- Haptic feedback automático
- Ripple effect (Android)
- Touch target mínimo garantido
- Suporte a loading state

### Text

Texto com suporte a Dynamic Type/Text Scaling.

**Props:**

```typescript
interface TextProps {
  variant?: 'body' | 'caption' | 'label' | 'overline' | 'small';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  color?: 'primary' | 'secondary' | 'tertiary' | 'disabled' | 'inverse' | 'link';
  align?: 'left' | 'center' | 'right' | 'justify';
  weight?: 'light' | 'regular' | 'medium' | 'semibold' | 'bold';
  allowFontScaling?: boolean;
}
```

**Exemplo:**

```typescript
<Text variant="body" size="md" color="primary">
  Olá, mãe!
</Text>
```

### Box

Container flexível com props de estilo.

**Props:**

```typescript
interface BoxProps {
  bg?: 'canvas' | 'card' | 'elevated' | 'transparent';
  p?: keyof typeof Spacing;
  px?: keyof typeof Spacing;
  py?: keyof typeof Spacing;
  rounded?: keyof typeof Radius;
  shadow?: keyof typeof Shadows;
  // ... mais props de flex, margin, etc
}
```

**Exemplo:**

```typescript
<Box bg="card" p="4" rounded="lg" shadow="card">
  Conteúdo
</Box>
```

## Componentes de Layout

### SafeAreaContainer

Container com safe area automática.

**Props:**

```typescript
interface SafeAreaContainerProps {
  children: React.ReactNode;
  edges?: ('top' | 'bottom' | 'left' | 'right')[];
  backgroundColor?: string;
}
```

**Exemplo:**

```typescript
<SafeAreaContainer edges={['top', 'bottom']}>
  <YourContent />
</SafeAreaContainer>
```

### KeyboardAvoidingContainer

Container que ajusta quando teclado aparece.

**Props:**

```typescript
interface KeyboardAvoidingContainerProps {
  children: React.ReactNode;
  behavior?: 'padding' | 'height' | 'position';
  keyboardVerticalOffset?: number;
}
```

**Exemplo:**

```typescript
<KeyboardAvoidingContainer keyboardVerticalOffset={100}>
  <TextInput placeholder="Digite algo" />
</KeyboardAvoidingContainer>
```

### PlatformScrollView

ScrollView otimizado por plataforma.

**Props:**

```typescript
interface PlatformScrollViewProps {
  children: React.ReactNode;
  bounces?: boolean; // iOS only
  overScrollMode?: 'auto' | 'always' | 'never'; // Android only
}
```

**Exemplo:**

```typescript
<PlatformScrollView bounces={true}>
  <Text>Conteúdo scrollável</Text>
</PlatformScrollView>
```

## Padrões de Uso

### Tela Completa

```typescript
import { SafeAreaContainer } from '@/components/layout';
import { Box } from '@/components/primitives/Box';
import { Text } from '@/components/primitives/Text';
import { Button } from '@/components/primitives/Button';

export function MyScreen() {
  return (
    <SafeAreaContainer edges={['top', 'bottom']}>
      <Box p="4">
        <Text variant="h1">Título</Text>
        <Text variant="body">Descrição</Text>
        <Button title="Ação" onPress={handleAction} />
      </Box>
    </SafeAreaContainer>
  );
}
```

### Formulário

```typescript
import { KeyboardAvoidingContainer } from '@/components/layout';
import { Box } from '@/components/primitives/Box';
import { Input } from '@/components/primitives/Input';
import { Button } from '@/components/primitives/Button';

export function MyForm() {
  return (
    <KeyboardAvoidingContainer>
      <Box p="4">
        <Input placeholder="Nome" />
        <Input placeholder="Email" />
        <Button title="Enviar" onPress={handleSubmit} />
      </Box>
    </KeyboardAvoidingContainer>
  );
}
```

## Boas Práticas

1. **Sempre use componentes primitivos** em vez de View/Text nativos
2. **Use tokens do design system** em vez de valores hardcoded
3. **Respeite safe areas** em todas as telas
4. **Implemente acessibilidade** (labels, roles, hints)
5. **Teste em ambas plataformas** antes de commitar
