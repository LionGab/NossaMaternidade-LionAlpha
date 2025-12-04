# 🚀 Guia de Otimização de Performance - Nossa Maternidade

## 📊 Status Atual

### ✅ Já Implementado

- FlashList em ChatScreen e FeedScreen
- React.memo em alguns componentes (MessageBubble, PostCard)
- useCallback e useMemo em várias telas
- expo-image com cache básico
- TanStack Query configurado

### ⚠️ Oportunidades de Melhoria

- Lazy loading de telas não implementado
- QueryProvider com configuração básica
- Falta estimatedItemSize em FlashLists
- Imagens sem otimização avançada (blurhash, placeholders)
- Sem métricas de performance
- Algumas telas ainda usam FlatList padrão

---

## 🎯 Plano de Otimização (Priorizado)

### 1. **QueryProvider Avançado** (Impacto: Alto ⭐⭐⭐)

**Problema:** Cache básico, sem persistência offline, sem estratégias por tipo de dado.

**Solução:**

```typescript
// src/contexts/QueryProvider.tsx
import {
  QueryClient,
  QueryClientProvider,
  focusManager,
} from "@tanstack/react-query";
import { onlineManager } from "@tanstack/react-query";
import NetInfo from "@react-native-community/netinfo";
import { AppState, Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";

// Persister para cache offline
const asyncStoragePersister = createAsyncStoragePersister({
  storage: AsyncStorage,
  throttleTime: 1000, // Debounce writes
});

// QueryClient otimizado
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Cache por tipo de dado
      staleTime: {
        // Dados estáticos (conteúdo educativo) - 30 min
        content: 30 * 60 * 1000,
        // Dados dinâmicos (chat) - 0 (sempre fresh)
        chat: 0,
        // Perfil - 5 min
        profile: 5 * 60 * 1000,
        // Feed - 2 min
        feed: 2 * 60 * 1000,
        // Default - 5 min
        default: 5 * 60 * 1000,
      },
      gcTime: 24 * 60 * 60 * 1000, // 24h
      retry: (failureCount, error) => {
        // Não retry em erros 4xx (client errors)
        if (error instanceof Error && "status" in error) {
          const status = (error as any).status;
          if (status >= 400 && status < 500) return false;
        }
        return failureCount < 3;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      refetchOnWindowFocus: false, // Mobile não tem "window focus"
      refetchOnReconnect: true,
      refetchOnMount: true,
      // Network mode: offline-first
      networkMode: "offlineFirst",
    },
    mutations: {
      retry: 1,
      networkMode: "offlineFirst",
    },
  },
});

// Setup network listener
onlineManager.setEventListener((setOnline) => {
  return NetInfo.addEventListener((state) => {
    setOnline(state.isConnected ?? false);
  });
});

// Setup app state listener (para refetch quando app volta ao foreground)
if (Platform.OS !== "web") {
  AppState.addEventListener("change", (status) => {
    focusManager.setFocused(status === "active");
  });
}

export function QueryProvider({ children }: { children: React.ReactNode }) {
  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        persister: asyncStoragePersister,
        maxAge: 24 * 60 * 60 * 1000, // 24h
        dehydrateOptions: {
          shouldDehydrateQuery: (query) => {
            // Persistir apenas queries importantes
            const queryKey = query.queryKey[0] as string;
            return ["profile", "content", "feed"].includes(queryKey);
          },
        },
      }}
    >
      {children}
    </PersistQueryClientProvider>
  );
}
```

**Dependências necessárias:**

```bash
npm install @tanstack/react-query-persist-client @tanstack/query-async-storage-persister @react-native-community/netinfo
```

---

### 2. **Lazy Loading de Telas** (Impacto: Alto ⭐⭐⭐)

**Problema:** Todas as telas são carregadas no bundle inicial, aumentando tempo de startup.

**Solução:**

```typescript
// src/navigation/LazyScreens.tsx
import React, { Suspense, lazy } from "react";
import { View, ActivityIndicator } from "react-native";
import { Tokens } from "@/theme/tokens";

// Loading fallback
const ScreenLoader = () => (
  <View
    style={{
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: Tokens.colors.background.canvas,
    }}
  >
    <ActivityIndicator size="large" color={Tokens.colors.primary.main} />
  </View>
);

// Lazy load telas não-críticas
export const ChatScreen = lazy(() => import("@/screens/ChatScreen"));
export const FeedScreen = lazy(() => import("@/screens/FeedScreen"));
export const HabitsScreen = lazy(() => import("@/screens/HabitsScreen"));
export const ProfileScreen = lazy(() => import("@/screens/ProfileScreen"));
export const CommunityScreen = lazy(() => import("@/screens/CommunityScreen"));

// Wrapper com Suspense
export const LazyScreen = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={<ScreenLoader />}>{children}</Suspense>
);

// Uso no navigator:
// import { ChatScreen, LazyScreen } from '@/navigation/LazyScreens';
// <Stack.Screen name="Chat">
//   {() => <LazyScreen><ChatScreen /></LazyScreen>}
// </Stack.Screen>
```

**Impacto esperado:** Redução de 30-40% no bundle inicial.

---

### 3. **FlashList Otimizado** (Impacto: Médio ⭐⭐)

**Problema:** FlashLists sem `estimatedItemSize`, causando layout shifts.

**Solução:**

```typescript
// src/screens/FeedScreen.tsx (exemplo)
<FlashList
  data={filteredPosts}
  renderItem={renderPost}
  keyExtractor={(item) => item.id}
  // ✅ Otimizações críticas
  estimatedItemSize={280} // Altura aproximada do PostCard
  removeClippedSubviews={true}
  drawDistance={500} // Renderizar 500px antes de aparecer
  // ✅ Performance
  overrideItemLayout={(layout, item) => {
    // Se você souber altura exata, pode otimizar mais
    // layout.size = 280; // altura fixa
  }}
  // ✅ Memória
  maxToRenderPerBatch={10}
  windowSize={5}
  initialNumToRender={10}
  // ✅ Acessibilidade
  accessibilityRole="list"
  accessibilityLabel={`Lista de posts. ${filteredPosts.length} posts`}
/>
```

**Aplicar em:**

- FeedScreen ✅ (já tem FlashList, falta estimatedItemSize)
- ChatScreen ✅ (já tem FlashList, falta estimatedItemSize)
- HabitsScreen (converter de FlatList para FlashList)
- CommunityScreen (se existir lista)

---

### 4. **Otimização de Imagens** (Impacto: Médio ⭐⭐)

**Problema:** Imagens sem blurhash, sem cachePolicy otimizado, sem lazy loading.

**Solução:**

```typescript
// src/components/OptimizedImage.tsx
import { Image, ImageProps } from "expo-image";
import { useMemo } from "react";
import { Blurhash } from "expo-blurhash";

interface OptimizedImageProps extends Omit<ImageProps, "source"> {
  uri: string;
  blurhash?: string; // Gerar com: https://blurha.sh/
  priority?: "low" | "normal" | "high";
  aspectRatio?: number;
}

export const OptimizedImage = ({
  uri,
  blurhash,
  priority = "normal",
  aspectRatio,
  style,
  ...props
}: OptimizedImageProps) => {
  const cachePolicy = useMemo(() => {
    // Cache agressivo para imagens estáticas
    if (uri.includes("static") || uri.includes("avatar")) {
      return "memory-disk";
    }
    // Cache moderado para conteúdo dinâmico
    return "memory";
  }, [uri]);

  return (
    <Image
      source={{ uri }}
      style={[aspectRatio && { aspectRatio }, style]}
      contentFit="cover"
      transition={200}
      cachePolicy={cachePolicy}
      priority={priority}
      placeholder={
        blurhash ? <Blurhash hash={blurhash} style={{ flex: 1 }} /> : undefined
      }
      recyclingKey={uri} // Reutilizar views de imagem
      {...props}
    />
  );
};

// Uso:
// <OptimizedImage
//   uri={item.thumbnailUrl}
//   blurhash="LKO2?U%2Tw=w]~RBVZRi};RPxuwH"
//   priority="high"
//   aspectRatio={16/9}
// />
```

**Dependências:**

```bash
npm install expo-blurhash
```

---

### 5. **Métricas de Performance** (Impacto: Baixo-Médio ⭐)

**Problema:** Sem visibilidade de performance em produção.

**Solução:**

```typescript
// src/hooks/usePerformanceMonitor.ts
import { useEffect, useRef } from 'react';
import { InteractionManager } from 'react-native';
import { logger } from '@/utils/logger';

interface PerformanceMetrics {
  screenName: string;
  timeToInteractive: number;
  renderCount: number;
  avgRenderTime: number;
}

export const usePerformanceMonitor = (screenName: string) => {
  const startTime = useRef(Date.now());
  const renderCount = useRef(0);
  const renderTimes = useRef<number[]>([]);

  useEffect(() => {
    // Medir Time to Interactive (TTI)
    InteractionManager.runAfterInteractions(() => {
      const tti = Date.now() - startTime.current;
      logger.info(`[Performance] ${screenName} - TTI: ${tti}ms`);

      // Enviar para analytics (opcional)
      // analytics.track('screen_tti', { screen: screenName, tti });
    });

    // Medir re-renders
    return () => {
      const avgRenderTime =
        renderTimes.current.length > 0
          ? renderTimes.current.reduce((a, b) => a + b, 0) / renderTimes.current.length
          : 0;

      logger.info(
        `[Performance] ${screenName} - Renders: ${
          renderCount.current
        }, Avg: ${avgRenderTime.toFixed(2)}ms`
      );
    };
  }, [screenName]);

  // Hook para medir render time
  const measureRender = (fn: () => void) => {
    const renderStart = performance.now();
    fn();
    const renderTime = performance.now() - renderStart;
    renderCount.current++;
    renderTimes.current.push(renderTime);
  };

  return { measureRender };
};

// Uso:
// const { measureRender } = usePerformanceMonitor('FeedScreen');
// measureRender(() => {
//   // código que quer medir
// });
```

---

### 6. **Memoização Avançada** (Impacto: Médio ⭐⭐)

**Problema:** Alguns componentes ainda não estão memoizados.

**Checklist:**

- [ ] PostCard (FeedScreen) - ✅ Já memoizado
- [ ] MessageBubble (ChatScreen) - ✅ Já memoizado
- [ ] ContentCard - ⚠️ Verificar se está memoizado
- [ ] HabitCard (HabitsScreen) - ❌ Adicionar memo
- [ ] CommentCard (CommunityScreen) - ❌ Adicionar memo

**Padrão:**

```typescript
// ✅ CORRETO
const HabitCard = React.memo(
  ({ item, onPress }: HabitCardProps) => {
    // ...
  },
  (prevProps, nextProps) => {
    // Comparação customizada (opcional, mas recomendado)
    return (
      prevProps.item.id === nextProps.item.id &&
      prevProps.item.completed === nextProps.item.completed
    );
  }
);
```

---

### 7. **Code Splitting de Bibliotecas** (Impacto: Baixo ⭐)

**Problema:** Bibliotecas grandes carregadas no bundle inicial.

**Solução:**

```typescript
// ✅ Importações dinâmicas
const HeavyLibrary = lazy(() => import('heavy-library'));

// ✅ Tree-shaking de lodash
import debounce from 'lodash/debounce'; // ✅
// import _ from 'lodash'; // ❌

// ✅ Icon libraries
import { Heart } from 'lucide-react-native'; // ✅ Tree-shakeable
```

---

## 📈 Métricas Alvo

| Métrica                 | Atual (Estimado) | Meta   | Como Medir                   |
| ----------------------- | ---------------- | ------ | ---------------------------- |
| **Bundle Size**         | ~5-8MB           | <4MB   | `npx expo-bundle-visualizer` |
| **Time to Interactive** | ~2-3s            | <1.5s  | `usePerformanceMonitor`      |
| **FPS (Scroll)**        | 50-55            | 60     | React DevTools Profiler      |
| **Memory Usage**        | ~150MB           | <100MB | React DevTools               |
| **Cache Hit Rate**      | ~40%             | >70%   | TanStack Query DevTools      |

---

## 🛠️ Scripts de Validação

```bash
# Analisar bundle
npm run analyze:bundle

# Verificar performance
npm run perf:check

# Validar otimizações
npm run validate:performance
```

---

## ✅ Checklist de Implementação

### Fase 1: Quick Wins (1-2 dias)

- [ ] Otimizar QueryProvider com persistência
- [ ] Adicionar estimatedItemSize em FlashLists
- [ ] Memoizar componentes de lista restantes

### Fase 2: Médio Prazo (3-5 dias)

- [ ] Implementar lazy loading de telas
- [ ] Criar OptimizedImage component
- [ ] Adicionar usePerformanceMonitor

### Fase 3: Longo Prazo (1-2 semanas)

- [ ] Implementar métricas em produção
- [ ] Otimizar bundle size (code splitting)
- [ ] A/B testing de otimizações

---

## 📚 Referências

- [React Native Performance](https://reactnative.dev/docs/performance)
- [FlashList Docs](https://shopify.github.io/flash-list/)
- [TanStack Query Best Practices](https://tanstack.com/query/latest/docs/react/guides/performance)
- [Expo Image Optimization](https://docs.expo.dev/versions/latest/sdk/image/)
