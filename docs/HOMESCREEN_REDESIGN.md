# HomeScreen Redesign - Nossa Maternidade

> Proposta completa de melhoria da tela principal com foco em empatia, acolhimento e UX premium.

---

## 1. RESUMO EXECUTIVO

### O QUÊ?

Redesign completo da HomeScreen com foco em:

- Linguagem mais empática e humana
- Hierarquia visual clara
- Microcopy acolhedor
- 3 variações para diferentes perfis

### POR QUÊ IMPORTA?

- Mães em momentos vulneráveis precisam de acolhimento imediato
- A tela atual tem muitos elementos competindo por atenção
- Textos podem ser mais curtos e impactantes

---

## 2. TEXTOS REESCRITOS

### 2.1 Saudação (EmpatheticWelcome)

**ANTES:**

```
Boa noite, [nome]
Oi mãe, respire um pouquinho…
Estamos aqui por você.
```

**DEPOIS (3 variações por período):**

| Período | Opção A (Acolhedora)                          | Opção B (Leve)                        | Opção C (Direta)              |
| ------- | --------------------------------------------- | ------------------------------------- | ----------------------------- |
| Manhã   | "Bom dia, [nome] ☀️ Que seu dia seja leve."   | "Oi, [nome]! Pronta pra mais um dia?" | "Bom dia! Como posso ajudar?" |
| Tarde   | "Boa tarde 🌤️ Como está sendo seu dia?"       | "Ei, [nome]! Passando pra ver você."  | "Tudo bem por aí?"            |
| Noite   | "Boa noite, [nome] 🌙 Você merece descansar." | "Noite chegou. Como você está?"       | "Boa noite! Precisa de algo?" |

**Subtítulo empático (rotativo):**

- "Estou aqui. Sem pressa."
- "Respire. Você está segura."
- "Um momento só pra você."
- "Não precisa dar conta de tudo."

---

### 2.2 Card NathIA (EmpatheticNathIACard)

**ANTES:**

```
Título: "Converse com a NathIA"
Subtítulo: "Apoio imediato, sem julgamentos."
Pergunta: "O que está acontecendo aí dentro agora?"
Botão: "Quero conversar"
```

**DEPOIS (opções de microcopy):**

| Elemento  | Opção A (Acolhedora)           | Opção B (Direta)          | Opção C (Curiosa)                |
| --------- | ------------------------------ | ------------------------- | -------------------------------- |
| Título    | "Posso te ouvir agora"         | "Vamos conversar?"        | "O que está no seu coração?"     |
| Subtítulo | "Sem pressa. Sem julgamentos." | "Estou aqui, disponível." | "Tudo que você sentir é válido." |
| Pergunta  | "Como você está, de verdade?"  | "Quer desabafar?"         | "O que está pesando hoje?"       |
| Botão     | "Quero conversar"              | "Abrir chat"              | "Falar agora"                    |
| Botão Alt | "Me conta"                     | "Desabafar"               | "Preciso de apoio"               |

**Badge de status:**

- "Disponível agora" (verde)
- "Sempre aqui" (azul suave)

---

### 2.3 Chips de Humor (EmpatheticMoodChips)

**ANTES:**

```
Título: "💛 Como você está hoje?"
Subtítulo: "Toque na opção que mais combina com seu momento:"
```

**DEPOIS:**

```
Título: "Como você está agora?"
Subtítulo: "Toque no que mais combina com você:"
```

**Chips redesenhados:**

| ID               | Antes               | Depois             | Emoji | Cor (Light) | Cor (Dark) |
| ---------------- | ------------------- | ------------------ | ----- | ----------- | ---------- |
| sobrecarregada   | Sobrecarregada      | Cansada            | 😮‍💨    | #FFE8EC     | #3D1A24    |
| precisando-apoio | Precisando de apoio | Precisando de colo | 💙    | #E8F0FF     | #1A2438    |
| ansiosa          | - (novo)            | Ansiosa            | 😰    | #FFF3E8     | #3D2A1A    |
| tranquila        | Tranquila           | Em paz             | 😌    | #E8FFF0     | #1A3D24    |
| com-esperanca    | Com esperança       | Esperançosa        | 🌟    | #FFF8E8     | #3D351A    |
| grata            | - (novo)            | Grata              | 🙏    | #F0E8FF     | #2A1A3D    |
| outro            | Outro               | Outra coisa        | 💭    | #F5F5F5     | #2A2A2A    |

**Estilo melhorado:**

- Chips com altura mínima 48pt (WCAG AAA)
- Emoji à esquerda, texto centralizado
- Borda suave (1px) que aumenta para 2px quando selecionado
- Animação de scale sutil ao tocar (0.97)

---

### 2.4 Destaques (EmpatheticHighlights)

**ANTES:**

```
Título: "Destaques de hoje"
Subtítulo: "Selecionados especialmente para você"
```

**DEPOIS:**

```
Título: "Pra você hoje"
Subtítulo: "Escolhidos com carinho"
```

**Cards de destaque redesenhados:**

| Tipo    | Título Antes                   | Título Depois     | Microcopy                |
| ------- | ------------------------------ | ----------------- | ------------------------ |
| video   | Conteúdo especial de hoje      | Momento de pausa  | "5 min que valem a pena" |
| story   | História que tocou muitas mães | Uma mãe como você | "Histórias que conectam" |
| audio   | -                              | Áudio pra relaxar | "Feche os olhos e ouça"  |
| article | -                              | Leitura leve      | "Pra quando tiver tempo" |

---

## 3. HIERARQUIA VISUAL

### Layout Atual (problemas):

```
[Logo + SearchBar] ← muito próximos
[Welcome] ← bom, mas pode ser mais impactante
[NathIA Card] ← correto, destaque principal
[Mood Chips] ← scroll horizontal confuso
[Highlights] ← cards pequenos demais
[Energy Card] ← duplica informação
[Recent/For You] ← muito conteúdo
[Mood Selector] ← redundante com chips
[AI Card] ← duplica NathIA
```

### Layout Proposto:

```
┌─────────────────────────────────┐
│  [Logo pequeno]    [Busca pill] │  ← Header compacto
├─────────────────────────────────┤
│                                 │
│  Boa noite, Maria 🌙            │  ← Saudação grande
│  Você merece descansar.         │  ← Subtítulo empático
│                                 │
├─────────────────────────────────┤
│ ┌─────────────────────────────┐ │
│ │  [Gradient Card NathIA]     │ │  ← Card principal HERO
│ │  Posso te ouvir agora       │ │
│ │  [💙 Quero conversar]       │ │
│ └─────────────────────────────┘ │
├─────────────────────────────────┤
│  Como você está agora?          │
│  [😮‍💨 Cansada] [💙 Colo] [😌 Paz] │  ← Chips em row wrap
│  [🌟 Esperança] [💭 Outra]      │
├─────────────────────────────────┤
│  Pra você hoje                  │
│  ┌─────────┐ ┌─────────┐       │  ← 2 cards lado a lado
│  │ 🎬      │ │ ❤️      │       │
│  │ Pausa   │ │ História│       │
│  └─────────┘ └─────────┘       │
├─────────────────────────────────┤
│  [Tab: Home] [Rastrear] [+] [Comunidade] [Perfil] │
└─────────────────────────────────┘
```

---

## 4. ESPAÇAMENTO

| Seção        | Padding/Margin        | Justificativa         |
| ------------ | --------------------- | --------------------- |
| Header       | px: 20, py: 16        | Respiro superior      |
| Welcome      | px: 20, pt: 8, pb: 16 | Destaque visual       |
| NathIA Card  | mx: 20, my: 16        | Card hero com respiro |
| Mood Section | px: 20, py: 16        | Seção independente    |
| Highlights   | px: 20, py: 16        | Consistência          |
| Entre seções | 24px                  | Separação clara       |

---

## 5. CORES E TEMAS

### 5.1 Modo Dark (Principal)

```css
/* Background */
--bg-canvas: #0a0d14; /* Azul profundo */
--bg-card: #141820; /* Card */
--bg-elevated: #1a1f2e; /* Elevado */

/* Text */
--text-primary: #ffffff; /* Branco */
--text-secondary: #e2e8f0; /* Cinza claro */
--text-tertiary: #a8b4c4; /* Cinza médio */

/* Primary (NathIA Card) */
--primary-gradient: linear-gradient(135deg, #4ecdc4 0%, #3bb3b5 50%, #2d9a93 100%);

/* Chips */
--chip-bg: #1a1f2e;
--chip-border: #2a2f40;
--chip-selected-border: #4ecdc4;

/* Highlights */
--highlight-video: #4ecdc4;
--highlight-story: #ff8faf;
--highlight-audio: #a78bfa;
--highlight-article: #60a5fa;
```

### 5.2 Modo Light

```css
/* Background */
--bg-canvas: #fff8f3; /* Pêssego suave */
--bg-card: #ffffff; /* Branco */
--bg-elevated: #ffffff; /* Branco */

/* Text */
--text-primary: #6a5450; /* Marrom suave */
--text-secondary: #334155; /* Slate */
--text-tertiary: #64748b; /* Slate médio */

/* Primary (NathIA Card) */
--primary-gradient: linear-gradient(135deg, #6da9e4 0%, #5a8fd8 50%, #4a8fd8 100%);

/* Chips */
--chip-bg: #ffffff;
--chip-border: #e5e5e5;
--chip-selected-border: #6da9e4;

/* Highlights */
--highlight-video: #4ecdc4;
--highlight-story: #ff6b9d;
--highlight-audio: #8b5cf6;
--highlight-article: #3b82f6;
```

---

## 6. TRÊS VARIAÇÕES

### 6.1 Variação MINIMALISTA

**Características:**

- Menos elementos na tela
- Foco total no NathIA Card
- Chips ocultos inicialmente
- Destaques em carousel compacto

**Estrutura:**

```
[Header compacto - só logo]
[Saudação simples - 1 linha]
[NathIA Card HERO - ocupa 40% da tela]
[Botão "Como estou" - abre chips em modal]
[1 destaque apenas - swipe para ver mais]
```

**Textos:**

- Saudação: "Oi, [nome]"
- NathIA: "Estou aqui pra você"
- Botão NathIA: "Conversar"
- Destaques: Apenas título, sem subtítulo

---

### 6.2 Variação ACOLHEDORA (Recomendada)

**Características:**

- Linguagem muito empática
- Cores quentes e suaves
- Animações lentas e suaves
- Microcopy emocional

**Estrutura:**

```
[Header com logo + busca suave]
[Saudação com emoji + subtítulo rotativo]
[NathIA Card com pergunta empática]
[Mood chips coloridos em wrap]
[2 destaques com microcopy emocional]
```

**Textos:**

- Saudação: "Boa noite, Maria 🌙" + "Você merece um descanso."
- NathIA: "Posso te ouvir agora" + "Como você está, de verdade?"
- Botão: "Me conta 💙"
- Chips: Emojis expressivos + labels curtos
- Destaques: Títulos + microcopy acolhedor

---

### 6.3 Variação FUNCIONAL

**Características:**

- Layout objetivo
- Acesso rápido às funções
- Menos decoração, mais utilidade
- Ideal para usuárias recorrentes

**Estrutura:**

```
[Header com logo + busca + notificações]
[Saudação curta - 1 linha]
[Quick Actions Row - 4 ícones]
[NathIA compact - botão pill]
[Mood chips inline - 3 visíveis + "mais"]
[Destaques em lista vertical compacta]
```

**Textos:**

- Saudação: "Olá, Maria"
- Quick actions: ícones com labels curtos
- NathIA: "Falar com NathIA"
- Chips: Só texto, sem emoji grande
- Destaques: Título + duração/tipo

---

## 7. SUGESTÕES UX (Inspiradas em apps de bem-estar)

### 7.1 Calm App

- **Breathing animation** no fundo do NathIA Card
- **Ambient sounds** suaves ao abrir o app
- **Daily check-in** simplificado (1 toque)

### 7.2 Headspace

- **Ilustrações suaves** em vez de fotos
- **Progress ring** sutil mostrando dias ativos
- **Celebrações** micro (confetti leve ao completar algo)

### 7.3 Flo App

- **Mood tracking** integrado naturalmente
- **Insights personalizados** baseados em padrões
- **Comunidade** destacada mas não invasiva

### 7.4 Finch (Self-care pet)

- **Gamificação leve** (sem pontos, só carinho)
- **Companion feeling** - NathIA como companheira
- **Gentle reminders** - notificações carinhosas

### 7.5 Bearable (Health tracker)

- **Correlações visuais** - "Você dorme melhor quando..."
- **Tags rápidas** para registro
- **Export** fácil para profissionais

---

## 8. ACESSIBILIDADE (WCAG AAA)

### Checklist:

- [x] Touch targets mínimo 44pt
- [x] Contraste de texto 7:1 (primário), 4.5:1 (secundário)
- [x] Todos elementos interativos com accessibilityLabel
- [x] Animações respeitam preferências do sistema
- [x] Fontes escaláveis (não usar `fontSize` fixo)
- [x] Cores não são único indicador de estado
- [x] Focus visible em todos elementos navegáveis

### Labels específicos:

```typescript
// Saudação
accessibilityRole="header"
accessibilityLabel={`Saudação: ${greeting}. ${subtitle}`}

// NathIA Card
accessibilityRole="button"
accessibilityLabel="Abrir conversa com NathIA, sua assistente de apoio emocional"
accessibilityHint="Toque duas vezes para iniciar uma conversa"

// Mood Chips
accessibilityRole="radiogroup"
accessibilityLabel="Selecione como você está se sentindo"
// Cada chip:
accessibilityRole="radio"
accessibilityState={{ selected: isSelected }}
accessibilityLabel={`Estou me sentindo ${label}`}

// Highlights
accessibilityRole="button"
accessibilityLabel={`${title}. ${subtitle}. ${type === 'video' ? 'Vídeo' : 'História'}`}
```

---

## 9. PRÓXIMOS PASSOS

1. **Implementar EmpatheticWelcome v2** - textos rotativos
2. **Implementar EmpatheticNathIACard v2** - breathing animation
3. **Implementar EmpatheticMoodChips v2** - wrap layout
4. **Implementar EmpatheticHighlights v2** - grid 2x2
5. **Criar HomeScreenMinimal** - variação minimalista
6. **Criar HomeScreenWarm** - variação acolhedora
7. **Criar HomeScreenFunctional** - variação funcional
8. **A/B test** - testar com usuárias reais

---

_Documento criado em: 1 de dezembro de 2025_
_Versão: 1.0.0_
