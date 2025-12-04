# Instruções para Adicionar a Foto do Avatar

## Foto: Nathália Valente (Avatar Principal)

**Descrição da foto:**

- Mulher sorrindo
- Cabelo castanho longo e ondulado
- Camisa vermelha sem mangas (sleeveless)
- Choker preto com pérolas brancas
- Brincos dourados (hoop earrings)
- Tatuagem de rosa no braço esquerdo
- Estilo cartoon/ilustração
- Fundo bege/claro

**Onde usar:**

- MãesValentes (ChatScreen) - Header e mensagens
- Avatar no canto superior direito em várias telas

**Como adicionar:**

1. Salve a imagem como `nath-avatar-red-shirt.png` na pasta `src/assets/images/`

2. Atualize o arquivo `src/assets/images/index.ts`:

```typescript
export const nathAvatar = require('./nath-avatar-red-shirt.png');
```

**Tamanhos recomendados:**

- Para avatar pequeno (24-48px): 96x96px (@2x) ou 144x144px (@3x)
- Para avatar grande (120px+): 240x240px (@2x) ou 360x360px (@3x)
- Formato: PNG com fundo transparente (preferível) ou JPG

**Nota:** A imagem atual está usando um placeholder. Substitua pela foto real seguindo as instruções acima.
