# 📱 Nossa Maternidade Mobile

> ## 🎯 **REPOSITÓRIO OFICIAL**
>
> **Este é o único repositório que gera builds para App Store e Google Play Store.**
>
> **Regra de Ouro:** Se não está neste repositório, não existe para as lojas.
>
> **Workflow:** `feature/*` → PR → `dev` → PR → `main` (produção)

Aplicativo mobile-first para apoio às mães durante a jornada da maternidade, desenvolvido com Expo e React Native.

## ⭐ Pontuação: 10/10

Este projeto foi identificado como o melhor para lançamento na App Store e Google Play Store, agora com **arquitetura avançada de IA** usando MCPs (Model Context Protocol) e Agentes Inteligentes.

## 🚀 Diferenciais de Arquitetura

### 🤖 Sistema de Agentes IA

- **Maternal Chat Agent**: Chat empático e contextualizado especializado em suporte maternal
- **Content Recommendation Agent**: Recomendações personalizadas baseadas em IA
- **Habits Analysis Agent**: Análise inteligente de hábitos e bem-estar com insights preditivos

### 🔌 MCP (Model Context Protocol)

- **Supabase MCP**: Gerenciamento unificado de autenticação, database e storage
- **Google AI MCP**: Integração otimizada com Gemini para chat, análise de emoções e geração de conteúdo
- **Analytics MCP**: Sistema robusto de tracking e análise de comportamento

### 🎯 Orchestrator Pattern

- Gerenciamento centralizado de todos os agentes IA
- Comunicação eficiente entre agentes e serviços externos
- Escalabilidade para novos agentes e funcionalidades

## ✨ Funcionalidades

- 🤖 **Chat Inteligente** - MãesValente: Assistente virtual com IA contextualizada (Gemini 2.0)
- 📚 **Conteúdo Personalizado** - Recomendações baseadas em IA adaptadas ao seu perfil
- 📊 **Análise de Hábitos** - Tracking inteligente com insights e alertas de bem-estar
- 💬 **Comunidade MãesValentes** - Conexão e interação entre mães
- 🎯 **Onboarding Completo** - 9 etapas personalizadas para criar seu perfil
- 🔐 **Autenticação Segura** - Sistema robusto com Supabase
- 🌙 **Sleep Tracker** - Rastreamento de qualidade do sono
- 🧘‍♀️ **Exercícios de Respiração** - Técnicas de calma e bem-estar
- 📺 **Mundo Nath** - Feed de vídeos, áudios, reels e textos educativos
- 🎬 **Séries Educativas** - "Bastidores com o Thales" e mais conteúdo exclusivo

## 🚀 Tecnologias

- **Framework**: Expo SDK ~54.0.25
- **React Native**: 0.81.5
- **React**: 19.1.0
- **TypeScript**: 5.9.2
- **Navegação**: React Navigation 7
- **Estilização**: NativeWind (Tailwind CSS)
- **IA**: Google Gemini API
- **Backend**: Supabase (autenticação, database, storage)
- **Build**: EAS Build

## 📚 Documentação

### 🏆 Documento Definitivo Consolidado

**⭐ NOVO:** **[DOCUMENTO_DEFINITIVO_NOSSA_MATERNIDADE.md](./docs/DOCUMENTO_DEFINITIVO_NOSSA_MATERNIDADE.md)** - Este é o documento único e consolidado que reúne TODA a documentação do projeto em um só lugar. Elimina duplicações, organiza informações de forma lógica e serve como referência definitiva para desenvolvimento, deploy e manutenção.

**Recomendação:** Comece por este documento para uma visão completa do projeto.

### 🎨 Design System (Fonte Única da Verdade)

A documentação de design estabelece princípios, padrões e decisões definitivas para eliminar ambiguidades:

- **[Princípios de Design](./docs/design/DESIGN_PRINCIPLES.md)**: Filosofia, valores, objetivos e princípios fundamentais
- **[Guia do Sistema](./docs/design/DESIGN_SYSTEM_REFERENCE.md)**: Guia completo do sistema moderno, hierarquia e padrões de uso
- **[Padrões de Componentes](./docs/design/COMPONENT_PATTERNS.md)**: Padrões obrigatórios para criação de componentes (Atomic Design)
- **[Decisões Estabelecidas](./docs/design/DESIGN_DECISIONS.md)**: Todas as decisões de design (cores, tipografia, espaçamento, etc.)
- **[Referência Rápida](./docs/design/DESIGN_QUICK_REFERENCE.md)**: Cheat sheet rápido para desenvolvimento

**Regra de Ouro:** Quando houver dúvida sobre design, consulte `docs/design/` primeiro. Não "adivinhe" - tudo está documentado.

### 📖 Outros Documentos

- **[Plano de Migração](./MIGRATION_PLAN.md)**: Guia completo para migração para React Native com Expo usando Supabase
- **[Documentação do Tema](./THEME_DOCUMENTATION.md)**: Paleta de cores completa e sistema de design (legado - use docs/design/ para referência atual)
- **[Deploy para Lojas](./DEPLOY_STORES.md)**: Checklist e comandos para build e submissão
- **[Auditoria de Repositórios](./REPOS_AUDIT.md)**: Inventário de repositórios relacionados

## 📋 Pré-requisitos

- Node.js 18+
- npm ou yarn
- Expo CLI (`npm install -g expo-cli`)
- **Para Expo Go**: App Expo Go instalado no seu dispositivo móvel
  - [iOS App Store](https://apps.apple.com/app/expo-go/id982107779)
  - [Google Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)
- **Opcional**: iOS Simulator (para desenvolvimento iOS) ou Android Studio (para desenvolvimento Android)

## 🛠️ Instalação

1. Clone o repositório:

```bash
git clone https://github.com/LionGab/NossaMaternidadeMelhor.git
cd NossaMaternidadeMelhor/projects/nossa-maternidade-mobile
```

2. Instale as dependências:

```bash
npm install
```

3. Configure as variáveis de ambiente:

   Crie um arquivo `.env` na raiz do projeto e adicione suas chaves:

   ```env
   EXPO_PUBLIC_GEMINI_API_KEY=sua_chave_aqui
   EXPO_PUBLIC_SUPABASE_URL=sua_url_aqui
   EXPO_PUBLIC_SUPABASE_ANON_KEY=sua_chave_aqui
   EXPO_PUBLIC_SUPABASE_FUNCTIONS_URL=sua_url_aqui/functions/v1
   ```

   📖 Veja [docs/setup-env.md](./docs/setup-env.md) para configuração completa.
   📖 Veja [docs/env-variables.md](./docs/env-variables.md) para mais detalhes sobre as variáveis de ambiente.

   **⚠️ IMPORTANTE:** O arquivo `.env` está no `.gitignore` e não será commitado.

   **🔐 Configuração Gemini (Produção):** Para produção, configure `GEMINI_API_KEY` como **SECRET** no Supabase (não no `.env`):
   - 📖 [Guia Completo](./docs/SUPABASE_GEMINI_SECRET_SETUP.md)
   - 📖 [Resumo Executivo](./docs/RESUMO_GEMINI_SETUP.md)
   - 📖 [Checklist](./docs/CHECKLIST_GEMINI_SETUP.md)

## 🏃‍♂️ Executando o Projeto

### Usando Expo Go (Recomendado para desenvolvimento)

1. **Instale o Expo Go no seu dispositivo móvel:**
   - [iOS App Store](https://apps.apple.com/app/expo-go/id982107779)
   - [Google Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)

2. **Inicie o servidor de desenvolvimento:**

   ```bash
   npm start
   ```

3. **Escaneie o QR Code:**
   - **iOS**: Abra a câmera e escaneie o QR code
   - **Android**: Abra o app Expo Go e escaneie o QR code
   - Ou pressione `i` para iOS Simulator ou `a` para Android Emulator

### Desenvolvimento com Simuladores/Emuladores

```bash
# Iniciar o servidor de desenvolvimento
npm start

# Executar no iOS Simulator
npm run ios

# Executar no Android Emulator
npm run android

# Executar na Web
npm run web
```

### Nota sobre Expo Go

⚠️ **Importante**: Este projeto está configurado para funcionar com Expo Go. A nova arquitetura do React Native foi desabilitada para garantir compatibilidade. Se você precisar usar recursos que requerem desenvolvimento build customizado, use `eas build` para criar um build de desenvolvimento.

### Verificação de Tipos

```bash
npm run type-check
```

## 📦 Build para Produção

### Configurar EAS

```bash
npm install -g eas-cli
eas login
```

### Build iOS

```bash
npm run build:ios
```

### Build Android

```bash
# Validar configuração antes do build
npm run validate:android

# Build de produção
npm run build:android
```

📖 Veja [docs/DEPLOY_ANDROID.md](./docs/DEPLOY_ANDROID.md) para guia completo de deploy Android.

### Diagnóstico de Prontidão para Produção

**Antes de fazer build de produção**, execute o diagnóstico completo:

```bash
npm run diagnose:production
```

Este comando analisa:
- ✅ Qualidade de código (TypeScript, ESLint, testes, design system)
- ✅ Configuração (app.config.js, eas.json, environment)
- ✅ Assets (ícones, splash, screenshots)
- ✅ Segurança & LGPD (secrets, RLS, políticas)
- ✅ Arquitetura (padrões, services)
- ✅ Prontidão para lojas (iOS & Android)
- ✅ Performance (bundle size, otimizações)

O diagnóstico gera um **relatório completo** com:
- Score geral de prontidão (0-100)
- Roadmap priorizado (crítico → alto → médio → baixo)
- Ações concretas com estimativas de tempo e energia

📖 Veja [docs/PRODUCTION_READINESS_DIAGNOSTIC.md](./docs/PRODUCTION_READINESS_DIAGNOSTIC.md) para guia completo.

### Build para ambas as plataformas

```bash
npm run build:production
```

## 🚀 Deploy

### iOS (App Store)

```bash
npm run submit:ios
```

### Android (Google Play)

```bash
npm run submit:android
```

## 📁 Estrutura do Projeto

```
src/
├── agents/                    # 🤖 Sistema de Agentes IA
│   ├── core/
│   │   ├── BaseAgent.ts              # Classe base para agentes
│   │   └── AgentOrchestrator.ts      # Orquestrador central
│   ├── maternal/
│   │   └── MaternalChatAgent.ts      # Agente de chat maternal
│   ├── content/
│   │   └── ContentRecommendationAgent.ts  # Recomendações IA
│   ├── habits/
│   │   └── HabitsAnalysisAgent.ts    # Análise de hábitos
│   └── index.ts
├── mcp/                       # 🔌 Model Context Protocol
│   ├── servers/
│   │   ├── SupabaseMCPServer.ts      # MCP para Supabase
│   │   ├── GoogleAIMCPServer.ts      # MCP para Google AI
│   │   ├── AnalyticsMCPServer.ts     # MCP para Analytics
│   │   └── index.ts
│   └── types/
│       └── index.ts                   # Tipos do MCP
├── components/               # Componentes reutilizáveis
│   ├── primitives/           # Componentes base do Design System
│   ├── premium/              # Componentes premium
│   └── ...
├── screens/                  # Telas da aplicação
│   ├── onboarding/           # Fluxo de onboarding (9 steps)
│   │   └── OnboardingFlowNew.tsx
│   ├── ChatScreen.tsx        # Chat com MãesValente
│   ├── HabitsScreen.tsx      # Tracking de hábitos
│   ├── MundoNathScreen.tsx   # Feed de conteúdo
│   ├── HomeScreen.tsx        # Dashboard principal
│   └── ...
├── navigation/               # Configuração de navegação
│   ├── index.tsx
│   └── PremiumTabNavigator.tsx
├── contexts/                 # Contextos React
│   ├── AuthContext.tsx
│   └── AgentsContext.tsx     # 🆕 Context dos agentes IA
├── theme/                    # Design System
│   ├── tokens/               # Tokens de design
│   ├── ThemeContext.tsx
│   └── index.ts
├── types/                    # Tipos TypeScript
│   ├── onboarding.ts         # 🆕 Tipos do onboarding
│   ├── chat.ts
│   ├── habits.ts
│   └── ...
├── constants/                # Constantes
│   ├── Colors.ts
│   └── Theme.ts
├── hooks/                    # Custom hooks
│   ├── useHaptics.ts
│   ├── useTheme.ts
│   └── useStorage.ts
└── data/                     # Dados mockados
    ├── content.ts
    ├── habits.ts
    └── comments.ts
```

## 🔒 Segurança

- ✅ Validação de entrada em todos os formulários
- ✅ Tratamento robusto de erros
- ✅ ErrorBoundary para capturar erros React
- ✅ Validação de ambiente e configuração
- ✅ Sanitização de dados antes de renderizar
- ✅ Armazenamento seguro com AsyncStorage/SecureStore

## 🎨 Personalização

### Cores

Edite `src/constants/Colors.ts` para personalizar o tema:

```typescript
export const Colors = {
  primary: '#6DA9E4',
  secondary: '#FF69B4',
  // ...
};
```

### Ícones e Assets

Coloque seus assets em `assets/`:

- `icon.png` - Ícone do app (1024x1024)
- `splash.png` - Tela de splash
- `adaptive-icon.png` - Ícone adaptativo Android

## 📱 Configuração das Lojas

### iOS (App Store)

1. Crie uma conta Apple Developer ($99/ano)
2. Configure o Bundle ID em `app.json`
3. Execute `eas build --platform ios`
4. Envie via `eas submit --platform ios`

### Android (Google Play)

1. Crie uma conta Google Play Console ($25 único)
2. Configure o package name em `app.json`
3. Execute `eas build --platform android`
4. Envie via `eas submit --platform android`

## 🧪 Testes

```bash
# Executar testes (quando implementados)
npm test

# Cobertura de testes
npm run test:coverage
```

## 📊 Performance

- ✅ FlatList otimizado com virtualização
- ✅ Lazy loading de componentes
- ✅ Compressão de imagens
- ✅ 60 FPS garantido
- ✅ Compatível com Expo Go para desenvolvimento rápido

## 🐛 Tratamento de Erros

O app inclui um sistema robusto de tratamento de erros:

- **ErrorBoundary**: Captura erros React
- **Validação**: Validação de formulários e dados
- **Retry Logic**: Retry automático com exponential backoff
- **Logging**: Logs detalhados no console (dev mode)

## 📚 Documentação Adicional

### 🆕 Arquitetura Avançada

- **[IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md)** - 📖 **GUIA COMPLETO** de implementação de MCPs e Agentes IA

### 🔍 Diagnóstico e Qualidade

- **[docs/PRODUCTION_READINESS_DIAGNOSTIC.md](./docs/PRODUCTION_READINESS_DIAGNOSTIC.md)** - 🆕 **GUIA COMPLETO** do diagnóstico de prontidão para produção

### Setup e Configuração

- [docs/setup-env.md](./docs/setup-env.md) - Configuração de variáveis de ambiente
- [docs/env-variables.md](./docs/env-variables.md) - Referência de variáveis de ambiente
- [docs/setup-expo-go.md](./docs/setup-expo-go.md) - Setup para Expo Go
- [docs/setup-supabase.md](./docs/setup-supabase.md) - Setup completo do Supabase

### Deploy e Stores

- **[DEPLOY_STORES.md](./DEPLOY_STORES.md)** - 🆕 **Guia completo de build e submissão para lojas**
- [docs/deployment.md](./docs/deployment.md) - Guia de deploy para App Store e Google Play
- [docs/DEPLOY_ANDROID.md](./docs/DEPLOY_ANDROID.md) - 🆕 Guia completo de deploy Android (produção)
- [docs/DEEP_LINKS_SETUP.md](./docs/DEEP_LINKS_SETUP.md) - 🆕 Configuração de deep links Android
- [docs/data-safety-google-play.md](./docs/data-safety-google-play.md) - Data Safety para Google Play

### Funcionalidades

- [docs/chat-ia.md](./docs/chat-ia.md) - Documentação do chat com IA

## 🔄 Workflow de Desenvolvimento

### Estrutura de Branches

```
main         ← Produção (sempre estável, protegida)
  ↑
  └── dev     ← Integração (trabalho diário)
       ↑
       ├── feature/onboarding-v2
       ├── feature/chat-voz
       └── fix/crash-login
```

### Fluxo Padrão

1. **Criar feature branch:**

   ```bash
   git checkout dev
   git pull origin dev
   git checkout -b feature/nome-da-funcionalidade
   ```

2. **Desenvolver e commitar:**

   ```bash
   git add .
   git commit -m "feat: adiciona funcionalidade X"
   git push -u origin feature/nome-da-funcionalidade
   ```

3. **Abrir Pull Request:**
   - Base: `dev` (NUNCA `main`)
   - Compare: `feature/nome-da-funcionalidade`

4. **Após review e aprovação:**
   - Merge `feature/*` → `dev`
   - Quando `dev` estiver estável: PR `dev` → `main`

### Proteções

- ❌ **Push direto em `main` bloqueado** (hook Git + GitHub protection)
- ✅ Feature branches podem fazer push normalmente
- ✅ Sempre use PRs para integrar código

### Scripts de Validação

Antes de fazer build, execute:

**Recomendado (via npm):**

```bash
# Funciona em qualquer sistema
npm run check-ready
```

**Windows (PowerShell) - Alternativa:**

```powershell
# Navegue até o diretório do projeto
cd C:\Users\User\Documents\NossaMaternidade\NossaMaternidadeMelhor

# Execute o script
pwsh -File scripts/check-ready.ps1

# Ou se já estiver no diretório:
.\scripts\check-ready.ps1
```

**Linux/Mac (Bash) - Alternativa:**

```bash
bash scripts/check-ready.sh
# Ou via npm:
npm run check-ready:bash
```

Para configurar hooks Git:

**Windows (PowerShell):**

```powershell
# Navegue até o diretório do projeto primeiro
cd C:\Users\User\Documents\NossaMaternidade\NossaMaternidadeMelhor
.\scripts\setup-git-hooks.sh
```

**Linux/Mac (Bash):**

```bash
bash scripts/setup-git-hooks.sh
```

## 🧪 Repositório de Laboratório

Para experimentos e protótipos, use o repositório `NossaMaternidade-LN` (lab-monorepo).

**Regras:**

- ❌ NUNCA fazer deploy direto do lab
- ✅ Copiar manualmente código validado para este repositório oficial
- ✅ Usar lab para testar ideias arriscadas, MCPs, novos agentes IA

Veja [REPOS_AUDIT.md](./REPOS_AUDIT.md) para mais detalhes sobre repositórios relacionados.

## 🤝 Contribuindo

1. Siga o workflow acima (feature branch → PR → dev → main)
2. Crie uma branch para sua feature (`git checkout -b feature/MinhaFeature`)
3. Commit suas mudanças (`git commit -m 'feat: Adiciona MinhaFeature'`)
4. Push para a branch (`git push -u origin feature/MinhaFeature`)
5. Abra um Pull Request para `dev`

## 📄 Licença

Este projeto é privado e proprietário.

## 👥 Autores

- **LionGab** - [GitHub](https://github.com/LionGab)

## 📞 Suporte

Para suporte, abra uma issue no GitHub ou entre em contato através do email.

---

**⭐ Nossa Maternidade** - Apoiando mães em cada etapa da jornada maternal.
