# Guia de Assets - Nossa Maternidade

## Localização das Imagens do Projeto

Este documento mapeia as imagens fornecidas pelo usuário e suas localizações ideais no app.

---

## 1. Logo Principal (Home)

**Imagem:** `https://i.imgur.com/jzb0IgO.jpg`

**Uso:** Logo principal do app

**Localizações sugeridas:**

### a) SplashScreen

```typescript
// src/screens/SplashScreen.tsx
<Image
  source={{ uri: 'https://i.imgur.com/jzb0IgO.jpg' }}
  style={styles.logo}
  contentFit="contain"
/>
```

### b) Header da HomeScreen

```typescript
// src/screens/HomeScreen.tsx
<Box direction="row" align="center" justify="space-between" p="4">
  <Image
    source={{ uri: 'https://i.imgur.com/jzb0IgO.jpg' }}
    style={{ width: 120, height: 40 }}
    contentFit="contain"
  />
</Box>
```

### c) AuthScreen (Login/Cadastro)

```typescript
// src/screens/auth/LoginScreen.tsx
<Box align="center" mb="6">
  <Image
    source={{ uri: 'https://i.imgur.com/jzb0IgO.jpg' }}
    style={{ width: 180, height: 60 }}
    contentFit="contain"
  />
</Box>
```

---

## 2. MãesValente

**Imagem:** `https://i.imgur.com/I86r5G5.jpg`

**Uso:** Seção de comunidade e apoio entre mães

**Localizações sugeridas:**

### a) CommunityScreen Header

```typescript
// src/screens/CommunityScreen.tsx
<Box style={styles.communityHeader}>
  <Image
    source={{ uri: 'https://i.imgur.com/I86r5G5.jpg' }}
    style={{
      width: '100%',
      height: 200,
      borderRadius: Tokens.radius.xl,
    }}
    contentFit="cover"
  />
  <LinearGradient
    colors={['transparent', 'rgba(0,0,0,0.7)']}
    style={styles.headerGradient}
  >
    <Heading level="h1" color="inverse">
      Mães Valentes
    </Heading>
    <Text color="inverse" size="md">
      Juntas somos mais fortes 💪
    </Text>
  </LinearGradient>
</Box>
```

### b) HomeScreen Card "Comunidade"

```typescript
// src/components/home/CommunityCard.tsx
<TouchableOpacity
  onPress={() => navigation.navigate('Community')}
  style={styles.communityCard}
>
  <Image
    source={{ uri: 'https://i.imgur.com/I86r5G5.jpg' }}
    style={styles.cardImage}
  />
  <Box p="4">
    <Heading level="h3">Mães Valentes</Heading>
    <Text color="secondary">Conecte-se com outras mães</Text>
  </Box>
</TouchableOpacity>
```

---

## 3. MundoNath

**Imagem:** `https://i.imgur.com/5TMe7xW.jpg`

**Uso:** Seção de conteúdos exclusivos da NathIA

**Localizações sugeridas:**

### a) ContentScreen Header

```typescript
// src/screens/ContentScreen.tsx
<Box style={styles.contentHeader}>
  <Image
    source={{ uri: 'https://i.imgur.com/5TMe7xW.jpg' }}
    style={{
      width: '100%',
      height: 250,
      borderRadius: Tokens.radius['2xl'],
    }}
    contentFit="cover"
  />
  <Box style={styles.headerOverlay} p="6">
    <Badge variant="primary" size="sm">
      Conteúdo Exclusivo
    </Badge>
    <Heading level="h1" color="inverse" mt="2">
      Mundo Nath
    </Heading>
    <Text color="inverse" size="md">
      Aprenda, cresça e se conecte
    </Text>
  </Box>
</Box>
```

### b) HomeScreen "Conteúdos Recomendados"

```typescript
// src/components/home/ExclusiveContentCard.tsx
<Box style={styles.nathWorldCard}>
  <Image
    source={{ uri: 'https://i.imgur.com/5TMe7xW.jpg' }}
    style={{
      width: '100%',
      height: 180,
      borderTopLeftRadius: Tokens.radius.xl,
      borderTopRightRadius: Tokens.radius.xl,
    }}
  />
  <Box p="4">
    <Heading level="h3">Mundo Nath</Heading>
    <Text color="secondary" size="sm">
      Conteúdos especiais para você
    </Text>
  </Box>
</Box>
```

---

## 4. NathIA Chat Design (Referência)

**Imagem:** `https://i.imgur.com/7KFoU0F.jpg`

**Uso:** Referência de design para a interface do chat

**Já implementado em:**

- `src/screens/ChatScreenRefactored.tsx`
- `src/components/primitives/ChatBubble.tsx`
- `src/components/molecules/ChatHeader.tsx`
- `src/components/organisms/ChatEmptyState.tsx`

**Características aplicadas:**

- Avatar com breathing effect
- Gradient header suave (cyan warm)
- Input arredondado com botão circular
- Bubbles com contraste WCAG AAA
- Tokens centralizados

---

## 5. Adicional

**Imagem:** `https://i.imgur.com/JoxFimc.jpg`

**Uso:** Versátil - pode ser usado em múltiplos locais

**Sugestões:**

### a) EmptyState genérico

```typescript
// src/components/EmptyState.tsx
<Box align="center" justify="center" p="8">
  <Image
    source={{ uri: 'https://i.imgur.com/JoxFimc.jpg' }}
    style={{ width: 200, height: 200 }}
    contentFit="contain"
  />
  <Text color="secondary" align="center" mt="4">
    {emptyMessage}
  </Text>
</Box>
```

### b) Onboarding Screen

```typescript
// src/screens/onboarding/OnboardingStep2.tsx
<Box align="center">
  <Image
    source={{ uri: 'https://i.imgur.com/JoxFimc.jpg' }}
    style={{ width: 280, height: 280 }}
    contentFit="contain"
  />
  <Heading level="h2" align="center" mt="6">
    Bem-vinda ao Nossa Maternidade
  </Heading>
</Box>
```

### c) ProfileScreen Header

```typescript
// src/screens/ProfileScreen.tsx
<Box style={styles.profileBanner}>
  <Image
    source={{ uri: 'https://i.imgur.com/JoxFimc.jpg' }}
    style={{
      width: '100%',
      height: 150,
      opacity: 0.3,
    }}
    contentFit="cover"
  />
</Box>
```

---

## Estrutura de Assets Recomendada

```
assets/
├── images/
│   ├── logo/
│   │   └── home-logo.jpg (jzb0IgO)
│   ├── community/
│   │   └── maes-valente.jpg (I86r5G5)
│   ├── content/
│   │   └── mundo-nath.jpg (5TMe7xW)
│   └── general/
│       └── illustration.jpg (JoxFimc)
└── nathia/
    └── avatar.jpg (oB9ewPG - já em uso)
```

---

## Como Baixar e Integrar

### 1. Baixar imagens localmente (opcional):

```bash
# Criar estrutura de pastas
mkdir -p assets/images/{logo,community,content,general}

# Baixar imagens (usando curl ou wget)
curl -o assets/images/logo/home-logo.jpg https://i.imgur.com/jzb0IgO.jpg
curl -o assets/images/community/maes-valente.jpg https://i.imgur.com/I86r5G5.jpg
curl -o assets/images/content/mundo-nath.jpg https://i.imgur.com/5TMe7xW.jpg
curl -o assets/images/general/illustration.jpg https://i.imgur.com/JoxFimc.jpg
```

### 2. Usar nos componentes:

```typescript
// Opção 1: URL remota (já funciona)
<Image source={{ uri: 'https://i.imgur.com/jzb0IgO.jpg' }} />

// Opção 2: Asset local (após download)
<Image source={require('@/assets/images/logo/home-logo.jpg')} />
```

---

## Otimizações de Performance

### 1. Usar expo-image (já configurado):

```typescript
import { Image } from 'expo-image';

<Image
  source={{ uri: 'https://...' }}
  contentFit="cover"
  transition={300}
  cachePolicy="memory-disk" // Cache automático
/>
```

### 2. Placeholder enquanto carrega:

```typescript
<Image
  source={{ uri: 'https://...' }}
  placeholder={require('@/assets/placeholder.png')}
  transition={300}
/>
```

### 3. Responsividade:

```typescript
const { width } = Dimensions.get('window');

<Image
  source={{ uri: 'https://...' }}
  style={{
    width: width - Tokens.spacing['8'],
    height: (width - Tokens.spacing['8']) * 0.6, // Aspect ratio 16:10
  }}
/>
```

---

## Checklist de Implementação

- [ ] Baixar imagens para `assets/images/` (opcional)
- [ ] Adicionar logo principal em SplashScreen
- [ ] Adicionar logo no header da HomeScreen
- [ ] Criar CommunityCard com imagem "Mães Valente"
- [ ] Criar ContentCard com imagem "Mundo Nath"
- [ ] Usar imagem adicional em EmptyState ou Onboarding
- [ ] Testar carregamento e cache das imagens
- [ ] Validar acessibilidade (alt text)

---

## Acessibilidade

Sempre adicionar `accessibilityLabel` descritivo:

```typescript
<Image
  source={{ uri: 'https://...' }}
  accessibilityLabel="Logo Nossa Maternidade - Uma mãe abraçando seu bebê"
  accessibilityRole="image"
/>
```

---

## Próximos Passos

1. Implementar os componentes sugeridos
2. Testar em diferentes tamanhos de tela
3. Otimizar tamanhos das imagens (se necessário)
4. Adicionar fallback para erro de carregamento

---

_Última atualização: 2 de dezembro de 2025_
