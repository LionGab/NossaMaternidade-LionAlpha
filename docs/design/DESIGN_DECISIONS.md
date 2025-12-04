# Decisões de Design Estabelecidas - Nossa Maternidade

**Versão:** 1.0.0  
**Última Atualização:** Janeiro 2025  
**Status:** ✅ Definitivo - Não Negociável

---

## 🎯 Objetivo

Este documento registra **todas as decisões de design estabelecidas** do Nossa Maternidade. Estas decisões são **definitivas** e não devem ser questionadas ou alteradas sem justificativa técnica clara.

**IMPORTANTE:** Quando houver dúvida sobre uma cor, tamanho, espaçamento ou padrão, consulte este documento. Não "adivinhe" - todas as decisões estão documentadas aqui.

---

## 🎨 Cores

### Cores Primárias

| Cor                 | Hex                | Token                          | Uso                    | Status    |
| ------------------- | ------------------ | ------------------------------ | ---------------------- | --------- |
| **Azul iOS System** | `#007AFF`          | `ColorTokens.primary[500]`     | Ações primárias, links | ✅ Padrão |
| **Roxo Espiritual** | `#A78BFA`          | `ColorTokens.secondary[400]`   | Elementos secundários  | ✅ Padrão |
| **Rosa Maternal**   | `#007AFF` (legado) | `ColorTokens.primaryPink[400]` | Elementos especiais    | ⚠️ Legado |

**Decisão:** Azul iOS System é a cor primária padrão. Rosa é mantida apenas para compatibilidade com código legado.

### Cores de Status

| Status      | Hex       | Token                      | Uso                |
| ----------- | --------- | -------------------------- | ------------------ | --- |
| **Success** | `#236B62` | `ColorTokens.mint[400]`    | Sucesso, conclusão | ✅  |
| **Warning** | `#F59E0B` | `ColorTokens.warning[500]` | Avisos, alertas    | ✅  |
| **Error**   | `#EF4444` | `ColorTokens.error[500]`   | Erros, validações  | ✅  |
| **Info**    | `#2563EB` | `ColorTokens.info[600]`    | Informações        | ✅  |

**Decisão:** Error é vermelho (#EF4444), **não coral**. Coral é usado apenas como accent color.

### Cores de Background

#### Light Mode

| Background         | Hex       | Token                            | Uso                    |
| ------------------ | --------- | -------------------------------- | ---------------------- | ----------- |
| **Canvas**         | `#F1F5F9` | `LightTheme.background.canvas`   | Fundo principal        | ✅          |
| **Card**           | `#FFFFFF` | `LightTheme.background.card`     | Cards, superfícies     | ✅          |
| **Elevated**       | `#FFFFFF` | `LightTheme.background.elevated` | Superfícies elevadas   | ✅          |
| **Input**          | `#FFFFFF` | `LightTheme.background.input`    | Campos de entrada      | ✅          |
| **Beige** (Airbnb) | `#FAF7F5` | `LightTheme.background.beige`    | Background alternativo | ✅ Opcional |

#### Dark Mode

| Background   | Hex       | Token                           | Uso                  |
| ------------ | --------- | ------------------------------- | -------------------- | --- |
| **Canvas**   | `#020617` | `DarkTheme.background.canvas`   | Fundo principal      | ✅  |
| **Card**     | `#1E293B` | `DarkTheme.background.card`     | Cards, superfícies   | ✅  |
| **Elevated** | `#334155` | `DarkTheme.background.elevated` | Superfícies elevadas | ✅  |
| **Input**    | `#334155` | `DarkTheme.background.input`    | Campos de entrada    | ✅  |

**Decisão:** Dark mode usa tons de slate (azul-escuro) para criar ambiente calmo e com pouco brilho.

### Cores de Texto

#### Light Mode

| Texto         | Hex       | Token                       | Contraste | Uso                |
| ------------- | --------- | --------------------------- | --------- | ------------------ | --- |
| **Primary**   | `#0F172A` | `LightTheme.text.primary`   | 15.8:1    | Texto principal    | ✅  |
| **Secondary** | `#334155` | `LightTheme.text.secondary` | 8.6:1     | Texto secundário   | ✅  |
| **Tertiary**  | `#475569` | `LightTheme.text.tertiary`  | 6.2:1     | Texto terciário    | ✅  |
| **Disabled**  | `#94A3B8` | `LightTheme.text.disabled`  | 2.8:1     | Texto desabilitado | ✅  |

#### Dark Mode

| Texto         | Hex       | Token                      | Contraste | Uso                |
| ------------- | --------- | -------------------------- | --------- | ------------------ | --- |
| **Primary**   | `#FFFFFF` | `DarkTheme.text.primary`   | 15.8:1    | Texto principal    | ✅  |
| **Secondary** | `#E2E8F0` | `DarkTheme.text.secondary` | 12.5:1    | Texto secundário   | ✅  |
| **Tertiary**  | `#A8B4C4` | `DarkTheme.text.tertiary`  | 7.2:1     | Texto terciário    | ✅  |
| **Disabled**  | `#64748B` | `DarkTheme.text.disabled`  | 4.1:1     | Texto desabilitado | ✅  |

**Decisão:** Todos os textos atendem WCAG AAA (7:1 mínimo) ou WCAG AA (4.5:1 para texto grande).

### Overlays

| Overlay      | Valor                       | Token                          | Uso            |
| ------------ | --------------------------- | ------------------------------ | -------------- | --- |
| **Light**    | `rgba(255, 255, 255, 0.25)` | `ColorTokens.overlay.light`    | Overlay claro  | ✅  |
| **Medium**   | `rgba(0, 0, 0, 0.4)`        | `ColorTokens.overlay.medium`   | Overlay médio  | ✅  |
| **Dark**     | `rgba(0, 0, 0, 0.6)`        | `ColorTokens.overlay.dark`     | Overlay escuro | ✅  |
| **Backdrop** | `rgba(0, 0, 0, 0.5)`        | `ColorTokens.overlay.backdrop` | Modal backdrop | ✅  |

**Decisão:** Sempre usar `ColorTokens.overlay.*` - nunca hardcoded rgba.

---

## ✍️ Tipografia

### Font Family

| Plataforma  | Font            | Token                   | Status |
| ----------- | --------------- | ----------------------- | ------ |
| **iOS**     | System (SF Pro) | `Typography.fonts.body` | ✅     |
| **Android** | Roboto          | `Typography.fonts.body` | ✅     |
| **Web**     | System          | `Typography.fonts.body` | ✅     |

**Decisão:** System fonts para melhor performance e familiaridade nativa.

### Tamanhos de Fonte

| Estilo             | Tamanho | Token                      | Uso                  |
| ------------------ | ------- | -------------------------- | -------------------- | --- |
| **Display Large**  | 32px    | `TextStyles.displayLarge`  | Títulos hero         | ✅  |
| **Display Medium** | 28px    | `TextStyles.displayMedium` | Títulos grandes      | ✅  |
| **Display Small**  | 24px    | `TextStyles.displaySmall`  | Títulos médios       | ✅  |
| **Title Large**    | 20px    | `TextStyles.titleLarge`    | Títulos de seção     | ✅  |
| **Title Medium**   | 18px    | `TextStyles.titleMedium`   | Subtítulos           | ✅  |
| **Title Small**    | 16px    | `TextStyles.titleSmall`    | Títulos de card      | ✅  |
| **Body Large**     | 16px    | `TextStyles.bodyLarge`     | Parágrafo principal  | ✅  |
| **Body Medium**    | 14px    | `TextStyles.bodyMedium`    | Parágrafo secundário | ✅  |
| **Body Small**     | 12px    | `TextStyles.bodySmall`     | Texto pequeno        | ✅  |
| **Label Large**    | 14px    | `TextStyles.labelLarge`    | Botões               | ✅  |
| **Label Medium**   | 12px    | `TextStyles.labelMedium`   | Chips                | ✅  |
| **Label Small**    | 11px    | `TextStyles.labelSmall`    | Badges               | ✅  |

**Decisão:** Sempre usar `TextStyles.*` - nunca hardcoded fontSize.

### Pesos de Fonte

| Peso          | Valor | Token                          | Uso             |
| ------------- | ----- | ------------------------------ | --------------- | --- |
| **Light**     | 300   | `Typography.weights.light`     | Raramente usado | ✅  |
| **Regular**   | 400   | `Typography.weights.regular`   | Texto corpo     | ✅  |
| **Medium**    | 500   | `Typography.weights.medium`    | Títulos médios  | ✅  |
| **Semibold**  | 600   | `Typography.weights.semibold`  | Títulos         | ✅  |
| **Bold**      | 700   | `Typography.weights.bold`      | Títulos grandes | ✅  |
| **Extrabold** | 800   | `Typography.weights.extrabold` | Títulos hero    | ✅  |

**Decisão:** Regular (400) para texto corpo, Semibold (600) para títulos, Bold (700) para destaques.

---

## 📏 Espaçamento

### Grid Base

**Decisão:** Grid base de **4px**. Todos os espaçamentos são múltiplos de 4px.

### Espaçamentos Padrão

| Token           | Valor | Uso Comum                |
| --------------- | ----- | ------------------------ |
| `Spacing['0']`  | 0px   | Sem espaçamento          |
| `Spacing['1']`  | 4px   | Espaçamento mínimo       |
| `Spacing['2']`  | 8px   | Gap padrão               |
| `Spacing['3']`  | 12px  | Padding pequeno          |
| `Spacing['4']`  | 16px  | **Padding padrão** ✅    |
| `Spacing['6']`  | 24px  | Espaçamento entre seções |
| `Spacing['8']`  | 32px  | Espaçamento grande       |
| `Spacing['12']` | 48px  | Espaçamento extra grande |

**Decisão:** Padding padrão é **16px** (`Spacing['4']`). Gap padrão é **8px** (`Spacing['2']`).

### ❌ NUNCA Fazer

```typescript
// ❌ Valores não múltiplos de 4
padding: 5;
margin: 7;
gap: 13;

// ❌ Valores hardcoded
padding: 16; // Use Spacing['4']
margin: 8; // Use Spacing['2']
```

---

## 🔲 Bordas

### Border Radius

| Token           | Valor | Uso                      |
| --------------- | ----- | ------------------------ |
| `Radius.sm`     | 4px   | Bordas pequenas          |
| `Radius.md`     | 8px   | Bordas médias            |
| `Radius.lg`     | 12px  | **Padrão** ✅            |
| `Radius.xl`     | 16px  | Bordas grandes           |
| `Radius['2xl']` | 20px  | **Cards** ✅             |
| `Radius.full`   | 9999  | Pills, botões circulares |

**Decisão:**

- **Padrão:** 12px (`Radius.lg`)
- **Cards:** 20px (`Radius['2xl']`)
- **Inputs:** 12px (`Radius.lg`)
- **Pills:** 9999 (`Radius.full`)

### Border Width

**Decisão:** Border width padrão é **1px**. Para bordas mais visíveis, usar `borderWidth: 2`.

### Border Color

**Decisão:** Sempre usar tokens do tema:

```typescript
// ✅ CORRETO
borderColor: colors.border.light; // Borda sutil
borderColor: colors.border.medium; // Borda padrão
borderColor: colors.border.focus; // Borda de foco

// ❌ ERRADO
borderColor: '#E5E5E5';
borderColor: 'rgba(0, 0, 0, 0.1)';
```

---

## 🌑 Sombras

### Shadow Tokens

| Token               | Elevation | Uso                   |
| ------------------- | --------- | --------------------- |
| `Shadows.sm`        | 1dp       | Sombras pequenas      |
| `Shadows.md`        | 2dp       | Sombras médias        |
| `Shadows.lg`        | 4dp       | Sombras grandes       |
| `Shadows.xl`        | 8dp       | Sombras extra grandes |
| `Shadows.card`      | 4dp       | **Cards** ✅          |
| `Shadows.cardHover` | 8dp       | Cards em hover        |
| `Shadows.soft`      | 2dp       | Sombras suaves        |

**Decisão:**

- **Cards:** `Shadows.card` (4dp)
- **Cards hover:** `Shadows.cardHover` (8dp)
- **Sombras suaves:** `Shadows.soft` (2dp)

### Shadow Color

**Decisão:** Shadow color padrão é `ColorTokens.neutral[900]` (#171717) com opacity apropriada.

---

## 🎬 Animações

### Durações

| Token                         | Valor | Uso                    |
| ----------------------------- | ----- | ---------------------- |
| `Animations.duration.instant` | 0ms   | Sem animação           |
| `Animations.duration.fast`    | 150ms | Micro-interações       |
| `Animations.duration.normal`  | 300ms | **Padrão** ✅          |
| `Animations.duration.slow`    | 500ms | Transições importantes |

**Decisão:** Duração padrão é **300ms** (`Animations.duration.normal`).

### Easing

| Token                       | Curva                      | Uso                |
| --------------------------- | -------------------------- | ------------------ |
| `Animations.easing.easeOut` | `[0, 0, 0.58, 1]`          | **Padrão** ✅      |
| `Animations.easing.spring`  | `[0.25, 0.46, 0.45, 0.94]` | Interações físicas |
| `Animations.easing.linear`  | `[0, 0, 1, 1]`             | Progresso/loading  |

**Decisão:** Easing padrão é `easeOut` para transições suaves e naturais.

---

## 📱 Touch Targets

### Tamanhos Mínimos

| Plataforma  | Mínimo | Recomendado | Token              |
| ----------- | ------ | ----------- | ------------------ |
| **iOS**     | 44pt   | 48pt        | `TouchTargets.min` |
| **Android** | 48dp   | 56dp        | `TouchTargets.min` |

**Decisão:**

- **Mínimo:** 44pt (iOS) / 48dp (Android)
- **Recomendado:** 48pt+ para ações principais
- **Espaçamento entre targets:** 8pt mínimo

---

## 🎯 Ícones

### Tamanhos Padrão

| Token          | Valor | Uso                  |
| -------------- | ----- | -------------------- |
| `IconSizes.xs` | 16px  | Ícones pequenos      |
| `IconSizes.sm` | 20px  | Ícones médios        |
| `IconSizes.md` | 24px  | **Padrão** ✅        |
| `IconSizes.lg` | 28px  | Ícones grandes       |
| `IconSizes.xl` | 32px  | Ícones extra grandes |

**Decisão:** Tamanho padrão de ícones é **24px** (`IconSizes.md`).

---

## 📐 Breakpoints

| Token            | Valor | Uso            |
| ---------------- | ----- | -------------- |
| `Breakpoints.xs` | 360px | Telas pequenas |
| `Breakpoints.sm` | 390px | Telas médias   |
| `Breakpoints.md` | 428px | Telas grandes  |
| `Breakpoints.lg` | 768px | Tablets        |

**Decisão:** Layout responsivo baseado nestes breakpoints.

---

## ✅ Resumo de Decisões Críticas

1. **Cores:** Azul iOS System (#007AFF) é primária padrão
2. **Error:** Vermelho (#EF4444), não coral
3. **Grid:** 4px base, todos espaçamentos múltiplos de 4
4. **Padding padrão:** 16px (Spacing['4'])
5. **Radius padrão:** 12px (Radius.lg)
6. **Cards radius:** 20px (Radius['2xl'])
7. **Touch targets:** Mínimo 44pt (iOS) / 48dp (Android)
8. **Tipografia:** Sempre TextStyles.\*, nunca hardcoded
9. **Dark mode:** Obrigatório em todos componentes
10. **Acessibilidade:** WCAG AAA (7:1 contraste mínimo)

---

## 📖 Referências

- **Tokens Completos:** `src/theme/tokens.ts`
- **Sistema de Design:** `docs/design/DESIGN_SYSTEM_REFERENCE.md`
- **Princípios:** `docs/design/DESIGN_PRINCIPLES.md`
- **Padrões de Componentes:** `docs/design/COMPONENT_PATTERNS.md`

---

**Este documento registra todas as decisões de design estabelecidas. Quando houver dúvida, consulte este documento - não "adivinhe".**
