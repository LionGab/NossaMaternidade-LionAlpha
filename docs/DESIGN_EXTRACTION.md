# 🎨 Extração de Design - Nossa Maternidade

## 📋 Visão Geral

Este documento extrai e documenta todos os elementos de design da aplicação web Nossa Maternidade, baseado na análise visual das telas em produção.

**Data de Extração:** 2025-01-27  
**URL Analisada:** https://nossa-maternidade-app-854690283424.us-west1.run.app

---

## 🎨 Paleta de Cores

### Cores Principais

| Cor                   | Uso                              | Hex (Aproximado) | Descrição              |
| --------------------- | -------------------------------- | ---------------- | ---------------------- |
| **Azul Escuro**       | Primary, Botões, Navegação Ativa | `#004E9A`        | Cor principal da marca |
| **Azul Claro**        | Backgrounds, Cards Secundários   | `#B3D9E8`        | Cor de apoio           |
| **Roxo**              | Avatares, Progress Bars          | `#8B5CF6`        | Destaques e progresso  |
| **Branco**            | Backgrounds, Cards               | `#FFFFFF`        | Fundo principal        |
| **Cinza Claro**       | Backgrounds, Navegação           | `#F1F5F9`        | Backgrounds neutros    |
| **Cinza Escuro**      | Texto Secundário                 | `#334155`        | Texto menos importante |
| **Preto**             | Texto Principal                  | `#0F172A`        | Texto principal        |
| **Bege/Marrom Claro** | Ilustrações, Backgrounds         | `#F5E6D3`        | Tons quentes           |

### Gradientes

- **Progress Bar:** Gradiente de azul claro para roxo (`#B3D9E8` → `#8B5CF6`)
- **Cards:** Background branco com sombras sutis

---

## 📐 Tipografia

### Hierarquia de Texto

| Elemento                | Tamanho | Peso           | Cor                   | Uso                     |
| ----------------------- | ------- | -------------- | --------------------- | ----------------------- |
| **Títulos Principais**  | 24-32px | Bold (700)     | `#0F172A`             | Nomes, títulos de seção |
| **Títulos Secundários** | 18-20px | Semibold (600) | `#004E9A`             | Subtítulos, labels      |
| **Texto Corpo**         | 16px    | Regular (400)  | `#334155`             | Texto descritivo        |
| **Texto Pequeno**       | 12-14px | Regular (400)  | `#6B7280`             | Metadados, datas        |
| **Botões**              | 16px    | Medium (500)   | `#FFFFFF` (em botões) | Ações                   |

### Fontes

- **Família:** Sans-serif (provavelmente Google Sans ou similar)
- **Estilo:** Moderno, limpo, legível

---

## 🧩 Componentes de Design

### 1. Header/Hero Section

**Características:**

- Ilustração grande ocupando ~40% da tela superior
- Overlay de informações (avatar, saudação, nome)
- Background com tons quentes (bege/marrom)
- Avatar circular com inicial (roxo `#8B5CF6`)

**Elementos:**

- Avatar: Círculo roxo com inicial branca
- Saudação: "BEM-VINDA DE VOLTA" em cinza claro
- Nome: "Mamãe" em branco, bold
- Ícone de modo noturno: Círculo cinza com lua branca

### 2. Cards de Informação

**Características:**

- Background branco
- Bordas arredondadas (16-20px)
- Sombra sutil
- Padding: 16-20px

**Tipos de Cards:**

#### Card de Bebê (Home)

- Título: "3º MÊS" em azul
- Nome: "Leo" em azul escuro, bold, grande
- Idade: "3 meses e 2 semanas" em cinza
- Ícone: Quadrado azul com ícone de bebê
- Progress Bar: Gradiente azul→roxo

#### Card de Meta Diária (Hábitos)

- Background: Azul escuro (`#004E9A`)
- Título: "Sua Meta Diária" em branco
- Subtítulo: "Continue firme!" em branco
- Progress: "0%" em branco, grande
- Barra de progresso: Horizontal, azul claro

### 3. Navegação Inferior (Bottom Navigation)

**Características:**

- Background: Cinza claro ou branco
- Altura: ~60-70px
- 5 itens de navegação
- Item central destacado (Naty AI)

**Itens:**

1. **Início** - Ícone casa
2. **Mães Valentes** - Ícone coração
3. **Naty AI** - Botão circular azul escuro, maior, com ícone de estrela/plus
4. **Mundo Nat** - Ícone estrela
5. **Hábitos** - Ícone checkmark

**Estados:**

- **Ativo:** Texto azul, ícone azul (ou background azul)
- **Inativo:** Texto cinza, ícone cinza

### 4. Botões

#### Botões Primários

- Background: Azul escuro (`#004E9A`)
- Texto: Branco
- Padding: 12-16px horizontal, 10-14px vertical
- Border radius: 8-12px
- Altura mínima: 44px (touch target)

#### Botões Secundários

- Background: Branco
- Texto: Azul escuro
- Borda: 1px azul escuro
- Mesmo padding e radius

#### Botões de Filtro (Pills)

- Background: Branco (inativo) ou Azul escuro (ativo)
- Texto: Cinza (inativo) ou Branco (ativo)
- Border radius: 20px (pill shape)
- Padding: 8-12px horizontal

### 5. Check-in Emocional

**Características:**

- Título: "Como você está hoje?"
- 5 botões circulares com emojis
- Layout horizontal
- Espaçamento: 8-12px entre botões

**Emojis (provavelmente):**

- 😊 Feliz
- 😐 Neutro
- 😔 Triste
- 😴 Cansada
- 😰 Ansiosa

### 6. Seção de Conteúdo (Mundo Naty)

**Características:**

- Título: "Mundo Naty" em azul escuro
- Link "Ver tudo" à direita
- Cards horizontais (scroll horizontal)
- Largura dos cards: ~240-280px

### 7. Comunidade (Mães Valentes)

**Características:**

- Header com ilustração circular
- Título: "Comunidade" em azul escuro
- Subtítulo: "Mãe ajuda mãe ❤️"
- Filtros: Pills horizontais (Todos, Dicas, Desabafos, Dúvidas, Humor)
- Botão de adicionar: Círculo azul escuro com plus branco

---

## 📏 Espaçamento

### Grid System

- **Base:** 4px
- **Espaçamentos comuns:**
  - 4px (1x)
  - 8px (2x)
  - 12px (3x)
  - 16px (4x) - **Mais comum**
  - 20px (5x)
  - 24px (6x)
  - 32px (8x)

### Padding/Margin Padrão

- **Cards:** 16-20px
- **Seções:** 16px horizontal, 12-16px vertical
- **Entre elementos:** 8-12px
- **Entre seções:** 16-24px

---

## 🎭 Ilustrações

### Estilo

- **Tipo:** Cartoon/Ilustração amigável
- **Paleta:** Tons quentes (bege, marrom, rosa suave)
- **Tema:** Maternidade, cuidado, acolhimento
- **Personagens:** Mães e bebês em situações cotidianas

### Uso

- Header/Hero sections
- Backgrounds de seções importantes
- Empty states (provavelmente)

---

## 🔘 Ícones

### Estilo

- **Tipo:** Outline (linha)
- **Espessura:** 1.5-2px
- **Tamanho padrão:** 20-24px
- **Biblioteca:** Lucide React (provavelmente)

### Ícones Principais

- 🏠 Casa (Home)
- ❤️ Coração (Comunidade)
- ✨ Estrela/Sparkles (Naty AI)
- ⭐ Estrela (Mundo Nat)
- ✅ Checkmark (Hábitos)
- 📅 Calendário
- 🌙 Lua (Modo noturno)
- ➕ Plus (Adicionar)

---

## 📱 Layout e Estrutura

### Estrutura Geral

```
┌─────────────────────────┐
│   Header/Hero (40%)     │
│   - Ilustração          │
│   - Avatar + Info       │
├─────────────────────────┤
│   Conteúdo Principal    │
│   - Cards               │
│   - Seções              │
│   - Listas              │
├─────────────────────────┤
│   Navegação Inferior    │
│   (5 itens)             │
└─────────────────────────┘
```

### Breakpoints (Web)

- **Mobile:** < 768px (design atual)
- **Tablet:** 768px - 1024px
- **Desktop:** > 1024px

---

## 🎨 Estados Visuais

### Hover (Web)

- Opacidade reduzida (0.8)
- Transform scale (1.02)
- Transição suave (200ms)

### Active/Pressed

- Opacidade reduzida (0.7)
- Scale down (0.98)

### Disabled

- Opacidade: 0.5
- Cursor: not-allowed

### Loading

- Skeleton screens (provavelmente)
- Spinners azuis

---

## 📊 Componentes Específicos por Tela

### Home Screen

1. **Hero Section** - Ilustração + Avatar + Saudação
2. **Card de Bebê** - Informações do bebê + Progress
3. **Botões Rápidos** - Saúde, Vacina
4. **Check-in Emocional** - 5 emojis
5. **Links Rápidos** - Mãe Valente, Hábitos
6. **Mundo Naty Preview** - Cards horizontais

### Chat Screen (Naty AI)

- Interface de chat (não visível nos screenshots)
- Provavelmente: Input na parte inferior, mensagens em bubbles

### Mundo Naty Screen

- Feed de conteúdo
- Cards de artigos/vídeos
- Scroll vertical

### Mães Valentes Screen

- Header com ilustração
- Filtros (pills)
- Feed de posts da comunidade
- Botão de criar post

### Hábitos Screen

- Ilustração no topo
- Calendário semanal
- Card de meta diária
- Lista de hábitos

---

## 🎯 Princípios de Design

1. **Acolhimento:** Cores quentes, ilustrações amigáveis
2. **Clareza:** Tipografia legível, hierarquia clara
3. **Simplicidade:** Interface limpa, sem poluição visual
4. **Acessibilidade:** Touch targets de 44px+, contraste adequado
5. **Consistência:** Mesma paleta e componentes em todas as telas

---

## 📸 Screenshots Capturados

1. `home-screen-design.png` - Tela inicial
2. `chat-screen-design.png` - Tela de chat (Naty AI)
3. `mundo-nath-screen-design.png` - Feed de conteúdo
4. `maes-valentes-screen-design.png` - Comunidade
5. `habits-screen-design.png` - Hábitos

**Localização:** `C:\Users\Usuario\AppData\Local\Temp\cursor\screenshots\`

---

## 🔄 Comparação com Design System do Projeto

### Tokens Existentes vs. Design Extraído

| Token Projeto                      | Design Extraído       | Status   |
| ---------------------------------- | --------------------- | -------- |
| `colors.primary.main` (#004E9A)    | Azul escuro (#004E9A) | ✅ Match |
| `colors.background.card` (#FFFFFF) | Branco (#FFFFFF)      | ✅ Match |
| `colors.text.primary` (#0F172A)    | Preto (#0F172A)       | ✅ Match |
| `Spacing['4']` (16px)              | 16px padrão           | ✅ Match |
| `Typography.sizes.md` (16px)       | 16px corpo            | ✅ Match |

### Diferenças Encontradas

1. **Roxo não está no design system atual** - Usado em avatares e progress bars
2. **Bege/Marrom não está documentado** - Usado em ilustrações
3. **Gradientes não estão documentados** - Progress bars usam gradiente azul→roxo

---

## 📝 Recomendações

1. **Adicionar roxo ao design system** - Usado extensivamente
2. **Documentar gradientes** - Progress bars e backgrounds
3. **Documentar ilustrações** - Estilo e uso
4. **Criar componentes para:**
   - Hero section com ilustração
   - Card de bebê
   - Card de meta diária
   - Check-in emocional
   - Filtros pills

---

**Última atualização:** 2025-01-27  
**Versão:** 1.0.0
