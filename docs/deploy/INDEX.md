# Deploy - Guia de Navegacao

> Guias completos para deploy do Nossa Maternidade nas lojas

---

## Antes de Deploy

| Documento | Descricao |
|-----------|-----------|
| [../PRODUCTION_READINESS_DIAGNOSTIC.md](../PRODUCTION_READINESS_DIAGNOSTIC.md) | Diagnostico completo de producao |

**Comando de validacao:**
```bash
npm run diagnose:production  # Roda diagnostico completo
```

---

## Por Plataforma

| Documento | Descricao |
|-----------|-----------|
| [ANDROID_DEPLOY_GUIDE.md](./ANDROID_DEPLOY_GUIDE.md) | Deploy para Google Play Store |
| [IOS_DEPLOY_GUIDE.md](./IOS_DEPLOY_GUIDE.md) | Deploy para Apple App Store |
| [DEPLOY_STORES.md](./DEPLOY_STORES.md) | Guia geral para ambas lojas |
| [DEPLOY_SUPABASE.md](./DEPLOY_SUPABASE.md) | Deploy do backend Supabase |

---

## Checklist de Design

| Documento | Descricao |
|-----------|-----------|
| [DESIGN_SYSTEM_CHECKLIST.md](./DESIGN_SYSTEM_CHECKLIST.md) | Checklist de conformidade visual |

---

## Comandos Rapidos

```bash
# Diagnostico pre-deploy
npm run diagnose:production

# Build Android
npm run build:android
eas build --platform android

# Build iOS
npm run build:ios
eas build --platform ios

# Submit para lojas
eas submit --platform android
eas submit --platform ios
```

---

## Fluxo Recomendado

1. Rodar `npm run diagnose:production`
2. Corrigir issues criticos (se houver)
3. Criar build com EAS
4. Testar no dispositivo fisico
5. Submit para loja

---

_Ultima atualizacao: 5 de dezembro de 2025_
