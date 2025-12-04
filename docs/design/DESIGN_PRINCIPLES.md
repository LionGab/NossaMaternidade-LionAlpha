# Princípios Fundamentais de Design - Nossa Maternidade

**Versão:** 1.0.0  
**Última Atualização:** Janeiro 2025  
**Status:** ✅ Estabelecido e Definitivo

---

## 🎯 Visão Geral

Este documento estabelece os princípios fundamentais de design do Nossa Maternidade. Estes princípios são **definitivos e não negociáveis** - servem como base para todas as decisões de design e desenvolvimento.

**IMPORTANTE:** Este documento elimina ambiguidades. Quando houver dúvida sobre design, consulte este documento primeiro.

---

## 💝 Filosofia de Design

### Humanizado e Maternal

O design do Nossa Maternidade é **humanizado, acolhedor e maternal**. Cada decisão visual deve transmitir:

- **Acolhimento:** A mãe deve se sentir acolhida, não julgada
- **Confiança:** O app deve inspirar confiança em informações de saúde
- **Serenidade:** O ambiente visual deve ser calmo e tranquilo
- **Empoderamento:** A mãe deve se sentir empoderada e capaz

### Acessibilidade como Prioridade

Acessibilidade não é opcional - é **fundamental**. O app serve mães em diferentes condições:

- **Visual:** Contraste WCAG AAA (7:1 mínimo)
- **Motor:** Touch targets mínimos 44pt (iOS) / 48dp (Android)
- **Cognitiva:** Interface clara, sem ambiguidades
- **Técnica:** Suporte a leitores de tela (VoiceOver/TalkBack)

### Simplicidade e Clareza

**Menos é mais.** O design deve ser:

- **Simples:** Sem elementos desnecessários
- **Claro:** Hierarquia visual evidente
- **Direto:** Ações óbvias e intuitivas
- **Consistente:** Padrões repetidos em todo o app

---

## 🎨 Valores Visuais

### Paleta de Emoções

As cores transmitem emoções específicas:

| Cor                           | Emoção                 | Uso                     |
| ----------------------------- | ---------------------- | ----------------------- |
| **Azul iOS System** (#007AFF) | Confiança, serenidade  | Ações primárias, links  |
| **Roxo Espiritual** (#A78BFA) | Espiritualidade, calma | Elementos secundários   |
| **Verde Mint** (#236B62)      | Bem-estar, completude  | Sucesso, conclusão      |
| **Rosa Maternal** (legado)    | Acolhimento, calor     | Elementos especiais     |
| **Vermelho** (#EF4444)        | Atenção, urgência      | Erros, alertas críticos |

### Tipografia como Voz

A tipografia é a "voz" do app:

- **System Fonts:** iOS System / Android Roboto (familiaridade)
- **Hierarquia Clara:** Display → Title → Body → Label
- **Legibilidade:** Tamanhos mínimos respeitando WCAG AAA
- **Espaçamento:** Line height generoso para conforto de leitura

### Espaçamento como Respiração

O espaçamento cria "respiração" visual:

- **Grid Base:** 4px (todos os espaçamentos são múltiplos de 4)
- **Padding Padrão:** 16px (Spacing['4'])
- **Gap Padrão:** 8px (Spacing['2'])
- **Consistência:** Mesmos espaçamentos em contextos similares

---

## 🎯 Objetivos de UX

### 1. Reduzir Fricção

- **Menos toques:** Ações principais em 1-2 toques
- **Feedback imediato:** Haptic feedback em interações
- **Loading claro:** Estados de carregamento informativos
- **Erros amigáveis:** Mensagens claras e acionáveis

### 2. Aumentar Confiança

- **Transparência:** Informações claras sobre dados e privacidade
- **Consistência:** Comportamento previsível
- **Feedback visual:** Confirmações visuais de ações
- **Acessibilidade:** Suporte a todas as mães

### 3. Fomentar Conexão

- **Comunidade:** Espaços para mães se conectarem
- **Personalização:** Conteúdo relevante para cada mãe
- **Empatia:** Linguagem acolhedora e não-julgadora
- **Suporte:** NathIA sempre disponível para ajudar

---

## 📚 Referências de Inspiração

### Flo.health (Saúde Feminina)

**O que inspira:**

- Paleta rosa/roxo acolhedora
- Tipografia sem-serif warm
- Componentes pill (botões, inputs)
- Ilustrações flat pastel

**O que adaptamos:**

- Rosa Flo → Azul iOS System (confiança técnica)
- Adicionamos roxo espiritual (serenidade)
- Mantemos acolhimento maternal

### Airbnb (Experiência do Usuário)

**O que inspira:**

- Cards grandes e espaçosos
- Imagens como hero elements
- Busca intuitiva e poderosa
- Navegação clara e direta

**O que adaptamos:**

- Cards com aspect ratio 4:3
- Search pills com gradiente suave
- Layout limpo e focado em conteúdo

### Material Design 3 (Estrutura)

**O que inspira:**

- Sistema de tokens formalizado
- 8-point grid (adaptado para 4px)
- Motion design suave
- Dark mode nativo

**O que adaptamos:**

- Tokens semânticos (não apenas técnicos)
- Grid 4px (mais flexível para mobile)
- Animações sutis (não intrusivas)

### Apple HIG (iOS)

**O que inspira:**

- Safe area respeito
- Touch targets 44x44pt
- Navigation patterns nativos
- SF Pro font fallback

**O que adaptamos:**

- SafeAreaView em todas as screens
- Touch targets mínimos respeitados
- Navegação híbrida (iOS + Android)

---

## ♿ Princípios de Acessibilidade

### WCAG AAA Compliance

**Contraste:**

- Texto normal: **7:1 mínimo** (WCAG AAA)
- Texto grande (18pt+): **4.5:1 mínimo** (WCAG AA)
- UI elements: **3:1 mínimo** (WCAG AA)

**Touch Targets:**

- Mínimo: **44pt (iOS) / 48dp (Android)**
- Recomendado: **48pt+ para ações principais**
- Espaçamento entre targets: **8pt mínimo**

**Leitores de Tela:**

- `accessibilityLabel` em **todos** os elementos interativos
- `accessibilityHint` quando necessário
- `accessibilityRole` apropriado
- `accessibilityState` para estados (selected, disabled)

**Dynamic Type:**

- Suporte a `allowFontScaling={true}`
- Layouts que se adaptam a tamanhos maiores
- Texto nunca cortado ou sobreposto

---

## 🔧 Decisões Técnicas Estabelecidas

### Sistema de Design

**✅ USAR SEMPRE:**

- `src/theme/tokens.ts` - Sistema moderno de tokens
- `useThemeColors()` hook - Cores theme-aware
- `Tokens.*` - Acesso a todos os tokens

**❌ NUNCA USAR:**

- `src/design-system/` - Sistema legado (deprecated)
- Cores hardcoded (#xxx, rgba)
- Valores de espaçamento hardcoded
- Tamanhos de fonte hardcoded

### Cores Primárias

**Padrão Atual:**

- **Primary:** Azul iOS System (#007AFF)
- **Secondary:** Roxo espiritual (#A78BFA)
- **Success:** Verde mint (#236B62)
- **Error:** Vermelho (#EF4444)

**Legado (compatibilidade):**

- Rosa maternal mantida para elementos especiais
- Migração gradual para azul como padrão

### Dark Mode

**Obrigatório:**

- Todos os componentes devem suportar dark mode
- Cores sempre via `useThemeColors()` (nunca hardcoded)
- Testar transição entre light/dark
- Contraste mantido em ambos os modos

---

## 📏 Princípios de Layout

### Grid System

- **Base:** 4px
- **Todos os espaçamentos:** Múltiplos de 4px
- **Padding padrão:** 16px (Spacing['4'])
- **Gap padrão:** 8px (Spacing['2'])

### Safe Areas

- **iOS:** SafeAreaView em todas as screens
- **Android:** Padding respeitando status bar
- **Notch/Dynamic Island:** Espaçamento automático

### Responsividade

- **Breakpoints:** xs (360), sm (390), md (428), lg (768)
- **Adaptação:** Layouts que se adaptam a diferentes tamanhos
- **Tablet:** Suporte futuro (planejado)

---

## 🎬 Princípios de Animação

### Duração

- **Instant:** 0ms (sem animação)
- **Fast:** 150ms (micro-interações)
- **Normal:** 300ms (transições padrão)
- **Slow:** 500ms (transições importantes)

### Easing

- **Padrão:** `easeOut` (suave e natural)
- **Spring:** Para interações físicas
- **Linear:** Apenas para progresso/loading

### Feedback

- **Haptic:** Em todas as interações principais
- **Visual:** Mudanças de estado claras
- **Sonoro:** Opcional (configurável)

---

## ✅ Checklist de Validação

Antes de considerar um componente "pronto", verifique:

- [ ] Usa `useThemeColors()` para cores
- [ ] Suporta dark mode completamente
- [ ] Touch targets >= 44pt
- [ ] Contraste WCAG AAA (7:1)
- [ ] `accessibilityLabel` em elementos interativos
- [ ] Espaçamento via tokens (múltiplos de 4px)
- [ ] Tipografia via `TextStyles.*`
- [ ] Testado em iOS e Android
- [ ] Performance otimizada (memo quando necessário)

---

## 📖 Referências

- **Sistema de Tokens:** `src/theme/tokens.ts`
- **Guia do Sistema:** `docs/design/DESIGN_SYSTEM_REFERENCE.md`
- **Padrões de Componentes:** `docs/design/COMPONENT_PATTERNS.md`
- **Decisões Estabelecidas:** `docs/design/DESIGN_DECISIONS.md`
- **Referência Rápida:** `docs/design/DESIGN_QUICK_REFERENCE.md`

---

**Este documento é a fonte única da verdade para princípios de design. Quando houver dúvida, consulte este documento primeiro.**
