# 🚀 Configuração do Expo para Produção - Nossa Maternidade

**Data:** 05/12/2025  
**Status:** ⚠️ Configuração completa, mas **assets faltando** (bloqueia build)

---

## 📋 RESUMO EXECUTIVO

O arquivo `app.config.js` está **bem configurado e pronto para produção**, mas **faltam os assets obrigatórios** (ícone, splash, etc.) que são necessários para fazer o build.

**Avaliação:** ⭐⭐⭐⭐ (4/5) - Configuração OK, mas precisa de assets

---

## 1️⃣ ARQUIVO DE CONFIGURAÇÃO

### Arquivo Fonte

- **Arquivo:** `app.config.js` (raiz do projeto)
- **Tipo:** JavaScript (com suporte a `dotenv`)
- **Status:** ✅ Configurado corretamente

### Campos Essenciais Validados

| Campo                                  | Valor Atual                        | Status       | Observação            |
| -------------------------------------- | ---------------------------------- | ------------ | --------------------- |
| `name`                                 | `'Nossa Maternidade'`              | ✅ OK        | Nome do app nas lojas |
| `slug`                                 | `'nossa-maternidade'`              | ✅ OK        | Slug do Expo          |
| `version`                              | `'1.0.0'`                          | ✅ OK        | Versão inicial        |
| `orientation`                          | `'portrait'`                       | ✅ OK        | Apenas retrato        |
| `icon`                                 | `'./assets/icon.png'`              | ⚠️ **FALTA** | Asset não existe      |
| `splash.image`                         | `'./assets/splash.png'`            | ⚠️ **FALTA** | Asset não existe      |
| `splash.backgroundColor`               | `'#EC4899'`                        | ✅ OK        | Rosa maternal         |
| `scheme`                               | `'nossamaternidade'`               | ✅ OK        | Deep linking          |
| `ios.bundleIdentifier`                 | `'com.nossamaternidade.app'`       | ✅ OK        | Bundle ID válido      |
| `android.package`                      | `'com.nossamaternidade.app'`       | ✅ OK        | Package válido        |
| `android.adaptiveIcon.foregroundImage` | `'./assets/adaptive-icon.png'`     | ⚠️ **FALTA** | Asset não existe      |
| `notification.icon`                    | `'./assets/notification-icon.png'` | ⚠️ **FALTA** | Asset não existe      |
| `web.favicon`                          | `'./assets/favicon.png'`           | ⚠️ **FALTA** | Asset não existe      |

---

## 2️⃣ ASSETS OBRIGATÓRIOS

### Status Atual dos Assets

**Pasta `assets/`:**

- ✅ Pasta existe
- ❌ **Nenhum asset de ícone/splash encontrado**
- ✅ Apenas `screenshots/` presente

### Assets Necessários

#### 1. **Ícone Principal** (`icon.png`)

- **Caminho:** `./assets/icon.png`
- **Tamanho:** 1024x1024 px
- **Formato:** PNG (sem transparência)
- **Uso:** iOS e Android (base)
- **Status:** ❌ **FALTANDO**

**Especificações:**

- Fundo sólido (rosa maternal #EC4899 ou branco)
- Logo centralizado
- Sem bordas ou padding (Expo adiciona automaticamente)
- Sem transparência

---

#### 2. **Splash Screen** (`splash.png`)

- **Caminho:** `./assets/splash.png`
- **Tamanho:** 1242x2436 px (iPhone 6.5") ou maior
- **Formato:** PNG
- **Uso:** Tela de splash inicial
- **Status:** ❌ **FALTANDO**

**Especificações:**

- Fundo: Rosa maternal (#EC4899)
- Logo centralizado (opcional)
- Texto "Nossa Maternidade" (opcional)
- Safe area considerada (não colocar conteúdo nas bordas)

**Nota:** O `app.config.js` também referencia `splash-icon.png` no plugin `expo-splash-screen`:

```javascript
image: './assets/splash-icon.png', // ⚠️ TAMBÉM FALTA
```

---

#### 3. **Adaptive Icon Android** (`adaptive-icon.png`)

- **Caminho:** `./assets/adaptive-icon.png`
- **Tamanho:** 1024x1024 px
- **Formato:** PNG (com transparência)
- **Uso:** Android 8.0+ (adaptive icons)
- **Status:** ❌ **FALTANDO**

**Especificações:**

- **Foreground:** Logo/ícone centralizado (máx. 432x432 px no centro)
- **Background:** Cor sólida (rosa #EC4899) - definida em `adaptiveIcon.backgroundColor`
- **Safe zone:** Conteúdo importante dentro de 432x432 px central
- **Transparência:** Permitida no foreground

**Nota:** O `app.config.js` também define `monochromeImage` (Android 13+):

```javascript
monochromeImage: './assets/adaptive-icon.png', // Mesmo arquivo
```

---

#### 4. **Notification Icon** (`notification-icon.png`)

- **Caminho:** `./assets/notification-icon.png`
- **Tamanho:** 96x96 px (Android) ou 20x20 pt (iOS)
- **Formato:** PNG (sem transparência para Android)
- **Uso:** Notificações push
- **Status:** ❌ **FALTANDO**

**Especificações:**

- Fundo sólido branco ou rosa
- Ícone simples e reconhecível
- Alta legibilidade em tamanho pequeno

---

#### 5. **Favicon Web** (`favicon.png`)

- **Caminho:** `./assets/favicon.png`
- **Tamanho:** 32x32 px ou 16x16 px
- **Formato:** PNG ou ICO
- **Uso:** Web (opcional, mas recomendado)
- **Status:** ❌ **FALTANDO**

---

#### 6. **Splash Icon** (`splash-icon.png`)

- **Caminho:** `./assets/splash-icon.png`
- **Tamanho:** Variável (usado no plugin expo-splash-screen)
- **Formato:** PNG
- **Uso:** Plugin expo-splash-screen (ícone na splash)
- **Status:** ❌ **FALTANDO**

**Nota:** Este é usado pelo plugin `expo-splash-screen` com `imageWidth: 200`.

---

## 3️⃣ CONFIGURAÇÕES ESPECÍFICAS POR PLATAFORMA

### iOS ✅

**Configurações Validadas:**

- ✅ `bundleIdentifier`: `com.nossamaternidade.app`
- ✅ `buildNumber`: `1` (auto-increment habilitado no EAS)
- ✅ `supportsTablet`: `true`
- ✅ `infoPlist` completo com:
  - Permissões (microfone, câmera, fotos, localização, tracking)
  - Descrições em PT-BR
  - Privacy Manifest (iOS 17+)
- ✅ `ITSAppUsesNonExemptEncryption`: `false` (correto para app sem criptografia custom)
- ✅ `UIBackgroundModes`: `['fetch', 'remote-notification']`

**Status:** ✅ **Pronto** (apenas falta ícone)

---

### Android ✅

**Configurações Validadas:**

- ✅ `package`: `com.nossamaternidade.app`
- ✅ `versionCode`: `1` (auto-increment habilitado no EAS)
- ✅ `targetSdkVersion`: `34` (Android 14)
- ✅ `compileSdkVersion`: `34`
- ✅ `minSdkVersion`: `24` (Android 7.0 - 95%+ cobertura)
- ✅ `edgeToEdgeEnabled`: `true`
- ✅ `predictiveBackGestureEnabled`: `true` (Android 14+)
- ✅ Permissões declaradas corretamente
- ✅ Intent filters para deep linking configurados

**Status:** ✅ **Pronto** (apenas falta ícone e adaptive-icon)

---

## 4️⃣ VARIÁVEIS DE AMBIENTE

### Configuração no `app.config.js`

O arquivo usa `require('dotenv').config()` e expõe variáveis via `extra`:

```javascript
extra: {
  supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL || '',
  supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '',
  // ... outras variáveis
}
```

**Status:** ✅ **Configurado corretamente**

### Variáveis Necessárias

**Obrigatórias:**

- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`
- `EXPO_PUBLIC_SUPABASE_FUNCTIONS_URL`

**Opcionais (mas recomendadas):**

- `EXPO_PUBLIC_SENTRY_DSN` (error tracking)
- `EXPO_PUBLIC_CLAUDE_API_KEY`
- `EXPO_PUBLIC_OPENAI_API_KEY`
- `EXPO_PUBLIC_ENABLE_AI_FEATURES`
- `EXPO_PUBLIC_ENABLE_ANALYTICS`

**Nota:** `EXPO_PUBLIC_GEMINI_API_KEY` foi removida por segurança (chave fica no Supabase Edge Function).

---

## 5️⃣ INTEGRAÇÃO COM EAS BUILD/SUBMIT

### EAS Project ID

- **ID:** `ceee9479-e404-47b8-bc37-4f913c18f270`
- **Status:** ✅ Configurado em `app.config.js` → `extra.eas.projectId`

### EAS Build Profiles (`eas.json`)

**Profiles configurados:**

- ✅ `development` - Development client
- ✅ `preview` - APK interno
- ✅ `staging` - APK interno
- ✅ `production` - App Bundle (Android) / IPA (iOS)

**Status:** ✅ **Configurado corretamente**

### EAS Submit (`eas.json`)

**Configuração:**

- ✅ `production` profile configurado
- ⚠️ **Placeholders que precisam ser preenchidos:**
  - `ascAppId`: `"YOUR_APP_STORE_CONNECT_APP_ID"` → Preencher após criar app no App Store Connect
  - `appleTeamId`: `"YOUR_APPLE_TEAM_ID"` → Preencher com Team ID da Apple Developer
  - `serviceAccountKeyPath`: `"./google-play-service-account.json"` → Criar arquivo após configurar Google Play Console

**Status:** ⚠️ **Configurado, mas precisa de valores reais**

---

## 6️⃣ CHECKLIST PARA PRODUÇÃO

### ✅ Configuração do Expo

- [x] `app.config.js` completo e válido
- [x] `name`, `slug`, `version` definidos
- [x] `bundleIdentifier` (iOS) e `package` (Android) definidos
- [x] Permissões iOS configuradas
- [x] Permissões Android configuradas
- [x] Deep linking configurado
- [x] Variáveis de ambiente via `extra`

### ❌ Assets Obrigatórios

- [ ] `assets/icon.png` (1024x1024)
- [ ] `assets/splash.png` (1242x2436 ou maior)
- [ ] `assets/adaptive-icon.png` (1024x1024)
- [ ] `assets/notification-icon.png` (96x96)
- [ ] `assets/favicon.png` (32x32) - opcional
- [ ] `assets/splash-icon.png` (200px width) - usado pelo plugin

### ⚠️ EAS Submit (Preencher antes de publicar)

- [ ] Criar app no App Store Connect e obter `ascAppId`
- [ ] Obter `appleTeamId` da Apple Developer
- [ ] Criar Service Account no Google Play Console
- [ ] Baixar `google-play-service-account.json`
- [ ] Atualizar `eas.json` com valores reais

### ✅ Variáveis de Ambiente

- [ ] Criar arquivo `.env` baseado em `env.template`
- [ ] Preencher `EXPO_PUBLIC_SUPABASE_URL`
- [ ] Preencher `EXPO_PUBLIC_SUPABASE_ANON_KEY`
- [ ] Preencher `EXPO_PUBLIC_SUPABASE_FUNCTIONS_URL`
- [ ] Configurar `EXPO_PUBLIC_SENTRY_DSN` (recomendado)
- [ ] Configurar outras variáveis opcionais conforme necessário

---

## 7️⃣ INSTRUÇÕES PARA CRIAR ASSETS

### Como Criar os Assets

#### Opção 1: Usar Ferramentas Online

1. **Figma / Canva / Adobe Express**
   - Criar design do ícone (1024x1024)
   - Exportar como PNG
   - Salvar em `assets/icon.png`

2. **Geradores Automáticos**
   - [AppIcon.co](https://www.appicon.co/) - Gera todos os tamanhos
   - [IconKitchen](https://icon.kitchen/) - Gera adaptive icons
   - [Splash Screen Generator](https://www.figma.com/community/plugin/1128190275492002146/splash-screen-generator)

#### Opção 2: Usar Expo CLI (Recomendado)

```bash
# Gerar assets a partir de um ícone base
npx expo install @expo/image-utils
# Ou usar o Expo Asset Generator
```

#### Opção 3: Criar Manualmente

1. **Ícone Principal** (`icon.png`):
   - Abrir design no Figma/Photoshop
   - Canvas: 1024x1024 px
   - Logo centralizado
   - Fundo sólido (rosa #EC4899 ou branco)
   - Exportar PNG

2. **Splash Screen** (`splash.png`):
   - Canvas: 1242x2436 px (ou maior)
   - Fundo: Rosa #EC4899
   - Logo centralizado (opcional)
   - Exportar PNG

3. **Adaptive Icon** (`adaptive-icon.png`):
   - Canvas: 1024x1024 px
   - Logo/ícone no centro (máx. 432x432 px)
   - Fundo transparente
   - Exportar PNG com transparência

4. **Notification Icon** (`notification-icon.png`):
   - Canvas: 96x96 px
   - Ícone simples e legível
   - Fundo branco ou rosa
   - Exportar PNG

---

## 8️⃣ PRÓXIMOS PASSOS

### Imediato (Bloqueia Build)

1. ✅ **Criar assets obrigatórios** (ícone, splash, adaptive-icon, notification-icon)
2. ✅ **Salvar em `assets/`**
3. ✅ **Validar que `app.config.js` referencia corretamente**

### Antes de Publicar

1. ✅ **Preencher `eas.json`** com valores reais (App Store Connect ID, Google Play Service Account)
2. ✅ **Configurar variáveis de ambiente** no EAS Secrets (se necessário)
3. ✅ **Testar build local** (`eas build --platform ios --profile preview`)

### Depois de Publicar

1. ✅ **Monitorar Sentry** (se configurado)
2. ✅ **Validar deep linking** em produção
3. ✅ **Testar notificações push** (se configurado)

---

## 📚 REFERÊNCIAS

- [Expo App Configuration](https://docs.expo.dev/workflow/configuration/)
- [EAS Build](https://docs.expo.dev/build/introduction/)
- [EAS Submit](https://docs.expo.dev/submit/introduction/)
- [App Icons Guide](https://docs.expo.dev/guides/app-icons/)
- [Splash Screens](https://docs.expo.dev/guides/splash-screens/)

---

**Status Final:** ⚠️ **Configuração OK, mas precisa de assets para build**
