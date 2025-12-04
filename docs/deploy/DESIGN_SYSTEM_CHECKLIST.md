# Design System Checklist - Pré-Deploy

## Checklist Completo Antes de Deploy iOS/Android

### Validação de Código

- [ ] TypeScript compila sem erros (`npm run type-check`)
- [ ] Design tokens validados (`npm run validate:design`)
- [ ] Platform design validado (`npm run validate:platform`)
- [ ] Validação pré-deploy passou (`npm run validate:pre-deploy`)

### Design System

- [ ] Zero uso de `src/design-system/` (legado)
- [ ] Todos os componentes usam `src/theme/tokens.ts`
- [ ] Zero cores hardcoded (#xxx, rgba, named colors)
- [ ] Todos os componentes suportam iOS e Android
- [ ] Dark mode funcionando em todas as telas

### Componentes

- [ ] Button com haptic feedback implementado
- [ ] Text com Dynamic Type/Text Scaling suportado
- [ ] Box com shadows/elevation adaptativos
- [ ] Safe areas respeitadas em todas as telas
- [ ] Touch targets >= 44pt (iOS) / 48dp (Android)

### Acessibilidade

- [ ] WCAG AAA compliance (7:1 text, 4.5:1 large)
- [ ] Accessibility labels em todos componentes interativos
- [ ] Accessibility roles apropriados
- [ ] Screen reader compatibility testada

### Assets

- [ ] Icon.png (1024x1024) existe
- [ ] Splash.png existe
- [ ] Adaptive icon (iOS/Android) configurado
- [ ] Screenshots preparados (se necessário)

### Configuração

- [ ] app.config.js configurado (iOS bundleIdentifier, Android package)
- [ ] eas.json configurado (build profiles)
- [ ] Versões atualizadas (iOS buildNumber, Android versionCode)

## Comandos de Validação

```bash
# Validação completa
npm run validate:pre-deploy

# Validações individuais
npm run type-check
npm run validate:design
npm run validate:platform
```

## Próximos Passos

Após passar todas as validações:

1. Ver [IOS_DEPLOY_GUIDE.md](./IOS_DEPLOY_GUIDE.md) para deploy iOS
2. Ver [ANDROID_DEPLOY_GUIDE.md](./ANDROID_DEPLOY_GUIDE.md) para deploy Android
