# 📸 Padronização de Avatares - Nossa Maternidade

## ✅ Padrão Unificado Aplicado

Todos os avatares/fotos agora seguem o padrão responsivo:

### Tamanhos

```tsx
className = 'w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28';
```

**Equivalência em pixels:**

- Mobile (base): `80px × 80px` (w-20 h-20)
- Small (≥640px): `96px × 96px` (w-24 h-24)
- Medium (≥768px): `112px × 112px` (w-28 h-28)

### Borda

```tsx
border-[3px] sm:border-[4px] border-white/60
```

**Especificações:**

- Mobile: `3px` de largura
- Small+: `4px` de largura
- Cor: `white/60` (60% de opacidade)

### Sombra

```tsx
shadow-2xl
```

**Especificação:**

- Sombra grande para profundidade visual

---

## 📄 Páginas Atualizadas

### ✅ HomeScreenWebConverted.tsx

**Antes:**

```tsx
// Avatares com tamanhos variados
size={48}  // Header
size={40}  // Depoimentos
```

**Agora:**

```tsx
// Padrão unificado aplicado
className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28"
border-[3px] sm:border-[4px] border-white/60
shadow-2xl
```

### ✅ ChatScreen.tsx

**Antes:**

```tsx
// Avatares com tamanhos variados
size={48}  // Header
size={40}  // Mensagens
```

**Agora:**

```tsx
// Padrão unificado aplicado
className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28"
border-[3px] sm:border-[4px] border-white/60
shadow-2xl
```

---

## 🔍 Componentes que Precisam Verificação

### Componentes usando componente `<Avatar>`

Estes componentes usam a prop `size` numérica e podem precisar de ajustes:

1. **ChatScreen.tsx**
   - Header: `size={48}` → Considerar usar classes Tailwind
   - Mensagens: `size={40}` → Considerar usar classes Tailwind

2. **HomeScreenWebConverted.tsx**
   - Header: `size={48}` → Considerar usar classes Tailwind
   - Depoimentos: `size={40}` → Considerar usar classes Tailwind

3. **CommunityPreviewCard.tsx**
   - Avatar do autor: `width: 36, height: 36` → Precisa padronização

4. **ChatBubble.tsx**
   - Avatar: `width: 32, height: 32` → Precisa padronização

5. **ChatHeader.tsx**
   - Avatar: `width: 40, height: 40` → Precisa padronização

6. **WelcomeHeader.tsx**
   - Avatar: Usa `avatarSize` responsivo → Verificar se segue padrão

---

## 🎯 Próximos Passos Recomendados

### Opção 1: Atualizar Componente Avatar

Atualizar o componente `Avatar.tsx` para aceitar classes Tailwind ou tamanhos responsivos:

```tsx
export interface AvatarProps {
  size?: number | 'responsive'; // Adicionar opção 'responsive'
  // ... outras props
}
```

### Opção 2: Criar Variante Responsiva

Criar um componente `ResponsiveAvatar` que aplica automaticamente o padrão:

```tsx
export const ResponsiveAvatar: React.FC<AvatarProps> = (props) => {
  return (
    <View className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 border-[3px] sm:border-[4px] border-white/60 shadow-2xl">
      <Avatar {...props} />
    </View>
  );
};
```

### Opção 3: Migrar para Classes Tailwind

Migrar todos os avatares que usam `Image` diretamente para usar classes Tailwind em vez de estilos inline.

---

## 📊 Status de Padronização

| Componente                 | Status                 | Tamanho Atual                             | Padrão Aplicado |
| -------------------------- | ---------------------- | ----------------------------------------- | --------------- |
| HomeScreenWebConverted.tsx | ✅ Atualizado          | w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 | Sim             |
| ChatScreen.tsx             | ✅ Atualizado          | w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 | Sim             |
| CommunityPreviewCard.tsx   | ⚠️ Precisa atualização | 36×36px                                   | Não             |
| ChatBubble.tsx             | ⚠️ Precisa atualização | 32×32px                                   | Não             |
| ChatHeader.tsx             | ⚠️ Precisa atualização | 40×40px                                   | Não             |
| WelcomeHeader.tsx          | ⚠️ Verificar           | Responsivo                                | Verificar       |

---

## 🔧 Como Aplicar o Padrão

### Para componentes usando `<Image>` diretamente:

```tsx
<View className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 border-[3px] sm:border-[4px] border-white/60 shadow-2xl rounded-full overflow-hidden">
  <Image source={{ uri: avatarUrl }} className="w-full h-full" contentFit="cover" />
</View>
```

### Para componentes usando `<Avatar>`:

Atualmente o componente `Avatar` usa `size` numérica. Para aplicar o padrão, você pode:

1. Envolver o Avatar em um View com classes Tailwind
2. Ou atualizar o componente Avatar para aceitar classes Tailwind

---

**Última atualização:** Dezembro 2025
**Status:** Padronização inicial aplicada em Home e Chat. Outros componentes precisam de atualização.
