# 🔍 Guia Completo de Configuração do Sentry - Nossa Maternidade

**Versão:** 1.0.0  
**Última Atualização:** Dezembro 2025

---

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [O Que É Sentry?](#o-que-é-sentry)
3. [Tipos de Autenticação](#tipos-de-autenticação)
4. [Setup Passo a Passo](#setup-passo-a-passo)
5. [Configuração no Projeto](#configuração-no-projeto)
6. [Uso no Código](#uso-no-código)
7. [Verificação e Teste](#verificação-e-teste)
8. [Troubleshooting](#troubleshooting)

---

## Visão Geral

O **Sentry** já está integrado no projeto Nossa Maternidade para:

- ✅ **Error Tracking:** Captura crashes e erros em produção
- ✅ **Performance Monitoring:** Monitora performance do app
- ✅ **Release Tracking:** Rastreia versões do app
- ✅ **User Context:** Rastreia erros por usuário (anônimo)

**Status Atual:** ✅ Configurado (requer apenas DSN válido)

---

## O Que É Sentry?

Sentry é uma plataforma de monitoramento de erros e performance que:

- Captura crashes automaticamente
- Envia notificações em tempo real
- Fornece contexto detalhado de cada erro
- Ajuda a identificar e corrigir bugs rapidamente

**É essencial para produção** - sem ele, você não sabe quando o app quebra para usuários.

---

## Tipos de Autenticação

### 1. **DSN (Data Source Name)** - ✅ USADO NO PROJETO

**O que é:** Uma string que identifica seu projeto Sentry. É o método recomendado para apps React Native.

**Formato:**
```
https://[PUBLIC_KEY]@[ORGANIZATION].ingest.sentry.io/[PROJECT_ID]
```

**Características:**
- ✅ **Seguro para incluir no bundle** (não é um segredo)
- ✅ **Recomendado para apps mobile** (React Native, Expo)
- ✅ **Pode ser incluído no código** (não precisa ser oculto)
- ✅ **Usado para enviar eventos** (erros, crashes)

**Quando usar:**
- Apps mobile (React Native, Expo) ✅
- Enviar erros do cliente ao Sentry ✅
- Configuração no código do app ✅

---

### 2. **Auth Tokens** - ❌ NÃO USADO NO APP

**O que é:** Tokens de autenticação para acessar a API do Sentry (não para enviar erros).

**Formato:**
```
Authorization: Bearer {TOKEN}
```

**Características:**
- ❌ **NÃO para enviar erros do app**
- ✅ **Para acessar API do Sentry** (backup, queries, etc.)
- ❌ **Não deve ir no bundle do app**
- ✅ **Para automação/scripts backend**

**Quando usar:**
- Backups via API
- Queries programáticas
- Integrações backend
- Scripts de deploy

**Exemplo de uso (API):**
```bash
curl -H 'Authorization: Bearer {TOKEN}' \
  https://sentry.io/api/0/organizations/{org}/projects/
```

---

### 3. **API Keys** - ❌ DEPRECATED

**Status:** Legacy, desabilitado para novas contas. Não usar.

---

## Setup Passo a Passo

### Passo 1: Criar Conta no Sentry

1. **Acesse:** https://sentry.io
2. **Crie uma conta gratuita** (ou faça login)
3. **Escolha a organização** (ou crie uma nova)

### Passo 2: Criar Projeto

1. **Dashboard Sentry → "Create Project"**
2. **Selecione a plataforma:**
   - ✅ **React Native** (recomendado para Expo)
   - Ou **Expo** se disponível
3. **Nome do projeto:** `nossa-maternidade-mobile`
4. **Organização:** Escolha sua org

### Passo 3: Obter o DSN

1. **Após criar o projeto, você verá:**
   ```
   Your DSN: https://[PUBLIC_KEY]@[ORG].ingest.sentry.io/[PROJECT_ID]
   ```
2. **Copie este DSN** - você precisará dele no próximo passo

**Onde encontrar depois:**
- Sentry Dashboard → Settings → Projects → `nossa-maternidade-mobile`
- Seção **"Client Keys (DSN)"**

---

## Configuração no Projeto

### Passo 1: Adicionar DSN no `.env`

Abra o arquivo `.env` na raiz do projeto:

```env
# Sentry - Error tracking
EXPO_PUBLIC_SENTRY_DSN=https://[SEU_PUBLIC_KEY]@[SUA_ORG].ingest.sentry.io/[SEU_PROJECT_ID]
```

**Exemplo real:**
```env
EXPO_PUBLIC_SENTRY_DSN=https://a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6@o1234567.ingest.sentry.io/1234567
```

**⚠️ IMPORTANTE:**
- ✅ Substitua `[SEU_PUBLIC_KEY]`, `[SUA_ORG]`, `[SEU_PROJECT_ID]` pelo seu DSN real
- ✅ O DSN pode ficar no `.env` e no código (não é segredo)
- ❌ Não confunda com Auth Token (não precisa)

### Passo 2: Verificar Configuração

O Sentry já está configurado em `src/services/sentry.ts`. A configuração:

- ✅ Lê o DSN de `EXPO_PUBLIC_SENTRY_DSN`
- ✅ Valida o formato do DSN
- ✅ Só inicializa se o DSN for válido
- ✅ Não envia erros em desenvolvimento (`__DEV__`)
- ✅ Remove dados sensíveis antes de enviar
- ✅ Configura release tracking automático

**Arquivo:** `src/services/sentry.ts`

### Passo 3: Reiniciar o Servidor

Após adicionar o DSN no `.env`:

```bash
# Parar o servidor (Ctrl+C)
# Reiniciar
npm start -- --clear
```

---

## Uso no Código

### Integração Automática

O Sentry já está integrado automaticamente com:

1. **Logger (`src/utils/logger.ts`):**
   - `logger.warn()` → Envia warning ao Sentry
   - `logger.error()` → Envia erro ao Sentry

2. **Error Boundary (`src/components/ErrorBoundary.tsx`):**
   - Captura erros React automaticamente
   - Envia ao Sentry com contexto

### Uso Manual (Quando Necessário)

```typescript
import { captureException, captureMessage, setUser, addBreadcrumb } from '@/services/sentry';

// Capturar exceção
try {
  await someRiskyOperation();
} catch (error) {
  captureException(error, {
    tags: { feature: 'chat' },
    extras: { userId: user.id },
  });
}

// Capturar mensagem importante
captureMessage('Usuário completou onboarding', 'info');

// Definir usuário (para rastreamento)
setUser(user.id); // ID anônimo apenas

// Adicionar contexto (breadcrumb)
addBreadcrumb({
  category: 'navigation',
  message: 'Usuário navegou para ChatScreen',
  level: 'info',
});
```

### Rastreamento de Usuário

```typescript
// Ao fazer login
import { setUser } from '@/services/sentry';

setUser(user.id); // Apenas ID anônimo (LGPD compliant)

// Ao fazer logout
setUser(null);
```

**⚠️ LGPD Compliance:**
- ✅ Use apenas ID anônimo do usuário
- ❌ Nunca envie nome, email, ou outros PII
- ✅ O Sentry já filtra dados sensíveis automaticamente (configurado)

---

## Verificação e Teste

### Teste 1: Verificar DSN Configurado

```bash
# Verificar se o DSN está sendo lido
npm start
# Deve aparecer no log: "[Sentry] Inicializado com sucesso" (apenas em produção)
```

### Teste 2: Forçar um Erro de Teste

Adicione temporariamente em algum componente:

```typescript
import { captureException } from '@/services/sentry';

// Em um botão de teste
const testSentry = () => {
  try {
    throw new Error('Teste de Sentry - pode deletar');
  } catch (error) {
    captureException(error, {
      tags: { test: 'true' },
    });
  }
};
```

**Verificar no Sentry:**
1. Dashboard Sentry → Issues
2. Deve aparecer o erro "Teste de Sentry"
3. Clique para ver detalhes completos

### Teste 3: Verificar em Produção

1. **Faça um build de produção:**
   ```bash
   npm run build:android
   # ou
   npm run build:ios
   ```

2. **Teste no dispositivo físico**
3. **Gere um erro** (force crash)
4. **Verifique no dashboard Sentry** (pode levar alguns segundos)

---

## Troubleshooting

### Problema: "DSN não configurado ou inválido"

**Causa:** DSN não está no `.env` ou formato inválido

**Solução:**
1. Verifique se `EXPO_PUBLIC_SENTRY_DSN` está no `.env`
2. Verifique o formato: `https://[KEY]@[ORG].ingest.sentry.io/[ID]`
3. Reinicie o servidor: `npm start -- --clear`

### Problema: Erros não aparecem no Sentry

**Causas possíveis:**

1. **Em desenvolvimento (`__DEV__ = true`):**
   - ✅ Normal - Sentry não envia erros em dev
   - **Solução:** Teste em produção build

2. **DSN inválido:**
   - Verifique se copiou o DSN completo
   - Teste o DSN no formato: `https://[KEY]@[ORG].ingest.sentry.io/[ID]`

3. **Network bloqueado:**
   - Verifique conexão com internet
   - Verifique firewall/proxy

### Problema: DSN exposto no código

**Resposta:** ✅ **Isso é normal e seguro!**

- O DSN (Data Source Name) **não é um segredo**
- É seguro incluir no bundle do app
- Ele só permite **enviar** eventos, não **acessar** dados
- É assim que o Sentry funciona para apps mobile

**O que NÃO expor:**
- ❌ Auth Tokens (para API)
- ❌ Service Role Keys
- ❌ Outras credenciais secretas

---

## Configurações Avançadas

### Customizar Ambiente

O ambiente é detectado automaticamente:
- `development` → quando `__DEV__ = true`
- `production` → quando `__DEV__ = false`

Para customizar, edite `src/services/sentry.ts`:

```typescript
environment: process.env.EXPO_PUBLIC_APP_ENV || (isDevelopment ? 'development' : 'production'),
```

### Sampling Rate (Performance)

Atualmente configurado para 20% em produção:

```typescript
tracesSampleRate: isDevelopment ? 0 : 0.2, // 20% dos traces
```

Para mudar, edite `src/services/sentry.ts`.

### Filtros de Dados

O Sentry já remove dados sensíveis automaticamente. Para customizar:

```typescript
beforeSend(event) {
  // Remover dados sensíveis
  if (event.user) {
    event.user = { id: event.user.id }; // Apenas ID anônimo
  }
  
  // Filtrar erros específicos
  if (event.exception?.values?.[0]?.value?.includes('test-error')) {
    return null; // Não enviar
  }
  
  return event;
}
```

---

## Exemplo Completo de Setup

### 1. Criar Conta e Projeto

```
1. Acessar: https://sentry.io/signup
2. Criar conta
3. Criar projeto: "React Native" → "nossa-maternidade-mobile"
4. Copiar DSN
```

### 2. Configurar no Projeto

```bash
# Editar .env
EXPO_PUBLIC_SENTRY_DSN=https://[SEU_DSN_AQUI]
```

### 3. Testar

```typescript
// Adicionar teste temporário
import { captureMessage } from '@/services/sentry';

captureMessage('Sentry configurado com sucesso!', 'info');
```

### 4. Verificar no Dashboard

- Dashboard Sentry → Issues
- Deve aparecer a mensagem de teste

---

## FAQ

### Preciso de Auth Token para o app?

**Não!** O DSN é suficiente. Auth Tokens são apenas para:
- Acessar API do Sentry (scripts backend)
- Fazer backups
- Queries programáticas

### O DSN pode ser exposto?

**Sim!** O DSN é seguro para incluir no código. Ele só permite enviar eventos, não acessar dados.

### Sentry funciona em desenvolvimento?

**Parcialmente.** 
- ✅ Captura erros, mas não envia em `__DEV__`
- ✅ Para testar, use build de produção

### Quanto custa?

- **Free tier:** 5,000 eventos/mês
- **Team:** $26/mês (50,000 eventos)
- Para produção, recomendado pelo menos Team

---

## Recursos

- [Documentação Sentry React Native](https://docs.sentry.io/platforms/react-native/)
- [Sentry Dashboard](https://sentry.io)
- [Guia de DSN](https://docs.sentry.io/product/sentry-basics/dsn-explainer/)
- [Configuração Expo](https://docs.expo.dev/guides/using-sentry/)

---

## Checklist de Configuração

- [ ] Conta Sentry criada
- [ ] Projeto "nossa-maternidade-mobile" criado
- [ ] DSN copiado
- [ ] DSN adicionado no `.env` como `EXPO_PUBLIC_SENTRY_DSN`
- [ ] Servidor reiniciado (`npm start -- --clear`)
- [ ] Erro de teste enviado
- [ ] Erro verificado no dashboard Sentry
- [ ] Integração testada em produção build

---

**Pronto!** O Sentry está configurado e funcionando. 🎉

Qualquer dúvida, consulte a documentação oficial ou abra uma issue no projeto.

