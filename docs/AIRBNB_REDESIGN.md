# 🏠 Airbnb Redesign - Nossa Maternidade

## 📋 Visão Geral

Este documento descreve o redesign do app Nossa Maternidade inspirado no estilo Airbnb, mudando a cor primária de rosa para azul e melhorando a experiência visual.

## 🎨 Mudanças de Design

### Cores

#### Antes (Rosa)

- Primary: `#FF7A96` (Rosa Nathália)
- Background: `#F1F5F9` (Cloud)

#### Depois (Azul)

- Primary: `#007AFF` (iOS System Blue)
- Background: `#FAF7F5` (Bege claro - Airbnb style)

### Componentes Novos

1. **SearchBarPill** - Barra de busca estilo pill
2. **CategoryTabs** - Tabs horizontais com ícones
3. **ListingCard** - Card estilo Airbnb com rating e favoritos
4. **HorizontalCardList** - Carrossel horizontal
5. **ImageGrid** - Grid 2x2 para experiências

## 🚀 Implementação

### Fase 0: Preparação ✅

- [x] Criar branch `feature/airbnb-redesign`
- [x] Adicionar feature flags (`src/constants/featureFlags.ts`)
- [x] Atualizar tokens com cores azuis (mantendo rosa como fallback)
- [x] Criar script de migração (`scripts/migrate-colors.js`)

### Fase 1: Foundation ✅

- [x] Atualizar `tokens.ts` com cores azuis
- [x] Criar `SearchBarPill` component
- [x] Criar `CategoryTabs` component
- [x] Criar `ListingCard` component
- [x] Criar `HorizontalCardList` component
- [x] Criar `ImageGrid` component

### Fase 2: HomeScreen (Pendente)

- [ ] Adicionar `SearchBarPill` no topo
- [ ] Adicionar `CategoryTabs` (5 tabs)
- [ ] Seção "Vistos recentemente" com `HorizontalCardList`
- [ ] Seção "Para Você" com `ListingCard` vertical
- [ ] Background bege claro

### Fase 3: CommunityScreen (Pendente)

- [ ] Remover avatar grande do header
- [ ] Adicionar `SearchBarPill`
- [ ] Mudar filtros para `CategoryTabs`
- [ ] Trocar ScrollView por FlatList
- [ ] Redesenhar PostCard
- [ ] Adicionar carrossel de histórias

### Fase 4: MundoNathScreen (Pendente)

- [ ] Grid de conteúdo estilo Experiências
- [ ] Filtros horizontais
- [ ] Cards com `ImageGrid` 2x2
- [ ] Badge "Original"

### Fase 5: Demais Telas (Pendente)

- [ ] HabitsScreen
- [ ] ChatScreen

## 🔧 Feature Flags

```typescript
// src/constants/featureFlags.ts

export const USE_BLUE_THEME = false; // Ativar quando redesign estiver completo
export const USE_BEIGE_BACKGROUND = false;
export const USE_AIRBNB_COMPONENTS = false;
```

## 📝 Migração de Cores

### Script de Migração

```bash
# Preview das mudanças
node scripts/migrate-colors.js --dry-run

# Aplicar mudanças
node scripts/migrate-colors.js --apply
```

### Mapeamento de Cores

| Antes (Rosa)   | Depois (Azul)                  |
| -------------- | ------------------------------ |
| `#FF7A96`      | `#007AFF`                      |
| `primary[400]` | `primary[500]`                 |
| `primary.main` | `primary.main` (já atualizado) |

## 🎯 Componentes Criados

### SearchBarPill

```tsx
<SearchBarPill
  placeholder="Onde você quer ir?"
  onPress={() => navigation.navigate('Search')}
  size="md"
/>
```

### CategoryTabs

```tsx
<CategoryTabs
  tabs={[
    { id: 'all', label: 'Todos', icon: Home },
    { id: 'content', label: 'Conteúdo', icon: Video, badge: 'NEW' },
  ]}
  activeTab="all"
  onTabChange={(id) => setActiveTab(id)}
/>
```

### ListingCard

```tsx
<ListingCard
  id="1"
  image="https://..."
  title="Apartamento aconchegante"
  subtitle="São Paulo, Brasil"
  rating={4.8}
  reviews={127}
  price={150}
  isFavorite={false}
  onPress={() => {}}
  onFavoritePress={() => {}}
/>
```

### HorizontalCardList

```tsx
<HorizontalCardList
  title="Vistos recentemente"
  data={listings}
  renderItem={(item) => <ListingCard {...item} />}
  onSeeAll={() => navigation.navigate('AllListings')}
/>
```

### ImageGrid

```tsx
<ImageGrid
  images={['https://...', 'https://...', 'https://...', 'https://...']}
  badge="Original"
  onPress={() => {}}
/>
```

## 📊 Status

- ✅ Fase 0: Preparação - **COMPLETA**
- ✅ Fase 1: Foundation - **COMPLETA**
- ⏳ Fase 2: HomeScreen - **PENDENTE**
- ⏳ Fase 3: CommunityScreen - **PENDENTE**
- ⏳ Fase 4: MundoNathScreen - **PENDENTE**
- ⏳ Fase 5: Demais Telas - **PENDENTE**

## 🔗 Referências

- [Airbnb Design System](https://airbnb.design/)
- [iOS Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/)
- [Material Design 3](https://m3.material.io/)

## 📝 Notas

- Cores rosa mantidas como `primaryPink` para compatibilidade
- Feature flags permitem rollback fácil
- Script de migração ajuda na transição gradual
- Todos os componentes seguem WCAG AAA para acessibilidade
