# Guia de Testes no Windows - Nossa Maternidade

## Limitações no Windows

No Windows, não é possível testar iOS nativamente (requer Mac + Xcode). Mas você pode:

1. **Testar Android** - Funciona perfeitamente no Windows
2. **Testar Web** - Para verificar design e funcionalidades básicas
3. **Usar EAS Build** - Para builds de teste em dispositivos reais

## Opções de Teste

### Opção 1: Testar Android (Recomendado)

```bash
# Instalar Android Studio primeiro
# Depois:
npm run android
```

**O que testar:**

- Safe areas (status bar)
- Fontes Roboto
- Haptic feedback
- Elevation (shadows Material Design)
- Ripple effect em botões
- Text Scaling

### Opção 2: Testar Web (Design e Funcionalidades)

```bash
npm run web
```

**O que testar:**

- Design geral
- Funcionalidades básicas
- Dark mode
- Layout responsivo

**Limitações:**

- Não testa haptic feedback
- Não testa safe areas nativas
- Shadows podem aparecer diferentes

### Opção 3: EAS Build para Teste em Dispositivos Reais

```bash
# Build para Android (funciona no Windows)
eas build --platform android --profile preview

# Build para iOS (requer Mac, mas pode fazer build na nuvem)
eas build --platform ios --profile preview
```

Depois instale o APK/IPA no dispositivo físico.

## Validações que Funcionam no Windows

Todas as validações automáticas funcionam:

```bash
npm run validate:pre-deploy  # ✅ Funciona
npm run validate:design      # ✅ Funciona
npm run validate:platform    # ✅ Funciona (mostra warnings)
npm run prepare:assets        # ✅ Funciona
npm run type-check            # ✅ Funciona
```

## Checklist de Testes no Windows

### Validações Automáticas

- [x] `npm run validate:pre-deploy` → Todas passam
- [x] `npm run validate:design` → 0 violações críticas
- [x] `npm run type-check` → 0 erros

### Testes Android (se tiver Android Studio)

- [ ] App inicia sem erros
- [ ] Safe areas respeitadas
- [ ] Fontes Roboto corretas
- [ ] Haptic feedback funcionando
- [ ] Elevation aparecendo
- [ ] Ripple effect em botões
- [ ] Text Scaling funcionando
- [ ] Dark mode funcionando

### Testes Web (design visual)

- [ ] Layout correto
- [ ] Cores corretas
- [ ] Dark mode funcionando
- [ ] Componentes renderizando

## Próximos Passos

1. **Se tiver Android Studio:** Teste Android localmente
2. **Se não tiver:** Use EAS Build para gerar APK e testar em dispositivo físico
3. **Para iOS:** Use EAS Build (build na nuvem) ou teste em Mac/iOS Simulator

## Troubleshooting

### Erro: "Xcode must be fully installed"

**Solução:** Normal no Windows. Use `npm run android` ou `npm run web` em vez de `npm run ios`.

### Erro: Android Studio não encontrado

**Solução:**

1. Instale Android Studio
2. Configure ANDROID_HOME
3. Adicione platform-tools ao PATH

### Como testar iOS sem Mac?

**Solução:** Use EAS Build na nuvem:

```bash
eas build --platform ios --profile preview
```

Depois instale no iPhone via TestFlight ou link direto.
