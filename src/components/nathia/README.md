# NathIA Layout Responsivo

Sistema de layout responsivo para telas da NathIA que se adapta automaticamente a diferentes tamanhos de tela.

## 📱 Breakpoints

- **xs** (< 390px): Mobile pequeno - Layout compacto
- **sm** (390-428px): Mobile padrão - Layout padrão
- **md** (428-768px): Mobile grande - Layout expandido
- **lg** (≥ 768px): Tablet - Layout em colunas
- **xl** (≥ 1024px): Desktop - Layout multi-colunas

## 🚀 Uso Básico

### Layout Simples

```tsx
import { NathIALayout, NathIACard } from '@/components/nathia';

function MyScreen() {
  return (
    <NathIALayout>
      <NathIACard>
        <Text>Conteúdo do card</Text>
      </NathIACard>
    </NathIALayout>
  );
}
```

### Layout com Header

```tsx
<NathIALayout
  header={
    <Box>
      <Text>Título</Text>
    </Box>
  }
>
  <NathIACard>Conteúdo</NathIACard>
</NathIALayout>
```

### Grid Responsivo

```tsx
import { NathIALayout, NathIAGrid, NathIACard } from '@/components/nathia';

<NathIALayout>
  <NathIAGrid mobileColumns={1} tabletColumns={3}>
    <NathIACard columns={4}>Card 1</NathIACard>
    <NathIACard columns={4}>Card 2</NathIACard>
    <NathIACard columns={4}>Card 3</NathIACard>
  </NathIAGrid>
</NathIALayout>;
```

## 📐 Componentes

### NathIALayout

Container principal responsivo.

**Props:**

- `children`: Conteúdo principal
- `header?`: Header customizado
- `footer?`: Footer customizado
- `scrollable?`: Se deve usar ScrollView (padrão: `true`)
- `padding?`: Padding customizado (keyof Tokens.spacing)
- `gap?`: Gap customizado entre elementos
- `centerContent?`: Centralizar conteúdo em tablets (padrão: `true`)

### NathIACard

Card responsivo que se adapta ao tamanho da tela.

**Props:**

- `children`: Conteúdo do card
- `columns?`: Largura em colunas (1-12) para tablets (padrão: `1`)
- `padding?`: Padding interno (padrão: `'4'`)
- `shadow?`: Se deve ter sombra (padrão: `true`)
- `bordered?`: Se deve ter borda (padrão: `true`)
- `onPress?`: Callback ao pressionar

**Comportamento:**

- **Mobile**: Sempre largura total (100%)
- **Tablet+**: Largura calculada baseada em `columns` (sistema de 12 colunas)

### NathIAGrid

Grid responsivo para múltiplos cards.

**Props:**

- `children`: Cards para renderizar
- `mobileColumns?`: Número de colunas em mobile (padrão: `1`)
- `tabletColumns?`: Número de colunas em tablet (padrão: `3`)
- `gap?`: Gap entre cards (padrão: `'4'`)

## 🎨 Exemplos

### Exemplo 1: Chat Screen

```tsx
<NathIALayout
  header={
    <Box direction="row" align="center" gap="3">
      <Avatar />
      <Box>
        <Text>NathIA</Text>
        <Badge>Disponível</Badge>
      </Box>
    </Box>
  }
>
  <NathIACard>
    <Text>Mensagens do chat...</Text>
  </NathIACard>
</NathIALayout>
```

### Exemplo 2: Dashboard de Conteúdo

```tsx
<NathIALayout>
  <NathIAGrid mobileColumns={1} tabletColumns={2}>
    <NathIACard columns={6}>
      <Text>Card 1</Text>
    </NathIACard>
    <NathIACard columns={6}>
      <Text>Card 2</Text>
    </NathIACard>
  </NathIAGrid>
</NathIALayout>
```

### Exemplo 3: Layout Complexo

```tsx
<NathIALayout header={<Header />} footer={<Footer />}>
  {/* Seção full-width */}
  <NathIACard columns={12}>
    <Text>Conteúdo full-width</Text>
  </NathIACard>

  {/* Grid de cards */}
  <NathIAGrid mobileColumns={1} tabletColumns={3}>
    <NathIACard columns={4}>Card 1</NathIACard>
    <NathIACard columns={4}>Card 2</NathIACard>
    <NathIACard columns={4}>Card 3</NathIACard>
  </NathIAGrid>
</NathIALayout>
```

## 🔧 Customização

### Padding Customizado

```tsx
<NathIALayout padding="6" gap="5">
  {/* Padding maior */}
</NathIALayout>
```

### Card sem Sombra/Borda

```tsx
<NathIACard shadow={false} bordered={false}>
  Card minimalista
</NathIACard>
```

### Card Clicável

```tsx
<NathIACard onPress={() => navigation.navigate('Detail')}>Card interativo</NathIACard>
```

## 📱 Comportamento Responsivo

### Mobile (< 768px)

- Cards sempre em largura total
- Layout vertical (coluna única)
- Padding reduzido
- Gap menor entre elementos

### Tablet (≥ 768px)

- Cards em grid (múltiplas colunas)
- Layout horizontal quando possível
- Padding aumentado
- Gap maior entre elementos
- Conteúdo centralizado (max-width: 1200px)

### Desktop (≥ 1024px)

- Grid de 3 colunas padrão
- Max-width: 1400px
- Espaçamento otimizado

## ✅ Padrões Aplicados

- ✅ Design tokens (`Tokens`, `ColorTokens`)
- ✅ Safe area support
- ✅ Dark mode support
- ✅ Acessibilidade WCAG AAA
- ✅ TypeScript strict mode
- ✅ Performance otimizada (useMemo)

## 💬 NathIAChatInput

Componente de input de chat estilizado para NathIA.

### Uso Básico

```tsx
import { NathIAChatInput } from '@/components/nathia';

function ChatScreen() {
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  const handleSend = (text: string) => {
    // Enviar mensagem
    setSending(true);
    // ... lógica de envio
  };

  return (
    <NathIAChatInput
      value={message}
      onChangeText={setMessage}
      onSend={handleSend}
      sending={sending}
      placeholder="Responder a NathIA..."
    />
  );
}
```

### Props

- `value`: Valor do input (string)
- `onChangeText`: Callback ao mudar texto
- `onSend`: Callback ao enviar (recebe o texto)
- `placeholder?`: Placeholder customizado (padrão: "Responder a NathIA...")
- `sending?`: Se está enviando (padrão: `false`)
- `multiline?`: Se deve usar multiline (padrão: `true`)
- `maxLines?`: Máximo de linhas (padrão: `4`)

### Características

- ✅ Input arredondado com fundo escuro (dark mode aware)
- ✅ Botão circular rosa que se ativa quando há texto
- ✅ Suporte a multiline
- ✅ Haptic feedback ao enviar
- ✅ Acessibilidade WCAG AAA
- ✅ Design tokens aplicados

## 📚 Ver Também

- `src/components/primitives/Box` - Componente de layout base
- `src/theme/tokens.ts` - Design tokens
- `src/components/nathia/NathIALayoutExample.tsx` - Exemplos de layout
- `src/components/nathia/NathIAChatInputExample.tsx` - Exemplo de chat completo
