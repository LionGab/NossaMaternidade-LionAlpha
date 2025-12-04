# Guia de Testes - Sistema de Design iOS/Android

## Como Testar o Sistema de Design

Este guia mostra como testar o sistema de design antes de fazer deploy.

## 1. Validações Automáticas

### 1.1 Validação de Design Tokens

```bash
npm run validate:design
```

**O que valida:**

- Cores hardcoded (#xxx, rgba, named colors)
- Uso de `src/design-system/` (legado)
- Sugestões de tokens equivalentes

**Resultado esperado:** 0 violações críticas

### 1.2 Validação de Platform Design

```bash
npm run validate:platform
```

**O que valida:**

- Fontes iOS (SF Pro) e Android (Roboto)
- Safe areas em telas
- Haptic feedback em componentes interativos
- Touch targets (44pt iOS, 48dp Android)
- Dynamic Type/Text Scaling

**Resultado esperado:** 0 erros, warnings aceitáveis

### 1.3 Validação Pré-Deploy Completa

```bash
npm run validate:pre-deploy
```

**O que valida:**

- TypeScript compila sem erros
- Design tokens corretos
- Platform design correto
- app.config.js configurado
- eas.json configurado
- Assets presentes
- Nenhum uso de sistema legado

**Resultado esperado:** Todas as validações passam

### 1.4 Validação de Assets

```bash
npm run prepare:assets
```

**O que valida:**

- Icon.png existe
- Splash.png existe
- Adaptive icon existe
- Tamanhos mínimos

**Resultado esperado:** Todos os assets obrigatórios presentes

## 2. Testes Manuais

### 2.1 Testar em iOS

1. **Iniciar app:**

   ```bash
   npm run ios
   ```

2. **Verificar:**
   - Safe areas respeitadas (notch, home indicator)
   - Fontes SF Pro sendo usadas
   - Haptic feedback funcionando
   - Shadows aparecendo corretamente
   - Dynamic Type funcionando (ajustar em Configurações > Acessibilidade)

### 2.2 Testar em Android

1. **Iniciar app:**

   ```bash
   npm run android
   ```

2. **Verificar:**
   - Safe areas respeitadas (status bar)
   - Fontes Roboto sendo usadas
   - Haptic feedback funcionando
   - Elevation aparecendo corretamente
   - Ripple effect em botões
   - Text Scaling funcionando (ajustar em Configurações > Acessibilidade)

### 2.3 Testar Dark Mode

1. **Alternar tema:**
   - Usar toggle de tema no app
   - Ou seguir preferência do sistema

2. **Verificar:**
   - Todas as cores adaptam corretamente
   - Contraste mantido (WCAG AAA)
   - Transições suaves

### 2.4 Testar Acessibilidade

1. **Ativar VoiceOver (iOS) ou TalkBack (Android)**
2. **Navegar pelo app:**
   - Verificar se todos os elementos têm labels
   - Verificar se navegação faz sentido
   - Verificar se ações são claras

3. **Testar Dynamic Type/Text Scaling:**
   - Aumentar tamanho de fonte no sistema
   - Verificar se textos ajustam
   - Verificar se layout não quebra

## 3. Checklist de Testes

Antes de considerar pronto para deploy:

### Validações Automáticas

- [ ] `npm run validate:design` → 0 violações críticas
- [ ] `npm run validate:platform` → 0 erros
- [ ] `npm run validate:pre-deploy` → Todas passam
- [ ] `npm run prepare:assets` → Todos assets presentes
- [ ] `npm run type-check` → 0 erros TypeScript

### Testes iOS

- [ ] Safe areas funcionando
- [ ] Fontes SF Pro corretas
- [ ] Haptic feedback funcionando
- [ ] Shadows aparecendo
- [ ] Dynamic Type funcionando

### Testes Android

- [ ] Safe areas funcionando
- [ ] Fontes Roboto corretas
- [ ] Haptic feedback funcionando
- [ ] Elevation aparecendo
- [ ] Ripple effect funcionando
- [ ] Text Scaling funcionando

### Testes Cross-Platform

- [ ] Dark mode funcionando
- [ ] Acessibilidade completa
- [ ] Touch targets >= 44pt/48dp
- [ ] Contraste WCAG AAA

## 4. Problemas Comuns

### Erro: "require is not defined"

**Solução:** Scripts foram corrigidos para usar import dinâmico. Se persistir, verifique Node.js version (20+).

### Erro: "glob is not defined"

**Solução:** O script tem fallback manual. Se necessário, instale: `npm install glob`

### Validação falha mas código parece correto

**Solução:** Verifique se está usando tokens do design system, não valores hardcoded.

## 5. Próximos Passos Após Testes

Se todos os testes passarem:

1. Ver [DESIGN_SYSTEM_CHECKLIST.md](./docs/deploy/DESIGN_SYSTEM_CHECKLIST.md)
2. Ver [IOS_DEPLOY_GUIDE.md](./docs/deploy/IOS_DEPLOY_GUIDE.md) ou [ANDROID_DEPLOY_GUIDE.md](./docs/deploy/ANDROID_DEPLOY_GUIDE.md)
3. Fazer build e deploy
