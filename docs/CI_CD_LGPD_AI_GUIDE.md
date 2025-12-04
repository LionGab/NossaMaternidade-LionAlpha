# CI/CD, LGPD e AI Gateway - Guia de Implementação

Este documento descreve a implementação completa do sistema de CI/CD, segurança LGPD e AI Gateway multi-provider no NossaMaternidade.

## 📋 Visão Geral

### Implementado

- ✅ GitHub Actions workflows profissionais para CI/CD
- ✅ Sistema de segurança LGPD com criptografia e audit logging
- ✅ AI Gateway para orquestrar Gemini, Claude e OpenAI
- ✅ Features de consentimento e assistente NathIA
- ✅ Configurações EAS profissionais

## 🔄 GitHub Actions

### Workflows

1. **expo-doctor.yml** - Valida configuração do Expo
2. **eas-build-production.yml** - Build manual para produção
3. **eas-update.yml** - OTA updates automáticos
4. **preview.yml** - Preview builds em PRs

### Configurar Secrets

```
EXPO_TOKEN
EXPO_PUBLIC_GEMINI_API_KEY
EXPO_PUBLIC_CLAUDE_API_KEY
EXPO_PUBLIC_OPENAI_API_KEY
EXPO_PUBLIC_SUPABASE_URL
EXPO_PUBLIC_SUPABASE_ANON_KEY
```

## 🔒 Segurança LGPD

### SecureStorage

```typescript
import { secureStorage } from '@/core/security';

await secureStorage.storeHealthData(userId, 'pregnancy_data', id, data);
const { data } = await secureStorage.getHealthData(userId, 'pregnancy_data', id);
```

### ConsentManager

```typescript
import { consentManager } from '@/core/security';

await consentManager.saveConsent(userId, 'health_data', true);
const { hasAll } = await consentManager.hasRequiredConsents(userId);
```

### AuditLogger

```typescript
import { auditLogger } from '@/core/security';

await auditLogger.logDataAccess(userId, 'pregnancy_data', id, true);
await auditLogger.flush();
```

## 🤖 AI Gateway

### Uso

```typescript
import { aiGateway } from '@/core/ai';

const response = await aiGateway.chat([{ role: 'user', content: 'Olá!' }]);
// Fallback automático: Gemini → Claude → OpenAI
```

## 📱 Features

### ConsentScreen

```typescript
import { ConsentScreen } from '@/features/consent';

<ConsentScreen userId={user.id} onComplete={() => {}} />
```

### NathIA

```typescript
import { useNathIA } from '@/features/nathia';

const { sendMessage, messages } = useNathIA({
  weekOfPregnancy: 12,
});
```

## 🚀 Próximos Passos

### Críticos (LGPD)

1. Implementar persistência Supabase para audit logs
2. Implementar backup de consentimentos no Supabase
3. Implementar rotação de logs (retenção 5 anos)

### Funcionalidades

1. Integrar ConsentScreen no onboarding
2. Conectar NathIA ao chat existente
3. Adicionar testes unitários

## 📚 Estrutura

```
.github/
├── actions/              # Actions reutilizáveis
└── workflows/           # Workflows CI/CD

src/
├── core/
│   ├── ai/              # AI Gateway
│   └── security/        # LGPD
└── features/
    ├── consent/         # UI de consentimentos
    └── nathia/          # Assistente virtual
```

## 💡 Scripts Úteis

```bash
# Build
npm run build:staging
npm run build:prod

# Update
npm run update:prod

# Tests
npm run test:ci
```

---

**Versão:** 1.0.0 | **Data:** 2 dez 2025
