# 🎯 Guia Completo de Centralização - React Native

## Centralizar View no Container

### 1. ✅ Centralização Horizontal (Eixo X)

```tsx
// Inline Styles
<View
  style={{
    alignItems: 'center', // Centraliza filhos no eixo horizontal
  }}
>
  <View style={{ backgroundColor: 'rgba(59, 179, 181, 0.13)' }}>{/* Conteúdo */}</View>
</View>;

// StyleSheet
const styles = StyleSheet.create({
  container: {
    alignItems: 'center', // Horizontal
  },
});
```

### 2. ✅ Centralização Vertical (Eixo Y)

```tsx
// Inline Styles
<View
  style={{
    justifyContent: 'center', // Centraliza filhos no eixo vertical
  }}
>
  <View style={{ backgroundColor: 'rgba(59, 179, 181, 0.13)' }}>{/* Conteúdo */}</View>
</View>;

// StyleSheet
const styles = StyleSheet.create({
  container: {
    justifyContent: 'center', // Vertical
  },
});
```

### 3. ✅ Centralização Completa (Horizontal + Vertical)

```tsx
// Inline Styles
<View
  style={{
    alignItems: 'center', // Horizontal
    justifyContent: 'center', // Vertical
  }}
>
  <View style={{ backgroundColor: 'rgba(59, 179, 181, 0.13)' }}>{/* Conteúdo */}</View>
</View>;

// StyleSheet
const styles = StyleSheet.create({
  container: {
    alignItems: 'center', // Horizontal
    justifyContent: 'center', // Vertical
  },
});
```

### 4. ✅ Versão com Inline Styles (Completa)

```tsx
// Container com centralização
<View
  style={{
    flex: 1, // Ocupa todo espaço disponível
    alignItems: 'center', // Centraliza horizontalmente
    justifyContent: 'center', // Centraliza verticalmente
  }}
>
  <View
    style={{
      backgroundColor: 'rgba(59, 179, 181, 0.13)',
      width: 24,
      height: 24,
      borderRadius: 12,
    }}
  >
    {/* Conteúdo interno */}
  </View>
</View>
```

### 5. ✅ Versão com Tailwind/NativeWind (className)

```tsx
// React Native Web com NativeWind
<View className="flex-1 items-center justify-center">
  <View className="w-6 h-6 rounded-full" style={{ backgroundColor: 'rgba(59, 179, 181, 0.13)' }}>
    {/* Conteúdo */}
  </View>
</View>

// Classes Tailwind:
// - flex-1: flex: 1
// - items-center: alignItems: 'center' (horizontal)
// - justify-center: justifyContent: 'center' (vertical)
// - w-6: width: 24
// - h-6: height: 24
// - rounded-full: borderRadius: 9999
```

### 6. ✅ Versão com Container Wrapper (Recomendado)

```tsx
// Componente com wrapper centralizado
const CenteredView = () => {
  return (
    <View style={styles.wrapper}>
      <View style={styles.centeredContent}>{/* Conteúdo centralizado */}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    alignItems: 'center', // Centraliza horizontalmente
    justifyContent: 'center', // Centraliza verticalmente
  },
  centeredContent: {
    backgroundColor: 'rgba(59, 179, 181, 0.13)',
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center', // Se tiver conteúdo interno
    justifyContent: 'center', // Se tiver conteúdo interno
  },
});
```

## 📋 Exemplos Práticos

### Exemplo 1: Centralizar em Container com Largura Fixa

```tsx
<View
  style={{
    width: 100,
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0f0f0',
  }}
>
  <View
    style={{
      backgroundColor: 'rgba(59, 179, 181, 0.13)',
      width: 24,
      height: 24,
    }}
  />
</View>
```

### Exemplo 2: Centralizar em Tela Completa

```tsx
<View
  style={{
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  }}
>
  <View
    style={{
      backgroundColor: 'rgba(59, 179, 181, 0.13)',
      width: 24,
      height: 24,
    }}
  />
</View>
```

### Exemplo 3: Centralizar com Design Tokens

```tsx
import { Tokens } from '@/theme/tokens';

<View
  style={{
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Tokens.spacing['4'],
  }}
>
  <View
    style={{
      backgroundColor: 'rgba(59, 179, 181, 0.13)',
      width: Tokens.iconSizes.md, // 24
      height: Tokens.iconSizes.md, // 24
      borderRadius: Tokens.radius.full,
    }}
  />
</View>;
```

## 🔑 Propriedades Chave

| Propriedade                | Eixo           | Descrição                                                                 |
| -------------------------- | -------------- | ------------------------------------------------------------------------- |
| `alignItems: 'center'`     | Horizontal (X) | Centraliza filhos no eixo cruzado (horizontal em flexDirection: 'row')    |
| `justifyContent: 'center'` | Vertical (Y)   | Centraliza filhos no eixo principal (vertical em flexDirection: 'column') |
| `alignSelf: 'center'`      | Horizontal     | Centraliza o próprio elemento (não os filhos)                             |
| `margin: 'auto'`           | Ambos          | Centraliza elemento (funciona melhor no web)                              |

## ⚠️ Observações Importantes

1. **Container precisa ter dimensões**: Para centralizar, o container precisa ter `width` e `height` definidos ou `flex: 1`
2. **flexDirection importa**:
   - `column` (padrão): `justifyContent` = vertical, `alignItems` = horizontal
   - `row`: `justifyContent` = horizontal, `alignItems` = vertical
3. **Web vs Native**: No web, `margin: 'auto'` também funciona, mas `alignItems` + `justifyContent` é mais confiável

## ✅ Solução Aplicada no EmojiContainer

```tsx
emojiContainer: {
  width: 24,
  height: 24,
  alignItems: 'center',      // ✅ Centraliza horizontalmente
  justifyContent: 'center',   // ✅ Centraliza verticalmente
  // Resultado: emoji perfeitamente centralizado
}
```
