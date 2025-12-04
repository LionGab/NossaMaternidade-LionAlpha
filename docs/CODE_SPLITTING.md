# Code Splitting e Lazy Loading

## Visão Geral

Implementação de code splitting por feature para reduzir o bundle inicial e melhorar performance de carregamento.

## Estrutura

### Rotas Lazy (`routes/lazyRoutes.native.tsx`)

Rotas organizadas por feature com lazy loading:

- **Auth**: LoginView, SignUpView, OnboardingView
- **Home & Core**: HomeView, SplashScreen
- **Chat (NathIA)**: NathIAView, NathIAHistoryView
- **Community**: MundoNathView, RefugioNathView
- **Wellness**: HabitosView, RespirarView
- **Tools**: ImageEditView

### Preloader Inteligente (`utils/preloader.native.ts`)

Sistema de preloading baseado em contexto do usuário:

- `preloadPostLogin()`: Preload após login bem-sucedido
- `preloadPostOnboarding()`: Preload após onboarding completo
- `preloadFromHome()`: Preload quando usuário está na Home
- `preloadFromNathIA()`: Preload quando usuário acessa NathIA

### Error Boundaries

- **ErrorBoundary**: Error boundary geral do app
- **ChunkErrorBoundary**: Error boundary específico para chunks lazy loaded
  - Detecta erros de carregamento de módulos
  - Retry automático com backoff exponencial
  - Limite de 3 tentativas

### LoadingFallback (`components/LoadingFallback.native.tsx`)

Componente otimizado de loading que:

- Não depende de context (evita circular dependencies)
- Leve e rápido
- Suporta tema dark/light

## Como Funciona

1. **Carregamento Inicial**: Apenas código crítico é carregado
2. **Preloading**: Chunks prováveis são carregados em background
3. **Lazy Loading**: Componentes são carregados sob demanda
4. **Error Handling**: ChunkErrorBoundary trata erros de carregamento

## Métricas Alvo

- Bundle inicial < 200KB (gzipped)
- Tempo de carregamento inicial < 2s
- Chunks carregados sob demanda
- Sem impacto na UX

## Uso

### Adicionar Nova Rota Lazy

```typescript
// routes/lazyRoutes.native.tsx
export const NovaView = lazy(() => import('../components/NovaView.native'));
```

### Usar no App

```typescript
import { NovaView } from './routes/lazyRoutes.native';

// No renderView
<Suspense fallback={<LoadingFallback theme={theme} />}>
  <ChunkErrorBoundary theme={theme}>
    <NovaView />
  </ChunkErrorBoundary>
</Suspense>
```

### Adicionar Preload

```typescript
// utils/preloader.native.ts
export const preloadNovaFeature = async () => {
  if (preloadCache.has('novaFeature')) return;
  await import('../components/NovaView.native');
  preloadCache.add('novaFeature');
};
```

## Otimizações

- **Dynamic Imports**: Serviços pesados (ex: geminiService) são carregados sob demanda
- **Tree Shaking**: Imports otimizados para remover código não utilizado
- **Chunk Caching**: Preloads são cacheados para evitar carregamentos duplicados

## Troubleshooting

### Chunk Load Error

Se ocorrer erro de carregamento de chunk:

1. Verificar conexão de rede
2. ChunkErrorBoundary tentará retry automático
3. Se persistir, usuário pode tentar novamente manualmente

### Bundle Size

Para verificar tamanho do bundle:

```bash
# React Native
npx react-native-bundle-visualizer

# Expo
expo export --dump-sourcemap
```

## Checklist de Validação

- [x] Lazy loading implementado
- [x] Bundle size reduzido
- [x] Preloading funciona
- [x] Error boundaries configurados
- [x] Performance não degradou
- [ ] Testado em iOS e Android
