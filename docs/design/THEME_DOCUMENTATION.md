# 🎨 Documentação do Tema - Nossa Maternidade

## Visão Geral

O tema do aplicativo foi construído para ser acolhedor e limpo, usando uma paleta de cores consistente que se adapta bem tanto ao modo claro quanto ao escuro. O sistema de design é baseado em tokens semânticos que garantem consistência visual em toda a aplicação.

---

## 📋 Paleta Principal (Modo Claro)

### Cores de Fundo

| Token                 | Hex       | Descrição                    | Uso                                  |
| --------------------- | --------- | ---------------------------- | ------------------------------------ |
| `background.canvas`   | `#F8F9FA` | Fundo principal (warm white) | Fundo geral do app, telas principais |
| `background.card`     | `#FFFFFF` | Cards e superfícies          | Cards, modais, inputs                |
| `background.elevated` | `#FFFFFF` | Superfícies elevadas         | Elementos com elevação (shadows)     |
| `background.input`    | `#FFFFFF` | Inputs                       | Campos de texto, selects             |

### Cores de Texto

| Token              | Hex       | Descrição               | Uso                            |
| ------------------ | --------- | ----------------------- | ------------------------------ |
| `text.primary`     | `#5D4E4B` | Cinza-marrom principal  | Textos principais, títulos     |
| `text.secondary`   | `#525252` | Cinza médio             | Textos secundários, subtítulos |
| `text.tertiary`    | `#737373` | Cinza claro             | Textos terciários, labels      |
| `text.disabled`    | `#A3A3A3` | Desabilitado            | Elementos desabilitados        |
| `text.placeholder` | `#9CA3AF` | Placeholder             | Textos de placeholder          |
| `text.inverse`     | `#FFFFFF` | Texto em fundos escuros | Texto em botões, cards escuros |
| `text.link`        | `#0D5FFF` | Links                   | Links clicáveis                |

### Cores Primárias (Azul)

| Token              | Hex                                 | Descrição                    | Uso                                    |
| ------------------ | ----------------------------------- | ---------------------------- | -------------------------------------- |
| `primary.main`     | `#4285F4`                           | Google Blue (azul principal) | Botões primários, links, ícones ativos |
| `primary.light`    | `#E0EFFF`                           | Azul claro pastel            | Fundos secundários, estados de seleção |
| `primary.dark`     | `#0036B8`                           | Azul escuro                  | Hover states, elementos pressionados   |
| `primary.gradient` | `['#367FFF', '#0D5FFF', '#0047E6']` | Gradiente azul               | Cards especiais, destaques             |

**Escala completa do azul:**

- `50`: `#F0F7FF` (mais claro)
- `100`: `#E0EFFF`
- `200`: `#BAD4FF`
- `300`: `#7CACFF`
- `400`: `#4285F4` ⭐ (main)
- `500`: `#0D5FFF` (brand principal)
- `600`: `#0047E6`
- `700`: `#0036B8`
- `800`: `#002D96`
- `900`: `#002979` (mais escuro)

### Cores Secundárias (Rosa)

| Token                | Hex                                 | Descrição           | Uso                          |
| -------------------- | ----------------------------------- | ------------------- | ---------------------------- |
| `secondary.main`     | `#FF8FA3`                           | Rosa coral (legacy) | Destaques, badges, chips     |
| `secondary.light`    | `#FFE0EC`                           | Rosa claro pastel   | Fundos suaves, estados hover |
| `secondary.dark`     | `#C10048`                           | Rosa escuro         | Elementos pressionados       |
| `secondary.gradient` | `['#FF94BA', '#FF2576', '#E60A5B']` | Gradiente rosa      | Cards especiais, destaques   |

**Escala completa do rosa:**

- `50`: `#FFF0F6` (mais claro)
- `100`: `#FFE0EC`
- `200`: `#FFC2D9`
- `300`: `#FF94BA`
- `400`: `#FF8FA3` ⭐ (main)
- `500`: `#FF2576` (brand secondary)
- `600`: `#E60A5B`
- `700`: `#C10048`
- `800`: `#A0003D`
- `900`: `#840036` (mais escuro)

### Cores de Status

| Token            | Hex       | Descrição        | Uso                                |
| ---------------- | --------- | ---------------- | ---------------------------------- |
| `status.success` | `#10B981` | Verde suave      | Mensagens de sucesso, confirmações |
| `status.warning` | `#D97706` | Laranja/Amarelo  | Avisos, alertas                    |
| `status.error`   | `#EF4444` | Vermelho         | Erros, validações                  |
| `status.info`    | `#2563EB` | Azul informativo | Informações, tooltips              |

### Bordas

| Token            | Hex                   | Descrição        | Uso                       |
| ---------------- | --------------------- | ---------------- | ------------------------- |
| `border.light`   | `rgba(0, 0, 0, 0.08)` | Borda clara      | Bordas sutis, divisores   |
| `border.medium`  | `rgba(0, 0, 0, 0.12)` | Borda média      | Bordas padrão             |
| `border.dark`    | `rgba(0, 0, 0, 0.16)` | Borda escura     | Bordas destacadas         |
| `border.focus`   | `#0D5FFF`             | Borda de foco    | Estados de foco em inputs |
| `border.error`   | `#EF4444`             | Borda de erro    | Validações de erro        |
| `border.success` | `#10B981`             | Borda de sucesso | Validações de sucesso     |

---

## 🌙 Paleta Principal (Modo Escuro - Ocean Dark Theme)

### Cores de Fundo

| Token                 | Hex       | Descrição              | Uso                                         |
| --------------------- | --------- | ---------------------- | ------------------------------------------- |
| `background.canvas`   | `#020617` | Preto azulado profundo | Fundo geral do app (slate-950 equivalente)  |
| `background.card`     | `#0B1220` | Superfície card        | Cards, modais (slate-900 equivalente)       |
| `background.elevated` | `#1D2843` | Superfície elevada     | Elementos com elevação, pause states        |
| `background.input`    | `#FFFFFF` | Input background       | Campos de texto (branco mesmo no dark mode) |

### Cores de Texto

| Token              | Hex       | Descrição              | Uso                                            |
| ------------------ | --------- | ---------------------- | ---------------------------------------------- |
| `text.primary`     | `#F9FAFB` | Branco suave           | Textos principais (gray-100 equivalente)       |
| `text.secondary`   | `#D1D5DB` | Cinza claro            | Textos secundários (gray-300 equivalente)      |
| `text.tertiary`    | `#9CA3AF` | Cinza médio            | Textos terciários (gray-400 equivalente)       |
| `text.disabled`    | `#6B7280` | Desabilitado           | Elementos desabilitados (gray-500 equivalente) |
| `text.placeholder` | `#6B7280` | Placeholder            | Textos de placeholder                          |
| `text.inverse`     | `#171717` | Texto em fundos claros | Texto em botões claros                         |
| `text.link`        | `#60A5FA` | Link azul claro        | Links clicáveis                                |

### Cores Primárias (Azul - Dark Mode)

| Token              | Hex                                 | Descrição                      | Uso                                    |
| ------------------ | ----------------------------------- | ------------------------------ | -------------------------------------- |
| `primary.main`     | `#3B82F6`                           | Azul vibrante (nath-dark-hero) | Botões primários, links, ícones ativos |
| `primary.light`    | `#7CACFF`                           | Azul claro                     | Fundos secundários, estados de seleção |
| `primary.dark`     | `#0047E6`                           | Azul escuro                    | Hover states, elementos pressionados   |
| `primary.gradient` | `['#367FFF', '#0D5FFF', '#0047E6']` | Gradiente azul                 | Cards especiais (ex: card da NathIA)   |

**Card da NathIA (Gradiente):**

- Usa gradiente de `blue-600` a `blue-800` no modo escuro
- Cores: `from-blue-600` (`#2563EB`) a `to-blue-800` (`#1E40AF`)

### Cores Secundárias (Rosa - Dark Mode)

| Token                | Hex                                 | Descrição      | Uso                          |
| -------------------- | ----------------------------------- | -------------- | ---------------------------- |
| `secondary.main`     | `#FF8FA3`                           | Rosa coral     | Destaques, badges, chips     |
| `secondary.light`    | `#FF94BA`                           | Rosa claro     | Fundos suaves, estados hover |
| `secondary.dark`     | `#E60A5B`                           | Rosa escuro    | Elementos pressionados       |
| `secondary.gradient` | `['#FF94BA', '#FF2576', '#E60A5B']` | Gradiente rosa | Cards especiais              |

### Cores de Status (Dark Mode)

| Token            | Hex       | Descrição        | Uso                   |
| ---------------- | --------- | ---------------- | --------------------- |
| `status.success` | `#4ADE80` | Verde suave      | Mensagens de sucesso  |
| `status.warning` | `#FBBF24` | Laranja/Amarelo  | Avisos, alertas       |
| `status.error`   | `#F87171` | Vermelho         | Erros, validações     |
| `status.info`    | `#60A5FA` | Azul informativo | Informações, tooltips |

### Bordas (Dark Mode)

| Token            | Hex                        | Descrição        | Uso                       |
| ---------------- | -------------------------- | ---------------- | ------------------------- |
| `border.light`   | `rgba(148, 163, 184, 0.1)` | Borda clara      | Bordas sutis, divisores   |
| `border.medium`  | `rgba(148, 163, 184, 0.2)` | Borda média      | Bordas padrão             |
| `border.dark`    | `rgba(148, 163, 184, 0.3)` | Borda escura     | Bordas destacadas         |
| `border.focus`   | `#60A5FA`                  | Borda de foco    | Estados de foco em inputs |
| `border.error`   | `#F87171`                  | Borda de erro    | Validações de erro        |
| `border.success` | `#34D399`                  | Borda de sucesso | Validações de sucesso     |

### Chips de Emoção (Dark Mode)

Os chips de emoção ("Ansiosa", "Cansada", etc.) usam:

- Background: `#0B1220` (slate-900)
- Border: `rgba(148, 163, 184, 0.2)` (slate-700 equivalente)

---

## 🎨 Gradientes

### Modo Claro

| Nome                          | Cores                               | Uso                 |
| ----------------------------- | ----------------------------------- | ------------------- |
| `background.gradient.primary` | `['#E0EFFF', '#FFFFFF']`            | Fundos suaves       |
| `background.gradient.soft`    | `['#FFF0F6', '#F0F7FF']`            | Fundos muito suaves |
| `background.gradient.warm`    | `['#FFFFFF', '#F8F9FA']`            | Fundos quentes      |
| `primary.gradient`            | `['#367FFF', '#0D5FFF', '#0047E6']` | Destaques azuis     |
| `secondary.gradient`          | `['#FF94BA', '#FF2576', '#E60A5B']` | Destaques rosa      |

### Modo Escuro

| Nome                          | Cores                               | Uso                 |
| ----------------------------- | ----------------------------------- | ------------------- |
| `background.gradient.primary` | `['#0B1220', '#020617']`            | Fundos suaves       |
| `background.gradient.soft`    | `['#1D2843', '#0B1220']`            | Fundos muito suaves |
| `background.gradient.ocean`   | `['#020617', '#0B1220', '#1D2843']` | Fundos oceânicos    |
| `primary.gradient`            | `['#367FFF', '#0D5FFF', '#0047E6']` | Destaques azuis     |
| `secondary.gradient`          | `['#FF94BA', '#FF2576', '#E60A5B']` | Destaques rosa      |

---

## 📱 Uso no Código

### Exemplo Básico

```tsx
import { useTheme } from '../theme/ThemeContext';

function MyComponent() {
  const { colors, isDark } = useTheme();

  return (
    <View
      style={{
        backgroundColor: colors.background.canvas,
        padding: 16,
      }}
    >
      <Text style={{ color: colors.text.primary }}>Texto principal</Text>
      <TouchableOpacity
        style={{
          backgroundColor: colors.primary.main,
        }}
      >
        <Text style={{ color: colors.text.inverse }}>Botão</Text>
      </TouchableOpacity>
    </View>
  );
}
```

### Acessando Cores Raw

```tsx
import { useTheme } from '../theme/ThemeContext';

function MyComponent() {
  const { colors } = useTheme();

  // Acessar cores raw (escalas completas)
  const blue50 = colors.raw.primary[50]; // #F0F7FF
  const blue400 = colors.raw.primary[400]; // #4285F4
  const pink400 = colors.raw.secondary[400]; // #FF8FA3
}
```

### Usando Gradientes

```tsx
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../theme/ThemeContext';

function GradientCard() {
  const { colors } = useTheme();

  return (
    <LinearGradient colors={colors.primary.gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
      {/* Conteúdo */}
    </LinearGradient>
  );
}
```

---

## 🔄 Transição entre Modos

O tema suporta três modos:

- **Light**: Modo claro
- **Dark**: Modo escuro
- **System**: Segue a preferência do sistema operacional

A transição entre modos é suave e automática, mantendo a consistência visual em todos os componentes.

---

## 📝 Notas de Design

1. **Contraste**: Todas as cores foram testadas para garantir contraste adequado (WCAG AA mínimo)
2. **Acessibilidade**: Cores de texto e fundo seguem diretrizes de acessibilidade
3. **Consistência**: Use sempre os tokens do tema, nunca cores hardcoded
4. **Dark Mode**: O modo escuro usa tons de ardósia (slate) para criar um ambiente com pouco brilho e muito contraste

---

## 🎯 Cores Específicas por Componente

### Card da NathIA

- **Light Mode**: Gradiente azul claro
- **Dark Mode**: Gradiente `from-blue-600` a `to-blue-800` (`#2563EB` → `#1E40AF`)

### Chips de Emoção

- **Light Mode**: Fundo branco com borda sutil
- **Dark Mode**: Fundo `#0B1220` (slate-900) com borda `rgba(148, 163, 184, 0.2)`

### Cards de Destaque

- **Light Mode**: Fundo branco (`#FFFFFF`)
- **Dark Mode**: Fundo `#0B1220` (slate-900)

---

## 🔄 Cores Legadas e Variações

Algumas cores legadas ainda podem aparecer em partes específicas do código:

| Cor Legada | Hex                 | Uso Atual                   | Substituição Recomendada               |
| ---------- | ------------------- | --------------------------- | -------------------------------------- |
| `#6DA9E4`  | Azul legado         | Hábitos, alguns componentes | `colors.primary.main` (`#4285F4`)      |
| `#FFF8F3`  | Fundo quente legado | Alguns componentes antigos  | `colors.background.canvas` (`#F8F9FA`) |
| `#6A5450`  | Texto legado        | Alguns textos antigos       | `colors.text.primary` (`#5D4E4B`)      |
| `#DCEBFA`  | Azul claro legado   | Alguns fundos antigos       | `colors.primary.light` (`#E0EFFF`)     |
| `#FF8BA3`  | Rosa legado         | Variação do rosa            | `colors.secondary.main` (`#FF8FA3`)    |

**Nota**: Essas cores legadas devem ser gradualmente substituídas pelos tokens do tema para manter consistência.

---

## 📚 Referências

- **Arquivo de Tokens**: `src/theme/tokens.ts`
- **Context do Tema**: `src/theme/ThemeContext.tsx`
- **Tailwind Config**: `tailwind.config.js`
- **Sistema Base**: Material Design 3 + Identidade Maternal

---

**Última atualização**: Dezembro 2024
**Versão do Tema**: 2.0.0
