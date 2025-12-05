# Nossa Maternidade - App de Comunidade Materna

> **Contexto para Agentes IA (Claude Code, Cursor AI)**

## 📱 Sobre o Projeto

**Nossa Maternidade** é um aplicativo mobile React Native + Expo para mães brasileiras, focado em:
- 🤖 Apoio emocional com IA amigável (NathIA)
- 💬 Comunidade de mães (MãesValentes)
- 📚 Conteúdo personalizado (MundoNath)
- 📊 Tracking de hábitos e bem-estar
- 🎯 Autocuidado e desenvolvimento pessoal

**Público-Alvo:** Mães 18-45 anos, classes C-D, Brasil (LGPD compliance obrigatório)

## 🛠️ Stack Técnica

### Frontend
- **React Native** 0.81+ + **Expo SDK 54+**
- **TypeScript** strict mode (zero `any`)
- **UI**: NativeWind (Tailwind para RN) + primitives em `src/components/primitives/`
- **Design System**: Tokens centralizados em `src/theme/tokens.ts`
- **Navegação**: React Navigation v7 (Stack + Tabs)

### State & Data
- **React Query** (TanStack Query) para fetching/cache
- **Zustand** opcional para state complexo
- **Context + reducers** para state global quando necessário

### Backend
- **Supabase** (Auth, DB PostgreSQL, Storage, Realtime)
- **RLS policies** obrigatórias (LGPD compliance)
- **Edge Functions** (Deno) para orquestração IA

### IA Multi-Provider
- **Roteamento inteligente** via `src/agents/helpers/llmRouter.ts`
- **Primary**: Gemini 2.5 Flash (chat default)
- **Fallback**: GPT-4o (crise emocional), Claude Opus (análise profunda)
- **Agentes especializados**: MaternalChatAgent, ContentRecommendationAgent, HabitsAnalysisAgent

### Arquitetura MCP
- **MCP Servers**: Supabase, Context7, Brave Search, GitHub, etc.
- **Dynamic MCP Gateway**: Docker-based para discovery de tools
- **Agent Orchestrator**: Singleton para gerenciar agentes e MCPs

## 🎯 Regras de Ouro

### Segurança
- ❌ **NUNCA** expor `service_role_key` no app
- ✅ **SEMPRE** usar RLS policies no Supabase
- ✅ **SEMPRE** sanitizar inputs (prevenção XSS)
- ✅ Dados sensíveis em `expo-secure-store`

### Código
- ❌ **NUNCA** usar `console.log` (usar `logger` de `@/utils/logger`)
- ❌ **NUNCA** valores hardcoded (cores, espaçamento, tipografia)
- ✅ **SEMPRE** usar design tokens (`useThemeColors()`, `Tokens.*`)
- ✅ **SEMPRE** usar primitives de `src/components/primitives/`
- ✅ **SEMPRE** TypeScript strict (zero `any`)

### Arquitetura
- ✅ Componentes apresentacionais (lógica em services/hooks)
- ✅ Services retornam `{ data, error }` pattern
- ✅ Hooks como bridge entre UI e services
- ✅ FlatList para listas (nunca ScrollView + map)

### Qualidade
- ✅ Testar em **iOS E Android**
- ✅ Acessibilidade WCAG AAA (contraste, touch targets 44pt+)
- ✅ Dark mode obrigatório
- ✅ Performance otimizada (memo, useMemo, useCallback)

### Deploy
- ✅ Usar `expo-updates` para OTA (Over-The-Air updates)
- ✅ EAS Build para builds nativos
- ✅ Validação pré-deploy: `npm run validate`

## 📋 Checklist Rápido por Feature

### Antes de Implementar
- [ ] TypeScript types definidos em `src/types/`
- [ ] Service criado em `src/services/` (se necessário)
- [ ] Hook criado em `src/hooks/` (se necessário)
- [ ] Design tokens verificados (`src/theme/tokens.ts`)

### Durante Implementação
- [ ] Componentes funcionais (sem classes)
- [ ] Primitives usados (não View/Text direto)
- [ ] Design tokens aplicados (sem hardcoded)
- [ ] Dark mode implementado
- [ ] Acessibilidade (labels, hints, roles)
- [ ] Safe areas tratadas
- [ ] Loading/error states

### Antes de Commit
- [ ] TypeScript: `npm run type-check` (0 erros)
- [ ] Lint: `npm run lint` (0 críticos)
- [ ] Testes: adicionar em `__tests__/` para nova lógica
- [ ] RLS policies verificadas (se tocar Supabase)
- [ ] Testado em iOS E Android

## 🗂️ Estrutura de Pastas Esperada

```
src/
├── screens/           # Telas (HomeScreen, ChatScreen, etc.)
├── components/        # Componentes reutilizáveis
│   ├── primitives/    # Box, Text, Button, HapticButton, Input
│   ├── molecules/     # Avatar, Badge, EmotionalPrompt
│   ├── organisms/     # MaternalCard (variants)
│   └── templates/     # ScreenLayout, SectionLayout
├── hooks/             # useEmotionTracking, useHabits, useSupabase
├── services/          # Lógica de negócio
│   ├── supabase/      # profileService, chatService, emotionService
│   └── ai/            # llmRouter, aiOrchestrator
├── agents/            # Agentes IA especializados
│   ├── core/          # BaseAgent, AgentOrchestrator
│   ├── helpers/       # llmRouter.ts
│   └── maternal/      # MaternalChatAgent
├── mcp/               # MCP servers e dynamic gateway
├── theme/             # Design tokens, colors, typography
└── types/             # TypeScript definitions globais
```

## 🔗 Referências Críticas

- **Cérebro Externo**: `CONTEXTO.md` (raiz) - **LEIA PRIMEIRO**
- **Design System**: `docs/design/` (fonte única da verdade)
- **Tokens**: `src/theme/tokens.ts`
- **Regras Mobile**: `.cursor/rules/mobile-standards.mdc`
- **MCP Setup**: `docs/MCP_SETUP.md`

## ⚠️ Armadilhas Comuns

1. **Não usar primitives** → Usar View/Text direto (quebra design system)
2. **Hardcoded colors** → Não funciona dark mode
3. **ScrollView + map** → Performance ruim em listas grandes
4. **Lógica em componentes** → Deve estar em services/hooks
5. **Sem RLS policies** → Violação LGPD
6. **console.log** → Não integra com Sentry
7. **Sem testes** → Coverage não aumenta

## 🚀 Comandos Úteis

```bash
# Validação completa
npm run validate

# Type check
npm run type-check

# Lint
npm run lint

# Testes
npm test

# Build
npm run build:android
npm run build:ios

# OTA Update
npm run update:prod
```

---

**Última atualização:** Dezembro 2025

