# 📱 Plano de Migração - App Store & Google Play

**Nossa Maternidade** - Plano de deploy para lojas de aplicativos

---

## 📊 Status Atual

### ✅ Telas Implementadas (Prontas para uso)

| Tela | Status | Navegável | Dark Mode | Acessibilidade |
|------|--------|-----------|-----------|----------------|
| HomeScreen | ✅ Completa | ✅ | ✅ | ✅ |
| ChatScreen | ✅ Completa | ✅ | ✅ | ✅ |
| CommunityScreen | ✅ Completa | ✅ | ✅ | ✅ |
| HabitsScreen | ✅ Completa | ✅ | ✅ | ✅ |
| MundoNathScreen | ✅ Completa | ✅ | ✅ | ✅ |
| RitualScreen | ✅ Completa | ✅ | ✅ | ✅ |
| SOSMaeScreen | ✅ Completa | ✅ | ✅ | ✅ |
| DesculpaHojeScreen | ✅ Completa | ✅ | ✅ | ✅ |
| ProfileScreen | ✅ Completa | ✅ | ✅ | ✅ |
| SettingsScreen | ✅ Completa | ✅ | ✅ | ✅ |
| OnboardingScreen | ✅ Completa | ✅ | ✅ | ✅ |
| SearchScreen | ✅ Completa | ✅ | ✅ | ✅ |
| NotFoundScreen | ✅ Completa | ✅ | ✅ | ✅ |

### 📋 Types Implementados

- ✅ `src/types/ritual.ts` - EmotionValue, RitualStep, BreathingConfig, etc.
- ✅ `src/types/sos.ts` - SentimentType, SOSInteraction, CommunityTestimonial
- ✅ `src/types/guilt.ts` - GuiltType, GuiltValidation, Badge, GuiltStats

### 🧭 Navegação Configurada

```
RootStack (NativeStackNavigator)
├── Splash
├── Auth (Login)
├── Onboarding
└── Main (BottomTabs)
    ├── Home 🏠
    ├── MaesValentes 👥
    ├── Chat 💬
    ├── MundoNath 📚
    └── Habitos ❤️

Modais:
├── Ritual 🧘
├── SOSMae 🆘
├── DesculpaHoje 💙
├── Diary 📓
├── ContentDetail 📄
├── ChatSessions 💬
├── Settings ⚙️
├── Profile 👤
└── Search 🔍
```

---

## 🚀 Checklist de Deploy

### Fase 1: Validação de Qualidade (1-2 dias)

#### TypeScript & Lint
- [ ] `npm run type-check` → 0 errors
- [ ] `npm run lint` → 0 critical warnings
- [ ] `npm run lint:fix` → correções automáticas aplicadas

#### Testes
- [ ] `npm test` → todos passando
- [ ] Coverage mínimo 40% (MVP)
- [ ] Testes de navegação entre todas as telas
- [ ] Testes de componentes críticos

#### Performance
- [ ] FlatList em todas as listas (não ScrollView + map)
- [ ] Componentes de lista memoizados
- [ ] Imagens otimizadas (expo-image, WebP)
- [ ] Lazy loading configurado

### Fase 2: Build e Configuração (2-3 dias)

#### app.json / app.config.js
```json
{
  "expo": {
    "name": "Nossa Maternidade",
    "slug": "nossa-maternidade",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#E91E63"
    },
    "ios": {
      "bundleIdentifier": "com.nossamaternidade.app",
      "supportsTablet": false,
      "infoPlist": {
        "NSCameraUsageDescription": "Para foto de perfil",
        "NSPhotoLibraryUsageDescription": "Para escolher foto de perfil",
        "NSMicrophoneUsageDescription": "Para gravar áudio nas conversas"
      }
    },
    "android": {
      "package": "com.nossamaternidade.app",
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#E91E63"
      },
      "permissions": [
        "CAMERA",
        "READ_EXTERNAL_STORAGE",
        "RECORD_AUDIO"
      ]
    },
    "plugins": [
      "expo-router",
      "expo-secure-store",
      [
        "expo-notifications",
        {
          "icon": "./assets/notification-icon.png",
          "color": "#E91E63"
        }
      ]
    ]
  }
}
```

#### eas.json
```json
{
  "cli": {
    "version": ">= 5.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "autoIncrement": true
    }
  },
  "submit": {
    "production": {}
  }
}
```

### Fase 3: Assets e Branding (1 dia)

#### iOS (App Store Connect)
- [ ] App Icon 1024x1024
- [ ] Splash Screen 2732x2732
- [ ] Screenshots iPhone 6.7" (1290x2796) - 5 imagens
- [ ] Screenshots iPhone 6.5" (1242x2688) - 5 imagens
- [ ] Screenshots iPhone 5.5" (1242x2208) - 5 imagens

#### Android (Google Play Console)
- [ ] App Icon 512x512
- [ ] Feature Graphic 1024x500
- [ ] Adaptive Icon (foreground + background)
- [ ] Screenshots Phone (1080x1920) - 8 imagens
- [ ] Screenshots Tablet 7" (opcional)
- [ ] Screenshots Tablet 10" (opcional)

### Fase 4: Documentação Legal (1 dia)

- [ ] Privacy Policy URL (hospedada)
- [ ] Terms of Service URL (hospedada)
- [ ] LGPD compliance documentado
- [ ] Data safety section preenchida

### Fase 5: Build Final (1 dia)

```bash
# Instalar EAS CLI
npm install -g eas-cli

# Login
eas login

# Build iOS
eas build --platform ios --profile production

# Build Android
eas build --platform android --profile production

# Submit iOS
eas submit --platform ios --latest

# Submit Android
eas submit --platform android --latest
```

---

## 📋 Requisitos das Lojas

### App Store (iOS)

| Requisito | Status | Notas |
|-----------|--------|-------|
| Expo SDK 51+ | ✅ | Configurado |
| Age Rating | 4+ | Sem conteúdo adulto |
| Privacy Labels | 📋 Pendente | Dados coletados |
| Review Guidelines | ✅ | Sem violações |
| TestFlight | 📋 Pendente | Beta testing |

### Google Play (Android)

| Requisito | Status | Notas |
|-----------|--------|-------|
| Target SDK 34+ | ✅ | Configurado |
| Content Rating | 📋 Pendente | Questionnaire |
| Data Safety | 📋 Pendente | Privacy form |
| Closed Testing | 📋 Pendente | Beta testing |

---

## 🔐 Segurança

### Supabase
- ✅ RLS policies em todas as tabelas
- ✅ Service role key nunca exposta no app
- ✅ Row-level security habilitado
- ✅ LGPD compliance

### Dados Sensíveis
- ✅ `expo-secure-store` para tokens
- ✅ Nenhum dado sensível em AsyncStorage
- ✅ HTTPS em todas as requisições

### Crash Reporting
- ✅ Sentry configurado
- ✅ `logger` centralizado (não console.log)
- ✅ Error boundaries em componentes críticos

---

## 📊 Métricas Pós-Deploy

### Monitorar
- DAU (Daily Active Users)
- Crash-free rate (> 99%)
- ANR rate Android (< 0.47%)
- Tempo de carregamento inicial (< 3s)
- Retenção D1, D7, D30

### Ferramentas
- Supabase Analytics
- Sentry (erros)
- expo-updates (OTA)

---

## 🗓 Timeline Estimada

| Fase | Duração | Data Estimada |
|------|---------|---------------|
| Validação de Qualidade | 1-2 dias | Dia 1-2 |
| Build e Configuração | 2-3 dias | Dia 3-5 |
| Assets e Branding | 1 dia | Dia 6 |
| Documentação Legal | 1 dia | Dia 7 |
| Build Final | 1 dia | Dia 8 |
| Submissão iOS | 1-7 dias (review) | Dia 9-15 |
| Submissão Android | 1-3 dias (review) | Dia 9-12 |
| **Total** | **~2 semanas** | - |

---

## ✅ Próximos Passos Imediatos

1. **Rodar validação**: `npm run type-check && npm run lint`
2. **Testar navegação**: Abrir cada tela manualmente
3. **Verificar dark mode**: Toggle em todas as telas
4. **Preparar assets**: Icons, splash, screenshots
5. **Criar contas**: App Store Connect + Google Play Console
6. **Build preview**: `eas build --profile preview`
7. **Beta testing**: TestFlight (iOS) + Internal Testing (Android)
8. **Build production**: `eas build --profile production`
9. **Submit**: `eas submit`

---

**Última atualização**: Dezembro 2025

