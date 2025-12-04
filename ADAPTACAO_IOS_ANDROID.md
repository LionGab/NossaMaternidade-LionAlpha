# 📱 Adaptação iOS/Android - Nossa Maternidade

## ✅ Mudanças Aplicadas

### 1. Remoção da Seção "Desculpa Hoje"

- ✅ Removido card "Desculpa Hoje" da HomeScreen
- ✅ Removido handler `handleDesculpaHojePress`
- ✅ Removida rota `DesculpaHoje` de `navigation/types.ts`
- ✅ Mantido apenas SOS Mãe como suporte emergencial

### 2. SOS Mãe - Card Único de Suporte

- ✅ Card destacado na HomeScreen
- ✅ Touch target mínimo 48px (WCAG AAA)
- ✅ Gradiente vermelho para emergência
- ✅ Texto claro: "Suporte emergencial 24/7. Estamos aqui por você."

### 3. Adaptações Mobile (iOS/Android)

#### Safe Areas

- ✅ Todas as telas usam `useSafeAreaInsets()`
- ✅ `SafeAreaContainer` no HomeScreen
- ✅ Safe areas configuradas em:
  - SOSMaeScreen
  - RitualScreen
  - ChatScreen
  - Todas as principais telas

#### Touch Targets

- ✅ Mínimo 48px (iOS/Android guideline)
- ✅ Botões com `minHeight: Tokens.touchTargets.min`
- ✅ Espaçamento adequado entre elementos

#### Textos Otimizados

- ✅ Tamanho base: 17px (iOS guideline)
- ✅ Hierarquia clara (xl, lg, md, sm, xs)
- ✅ Contraste WCAG AAA
- ✅ Labels de acessibilidade completos

#### Haptic Feedback

- ✅ Todas as ações importantes têm feedback háptico
- ✅ `Haptics.impactAsync()` configurado
- ✅ Diferentes intensidades (Light, Medium, Heavy)

### 4. Design System Rosa + Azul (60/40)

#### Rosa (60% - Principal)

- `primary`: #FF6B9D - CTAs, botões principais
- `rose-light`: #FFB3D9 - Backgrounds suaves
- `rose-subtle`: #FFE8F0 - Fundos sutis

#### Azul (40% - Accent)

- `azul-primary`: #5BA3D9 - Informações, badges
- `azul-light`: #B8D9F2 - Backgrounds informativos
- `azul-subtle`: #EDF5FB - Cards informativos

### 5. Navegação Atualizada

```typescript
// Rotas disponíveis:
- SOSMae: undefined // 🆘 Suporte emergencial
- Ritual: { ritual?, autoStart?, message? } // 🧘 Ritual
- ChatSessions: undefined // 💬 Histórico
```

## 📋 Checklist para Stores

### iOS App Store

- [x] Safe areas configuradas
- [x] Touch targets adequados (48px+)
- [x] Textos legíveis (17px+)
- [x] Acessibilidade (VoiceOver)
- [ ] Ícone 1024x1024px
- [ ] Screenshots (vários tamanhos)
- [ ] Privacy policy URL
- [ ] TestFlight beta

### Android Google Play

- [x] Safe areas configuradas
- [x] Touch targets adequados (48dp+)
- [x] Textos legíveis
- [x] Acessibilidade (TalkBack)
- [ ] Ícone 512x512px
- [ ] Feature graphic 1024x500px
- [ ] Screenshots
- [ ] Signed APK/AAB

## 🎨 Componentes Mobile-Optimized

### HomeScreen

- ✅ Header com blur (iOS) / gradient (Android)
- ✅ Safe area top
- ✅ Cards com touch feedback
- ✅ ScrollView com padding adequado

### SOSMaeScreen

- ✅ Modal de emergência
- ✅ Botões de ligação direta
- ✅ Mensagens empáticas
- ✅ Testemunhos de outras mães

### RitualScreen

- ✅ Guia de respiração animado
- ✅ Check-in emocional antes/depois
- ✅ Sons ambiente opcionais
- ✅ Timer com pause/resume

## 📐 Especificações Técnicas

### Touch Targets

- Mínimo: 48x48px (iOS) / 48x48dp (Android)
- Recomendado: 56x56px para ações críticas
- Espaçamento: Mínimo 8px entre targets

### Tipografia

- Base: 17px (iOS guideline)
- Títulos: 28px (h1), 22px (h2), 18px (h3)
- Corpo: 17px
- Pequeno: 14px
- Caption: 12px

### Cores

- Contraste mínimo: 4.5:1 (WCAG AA)
- Contraste recomendado: 7:1 (WCAG AAA)
- Dark mode: Suportado

## 🚀 Próximos Passos

1. Gerar ícones (iOS: 1024x1024, Android: 512x512)
2. Criar splash screens
3. Configurar EAS Build
4. Testar em dispositivos reais
5. Submeter para stores

---

**Status:** ✅ Pronto para build iOS/Android
