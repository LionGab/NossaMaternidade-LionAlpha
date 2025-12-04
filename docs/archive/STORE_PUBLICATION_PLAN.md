# 🚀 Plano Robusto de Publicação - iOS e Android Stores

**App:** Nossa Maternidade  
**Versão:** 1.0.0  
**Bundle ID iOS:** `com.nossamaternidade.app`  
**Package Android:** `com.nossamaternidade.app`  
**Data:** 24 de Janeiro de 2025

---

## 📋 Índice

1. [Resumo Executivo](#resumo-executivo)
2. [Pré-requisitos](#pré-requisitos)
3. [Fase 1: Preparação Técnica](#fase-1-preparação-técnica)
4. [Fase 2: Assets e Conteúdo](#fase-2-assets-e-conteúdo)
5. [Fase 3: Documentação Legal](#fase-3-documentação-legal)
6. [Fase 4: Build e Testes](#fase-4-build-e-testes)
7. [Fase 5: Submissão iOS (App Store)](#fase-5-submissão-ios-app-store)
8. [Fase 6: Submissão Android (Google Play)](#fase-6-submissão-android-google-play)
9. [Fase 7: Pós-Lançamento](#fase-7-pós-lançamento)
10. [Checklist Completo](#checklist-completo)
11. [Timeline](#timeline)
12. [Troubleshooting](#troubleshooting)

---

## 🎯 Resumo Executivo

### Objetivo

Publicar o app **Nossa Maternidade** nas lojas **Apple App Store** (iOS) e **Google Play Store** (Android) com aprovação na primeira tentativa.

### Status Atual

- ✅ **Configuração Expo:** Completa
- ✅ **EAS Build:** Configurado (`eas.json` existente)
- 🟡 **Assets:** Básicos prontos, faltam screenshots específicos
- 🟡 **Documentação Legal:** Templates prontos em `docs/`, falta publicação
- 🟡 **Testes:** Básicos implementados
- ❌ **Builds de Produção:** Ainda não gerados

### Timeline Estimado

**Total: 3-4 semanas**

- **Semana 1:** Preparação técnica e assets
- **Semana 2:** Documentação legal e builds
- **Semana 3:** Submissão e revisão
- **Semana 4:** Ajustes e publicação final

---

## 🔑 Pré-requisitos

### Contas Necessárias

#### ✅ Apple Developer Program

- **Custo:** $99/ano
- **Status:** Verificar se já existe conta
- **Email:** Verificar `eas.json` → `submit.production.ios.appleId`
- **Ação:** Se não tiver, criar conta em [developer.apple.com](https://developer.apple.com)

#### ✅ Google Play Console

- **Custo:** $25 (taxa única)
- **Status:** Verificar se já existe conta
- **Ação:** Se não tiver, criar conta em [play.google.com/console](https://play.google.com/console)

#### ✅ Expo Application Services (EAS)

- **Custo:** Gratuito (plano básico)
- **Status:** ✅ Configurado (`eas.json` existe)
- **Ação:** Verificar login: `eas whoami`

### Infraestrutura

#### ✅ Supabase

- **Status:** Configurado
- **Verificar:** Backend funcional e schema aplicado

#### ✅ Domínio e Website

- **Requisito:** URL pública para Privacy Policy e Terms
- **Opções:**
  - Website próprio: `https://nossamaternidade.com.br`
  - GitHub Pages: Gratuito
  - Vercel/Netlify: Gratuito

---

## 📱 Fase 1: Preparação Técnica

### 1.1 Verificar Configuração do App

#### Arquivo: `app.config.js`

**Verificar:**

```javascript
✅ name: 'Nossa Maternidade'
✅ slug: 'nossa-maternidade'
✅ version: '1.0.0'
✅ bundleIdentifier (iOS): 'com.nossamaternidade.app'
✅ package (Android): 'com.nossamaternidade.app'
✅ icon: './assets/icon.png'
✅ splash: './assets/splash.png'
```

**Ações:**

- [ ] Verificar se ícone existe (1024x1024px)
- [ ] Verificar se splash existe
- [ ] Validar bundle identifier único
- [ ] Validar package name único

### 1.2 Configurar Build Numbers

**iOS:**

```javascript
ios: {
  buildNumber: '1', // Incrementar a cada build
}
```

**Android:**

```javascript
android: {
  versionCode: 1, // Incrementar a cada build
}
```

**Estratégia:**

- Build de desenvolvimento: Build number atual
- Build de produção: Incrementar automaticamente (`autoIncrement: true` no `eas.json`)

### 1.3 Configurar Permissões iOS

**Arquivo:** `app.config.js` → `ios.infoPlist`

**Permissões Necessárias (verificar se estão todas):**

- ✅ Microfone (mensagens de áudio, videochamadas)
- ✅ Câmera (fotos)
- ✅ Fotos (compartilhamento)
- ✅ Localização (conexão com mães próximas)
- ⚠️ Tracking (personalização) - **REVISAR NECESSIDADE**

**Ação:**

- [ ] Revisar se todas as permissões são necessárias
- [ ] Ajustar descrições para serem específicas
- [ ] Verificar conformidade com App Store Guidelines

### 1.4 Configurar Permissões Android

**Arquivo:** `app.config.js` → `android.permissions`

**Verificar se todas estão presentes:**

```javascript
android: {
  permissions: [
    'CAMERA',
    'RECORD_AUDIO',
    'READ_EXTERNAL_STORAGE',
    'WRITE_EXTERNAL_STORAGE',
    'ACCESS_FINE_LOCATION',
    'ACCESS_COARSE_LOCATION',
    'INTERNET',
    'ACCESS_NETWORK_STATE',
  ],
}
```

**Ação:**

- [ ] Revisar permissões necessárias
- [ ] Implementar runtime permissions (Android 6.0+)
- [ ] Adicionar justificativas de uso no Data Safety form

### 1.5 Configurar EAS Build

**Arquivo:** `eas.json`

**Verificar:**

```json
✅ build.production.ios.autoIncrement: true
✅ build.production.android.autoIncrement: true
✅ submit.production.ios.appleId: [verificar]
✅ submit.production.android.serviceAccountKeyPath: [verificar]
```

**Ações:**

- [ ] Criar service account para Google Play (se não existe)
- [ ] Validar credenciais Apple
- [ ] Testar build preview antes de produção

---

## 🎨 Fase 2: Assets e Conteúdo

### 2.1 Ícones do App

#### iOS App Icon

- **Tamanho:** 1024x1024px
- **Formato:** PNG (sem transparência)
- **Localização:** `assets/icon.png`
- **Requisitos:**
  - Sem arredondamentos (Apple adiciona automaticamente)
  - Sem texto pequeno
  - Sem gradientes ou brilho excessivo

**Ações:**

- [ ] Criar ícone 1024x1024px
- [ ] Validar contraste e visibilidade
- [ ] Testar em diferentes tamanhos

#### Android App Icon

- **Tamanho:** 512x512px (mínimo)
- **Formato:** PNG (sem transparência)
- **Localização:** `assets/icon.png`
- **Adaptive Icon:** Criar se necessário (`assets/adaptive-icon.png`)

**Ações:**

- [ ] Criar ícone 512x512px
- [ ] Criar adaptive icon (foreground + background)
- [ ] Testar em diferentes dispositivos

### 2.2 Splash Screen

#### iOS e Android

- **Tamanho:** 2048x2732px (iOS), 1080x1920px (Android)
- **Formato:** PNG
- **Localização:** `assets/splash.png`
- **Requisitos:**
  - Logo centralizado
  - Background color: `#004E9A` (Ocean Blue) ou cor primária

**Ações:**

- [ ] Criar splash screen
- [ ] Validar em diferentes tamanhos de tela
- [ ] Testar transição para app

### 2.3 Screenshots (OBRIGATÓRIO)

#### iOS App Store

**Tamanhos Necessários:**

| Dispositivo              | Resolução   | Quantidade Mínima          |
| ------------------------ | ----------- | -------------------------- |
| iPhone 6.7" (14 Pro Max) | 1290x2796px | 3-5 screenshots            |
| iPhone 6.5" (11 Pro Max) | 1242x2688px | 3-5 screenshots            |
| iPad Pro 12.9"           | 2048x2732px | 3-5 screenshots (opcional) |

**Telas para Capturar:**

1. Home Screen (com saudação)
2. Chat com NathIA
3. Check-in Emocional
4. Comunidade (MãesValente)
5. Hábitos (opcional)

**Ações:**

- [ ] Capturar screenshots em dispositivos reais ou simulador
- [ ] Editar/otimizar imagens
- [ ] Adicionar legendas/textos explicativos
- [ ] Salvar em `store-metadata/app-store/screenshots/`

#### Google Play Store

**Tamanhos Necessários:**

| Dispositivo | Resolução   | Quantidade Mínima          |
| ----------- | ----------- | -------------------------- |
| Phone       | 1080x1920px | 2-8 screenshots            |
| Tablet 7"   | 1080x1920px | 2-8 screenshots (opcional) |
| Tablet 10"  | 1200x1920px | 2-8 screenshots (opcional) |

**Ações:**

- [ ] Capturar screenshots
- [ ] Editar/otimizar imagens
- [ ] Adicionar legendas (máximo 120 caracteres)
- [ ] Salvar em `store-metadata/google-play/screenshots/`

### 2.4 Vídeo Promocional (Opcional mas Recomendado)

#### App Preview (iOS)

- **Duração:** 15-30 segundos
- **Formato:** MP4, H.264
- **Resolução:** 1080p mínimo
- **Requisitos:**
  - Sem áudio ou com música de fundo royalty-free
  - Mostrar principais funcionalidades
  - Transições suaves

**Ações:**

- [ ] Criar storyboard do vídeo
- [ ] Gravar tela do app
- [ ] Editar vídeo
- [ ] Adicionar música de fundo (opcional)

#### Feature Graphic (Android)

- **Tamanho:** 1024x500px
- **Formato:** PNG ou JPG
- **Requisitos:**
  - Banner horizontal
  - Mostrar logo e principais features
  - Texto legível em diferentes tamanhos

**Ações:**

- [ ] Criar feature graphic
- [ ] Validar legibilidade
- [ ] Salvar em `store-metadata/google-play/feature-graphic.png`

### 2.5 Textos da Store

#### App Name

- **iOS:** Máximo 30 caracteres
- **Android:** Máximo 50 caracteres
- **Sugestão:** "Nossa Maternidade"

#### Subtitle (iOS apenas)

- **Máximo:** 30 caracteres
- **Sugestão:** "Apoio emocional para mães"

#### Descrição Curta

- **iOS:** Máximo 170 caracteres
- **Android:** Máximo 80 caracteres
- **Sugestão:** "Espaço seguro para mães com apoio emocional, IA amigável e comunidade acolhedora."

#### Descrição Longa

- **iOS:** Máximo 4000 caracteres
- **Android:** Máximo 4000 caracteres
- **Template:** (Ver seção completa abaixo)

---

## 📄 Fase 3: Documentação Legal

### 3.1 Privacy Policy (OBRIGATÓRIO)

**Status:** ✅ Template disponível em `docs/PRIVACY_POLICY_TEMPLATE.md`

**Requisitos:**

- URL pública obrigatória
- Conforme LGPD (Brasil)
- Conforme GDPR (se distribuir na UE)
- Listar todos os dados coletados
- Listar terceiros (Supabase, Google Gemini, etc.)
- Direitos do usuário
- Contato do DPO

**Ações:**

1. [ ] Customizar template com dados da empresa:
   - Nome legal da empresa
   - CNPJ
   - Endereço completo
   - Email de contato
   - DPO (Data Protection Officer)
2. [ ] Revisar com advogado especializado em LGPD
3. [ ] Publicar em URL pública:
   - Opção 1: Website próprio: `https://nossamaternidade.com.br/privacy`
   - Opção 2: GitHub Pages
   - Opção 3: Vercel/Netlify
4. [ ] Atualizar link no app (`src/screens/PrivacyPolicyScreen.tsx`)
5. [ ] Adicionar link no `app.config.js`:
   ```javascript
   extra: {
     privacyPolicyUrl: 'https://nossamaternidade.com.br/privacy',
   }
   ```

### 3.2 Terms of Service (OBRIGATÓRIO)

**Status:** ✅ Template disponível em `docs/TERMS_OF_SERVICE_TEMPLATE.md`

**Requisitos:**

- URL pública obrigatória
- Conforme legislação brasileira
- Disclaimer médico (ESSENCIAL para app de saúde)
- Limitação de responsabilidade
- Propriedade intelectual

**Ações:**

1. [ ] Customizar template com dados da empresa
2. [ ] Revisar com advogado
3. [ ] Publicar em URL pública: `https://nossamaternidade.com.br/terms`
4. [ ] Atualizar link no app (`src/screens/TermsOfServiceScreen.tsx`)

### 3.3 Disclaimer Médico (Já Implementado)

**Status:** ✅ Implementado nas telas do app

**Verificar:**

- [ ] Disclaimer visível antes de usar IA
- [ ] Link para termos completos
- [ ] Botão de aceite obrigatório

### 3.4 Data Safety (Google Play)

**Obrigatório para Google Play**

**Formulário a preencher:**

1. **Dados coletados:**
   - Nome
   - Email
   - Dados de saúde (emoções, hábitos)
   - Fotos
   - Localização
   - IDs de dispositivo

2. **Como os dados são usados:**
   - Personalização
   - Funcionalidade do app
   - Análise

3. **Compartilhamento:**
   - Supabase (hospedagem)
   - Google (IA - Gemini)
   - OpenAI (IA - GPT)

4. **Segurança:**
   - Dados criptografados
   - LGPD compliance

**Ações:**

- [ ] Preencher formulário no Google Play Console
- [ ] Revisar todas as respostas
- [ ] Garantir consistência com Privacy Policy

---

## 🏗️ Fase 4: Build e Testes

### 4.1 Preparar Ambiente

**Verificar:**

- [ ] Node.js instalado (v20.11.1 recomendado)
- [ ] Expo CLI atualizado: `npm install -g expo-cli@latest`
- [ ] EAS CLI instalado: `npm install -g eas-cli@latest`
- [ ] Login no EAS: `eas login`
- [ ] Configurar projeto: `eas build:configure`

### 4.2 Build de Preview (Teste)

**Antes de fazer build de produção, testar:**

```bash
# iOS Preview
eas build --platform ios --profile preview

# Android Preview
eas build --platform android --profile preview
```

**Ações:**

- [ ] Testar build iOS em dispositivo real
- [ ] Testar build Android em dispositivo real
- [ ] Validar todas as funcionalidades
- [ ] Testar permissões
- [ ] Verificar crash reports

### 4.3 Build de Produção

**iOS:**

```bash
eas build --platform ios --profile production
```

**Android:**

```bash
eas build --platform android --profile production
```

**Tempo estimado:** 15-30 minutos por build

**Ações:**

- [ ] Aguardar conclusão do build
- [ ] Baixar artefatos
- [ ] Validar assinatura
- [ ] Salvar builds para submissão

### 4.4 Testes Internos

**Antes de submeter, testar:**

1. **Funcionalidades Core:**
   - [ ] Login/Autenticação
   - [ ] Onboarding
   - [ ] Home Screen
   - [ ] Chat com NathIA
   - [ ] Check-in Emocional
   - [ ] Comunidade
   - [ ] Hábitos

2. **Edge Cases:**
   - [ ] App sem internet (offline)
   - [ ] Permissões negadas
   - [ ] Dados inválidos
   - [ ] Timeout de rede

3. **Dispositivos:**
   - [ ] iPhone (últimas 2 versões)
   - [ ] Android (API 24-34)
   - [ ] Tablets (se suportado)

4. **Acessibilidade:**
   - [ ] VoiceOver (iOS)
   - [ ] TalkBack (Android)
   - [ ] Tamanho de fonte aumentado
   - [ ] Modo de alto contraste

---

## 🍎 Fase 5: Submissão iOS (App Store)

### 5.1 Preparar App Store Connect

**Ações:**

1. [ ] Acessar [appstoreconnect.apple.com](https://appstoreconnect.apple.com)
2. [ ] Criar novo app:
   - **Name:** Nossa Maternidade
   - **Primary Language:** Português (Brasil)
   - **Bundle ID:** com.nossamaternidade.app
   - **SKU:** NOSSA_MATERNIDADE_2024 (do `eas.json`)
3. [ ] Configurar App Information:
   - Categoria: Health & Fitness / Social Networking
   - Age Rating: 4+ (revisar)
   - Privacy Policy URL
   - Support URL

### 5.2 Preencher Metadados

#### App Name e Subtitle

- **Name:** Nossa Maternidade (30 chars)
- **Subtitle:** Apoio emocional para mães (30 chars)

#### Descrição

```
Nossa Maternidade é um espaço seguro e acolhedor criado especialmente para mães brasileiras. Aqui você encontra:

💬 NathIA - Sua assistente de IA amigável
Converse sobre suas dúvidas, preocupações e sentimentos sem julgamentos. NathIA está sempre disponível para oferecer apoio emocional.

💚 Check-in Emocional
Registre como você está se sentindo e acompanhe seu bem-estar ao longo do tempo.

👥 Comunidade MãesValente
Conecte-se com outras mães, compartilhe experiências e receba apoio da comunidade.

✅ Hábitos e Autocuidado
Acompanhe seus hábitos diários e receba lembretes personalizados para cuidar de si mesma.

🎬 Mundo Nath
Acesse conteúdo educativo e inspirador sobre maternidade, saúde e bem-estar.

Por que escolher Nossa Maternidade?
✅ Espaço seguro e livre de julgamentos
✅ Privacidade e segurança garantidas (LGPD)
✅ Interface simples e intuitiva
✅ Apoio 24/7 através da IA
✅ Comunidade acolhedora de mães

Importante: Este app oferece apoio emocional e não substitui atendimento médico ou psicológico profissional. Em caso de emergência, procure ajuda médica imediatamente.

Desenvolvido com 💙 para mães brasileiras.
```

#### Keywords

- Maternidade, mãe, apoio emocional, saúde, bem-estar, comunidade, IA, assistente virtual, hábitos, autocuidado

### 5.3 Upload Screenshots

**Ações:**

- [ ] Upload screenshots iPhone 6.7"
- [ ] Upload screenshots iPhone 6.5" (se diferente)
- [ ] Upload screenshots iPad (se suportado)
- [ ] Upload App Preview (vídeo) - opcional

### 5.4 Informações de Versão

**Preencher:**

- **What's New:** Texto da primeira versão
- **App Review Information:**
  - **Contact Information:** Dados de contato
  - **Demo Account:** Criar conta de teste para revisores
  - **Notes:** Instruções para revisores (se necessário)

**Exemplo de "What's New":**

```
Bem-vinda ao Nossa Maternidade! 🎉

Esta é a primeira versão do app, com:
- Chat com NathIA, sua assistente de IA
- Check-in emocional diário
- Comunidade MãesValente
- Acompanhamento de hábitos
- Conteúdo educativo no Mundo Nath

Comece sua jornada de autocuidado e conexão agora mesmo!
```

### 5.5 Submeter para Revisão

**Ações:**

- [ ] Revisar todos os metadados
- [ ] Validar screenshots
- [ ] Testar demo account
- [ ] Clicar em "Submit for Review"

**Tempo de Revisão:** 24-48 horas (geralmente)

---

## 🤖 Fase 6: Submissão Android (Google Play)

### 6.1 Criar App no Google Play Console

**Ações:**

1. [ ] Acessar [play.google.com/console](https://play.google.com/console)
2. [ ] Criar novo app:
   - **Name:** Nossa Maternidade
   - **Default Language:** Português (Brasil)
   - **App or game:** App
   - **Free or paid:** Free
   - **Declarations:** Preencher acordo de distribuição

### 6.2 Preencher Detalhes do App

#### Descrição Curta

- **Máximo:** 80 caracteres
- **Sugestão:** "Espaço seguro para mães com apoio emocional e comunidade acolhedora."

#### Descrição Completa

- Usar mesmo texto da descrição iOS (adaptado)

#### Feature Graphic

- **Tamanho:** 1024x500px
- Upload do banner criado

### 6.3 Preencher Data Safety

**Obrigatório desde 2022**

**Preencher formulário completo** (ver seção 3.4)

**Ações:**

- [ ] Preencher formulário completo
- [ ] Revisar todas as respostas
- [ ] Garantir consistência com Privacy Policy

### 6.4 Preparar Release

**Criar Release:**

1. [ ] Upload AAB (Android App Bundle) de produção
2. [ ] Adicionar Release Notes
3. [ ] Selecionar países de distribuição
4. [ ] Definir rollout (100% ou gradual)

### 6.5 Revisão e Publicação

**Ações:**

- [ ] Revisar todos os dados
- [ ] Validar Data Safety form
- [ ] Clicar em "Review release"
- [ ] Confirmar publicação

**Tempo de Revisão:** 1-3 dias (geralmente)

---

## 📈 Fase 7: Pós-Lançamento

### 7.1 Monitoramento

**Configurar:**

- [ ] Analytics (Firebase Analytics / Mixpanel)
- [ ] Crash reporting (Sentry)
- [ ] Performance monitoring
- [ ] User feedback system

### 7.2 Responder Reviews

**Ações:**

- [ ] Monitorar reviews diariamente
- [ ] Responder reviews (positivas e negativas)
- [ ] Resolver problemas reportados
- [ ] Agradecer feedback positivo

---

## ✅ Checklist Completo

### Preparação Técnica

- [ ] Verificar `app.config.js`
- [ ] Validar bundle identifier único
- [ ] Validar package name único
- [ ] Configurar build numbers
- [ ] Revisar permissões iOS
- [ ] Revisar permissões Android
- [ ] Configurar EAS Build
- [ ] Testar build preview

### Assets

- [ ] Ícone iOS 1024x1024px
- [ ] Ícone Android 512x512px
- [ ] Adaptive icon Android
- [ ] Splash screen
- [ ] Screenshots iOS (3-5 por tamanho)
- [ ] Screenshots Android (2-8)
- [ ] Feature graphic Android
- [ ] App preview vídeo (opcional)

### Documentação Legal

- [ ] Privacy Policy customizada
- [ ] Privacy Policy publicada (URL)
- [ ] Terms of Service customizados
- [ ] Terms of Service publicados (URL)
- [ ] Revisão jurídica completa
- [ ] Data Safety form preenchido (Google Play)

### Builds

- [ ] Build iOS preview testado
- [ ] Build Android preview testado
- [ ] Build iOS produção gerado
- [ ] Build Android produção gerado
- [ ] Testes em dispositivos reais
- [ ] Validação de funcionalidades
- [ ] Testes de acessibilidade

### Submissão iOS

- [ ] App criado no App Store Connect
- [ ] Metadados preenchidos
- [ ] Screenshots uploadados
- [ ] Build selecionado
- [ ] App Review Information preenchida
- [ ] Demo account criada
- [ ] Submetido para revisão

### Submissão Android

- [ ] App criado no Google Play Console
- [ ] Metadados preenchidos
- [ ] Screenshots uploadados
- [ ] Feature graphic uploadado
- [ ] Data Safety form preenchido
- [ ] AAB uploadado
- [ ] Release notes adicionadas
- [ ] Publicado

---

## 📅 Timeline

### Semana 1: Preparação

- **Dia 1-2:** Configuração técnica e revisão de código
- **Dia 3-4:** Criação de assets (ícones, screenshots)
- **Dia 5-7:** Documentação legal e publicação

### Semana 2: Builds e Testes

- **Dia 1-2:** Builds de preview e testes
- **Dia 3-4:** Correções e ajustes
- **Dia 5-7:** Builds de produção e validação final

### Semana 3: Submissão

- **Dia 1-2:** Preparar metadados e screenshots
- **Dia 3:** Submissão iOS
- **Dia 4:** Submissão Android
- **Dia 5-7:** Aguardar revisão

### Semana 4: Ajustes e Lançamento

- **Dia 1-3:** Responder feedback das lojas
- **Dia 4-5:** Correções e resubmissão (se necessário)
- **Dia 6-7:** Publicação e lançamento

**Total: 3-4 semanas**

---

## 🔧 Troubleshooting

### Problemas Comuns

#### Build Falha

**Causa:** Erro de configuração ou dependências
**Solução:**

- Verificar logs: `eas build:list`
- Testar build local: `eas build --local`
- Limpar cache: `eas build --clear-cache`

#### Rejeição App Store

**Causa:** Violação de guidelines
**Solução:**

- Ler feedback completo da Apple
- Corrigir problemas apontados
- Resubmeter com explicação

#### Rejeição Google Play

**Causa:** Data Safety incompleto ou privacy policy
**Solução:**

- Revisar Data Safety form
- Validar Privacy Policy URL
- Resubmeter

---

## 📚 Recursos Úteis

### Documentação

- [Apple App Store Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- [Google Play Policies](https://play.google.com/about/developer-content-policy/)
- [EAS Build Docs](https://docs.expo.dev/build/introduction/)
- [Expo Deployment](https://docs.expo.dev/distribution/introduction/)

---

**Status:** 🟢 **Plano Completo e Pronto para Execução**

**Última atualização:** 24 de Janeiro de 2025
