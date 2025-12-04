# Assets - Imagens

## Imagens Principais do App

Todas as imagens estão configuradas em `index.ts`.

### Como adicionar as imagens reais:

1. **Adicione as imagens** na pasta `src/assets/images/`:
   - `nath-avatar-red-shirt.png` - Avatar Nathália (camisa vermelha)
   - `mundo-nath.png` - Mundo Nath (mãe com bebê e decorações)
   - `refugio-nath.png` - Refúgio Nath (mãe com bebê e cachorro)
   - `logo-principal.png` - Logo principal (mãe segurando bebê dormindo)

2. **Atualize o arquivo** `index.ts`:

```typescript
export const nathAvatar = require('./nath-avatar-red-shirt.png');
export const mundoNath = require('./mundo-nath.png');
export const refugioNath = require('./refugio-nath.png');
export const logoPrincipal = require('./logo-principal.png');
```

---

## Descrição das Imagens

### 1. NathAvatar (nath-avatar-red-shirt.png)

**Usada em:** MãesValentes (ChatScreen), Avatar no canto superior direito

- Mulher jovem sorrindo
- Camisa vermelha sem mangas
- Cabelo castanho longo e ondulado
- Óculos
- Choker preto com pérolas
- Brincos dourados
- Tatuagem de rosa no braço
- Estilo cartoon/ilustração

### 2. Mundo Nath (mundo-nath.png)

**Usada em:** Home/MundoNath

- Mãe segurando bebê recém-nascido
- Decorações: balões dourados, flores brancas, mesas, malas
- Ambiente acolhedor e celebratório
- Estilo cartoon com tons quentes

### 3. Refúgio Nath (refugio-nath.png)

**Usada em:** RefúgioNath (nova tab)

- Mãe segurando bebê
- Cachorro branco com moletom azul ao lado
- Ambiente íntimo e seguro
- Estilo cartoon acolhedor

### 4. Logo Principal (logo-principal.png)

**Usada em:** SplashScreen, Logo principal do app, Componente Logo

- Mãe segurando bebê dormindo
- Momento íntimo e carinhoso
- Mãe de olhos fechados, sorrindo
- Bebê dormindo profundamente
- Estilo cartoon suave e acolhedor
- **Descrição detalhada:**
  - Mãe com pele tom claro/quente, cabelo castanho escuro longo e ondulado
  - Olhos fechados, sorriso suave, lábios vermelhos suaves
  - Vestindo camisola preta com renda delicada (padrão floral/folhas)
  - Bebê com pele tom médio, cabelo escuro curto
  - Bebê usando macacão branco com padrões circulares azuis claros
  - Fundo bege/quente suave, ambiente aconchegante
  - Composição close-up enfatizando o vínculo mãe-bebê
