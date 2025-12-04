# 🏗️ Arquitetura do Projeto

## Visão Geral

**Nossa Maternidade** é uma aplicação multiplataforma (Web e Mobile) construída com React/React Native, compartilhando código entre plataformas através de extensões de arquivo (`.tsx` para web, `.native.tsx` para mobile).

## Estrutura de Arquitetura

```
┌─────────────────────────────────────────────────────────┐
│                    CAMADA DE APRESENTAÇÃO                │
│  (Components - Web: .tsx | Mobile: .native.tsx)         │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│                    CAMADA DE CONTEXTO                    │
│  (AuthContext, ThemeContext, ConversationsContext)      │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│                    CAMADA DE HOOKS                        │
│  (useAppState, useTheme, useAnalytics, useConversations)│
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│                    CAMADA DE SERVIÇOS                     │
│  (geminiService, analytics, monitoring)                  │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│                    CAMADA DE UTILITÁRIOS                  │
│  (storage, logger, errorHandler, errorTracking)         │
└─────────────────────────────────────────────────────────┘
```

## Fluxo de Dados

### 1. Autenticação e Onboarding

```
Usuário → LoginView → AuthContext → Storage (AsyncStorage/LocalStorage)
                                    ↓
                              OnboardingView → AuthContext.completeOnboarding()
                                    ↓
                              HomeView (acesso liberado)
```

### 2. Conversas com NathIA

```
Usuário → NathIAView → useAppState → ConversationsContext
                              ↓
                    geminiService (API Gemini)
                              ↓
                    ConversationsContext (salva no storage)
                              ↓
                    NathIAView (exibe resposta)
```

### 3. Comunidade (Refúgio Nath)

```
Usuário → RefugioNathView → PostsContext
                    ↓
          geminiService (moderação por IA)
                    ↓
          PostsContext (salva posts aprovados)
                    ↓
          RefugioNathView (exibe posts)
```

## Decisões de Design

### 1. Compartilhamento de Código

**Decisão**: Usar extensões de arquivo (`.tsx` vs `.native.tsx`) ao invés de plataforma única.

**Razão**:

- Permite otimizações específicas por plataforma
- Mantém código limpo e separado
- Facilita manutenção

**Alternativas consideradas**: React Native Web (rejeitado por complexidade), Expo (adotado para mobile).

### 2. Gerenciamento de Estado

**Decisão**: Context API + Hooks ao invés de Redux.

**Razão**:

- Menos boilerplate
- Suficiente para o escopo do projeto
- Mais fácil de entender para novos desenvolvedores

**Estrutura**:

- `AuthContext`: Autenticação e onboarding
- `ThemeContext`: Tema claro/escuro
- `ConversationsContext`: Conversas com NathIA
- `PostsContext`: Posts da comunidade

### 3. Storage

**Decisão**: AsyncStorage (mobile) / LocalStorage (web) com wrapper unificado.

**Razão**:

- API similar entre plataformas
- Persistência local (LGPD compliant)
- Sem necessidade de backend para dados do usuário

**Implementação**: `utils/storage.ts` abstrai diferenças entre plataformas.

### 4. Lazy Loading

**Decisão**: React.lazy + Suspense para code splitting.

**Razão**:

- Reduz bundle inicial
- Melhora tempo de carregamento
- Especialmente importante em mobile

**Implementação**: `routes/lazyRoutes.native.tsx` organiza imports lazy.

### 5. Error Handling

**Decisão**: Error Boundaries + Error Tracking (Sentry opcional).

**Razão**:

- Previne crashes totais
- Permite tracking de erros em produção
- Fallback graceful

**Implementação**:

- `ErrorBoundary.native.tsx` para erros de renderização
- `utils/errorTracking.ts` para tracking (Sentry opcional)

### 6. Analytics e Monitoramento

**Decisão**: Firebase Analytics (opcional) + storage local como fallback.

**Razão**:

- Privacy-first (dados locais primeiro)
- Opção de enviar para Firebase se configurado
- LGPD compliant

**Implementação**:

- `services/analytics.ts` gerencia eventos
- `services/monitoring.ts` monitora performance
- `hooks/useAnalytics.ts` facilita uso em componentes

## Componentes Principais

### App.native.tsx / App.tsx

**Responsabilidade**:

- Gerenciar navegação entre views
- Inicializar contexts
- Gerenciar estado global da aplicação

**Dependências**:

- Contexts (Auth, Theme)
- Hooks (useAppState)
- Lazy routes

### Views

Cada view é um componente independente que:

- Usa hooks para acessar estado
- Usa contexts para dados globais
- Gerencia seu próprio estado local

**Exemplos**:

- `HomeView`: Tela inicial com check-in emocional
- `NathIAView`: Chat com assistente IA
- `RefugioNathView`: Comunidade (desabafos + mural)
- `HabitosView`: Rastreamento de hábitos

### Services

**geminiService.ts**:

- Integração com Google Gemini API
- Moderação de conteúdo
- Geração de respostas da NathIA
- Edição de imagens

**analytics.ts**:

- Tracking de eventos
- Funil de conversão
- Engajamento

**monitoring.ts**:

- Performance monitoring
- Tempo de carregamento
- Renderizações lentas

## Segurança

### 1. Validação

**Zod schemas** (`schemas/validation.ts`):

- Validação de inputs do usuário
- Validação de respostas da API
- Sanitização de dados

### 2. Rate Limiting

**utils/rateLimiter.ts**:

- Limita requisições à API
- Previne abuso
- Cliente-side (complementa server-side)

### 3. Permissões

**utils/permissions.ts**:

- Solicita permissões nativas (câmera, storage)
- Trata negações gracefully
- Feedback ao usuário

## Performance

### Otimizações Implementadas

1. **Lazy Loading**: Views carregadas sob demanda
2. **Memoização**: React.memo, useMemo, useCallback
3. **FlatList**: Virtualização de listas longas
4. **Image Caching**: expo-image com cache
5. **Code Splitting**: Chunks por feature

### Métricas Alvo

- Bundle inicial < 200KB (gzipped)
- Tempo de carregamento inicial < 2s
- 60 FPS em scroll
- Tempo de resposta da API < 500ms

## Testes

### Estrutura

```
__tests__/
├── hooks/
│   ├── useAppState.test.ts
│   └── useTheme.test.ts
├── services/
│   └── geminiService.test.ts
└── utils/
    ├── errorHandler.test.ts
    ├── logger.test.ts
    └── storage.test.ts
```

### Cobertura Alvo

- 70%+ de cobertura de código
- Todos os utilitários testados
- Hooks principais testados

## Próximos Passos

1. **Backend**: Migrar para backend próprio (atualmente apenas API Gemini)
2. **Real-time**: WebSockets para comunidade em tempo real
3. **Offline-first**: Service workers / Background sync
4. **Push Notifications**: Notificações de apoio e lembretes
