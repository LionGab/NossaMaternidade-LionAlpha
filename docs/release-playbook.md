# 🚀 Release Playbook - Nossa Maternidade

**Guia Completo: Do Zero até Publicação nas Lojas**  
**Data:** 05/12/2025  
**Versão:** 1.0.0

---

## 📋 ÍNDICE

1. [Pré-requisitos](#1-pré-requisitos)
2. [Variáveis de Ambiente e Secrets](#2-variáveis-de-ambiente-e-secrets)
3. [Configuração do EAS Build](#3-configuração-do-eas-build)
4. [Configuração do EAS Submit](#4-configuração-do-eas-submit)
5. [Testes Antes de Publicar](#5-testes-antes-de-publicar)
6. [Publicação nas Lojas](#6-publicação-nas-lojas)
7. [Pós-lançamento](#7-pós-lançamento)

---

## 1️⃣ PRÉ-REQUISITOS

### O que você precisa ter

Antes de começar, certifique-se de ter:

#### Contas e Acessos

- ✅ **Conta Apple Developer** (paga - $99/ano)
  - Acesse: [developer.apple.com](https://developer.apple.com)
  - Necessária para publicar na App Store

- ✅ **Conta Google Play Console** (paga - $25 única vez)
  - Acesse: [play.google.com/console](https://play.google.com/console)
  - Necessária para publicar na Google Play

- ✅ **Conta Expo/EAS**
  - Acesse: [expo.dev](https://expo.dev)
  - Faça login: `eas login`
  - O projeto já está vinculado ao EAS Project ID: `ceee9479-e404-47b8-bc37-4f913c18f270`

#### Ferramentas no Computador

- ✅ **Node.js** instalado (versão 20.11.1 ou compatível)
- ✅ **EAS CLI** instalado globalmente:
  ```bash
  npm install -g eas-cli
  ```
- ✅ **Git** configurado (para commits)

---

### Checklist de Confirmação

Antes de prosseguir, valide que tudo está pronto:

#### ✅ Configuração do Projeto

- [ ] `app.config.js` está configurado corretamente
  - Verifique: `docs/CONFIGURACAO_PRODUCAO.md`
  - Campos essenciais: `name`, `slug`, `version`, `bundleIdentifier`, `package`

- [ ] Assets criados e salvos em `assets/`
  - Verifique: `docs/ASSETS_CHECKLIST.md`
  - Arquivos necessários:
    - [ ] `assets/icon.png` (1024x1024)
    - [ ] `assets/splash.png` (1242x2436+)
    - [ ] `assets/adaptive-icon.png` (1024x1024)
    - [ ] `assets/notification-icon.png` (96x96)
    - [ ] `assets/splash-icon.png` (200px width)
    - [ ] `assets/favicon.png` (32x32) - opcional

- [ ] `.env` criado e preenchido
  - Copie `env.template` para `.env`
  - Preencha as variáveis obrigatórias (veja Seção 2)

- [ ] `eas.json` configurado
  - Profiles de build estão corretos
  - Placeholders do submit serão preenchidos na Seção 4

#### ✅ Acesso às Contas

- [ ] Logado no EAS: `eas login`
- [ ] Acesso à conta Apple Developer
- [ ] Acesso à conta Google Play Console

---

## 2️⃣ VARIÁVEIS DE AMBIENTE E SECRETS

### Por que isso é importante?

As variáveis de ambiente são usadas para configurar APIs, serviços e feature flags. Algumas são **obrigatórias** (sem elas o app não funciona), outras são **opcionais** mas recomendadas.

### Variáveis Obrigatórias

Estas são **essenciais** para o app funcionar:

| Variável                             | Descrição                 | Onde Obter                                     |
| ------------------------------------ | ------------------------- | ---------------------------------------------- |
| `EXPO_PUBLIC_SUPABASE_URL`           | URL do projeto Supabase   | Dashboard do Supabase → Settings → API         |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY`      | Chave anônima do Supabase | Dashboard do Supabase → Settings → API         |
| `EXPO_PUBLIC_SUPABASE_FUNCTIONS_URL` | URL das Edge Functions    | `https://SEU_PROJETO.supabase.co/functions/v1` |

**Exemplo de valores:**

```bash
EXPO_PUBLIC_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
EXPO_PUBLIC_SUPABASE_FUNCTIONS_URL=https://abcdefghijklmnop.supabase.co/functions/v1
```

---

### Variáveis Opcionais (mas Recomendadas)

Estas melhoram a experiência e facilitam o monitoramento:

| Variável                         | Descrição                         | Quando Usar        |
| -------------------------------- | --------------------------------- | ------------------ |
| `EXPO_PUBLIC_SENTRY_DSN`         | DSN do Sentry para error tracking | Sempre em produção |
| `EXPO_PUBLIC_CLAUDE_API_KEY`     | Chave da API Claude (Anthropic)   | Se usar IA Claude  |
| `EXPO_PUBLIC_OPENAI_API_KEY`     | Chave da API OpenAI               | Se usar IA OpenAI  |
| `EXPO_PUBLIC_ENABLE_AI_FEATURES` | Feature flag para IA              | `true` ou `false`  |
| `EXPO_PUBLIC_ENABLE_ANALYTICS`   | Feature flag para analytics       | `true` ou `false`  |

**Nota Importante:** `EXPO_PUBLIC_GEMINI_API_KEY` **NÃO** deve ser usada no app. A chave do Gemini fica segura no Supabase Edge Function.

---

### Como Configurar

#### Opção 1: Arquivo `.env` Local (Desenvolvimento)

1. **Copie o template:**

   ```bash
   cp env.template .env
   ```

2. **Abra o arquivo `.env` e preencha:**

   ```bash
   # Obrigatórias
   EXPO_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=sua_chave_aqui
   EXPO_PUBLIC_SUPABASE_FUNCTIONS_URL=https://seu-projeto.supabase.co/functions/v1

   # Opcionais
   EXPO_PUBLIC_SENTRY_DSN=https://xxx@sentry.io/xxx
   EXPO_PUBLIC_ENABLE_AI_FEATURES=true
   EXPO_PUBLIC_ENABLE_ANALYTICS=true
   ```

3. **Valide que o arquivo está correto:**
   ```bash
   npm run validate:env
   ```

**⚠️ IMPORTANTE:** O arquivo `.env` está no `.gitignore` e **NUNCA** deve ser commitado no repositório.

---

#### Opção 2: EAS Secrets (Produção)

Para builds de produção, configure as variáveis como **secrets** no EAS. Isso garante que as chaves não fiquem expostas no código.

1. **Fazer login no EAS:**

   ```bash
   eas login
   ```

2. **Criar secrets para o projeto:**

   ```bash
   # Secret para Supabase URL
   eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_URL --value https://seu-projeto.supabase.co

   # Secret para Supabase Anon Key
   eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_ANON_KEY --value sua_chave_aqui

   # Secret para Supabase Functions URL
   eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_FUNCTIONS_URL --value https://seu-projeto.supabase.co/functions/v1

   # Secret para Sentry (opcional)
   eas secret:create --scope project --name EXPO_PUBLIC_SENTRY_DSN --value https://xxx@sentry.io/xxx
   ```

3. **Listar secrets criados:**

   ```bash
   eas secret:list
   ```

4. **Verificar que os secrets estão disponíveis:**
   - Os secrets criados com `--scope project` ficam disponíveis para **todos os builds** do projeto
   - Eles são automaticamente injetados como variáveis de ambiente durante o build

**Nota:** Os secrets do EAS têm precedência sobre o arquivo `.env` local durante builds na nuvem.

---

### Validação

Após configurar, valide:

```bash
# Verificar se as variáveis estão acessíveis
npm run validate:env

# Testar conexão com Supabase (se configurado)
npm run test:connection
```

---

## 3️⃣ CONFIGURAÇÃO DO EAS BUILD

### O que é EAS Build?

O EAS Build é o serviço da Expo que compila seu app React Native em arquivos prontos para as lojas:

- **Android:** `.aab` (App Bundle) ou `.apk`
- **iOS:** `.ipa`

### Profiles de Build

O projeto já está configurado com 4 profiles no `eas.json`:

| Profile       | Quando Usar              | O que Gera                                   |
| ------------- | ------------------------ | -------------------------------------------- |
| `development` | Desenvolvimento local    | Development client (para testar com Expo Go) |
| `preview`     | Testes internos          | APK (Android) / Simulator build (iOS)        |
| `staging`     | Testes com equipe        | APK (Android) / Ad-hoc build (iOS)           |
| `production`  | **Publicação nas lojas** | App Bundle (Android) / IPA (iOS)             |

---

### Comandos de Build

#### Build de Preview (Testes Internos)

**Android:**

```bash
eas build --platform android --profile preview
```

**iOS:**

```bash
eas build --platform ios --profile preview
```

**Ambos:**

```bash
eas build --platform all --profile preview
```

**O que acontece:**

- Build é feito na nuvem (não precisa de Mac para iOS)
- Você recebe um link para download quando terminar
- Android: APK para instalar em dispositivos
- iOS: Build para simulador ou dispositivo via TestFlight (se configurado)

**Quando usar:**

- Testar o app em dispositivos reais antes de publicar
- Validar que tudo funciona corretamente
- Compartilhar com equipe/testadores

---

#### Build de Produção

**Android:**

```bash
eas build --platform android --profile production
```

**iOS:**

```bash
eas build --platform ios --profile production
```

**Ambos:**

```bash
eas build --platform all --profile production
```

**O que acontece:**

- Build otimizado para produção
- Android: Gera `.aab` (App Bundle) - formato exigido pela Google Play
- iOS: Gera `.ipa` - formato exigido pela App Store
- Auto-increment de `versionCode` (Android) e `buildNumber` (iOS)

**Quando usar:**

- Quando estiver pronto para publicar nas lojas
- Após validar builds de preview
- Antes de fazer o submit para as lojas

---

### Monitoramento do Build

1. **Durante o build:**
   - O EAS mostra o progresso no terminal
   - Você recebe um link para acompanhar no dashboard

2. **Após o build:**
   - Acesse: [expo.dev/accounts/liongab/projects/nossa-maternidade/builds](https://expo.dev/accounts/liongab/projects/nossa-maternidade/builds)
   - Baixe o arquivo gerado (`.aab` ou `.ipa`)

3. **Tempo estimado:**
   - Android: 10-15 minutos
   - iOS: 15-20 minutos

---

### Troubleshooting

**Erro: "Asset not found"**

- ✅ Verifique que todos os assets estão em `assets/` (veja `docs/ASSETS_CHECKLIST.md`)

**Erro: "Invalid bundle identifier"**

- ✅ Verifique `ios.bundleIdentifier` e `android.package` no `app.config.js`

**Build muito lento:**

- ✅ Use `resourceClass: "m-medium"` no `eas.json` (já configurado para produção)

---

## 4️⃣ CONFIGURAÇÃO DO EAS SUBMIT

### O que é EAS Submit?

O EAS Submit envia automaticamente seu build para as lojas (App Store Connect e Google Play Console), sem precisar fazer upload manual.

### Pré-requisitos

Antes de usar o submit, você precisa:

1. ✅ **Ter um build de produção pronto** (Seção 3)
2. ✅ **Criar o app nas lojas** (App Store Connect e Google Play Console)
3. ✅ **Configurar o `eas.json`** com os IDs corretos

---

### Configuração para iOS (App Store)

#### Passo 1: Obter Apple Team ID

1. Acesse: [developer.apple.com/account](https://developer.apple.com/account)
2. Faça login com sua conta Apple Developer
3. Vá em **Membership**
4. Copie o **Team ID** (formato: `ABC123DEF4`)

#### Passo 2: Criar App no App Store Connect

1. Acesse: [appstoreconnect.apple.com](https://appstoreconnect.apple.com)
2. Vá em **My Apps** → **+** (criar novo app)
3. Preencha:
   - **Platform:** iOS
   - **Name:** Nossa Maternidade
   - **Primary Language:** Português (Brasil)
   - **Bundle ID:** `com.nossamaternidade.app` (deve estar criado no Apple Developer)
   - **SKU:** `NOSSA_MATERNIDADE_2025` (ou qualquer identificador único)
4. Clique em **Create**
5. **Copie o App ID** (formato numérico, ex: `1234567890`)

#### Passo 3: Atualizar `eas.json`

Abra `eas.json` e atualize a seção `submit.production.ios`:

```json
{
  "submit": {
    "production": {
      "ios": {
        "language": "pt-BR",
        "sku": "NOSSA_MATERNIDADE_2025",
        "ascAppId": "1234567890", // ← Substitua pelo App ID real
        "appleTeamId": "ABC123DEF4" // ← Substitua pelo Team ID real
      }
    }
  }
}
```

**⚠️ IMPORTANTE:** Use os valores **reais** que você obteve, não os exemplos acima.

---

### Configuração para Android (Google Play)

#### Passo 1: Criar Service Account

1. Acesse: [play.google.com/console](https://play.google.com/console)
2. Vá em **Setup** → **API access**
3. Clique em **Create new service account**
4. Siga as instruções para criar a conta no Google Cloud Console
5. **Baixe o arquivo JSON** da service account
6. Salve como `google-play-service-account.json` na **raiz do projeto**

#### Passo 2: Conceder Acesso no Google Play

1. No Google Play Console, vá em **Setup** → **API access**
2. Encontre a service account criada
3. Clique em **Grant access**
4. Selecione as permissões:
   - ✅ **View app information and download bulk reports**
   - ✅ **Manage production releases**
   - ✅ **Manage testing track releases**
5. Salve

#### Passo 3: Verificar `eas.json`

O `eas.json` já está configurado para usar o arquivo JSON:

```json
{
  "submit": {
    "production": {
      "android": {
        "serviceAccountKeyPath": "./google-play-service-account.json",
        "track": "production",
        "releaseStatus": "completed",
        "changesNotSentForReview": false
      }
    }
  }
}
```

**⚠️ IMPORTANTE:**

- O arquivo `google-play-service-account.json` está no `.gitignore` e **NUNCA** deve ser commitado
- Mantenha este arquivo seguro e não compartilhe

---

### Comandos de Submit

#### Submit para iOS

```bash
eas submit --platform ios --profile production
```

**O que acontece:**

- EAS encontra o último build de produção iOS
- Faz upload do `.ipa` para o App Store Connect
- O build fica disponível em **TestFlight** (se configurado) ou **App Store Connect** → **TestFlight** → **iOS Builds**

**Tempo estimado:** 5-10 minutos

---

#### Submit para Android

```bash
eas submit --platform android --profile production
```

**O que acontece:**

- EAS encontra o último build de produção Android
- Faz upload do `.aab` para o Google Play Console
- O build fica disponível em **Production** track (ou o track configurado)

**Tempo estimado:** 5-10 minutos

---

#### Submit para Ambos

```bash
eas submit --platform all --profile production
```

---

### Fluxo Completo: Build + Submit

**Ordem recomendada:**

1. **Fazer build de produção:**

   ```bash
   eas build --platform all --profile production
   ```

2. **Aguardar build terminar** (verificar no dashboard)

3. **Fazer submit:**
   ```bash
   eas submit --platform all --profile production
   ```

**Dica:** Você pode fazer build e submit em um único comando (mas não recomendado na primeira vez):

```bash
eas build --platform all --profile production --auto-submit
```

---

## 5️⃣ TESTES ANTES DE PUBLICAR

### Checklist de QA

Antes de enviar para as lojas, teste **tudo** em dispositivos reais:

#### ✅ Instalação e Primeira Abertura

- [ ] Instalar build de preview em dispositivo Android real
- [ ] Instalar build de preview em dispositivo iOS real (ou TestFlight)
- [ ] App abre sem erros
- [ ] Splash screen aparece corretamente
- [ ] Ícone do app está correto

---

#### ✅ Onboarding e Autenticação

- [ ] Fluxo de onboarding completo funciona
- [ ] Login com email/senha funciona
- [ ] Login social (Google/Apple) funciona (se configurado)
- [ ] Reset de senha funciona
- [ ] Logout funciona

---

#### ✅ Navegação e Telas Principais

- [ ] Navegação entre todas as 5 tabs funciona
  - [ ] Tab "Início" (Home)
  - [ ] Tab "Mães Valente" (Comunidade)
  - [ ] Tab "NathIA" (Chat)
  - [ ] Tab "Mundo da Nath" (Conteúdo)
  - [ ] Tab "Meus Cuidados" (Hábitos)
- [ ] Deep linking funciona (`nossamaternidade://`)
- [ ] Botão "voltar" funciona corretamente
- [ ] Modais abrem e fecham corretamente

---

#### ✅ Funcionalidades Principais

- [ ] **Fluxo "Desculpa Hoje" completo:**
  - [ ] Seleção de culpa funciona
  - [ ] Validação empática aparece
  - [ ] Badges são desbloqueadas
  - [ ] Compartilhamento funciona
- [ ] **Chat com NathIA:**
  - [ ] Enviar mensagem funciona
  - [ ] Resposta da IA aparece
  - [ ] Histórico de conversas funciona
- [ ] **Comunidade:**
  - [ ] Ver posts funciona
  - [ ] Criar post funciona
  - [ ] Comentários funcionam
- [ ] **Conteúdo:**
  - [ ] Feed de conteúdo carrega
  - [ ] Detalhes de conteúdo abrem
- [ ] **Hábitos:**
  - [ ] Registrar hábito funciona
  - [ ] Visualizar progresso funciona

---

#### ✅ Comportamento Offline

- [ ] App funciona sem internet (modo offline)
- [ ] Dados são salvos localmente
- [ ] Sincronização acontece quando volta internet

---

#### ✅ Permissões

- [ ] Solicitação de permissão de câmera funciona
- [ ] Solicitação de permissão de microfone funciona
- [ ] Solicitação de permissão de fotos funciona
- [ ] App lida graciosamente com permissões negadas

---

#### ✅ Acessibilidade

- [ ] Textos são legíveis (tamanho de fonte adequado)
- [ ] Contraste de cores está adequado
- [ ] Touch targets são grandes o suficiente (mín. 44pt)
- [ ] Labels de acessibilidade estão presentes

---

#### ✅ Performance

- [ ] App abre rapidamente (< 3 segundos)
- [ ] Navegação é fluida (sem travamentos)
- [ ] Imagens carregam corretamente
- [ ] Sem memory leaks aparentes

---

#### ✅ Dark Mode

- [ ] Dark mode funciona corretamente
- [ ] Cores estão adequadas em dark mode
- [ ] Textos são legíveis em dark mode

---

### Testes Específicos por Plataforma

#### iOS

- [ ] Testar em iPhone (diferentes tamanhos de tela)
- [ ] Testar em iPad (se `supportsTablet: true`)
- [ ] Safe area funciona corretamente (notch, etc.)
- [ ] Gestos nativos funcionam (swipe back, etc.)

#### Android

- [ ] Testar em diferentes versões do Android (mín. 7.0)
- [ ] Adaptive icon aparece corretamente
- [ ] Edge-to-edge funciona
- [ ] Predictive back gesture funciona (Android 14+)

---

### Como Reportar Problemas

Se encontrar problemas durante os testes:

1. **Anote:**
   - Tela onde ocorreu
   - Passos para reproduzir
   - Mensagem de erro (se houver)
   - Dispositivo e versão do OS

2. **Verifique logs:**

   ```bash
   # Se estiver usando Sentry, verifique o dashboard
   # Ou use: npx expo start --dev-client
   ```

3. **Corrija e teste novamente** antes de publicar

---

## 6️⃣ PUBLICAÇÃO NAS LOJAS

### App Store (iOS)

#### Passo 1: Preparar Informações do App

No App Store Connect, preencha:

**Informações Básicas:**

- **Nome:** Nossa Maternidade
- **Subtítulo:** (opcional) Apoio emocional para mães
- **Categoria Primária:** Saúde e Fitness
- **Categoria Secundária:** (opcional) Estilo de Vida
- **Classificação Indicativa:** 4+ (ou conforme conteúdo)

**Descrição:**

```
Nossa Maternidade é um app de apoio emocional criado especialmente para mães brasileiras.
Oferecemos uma comunidade acolhedora, assistente de IA empático, e ferramentas de autocuidado.

[Adicione sua descrição completa aqui]
```

**Palavras-chave:** (máx. 100 caracteres)

```
maternidade, mães, apoio emocional, comunidade, autocuidado, bem-estar
```

**URLs:**

- **Política de Privacidade:** `https://nossamaternidade.com.br/privacy`
- **Suporte:** `https://nossamaternidade.com.br/support`

---

#### Passo 2: Adicionar Screenshots

**Tamanhos necessários:**

- iPhone 6.7" (iPhone 14 Pro Max): 1290x2796 px
- iPhone 6.5" (iPhone 11 Pro Max): 1242x2688 px
- iPhone 5.5" (iPhone 8 Plus): 1242x2208 px
- iPad Pro 12.9": 2048x2732 px

**Dica:** Crie screenshots mostrando:

1. Tela inicial (Home)
2. Chat com NathIA
3. Fluxo "Desculpa Hoje"
4. Comunidade
5. Conteúdo

---

#### Passo 3: Selecionar Build

1. No App Store Connect, vá em **TestFlight** → **iOS Builds**
2. Encontre o build enviado pelo EAS Submit
3. Selecione o build para a versão que você quer publicar
4. Clique em **Submit for Review**

---

#### Passo 4: Preencher Informações de Review

**Informações de Contato:**

- **First Name / Last Name:** Seu nome
- **Phone Number:** Seu telefone
- **Email:** Seu email

**Informações de Review:**

- **Demo Account:** (se necessário) Crie uma conta de teste
- **Notes:** (opcional) Informações adicionais para os revisores

**Export Compliance:**

- ✅ Já está configurado: `ITSAppUsesNonExemptEncryption: false`

---

#### Passo 5: Enviar para Review

1. Revise todas as informações
2. Clique em **Submit for Review**
3. Aguarde aprovação (geralmente 1-3 dias)

**Status possíveis:**

- **Waiting for Review** → Em fila
- **In Review** → Sendo revisado
- **Pending Developer Release** → Aprovado, aguardando você publicar
- **Ready for Sale** → Publicado! 🎉

---

### Google Play (Android)

#### Passo 1: Criar App no Google Play Console

1. Acesse: [play.google.com/console](https://play.google.com/console)
2. Clique em **Create app**
3. Preencha:
   - **App name:** Nossa Maternidade
   - **Default language:** Português (Brasil)
   - **App or game:** App
   - **Free or paid:** Free
   - **Declarations:** Marque as declarações necessárias (LGPD, etc.)

---

#### Passo 2: Preencher Informações do App

**Store Listing:**

- **Short description:** (máx. 80 caracteres)
  ```
  Apoio emocional e comunidade para mães brasileiras
  ```
- **Full description:** (máx. 4000 caracteres)

  ```
  Nossa Maternidade é um app de apoio emocional criado especialmente para mães brasileiras.

  [Adicione sua descrição completa aqui]
  ```

- **App icon:** Upload do `icon.png` (512x512 px)
- **Feature graphic:** 1024x500 px (banner promocional)
- **Screenshots:** Mín. 2, máx. 8
  - Phone: 16:9 ou 9:16 (ex: 1080x1920)
  - Tablet: (opcional)

**Categoria e Classificação:**

- **App category:** Saúde e fitness
- **Content rating:** Preencha o questionário (geralmente PEGI 3 ou equivalente)

---

#### Passo 3: Configurar Versão de Produção

1. Vá em **Production** → **Create new release**
2. O `.aab` enviado pelo EAS Submit já deve estar disponível
3. Selecione o build
4. Preencha **Release notes** (o que mudou nesta versão):

```
Versão 1.0.0 - Lançamento inicial

- Apoio emocional com IA empática
- Comunidade de mães
- Ferramentas de autocuidado
- Fluxo "Desculpa Hoje"
```

---

#### Passo 4: Revisar e Publicar

1. Revise todas as informações
2. Clique em **Review release**
3. Se tudo estiver OK, clique em **Start rollout to Production**
4. Aguarde aprovação (geralmente algumas horas a 1 dia)

**Status possíveis:**

- **Draft** → Rascunho
- **Pending publication** → Aguardando publicação
- **Published** → Publicado! 🎉

---

## 7️⃣ PÓS-LANÇAMENTO

### Monitoramento

#### Sentry (Error Tracking)

Se você configurou `EXPO_PUBLIC_SENTRY_DSN`:

1. Acesse o dashboard do Sentry
2. Monitore erros em tempo real
3. Configure alertas para erros críticos
4. Revise relatórios semanais

**O que monitorar:**

- Erros críticos (crashes)
- Taxa de erro por tela
- Dispositivos/versões com mais problemas

---

#### Analytics (se configurado)

Se você configurou analytics:

1. Monitore métricas de uso:
   - Usuários ativos diários (DAU)
   - Retenção (usuários que voltam)
   - Telas mais acessadas
   - Funções mais usadas

2. Use os dados para:
   - Identificar pontos de melhoria
   - Priorizar features
   - Entender comportamento dos usuários

---

### Ciclos de Release

#### Versionamento

Siga o padrão **Semantic Versioning** (MAJOR.MINOR.PATCH):

- **1.0.0** → Lançamento inicial
- **1.0.1** → Correção de bugs
- **1.1.0** → Nova feature
- **2.0.0** → Mudança grande (breaking changes)

**Atualizar versão:**

1. Edite `app.config.js`:
   ```javascript
   version: '1.0.1', // Atualize aqui
   ```
2. O EAS auto-incrementa `buildNumber` (iOS) e `versionCode` (Android)

---

#### Processo de Atualização

1. **Desenvolver mudanças:**
   - Fazer alterações no código
   - Testar localmente
   - Commitar mudanças

2. **Fazer build de preview:**

   ```bash
   eas build --platform all --profile preview
   ```

3. **Testar em dispositivos reais**

4. **Fazer build de produção:**

   ```bash
   eas build --platform all --profile production
   ```

5. **Fazer submit:**

   ```bash
   eas submit --platform all --profile production
   ```

6. **Publicar nas lojas** (seguir Seção 6)

---

### Manutenção Contínua

#### Checklist Mensal

- [ ] Revisar erros no Sentry
- [ ] Analisar métricas de uso
- [ ] Verificar feedback dos usuários nas lojas
- [ ] Planejar próximas features
- [ ] Atualizar dependências (se necessário)

#### Checklist Trimestral

- [ ] Revisar e atualizar screenshots nas lojas
- [ ] Atualizar descrição do app (se necessário)
- [ ] Revisar políticas de privacidade
- [ ] Avaliar necessidade de atualizar SDK do Expo

---

## 📚 REFERÊNCIAS RÁPIDAS

### Comandos Essenciais

```bash
# Login no EAS
eas login

# Build de preview (testes)
eas build --platform all --profile preview

# Build de produção
eas build --platform all --profile production

# Submit para lojas
eas submit --platform all --profile production

# Listar secrets
eas secret:list

# Criar secret
eas secret:create --scope project --name EXPO_PUBLIC_XXX --value yyy
```

### Links Úteis

- **Expo Dashboard:** [expo.dev/accounts/liongab/projects/nossa-maternidade](https://expo.dev/accounts/liongab/projects/nossa-maternidade)
- **App Store Connect:** [appstoreconnect.apple.com](https://appstoreconnect.apple.com)
- **Google Play Console:** [play.google.com/console](https://play.google.com/console)
- **Documentação Expo:** [docs.expo.dev](https://docs.expo.dev)
- **EAS Build Docs:** [docs.expo.dev/build/introduction/](https://docs.expo.dev/build/introduction/)
- **EAS Submit Docs:** [docs.expo.dev/submit/introduction/](https://docs.expo.dev/submit/introduction/)

---

## 🎯 RESUMO DOS 5 PASSOS ESSENCIAIS

### 1. **Preparar Ambiente**

- Criar contas (Apple Developer, Google Play)
- Configurar `.env` com variáveis obrigatórias
- Criar assets (ícone, splash, etc.)

### 2. **Configurar EAS Secrets**

```bash
eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_URL --value https://...
eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_ANON_KEY --value ...
```

### 3. **Fazer Build de Produção**

```bash
eas build --platform all --profile production
```

### 4. **Configurar Submit**

- Obter `ascAppId` e `appleTeamId` (iOS)
- Criar service account e baixar JSON (Android)
- Atualizar `eas.json`

### 5. **Submit e Publicar**

```bash
eas submit --platform all --profile production
```

- Preencher informações nas lojas
- Enviar para review
- Aguardar aprovação

---

**Boa sorte com o lançamento! 🚀**

Se tiver dúvidas, consulte a documentação do Expo ou os outros documentos do projeto:

- `docs/CONFIGURACAO_PRODUCAO.md`
- `docs/ASSETS_CHECKLIST.md`
- `docs/ARQUITETURA_PRODUCAO.md`
