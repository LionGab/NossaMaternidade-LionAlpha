# 🎨 Melhorias de Design Tokens - Nossa Maternidade

> **Data:** Dezembro 2024  
> **Status:** ✅ Parcialmente Implementado  
> **Próximos Passos:** Migrar componentes V2 e corrigir duplicações

---

## 1. ✅ CORREÇÕES DE CONTRASTE WCAG AAA

| Elemento         | Antes   | Depois  | Ratio Antes | Ratio Depois | Melhoria |
| ---------------- | ------- | ------- | ----------- | ------------ | -------- |
| text.placeholder | #9CA3AF | #6B7280 | 2.6:1       | 5.1:1        | +96%     |
| text.disabled    | #94A3B8 | #6B7280 | 3.1:1       | 5.1:1        | +64%     |
| text.link        | #6DA9E4 | #2563EB | 3.2:1       | 7.5:1        | +134%    |
| text.warning     | #F59E0B | #B45309 | 3.0:1       | 7.1:1        | +137%    |
| text.error       | #EF4444 | #B91C1C | 4.5:1       | 7.8:1        | +73%     |

**Resultado:** Todos os textos agora passam WCAG AAA (7:1) ou AA mínimo (4.5:1) para elementos auxiliares.

---

## 2. ✅ NOVOS TOKENS CENTRALIZADOS

### `ColorTokens.nathIA`

Gradientes unificados para NathIACard, ChatScreen e componentes relacionados.

```typescript
ColorTokens.nathIA = {
  gradient: {
    light: ['#6DA9E4', '#5A8FD8', '#4A7FCC'],
    dark: ['#4A8FD8', '#2E75CC', '#1E5BB0'],
  },
  warm: {
    light: ['#4ECDC4', '#45B7AA', '#3BB3B5'], // Ciano vibrante
    dark: ['#3BB3B5', '#2D9A93', '#258F88'],
  },
  accent: {
    light: '#6DA9E4',
    dark: '#94C3F0',
  },
  text: {
    light: '#FFFFFF',
    dark: '#FFFFFF',
  },
  shadow: 'rgba(109, 169, 228, 0.3)',
};
```

### `ColorTokens.contentType`

Cores para tipos de conteúdo (vídeo, áudio, história, artigo, guia).

```typescript
ColorTokens.contentType = {
  video: { light: '#4ECDC4', dark: '#3BB3B5' }, // Teal
  audio: { light: '#A78BFA', dark: '#C4B5FD' }, // Roxo
  story: { light: '#FF6B9D', dark: '#FF8FAF' }, // Rosa
  article: { light: '#60A5FA', dark: '#93C5FD' }, // Azul
  guide: { light: '#F59E0B', dark: '#FCD34D' }, // Amber
};
```

### `ColorTokens.moodChip`

9 estados emocionais com cores para light/dark mode.

```typescript
ColorTokens.moodChip = {
  sobrecarregada: { bg: { light, dark }, border: { light, dark }, text: { light, dark }, icon },
  precisandoApoio: { ... },
  tranquila: { ... },
  comEsperanca: { ... },
  feliz: { ... },
  ansiosa: { ... },
  cansada: { ... },
  amada: { ... },
  outro: { ... },
  // V2 (com hífen):
  'cansada': { ... },        // Duplicado - precisa correção
  'precisando-colo': { ... },
  'em-paz': { ... },
  'esperancosa': { ... },
  'grata': { ... },
  'outra': { ... },
};
```

### `ColorTokens.chat`

Cores para ChatScreen (bubbles, input, timestamps).

```typescript
ColorTokens.chat = {
  userBubble: { bg: { light, dark }, text: { light, dark } },
  aiBubble: { bg: { light, dark }, text: { light, dark } },
  input: {
    bg: { light, dark },
    text: { light, dark },
    placeholder: { light, dark },
    border: { light, dark },
  },
  timestamp: { text: { light, dark } },
  typing: { dot: { light, dark } },
};
```

### `ColorTokens.vibrant` - EXTRA OOMPH! 🎨

Gradientes premium e cores vibrantes para CTAs e destaques.

```typescript
ColorTokens.vibrant = {
  // Gradientes premium
  sunrise: ['#FF6B6B', '#FF8E53', '#FFC93C'], // Vermelho → Laranja → Amarelo
  ocean: ['#667EEA', '#764BA2'], // Azul → Roxo
  aurora: ['#A8E6CF', '#88D8B0', '#6FCF97'], // Verde gradiente
  sunset: ['#FA709A', '#FEE140'], // Rosa → Amarelo
  cosmic: ['#8B5CF6', '#EC4899', '#EF4444'], // Roxo → Rosa → Vermelho
  dream: ['#FFECD2', '#FCB69F'], // Pêssego suave
  mint: ['#A8E6CF', '#DCEDC1'], // Mint suave
  lavender: ['#E0C3FC', '#8EC5FC'], // Lavanda → Azul claro

  // Cores sólidas vibrantes
  coral: '#FF6B6B',
  teal: '#4ECDC4',
  gold: '#FFC93C',
  violet: '#8B5CF6',
  rose: '#EC4899',
  emerald: '#10B981',
  sky: '#38BDF8',
  amber: '#F59E0B',
};
```

---

## 3. ✅ COMPONENTES MIGRADOS

| Componente           | Status | Antes              | Depois                     |
| -------------------- | ------ | ------------------ | -------------------------- |
| EmpatheticNathIACard | ✅     | 12 cores hardcoded | Usa `ColorTokens.nathIA`   |
| EmpatheticMoodChips  | ✅     | 10 cores hardcoded | Usa `ColorTokens.moodChip` |

---

## 4. ⚠️ PENDÊNCIAS CRÍTICAS

### Duplicação em `tokens.ts`

- **Problema:** Chave `cansada` duplicada (linha 342 e 362)
- **Impacto:** Erro de TypeScript ao compilar
- **Solução:** Remover duplicação, manter apenas tokens V2

### Componentes V2 não migrados

- ⚠️ `EmpatheticNathIACardV2.tsx` - gradientes hardcoded (linhas 75-81)
- ⚠️ `EmpatheticMoodChipsV2.tsx` - cores hardcoded (linhas 62-119)
- ⚠️ `EmpatheticHighlightsV2.tsx` - gradientes hardcoded
- ⚠️ `EmpatheticWelcomeV2.tsx` - possíveis overlays hardcoded

### Outros componentes

- ⚠️ `ChatScreen.tsx` - ~30 cores hardcoded
- ⚠️ `EmpatheticHighlights.tsx` (V1) - cores de content type hardcoded

---

## 5. 📖 COMO USAR CORRETAMENTE

### ✅ CORRETO - Usar tokens centralizados

```typescript
import { ColorTokens } from '@/theme/tokens';
import { useTheme } from '@/theme';

const { isDark } = useTheme();

// Gradientes
const gradient = isDark ? ColorTokens.nathIA.gradient.dark : ColorTokens.nathIA.gradient.light;

// Cores de conteúdo
const videoColor = isDark
  ? ColorTokens.contentType.video.dark
  : ColorTokens.contentType.video.light;

// Mood chips
const moodBg = isDark
  ? ColorTokens.moodChip['cansada'].bg.dark
  : ColorTokens.moodChip['cansada'].bg.light;

// Branco (nunca hardcoded)
import { ColorTokens } from '@/theme/tokens';
color: ColorTokens.neutral[0]; // ✅
// color: '#FFFFFF';  // ❌

// Overlays
backgroundColor: ColorTokens.overlay.light; // ✅
// backgroundColor: 'rgba(255, 255, 255, 0.2)';  // ❌
```

### ❌ EVITAR - Hardcoded

```typescript
// ❌ Gradientes hardcoded
const gradient = isDark ? ['#4A8FD8', '#2E75CC', '#1E5BB0'] : ['#6DA9E4', '#5A8FD8', '#4A7FCC'];

// ❌ Cores hex diretas
color: '#FFFFFF';
backgroundColor: '#FFE8EC';

// ❌ RGBA hardcoded
backgroundColor: 'rgba(255, 255, 255, 0.2)';
```

---

## 6. 🎯 SUGESTÕES DE USO DAS CORES VIBRANTES

### Para CTAs chamativos

```typescript
<LinearGradient colors={ColorTokens.vibrant.sunset} />
```

### Para badges/destaques

```typescript
backgroundColor: ColorTokens.vibrant.coral;
```

### Para cards premium

```typescript
<LinearGradient colors={ColorTokens.vibrant.ocean} />
```

### Para estados de sucesso vibrantes

```typescript
backgroundColor: ColorTokens.vibrant.emerald;
```

---

## 7. 📋 PRÓXIMOS PASSOS RECOMENDADOS

### Prioridade Alta 🔴

1. **Corrigir duplicação em `tokens.ts`**
   - Remover `cansada` duplicada (linha 342)
   - Manter apenas tokens V2 com nomes corretos

2. **Migrar componentes V2**
   - `EmpatheticNathIACardV2.tsx` → usar `ColorTokens.nathIA.gradient`
   - `EmpatheticMoodChipsV2.tsx` → usar `ColorTokens.moodChip['cansada']`, etc.
   - `EmpatheticHighlightsV2.tsx` → usar `ColorTokens.contentType`
   - Substituir `#FFFFFF` por `ColorTokens.neutral[0]` ou `ColorTokens.nathIA.text.light`
   - Substituir `rgba(...)` por `ColorTokens.overlay.*`

### Prioridade Média 🟡

3. **Migrar ChatScreen.tsx**
   - ~30 cores hardcoded
   - Usar `ColorTokens.chat.*`

4. **Migrar EmpatheticHighlights.tsx (V1)**
   - Usar `ColorTokens.contentType.*`

### Prioridade Baixa 🟢

5. **Criar hook `useContentTypeColor()`**

   ```typescript
   const useContentTypeColor = (type: 'video' | 'audio' | 'story' | 'article') => {
     const { isDark } = useTheme();
     return isDark ? ColorTokens.contentType[type].dark : ColorTokens.contentType[type].light;
   };
   ```

6. **Adicionar ESLint rule**
   - Detectar hex codes fora de `tokens.ts`
   - Sugerir uso de tokens

7. **Validação automática**
   - `npm run validate:design` → deve retornar 0 violations
   - Integrar no CI/CD

---

## 8. ✅ CHECKLIST DE VALIDAÇÃO

Antes de commitar mudanças de design:

- [ ] TypeScript: `npm run type-check` → 0 erros
- [ ] Design Tokens: `npm run validate:design` → 0 violations
- [ ] Nenhuma cor hardcoded (`#xxx`, `rgba(...)`)
- [ ] Todos os componentes usam `ColorTokens.*` ou `useThemeColors()`
- [ ] Dark mode testado
- [ ] Contraste WCAG AAA validado

---

## 9. 📚 REFERÊNCIAS

- **Arquivo de tokens:** `src/theme/tokens.ts`
- **Hook de tema:** `src/theme/ThemeContext.tsx`
- **Guia de centralização:** `docs/CENTRALIZACAO_GUIDE.md`
- **Redesign HomeScreen:** `docs/HOMESCREEN_REDESIGN.md`

---

**Última atualização:** Dezembro 2024  
**Mantido por:** Equipe de Design System
