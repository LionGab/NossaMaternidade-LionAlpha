# Padrão Híbrido: Props + className

**Componentes híbridos suportam 2 modos de estilização:**

- **Props semânticas** (legado, theme-aware, type-safe)
- **className** (NativeWind v4, conciso, web-familiar)

---

## Componentes Suportados

✅ **Box** v2.0 - Layout primitive
✅ **Text** v2.0 - Typography primitive
✅ **Button** v2.0 - Interaction primitive (híbrido)

---

## Regra de Ouro

**Se `className` fornecido → ignora props semânticas**

```tsx
// ❌ className sobrescreve props
<Box className="bg-primary" bg="card">
  {/* bg="card" é ignorado, usa bg-primary */}
</Box>

// ✅ Usar UM ou OUTRO
<Box className="bg-primary">        {/* Modo 1: NativeWind */}
<Box bg="card">                     {/* Modo 2: Props */}
```

---

## 1. Box Component

### Modo 1: className (NativeWind)

```tsx
import { Box } from '@/components/atoms/Box';

// Layout básico
<Box className="bg-card p-5 rounded-3xl shadow-md">
  <Box className="flex-row items-center gap-3">
    <Text>Conteúdo</Text>
  </Box>
</Box>

// Flexbox
<Box className="flex-1 flex-row justify-between items-center">
  <Text>Esquerda</Text>
  <Text>Direita</Text>
</Box>

// Spacing
<Box className="p-4 px-6 mb-6">      {/* padding, paddingHorizontal, marginBottom */}
<Box className="m-4 mt-2">            {/* margin, marginTop */}

// Border
<Box className="border border-border-light rounded-2xl">
<Box className="border-2 border-primary rounded-full">

// Size
<Box className="w-full h-20">        {/* width full, height 80px */}
<Box className="w-48 h-48">          {/* width/height 192px */}
```

### Modo 2: Props (Legado)

```tsx
// Layout básico
<Box bg="card" p="5" rounded="3xl" shadow="md">
  <Box direction="row" align="center" gap="3">
    <Text>Conteúdo</Text>
  </Box>
</Box>

// Flexbox
<Box flex={1} direction="row" justify="space-between" align="center">
  <Text>Esquerda</Text>
  <Text>Direita</Text>
</Box>

// Spacing
<Box p="4" px="6" mb="6">
<Box m="4" mt="2">

// Border
<Box borderWidth={1} borderColor="light" rounded="2xl">
<Box borderWidth={2} borderColor="focus" rounded="full">

// Size
<Box width="100%" height={80}>
<Box width={192} height={192}>
```

### Comparação Box

| Feature         | Props                           | className                             |
| --------------- | ------------------------------- | ------------------------------------- |
| **Código**      | `bg="card" p="5" rounded="3xl"` | `className="bg-card p-5 rounded-3xl"` |
| **Linhas**      | 1 linha                         | 1 linha                               |
| **Caracteres**  | ~35 chars                       | ~33 chars (similar)                   |
| **Type Safety** | ✅ TypeScript valida            | ⚠️ String (sem validação)             |
| **Dark Mode**   | ✅ Automático                   | ⚠️ Manual (`dark:` prefix)            |

---

## 2. Text Component

### Modo 1: className (NativeWind)

```tsx
import { Text } from '@/components/atoms/Text';

// Sizes
<Text className="text-xs">Extra small</Text>     {/* 12px */}
<Text className="text-sm">Small</Text>           {/* 14px */}
<Text className="text-base">Base</Text>          {/* 16px */}
<Text className="text-lg">Large</Text>           {/* 18px */}
<Text className="text-xl">Extra large</Text>     {/* 20px */}
<Text className="text-2xl">2XL</Text>            {/* 24px */}
<Text className="text-3xl">3XL</Text>            {/* 28px */}

// Weights
<Text className="font-light">Light</Text>        {/* 300 */}
<Text className="font-normal">Normal</Text>      {/* 400 */}
<Text className="font-medium">Medium</Text>      {/* 500 */}
<Text className="font-semibold">Semibold</Text>  {/* 600 */}
<Text className="font-bold">Bold</Text>          {/* 700 */}

// Colors (Tailwind config)
<Text className="text-primary">Primary</Text>
<Text className="text-text-secondary">Secondary</Text>
<Text className="text-text-tertiary">Tertiary</Text>
<Text className="text-success">Success</Text>
<Text className="text-error">Error</Text>

// Alignment
<Text className="text-left">Left</Text>
<Text className="text-center">Center</Text>
<Text className="text-right">Right</Text>

// Decorations
<Text className="italic">Italic</Text>
<Text className="underline">Underline</Text>
<Text className="line-through">Strikethrough</Text>

// Combinações
<Text className="text-2xl font-bold text-primary mb-4">
  Título Grande Rosa
</Text>

<Text className="text-sm font-medium text-text-secondary">
  Subtítulo Cinza
</Text>
```

### Modo 2: Props (Legado)

```tsx
// Variants + Sizes
<Text variant="body" size="xs">Extra small</Text>
<Text variant="body" size="sm">Small</Text>
<Text variant="body" size="md">Medium</Text>       {/* default */}
<Text variant="body" size="lg">Large</Text>
<Text variant="body" size="xl">Extra large</Text>
<Text variant="body" size="2xl">2XL</Text>
<Text variant="body" size="3xl">3XL</Text>

// Variants (pré-configuradas)
<Text variant="body">Body text</Text>              {/* 16px regular */}
<Text variant="caption">Caption</Text>             {/* 14px wide spacing */}
<Text variant="label">Label</Text>                 {/* 14px medium weight */}
<Text variant="overline">Overline</Text>           {/* 12px semibold uppercase */}
<Text variant="small">Small</Text>                 {/* 12px regular */}

// Weights
<Text weight="light">Light</Text>
<Text weight="regular">Regular</Text>
<Text weight="medium">Medium</Text>
<Text weight="semibold">Semibold</Text>
<Text weight="bold">Bold</Text>

// Colors (Theme-aware)
<Text color="primary">Primary</Text>
<Text color="secondary">Secondary</Text>
<Text color="tertiary">Tertiary</Text>
<Text color="success">Success</Text>
<Text color="error">Error</Text>
<Text color="inverse">Inverse (white)</Text>

// Alignment
<Text align="left">Left</Text>
<Text align="center">Center</Text>
<Text align="right">Right</Text>

// Decorations
<Text italic>Italic</Text>
<Text underline>Underline</Text>
<Text strikethrough>Strikethrough</Text>

// Combinações
<Text variant="body" size="2xl" weight="bold" color="primary">
  Título Grande Rosa
</Text>

<Text variant="caption" size="sm" weight="medium" color="secondary">
  Subtítulo Cinza
</Text>
```

### Comparação Text

| Feature         | Props                                    | className                       |
| --------------- | ---------------------------------------- | ------------------------------- |
| **Código**      | `variant="body" size="lg" weight="bold"` | `className="text-lg font-bold"` |
| **Linhas**      | 1 linha                                  | 1 linha                         |
| **Caracteres**  | ~40 chars                                | ~28 chars (**-30%**)            |
| **Type Safety** | ✅ Enum validation                       | ⚠️ String                       |
| **Dark Mode**   | ✅ Automático                            | ⚠️ Manual                       |
| **Variants**    | ✅ 5 pré-configuradas                    | ❌ Manual                       |

---

## 3. Button Component

### Modo 1: className/textClassName (NativeWind)

```tsx
import { Button } from '@/components/atoms/Button';

// Botão básico com className
<Button
  title="Salvar"
  onPress={handleSave}
  className="bg-primary rounded-xl px-6 py-3 shadow-md"
  textClassName="text-white font-semibold text-base"
/>

// Botão outline
<Button
  title="Cancelar"
  onPress={handleCancel}
  className="bg-transparent border-2 border-primary rounded-xl px-6 py-3"
  textClassName="text-primary font-semibold"
/>

// Botão pequeno com ícone
<Button
  title="Compartilhar"
  onPress={handleShare}
  leftIcon={<Share size={16} />}
  className="bg-secondary rounded-lg px-4 py-2"
  textClassName="text-white text-sm font-medium"
/>

// Botão full width
<Button
  title="Continuar"
  onPress={handleContinue}
  className="bg-primary rounded-2xl px-8 py-4 w-full"
  textClassName="text-white text-lg font-bold"
/>

// Estados: loading e disabled funcionam normalmente
<Button
  title="Enviar"
  onPress={handleSubmit}
  loading={isSubmitting}
  disabled={!isValid}
  className="bg-primary rounded-xl px-6 py-3"
  textClassName="text-white font-semibold"
/>
```

### Modo 2: Props (Legado)

```tsx
// Variantes pré-configuradas
<Button title="Salvar" onPress={handleSave} variant="primary" />
<Button title="Cancelar" onPress={handleCancel} variant="outline" />
<Button title="Excluir" onPress={handleDelete} variant="danger" />
<Button title="Pular" onPress={handleSkip} variant="ghost" />

// Tamanhos
<Button title="Pequeno" size="sm" variant="primary" />
<Button title="Médio" size="md" variant="primary" />  {/* default */}
<Button title="Grande" size="lg" variant="primary" />

// Com ícones
<Button
  title="Compartilhar"
  leftIcon={<Share size={16} />}
  variant="secondary"
/>
<Button
  title="Próximo"
  rightIcon={<ArrowRight size={16} />}
  variant="primary"
/>

// Estados
<Button title="Enviar" loading={isSubmitting} variant="primary" />
<Button title="Desabilitado" disabled={true} variant="primary" />
<Button title="Full Width" fullWidth variant="primary" />

// Combinações
<Button
  title="Salvar e Continuar"
  onPress={handleSave}
  variant="primary"
  size="lg"
  fullWidth
  leftIcon={<Save size={20} />}
  loading={isSaving}
/>
```

### Comparação Button

| Feature         | Props                          | className                                     |
| --------------- | ------------------------------ | --------------------------------------------- |
| **Código**      | `variant="primary" size="md"`  | `className="bg-primary rounded-xl px-6 py-3"` |
| **Linhas**      | 1 linha                        | 2 linhas (container + text)                   |
| **Caracteres**  | ~35 chars                      | ~60 chars (+71%)                              |
| **Type Safety** | ✅ Enum validation             | ⚠️ String                                     |
| **Dark Mode**   | ✅ Automático                  | ⚠️ Manual                                     |
| **Variants**    | ✅ 5 pré-configuradas          | ❌ Manual                                     |
| **Estados**     | ✅ loading/disabled integrados | ✅ Funcionam normalmente                      |

### Regra Especial: Button Híbrido

**Button tem comportamento especial:**

- `className` → controla apenas o **container** (Pressable)
- `textClassName` → controla apenas o **texto interno** (usa Text híbrido)
- `variant`/`size` → ignorados quando `className` fornecido
- `loading`/`disabled`/`onPress` → **sempre funcionam** (semântica preservada)

```tsx
// ✅ CORRETO: className + props semânticas (loading funciona)
<Button
  title="Salvar"
  className="bg-primary rounded-xl px-6 py-3"
  textClassName="text-white font-semibold"
  loading={isSaving}  // ✅ Funciona normalmente
  disabled={!isValid} // ✅ Funciona normalmente
/>

// ✅ CORRETO: Apenas className (sem variant)
<Button
  title="Custom"
  className="bg-purple-500 rounded-full px-8 py-4"
  textClassName="text-white text-lg font-bold"
/>

// ✅ CORRETO: Apenas props (sem className)
<Button
  title="Padrão"
  variant="primary"
  size="md"
/>
```

---

## 4. Dark Mode

### Props Semânticas (Automático) ✅

```tsx
import { Box, Text } from '@/components/atoms';

// Dark mode automático via Theme Context
<Box bg="card">
  {' '}
  {/* Light: #FFFFFF | Dark: #1E293B */}
  <Text color="primary">Texto</Text> {/* Light: #6A5450 | Dark: #F8FAFC */}
</Box>;

// Sem código extra, funciona out-of-the-box
```

**Como funciona:**

1. `useTheme()` hook detecta tema atual
2. Props (`bg="card"`, `color="primary"`) mapeiam para `colors.background.card`, `colors.text.primary`
3. Cores mudam automaticamente quando tema muda

---

### className (Manual) ⚠️

**Problema:** NativeWind v4 exige prefixo `dark:` manual

```tsx
// ❌ Sem dark mode (fixo light)
<Box className="bg-white">
  <Text className="text-gray-900">Texto</Text>
</Box>

// ✅ Com dark mode (manual)
<Box className="bg-white dark:bg-gray-900">
  <Text className="text-gray-900 dark:text-white">Texto</Text>
</Box>
```

**Verboso:** Precisa duplicar classes para light/dark

---

### Helper useThemeClassName() 🔧

**Semi-automático:** Helper processa `dark:` baseado em tema

```tsx
import { useThemeClassName } from '@/utils/themeClassName';

function MyComponent() {
  const cn = useThemeClassName();

  return (
    <Box className={cn('bg-white dark:bg-gray-900')}>
      <Text className={cn('text-gray-900 dark:text-white')}>Texto</Text>
    </Box>
  );
}
```

**Como funciona:**

- Light mode: remove `dark:` classes → `bg-white text-gray-900`
- Dark mode: aplica apenas `dark:` classes → `bg-gray-900 text-white`

**Limitação:** Ainda precisa escrever `dark:` classes manualmente

---

### Quando Usar Cada Modo

| Cenário                    | Recomendação          |
| -------------------------- | --------------------- |
| **Dark mode crítico**      | ✅ Props (automático) |
| **Código simples/limpo**   | ✅ Props              |
| **Compatibilidade web**    | ✅ className          |
| **Menos código**           | ✅ className          |
| **Migrando de web**        | ✅ className          |
| **Type safety importante** | ✅ Props              |

---

## 4. Exemplos Práticos (HomeScreen)

### Exemplo 1: Greeting Section

**ANTES (Props):**

```tsx
<Box mb="6">
  <Text variant="body" size="2xl" weight="bold" style={{ marginBottom: 8 }}>
    Olá, mãe
  </Text>
  <Text variant="body" size="sm" color="secondary">
    Respira um pouquinho. Estamos aqui por você.
  </Text>
</Box>
```

**DEPOIS (className):**

```tsx
<Box className="mb-6">
  <Text className="text-2xl font-bold mb-1">Olá, mãe</Text>
  <Text className="text-sm text-text-secondary">Respira um pouquinho. Estamos aqui por você.</Text>
</Box>
```

**Resultado:** -35% código, +50% legibilidade

---

### Exemplo 2: Card Layout

**ANTES (Props):**

```tsx
<Box bg="card" rounded="3xl" p="4" shadow="md" borderWidth={1} borderColor="light">
  <Box direction="row" gap="3" align="center">
    <Icon />
    <Box flex={1}>
      <Text variant="body" size="md" weight="semibold">
        Título
      </Text>
      <Text variant="body" size="sm" color="secondary">
        Descrição
      </Text>
    </Box>
  </Box>
</Box>
```

**DEPOIS (className):**

```tsx
<Box className="bg-card rounded-3xl p-4 shadow-md border border-border-light">
  <Box className="flex-row gap-3 items-center">
    <Icon />
    <Box className="flex-1">
      <Text className="text-base font-semibold">Título</Text>
      <Text className="text-sm text-text-secondary">Descrição</Text>
    </Box>
  </Box>
</Box>
```

**Resultado:** -40% código, mantém legibilidade

---

### Exemplo 3: Hybrid Mix (Recomendado)

**Usar className onde faz sentido, props onde é melhor:**

```tsx
{
  /* Layout: className (conciso) */
}
<Box className="bg-card rounded-3xl p-5 shadow-md mb-6">
  {/* Flex: className (web-familiar) */}
  <Box className="flex-row items-center gap-3">
    {/* Icon box: style inline (cores dinâmicas) */}
    <Box
      style={{
        padding: 8,
        borderRadius: 12,
        backgroundColor: ColorTokens.primary[100],
      }}
    >
      <Icon size={24} color={ColorTokens.primary[600]} />
    </Box>

    {/* Content: className */}
    <Box className="flex-1">
      <Text className="text-lg font-bold mb-2">Título</Text>

      {/* Text com cor dinâmica: props (theme-aware) */}
      <Text variant="body" size="sm" color="secondary">
        Descrição que respeita dark mode
      </Text>
    </Box>
  </Box>
</Box>;
```

**Melhor dos dois mundos:**

- Layout estrutural → className (menos código)
- Cores dinâmicas → props ou style (dark mode automático)
- Flexibilidade → misturar conforme necessário

---

### Exemplo 4: Button Híbrido (HomeScreen)

**ANTES (Props):**

```tsx
<Button
  title="Saiba mais"
  onPress={() => navigation.navigate('Ritual')}
  variant="outline"
  size="sm"
  leftIcon={<Info size={14} color={ColorTokens.info[600]} />}
  style={{
    borderColor: ColorTokens.info[300],
    backgroundColor: 'transparent',
  }}
/>
```

**DEPOIS (className):**

```tsx
<Button
  title="Saiba mais"
  onPress={() => navigation.navigate('Ritual')}
  className="bg-transparent border border-info-300 rounded-xl px-4 py-2"
  textClassName="text-info-600 text-sm font-semibold"
  leftIcon={<Info size={14} color={ColorTokens.info[600]} />}
/>
```

**Resultado:** -40% código, mantém funcionalidade completa

---

### Exemplo 5: Button com Estados (ChatScreen)

**ANTES (Props):**

```tsx
<Button
  title="Quero conversar"
  onPress={handleNathIAPress}
  variant="secondary"
  size="md"
  leftIcon={<Heart size={16} color={ColorTokens.primary[500]} />}
  style={{
    flex: 2,
    backgroundColor: ColorTokens.neutral[0],
  }}
/>
```

**DEPOIS (className):**

```tsx
<Button
  title="Quero conversar"
  onPress={handleNathIAPress}
  className="bg-white rounded-xl px-6 py-3 flex-[2] shadow-md"
  textClassName="text-primary-500 text-base font-semibold"
  leftIcon={<Heart size={16} color={ColorTokens.primary[500]} />}
/>
```

**Resultado:** Mais conciso, mantém loading/disabled automáticos

---

## 5. Guia de Migração

### Migração Gradual (Recomendado)

**NÃO precisa migrar tudo de uma vez!**

```tsx
// ✅ Código legado funciona normalmente
<Box bg="card" p="5">
  <Text variant="body" size="md">Texto antigo</Text>
</Box>

// ✅ Código novo usa className
<Box className="bg-card p-5">
  <Text className="text-base">Texto novo</Text>
</Box>

// ✅ Mesmo arquivo, estilos diferentes
function MyScreen() {
  return (
    <Box className="p-4">           {/* Novo */}
      <Text className="text-2xl font-bold">Título</Text>

      <Box bg="card" p="4">          {/* Legado - funciona! */}
        <Text variant="body">Conteúdo antigo</Text>
      </Box>
    </Box>
  );
}
```

---

### Quando Migrar

| Momento           | Ação                        |
| ----------------- | --------------------------- |
| **Código novo**   | ✅ Usar className           |
| **Bug fix**       | ❌ Não migrar (foco no bug) |
| **Refactor**      | ✅ Migrar aos poucos        |
| **Code review**   | 💡 Sugerir (não exigir)     |
| **Tela complexa** | ✅ Migrar layout principal  |

---

### Checklist de Migração

**Box:**

- [ ] `bg` → `className="bg-{color}"`
- [ ] `p`, `px`, `py` → `className="p-{n} px-{n} py-{n}"`
- [ ] `m`, `mb`, `mt` → `className="m-{n} mb-{n} mt-{n}"`
- [ ] `rounded` → `className="rounded-{size}"`
- [ ] `shadow` → `className="shadow-{size}"`
- [ ] `direction="row"` → `className="flex-row"`
- [ ] `align="center"` → `className="items-center"`
- [ ] `justify="between"` → `className="justify-between"`
- [ ] `gap` → `className="gap-{n}"`

**Text:**

- [ ] `variant` + `size` → `className="text-{size}"`
- [ ] `weight` → `className="font-{weight}"`
- [ ] `color` → `className="text-{color}"` (⚠️ dark mode manual)
- [ ] `align` → `className="text-{align}"`
- [ ] `italic` → `className="italic"`
- [ ] `underline` → `className="underline"`

**Button:**

- [ ] `variant="primary"` → `className="bg-primary"` + `textClassName="text-white"`
- [ ] `variant="outline"` → `className="bg-transparent border-2 border-primary"` + `textClassName="text-primary"`
- [ ] `variant="ghost"` → `className="bg-transparent"` + `textClassName="text-primary"`
- [ ] `size="sm"` → `className="px-4 py-2"` + `textClassName="text-sm"`
- [ ] `size="lg"` → `className="px-8 py-4"` + `textClassName="text-lg"`
- [ ] `fullWidth` → `className="w-full"` (ou manter prop)
- [ ] `loading`/`disabled` → **manter props** (funcionam normalmente)
- [ ] `leftIcon`/`rightIcon` → **manter props** (funcionam normalmente)

---

## 6. FAQ

### Q: Posso misturar props e className no mesmo componente?

**A:** ❌ Não recomendado. `className` tem prioridade total.

```tsx
// ❌ Confuso - className ganha, bg ignorado
<Box className="bg-primary" bg="card">

// ✅ Escolher UM modo
<Box className="bg-primary">        {/* Modo 1 */}
<Box bg="card">                     {/* Modo 2 */}
```

---

### Q: className funciona com dark mode?

**A:** ⚠️ Sim, mas **manual**.

```tsx
// Props: Automático ✅
<Text color="primary">Texto</Text>

// className: Manual ⚠️
<Text className="text-primary dark:text-dark-text">Texto</Text>

// Helper: Semi-automático 🔧
const cn = useThemeClassName();
<Text className={cn('text-primary dark:text-dark-text')}>Texto</Text>
```

---

### Q: Qual é mais rápido, props ou className?

**A:** Ambos têm performance similar (memoizados).

**Props:** useMemo() em `computedStyle`
**className:** NativeWind compila CSS → styles nativos

**Diferença:** Insignificante (<1ms)

---

### Q: className tem autocomplete no VS Code?

**A:** ⚠️ Parcial.

**Tailwind IntelliSense extension:**

- ✅ Autocomplete básico (`bg-`, `text-`, `p-`)
- ❌ Não valida valores customizados (`bg-card`, `text-primary`)

**Props:**

- ✅ Autocomplete completo (TypeScript)
- ✅ Validação em tempo real

---

### Q: Quando usar props vs className?

**Usar Props quando:**

- Dark mode é crítico
- Type safety é importante
- Código legado (evitar refactor desnecessário)
- Cores/styles dinâmicos via Theme Context

**Usar className quando:**

- Migrando de web (Tailwind familiar)
- Menos código é prioridade
- Estrutura de layout (flex, spacing)
- Time já sabe Tailwind

---

### Q: E se eu usar style inline?

**A:** ✅ Funciona junto com props OU className!

```tsx
// Com props
<Box bg="card" p="4" style={{ borderWidth: 2 }}>

// Com className
<Box className="bg-card p-4" style={{ borderWidth: 2 }}>

// Prioridade: style > className > props
<Box
  bg="card"                        // Prio 3
  className="bg-primary"           // Prio 2
  style={{ backgroundColor: '#FF0000' }}  // Prio 1 (ganha)
>
```

---

### Q: LinearGradient suporta className?

**A:** ⚠️ Parcial (apenas size/opacity).

```tsx
// ❌ Cores não funcionam
<LinearGradient className="bg-primary">  {/* Ignorado */}

// ✅ Usar colors prop (sempre)
<LinearGradient
  colors={[ColorTokens.primary[400], ColorTokens.secondary[500]]}
  className="opacity-95"  {/* ✅ Opacity funciona */}
>
```

---

### Q: Posso criar componentes customizados híbridos?

**A:** ✅ Sim! Seguir o padrão Box/Text.

```tsx
interface MyCardProps {
  className?: string; // ⭐ Suporte className
  variant?: 'primary' | 'secondary'; // Props semânticas
  children: React.ReactNode;
}

export function MyCard({ className, variant = 'primary', children }: MyCardProps) {
  // Modo 1: className (prioridade)
  if (className) {
    return <Box className={className}>{children}</Box>;
  }

  // Modo 2: Props semânticas (fallback)
  const bgMap = {
    primary: 'card',
    secondary: 'elevated',
  };
  return (
    <Box bg={bgMap[variant]} p="4" rounded="2xl">
      {children}
    </Box>
  );
}
```

---

## 7. Referências Rápidas

### Tailwind → Props Mapping

| Tailwind className                       | Props equivalente             |
| ---------------------------------------- | ----------------------------- |
| `bg-card`                                | `bg="card"`                   |
| `p-4`                                    | `p="4"`                       |
| `px-6`                                   | `px="6"`                      |
| `mb-4`                                   | `mb="4"`                      |
| `rounded-xl`                             | `rounded="xl"`                |
| `rounded-3xl`                            | `rounded="3xl"`               |
| `shadow-md`                              | `shadow="md"`                 |
| `flex-row`                               | `direction="row"`             |
| `items-center`                           | `align="center"`              |
| `justify-between`                        | `justify="space-between"`     |
| `gap-3`                                  | `gap="3"`                     |
| `flex-1`                                 | `flex={1}`                    |
| `text-lg`                                | `size="lg"`                   |
| `font-bold`                              | `weight="bold"`               |
| `text-primary`                           | `color="primary"`             |
| `bg-primary rounded-xl px-6 py-3`        | `variant="primary" size="md"` |
| `bg-transparent border-2 border-primary` | `variant="outline"`           |
| `text-white font-semibold`               | `variant="primary"` (texto)   |
| `text-primary font-semibold`             | `variant="outline"` (texto)   |

---

### Spacing Scale (ambos os modos)

| Value | Pixels | Rem     |
| ----- | ------ | ------- |
| `0`   | 0px    | 0rem    |
| `1`   | 4px    | 0.25rem |
| `2`   | 8px    | 0.5rem  |
| `3`   | 12px   | 0.75rem |
| `4`   | 16px   | 1rem    |
| `5`   | 20px   | 1.25rem |
| `6`   | 24px   | 1.5rem  |
| `8`   | 32px   | 2rem    |
| `10`  | 40px   | 2.5rem  |

---

### Font Sizes (ambos os modos)

| Size          | Pixels | Line Height |
| ------------- | ------ | ----------- |
| `xs`          | 12px   | 18px        |
| `sm`          | 14px   | 20px        |
| `md` / `base` | 16px   | 24px        |
| `lg`          | 18px   | 26px        |
| `xl`          | 20px   | 28px        |
| `2xl`         | 24px   | 32px        |
| `3xl`         | 28px   | 36px        |

---

### Border Radius (ambos os modos)

| Size   | Pixels |
| ------ | ------ |
| `sm`   | 4px    |
| `md`   | 8px    |
| `lg`   | 12px   |
| `xl`   | 16px   |
| `2xl`  | 20px   |
| `3xl`  | 24px   |
| `full` | 9999px |

---

## 8. Testes

### Estrutura de Testes

Todos os componentes híbridos têm testes dedicados em `__tests__/components/`:

- [`Box.hybrid.test.tsx`](../__tests__/components/Box.hybrid.test.tsx) - Testes do padrão híbrido Box
- [`Text.hybrid.test.tsx`](../__tests__/components/Text.hybrid.test.tsx) - Testes do padrão híbrido Text
- [`Button.hybrid.test.tsx`](../__tests__/components/Button.hybrid.test.tsx) - Testes do padrão híbrido Button

### Executar Testes

```bash
# Todos os testes
npm test

# Apenas testes híbridos
npm test -- __tests__/components/*.hybrid.test.tsx

# Com coverage
npm test -- --coverage
```

### Cobertura Esperada

- ✅ Modo className (NativeWind)
- ✅ Modo props semânticas (legado)
- ✅ Prioridade className > props
- ✅ Estados (loading/disabled)
- ✅ Acessibilidade
- ✅ Aninhamento
- ✅ Compatibilidade backward

---

## 9. Migração de Telas

### Status da Migração

**✅ Migradas (6 telas):**

- `HomeScreen.tsx` - Completo
- `ChatScreen.tsx` - Completo
- `SOSMaeScreen.tsx` - Completo
- `RitualScreen.tsx` - Completo
- `MundoNathScreen.tsx` - Completo
- `LoginScreenNew.tsx` - Completo

**⏳ Pendentes (prioridade alta):**

- `ProfileScreen.tsx`
- `SettingsScreen.tsx`
- `HabitsScreen.tsx`
- `DiaryScreen.tsx`

**⏳ Pendentes (prioridade média):**

- `FeedScreen.tsx`
- `CommunityScreen.tsx`
- `ContentDetailScreen.tsx`
- `SearchScreen.tsx`

### Checklist de Migração

Para cada tela:

- [ ] Identificar componentes `Box`, `Text`, `Button`
- [ ] Migrar para `className`/`textClassName` gradualmente
- [ ] Manter props semânticas funcionando (backward compat)
- [ ] Validar TypeScript (`npm run type-check`)
- [ ] Validar Lint (`npm run lint`)
- [ ] Testar visualmente (dark mode + light mode)
- [ ] Atualizar documentação se necessário

### Exemplo de Migração

**Antes:**

```tsx
<Box bg="card" p="4" gap="3">
  <Text size="lg" weight="bold" color="primary">
    Título
  </Text>
  <Button variant="primary" size="md" title="Ação" />
</Box>
```

**Depois:**

```tsx
<Box className="bg-card p-4 gap-3">
  <Text className="text-lg font-bold text-primary">Título</Text>
  <Button
    title="Ação"
    className="bg-primary rounded-xl px-6 py-3"
    textClassName="text-white font-semibold text-base"
  />
</Box>
```

---

## 10. Recursos

**Arquivos:**

- [`Box.tsx`](../src/components/atoms/Box.tsx) - Implementação híbrida
- [`Text.tsx`](../src/components/atoms/Text.tsx) - Implementação híbrida
- [`Button.tsx`](../src/components/atoms/Button.tsx) - Implementação híbrida
- [`HomeScreen.tsx`](../src/screens/HomeScreen.tsx) - Exemplos de uso
- [`themeClassName.ts`](../src/utils/themeClassName.ts) - Helper dark mode

**Testes:**

- [`Box.hybrid.test.tsx`](../__tests__/components/Box.hybrid.test.tsx) - Testes Box híbrido
- [`Text.hybrid.test.tsx`](../__tests__/components/Text.hybrid.test.tsx) - Testes Text híbrido
- [`Button.hybrid.test.tsx`](../__tests__/components/Button.hybrid.test.tsx) - Testes Button híbrido

**Documentação Externa:**

- [NativeWind v4 Docs](https://www.nativewind.dev/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [React Native Styling](https://reactnative.dev/docs/style)

---

**Última atualização:** 2025-12-05
**Versão:** 2.1.0 (Testes adicionados, documentação melhorada)
**Autor:** Claude Code
