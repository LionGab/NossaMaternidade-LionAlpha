# 📊 Análise de Violações de Design Tokens

**Data:** Janeiro 2025  
**Total de Violações:** 409 críticas  
**Arquivos Afetados:** 49 arquivos

---

## 🎯 Resumo Executivo

### Violações por Tipo

- **Hex colors:** 355 (87%)
- **RGBA colors:** 54 (13%)
- **Named colors:** 6 (<1%)

### Arquivos Mais Críticos (Top 10)

| Arquivo                    | Violações | Prioridade | Motivo                                 |
| -------------------------- | --------- | ---------- | -------------------------------------- |
| `RitualScreen.tsx`         | 28        | 🔴 ALTA    | Tela principal, muitas cores hardcoded |
| `OnboardingStep9.tsx`      | 20        | 🔴 ALTA    | Última etapa onboarding (crítico)      |
| `OnboardingStep8.tsx`      | 17        | 🔴 ALTA    | Etapa importante onboarding            |
| `OnboardingFlowNew.tsx`    | 15        | 🔴 ALTA    | Fluxo principal onboarding             |
| `PremiumOnboarding.tsx`    | 13        | 🟡 MÉDIA   | Tela premium (menos crítico)           |
| `RefugioNathScreen.tsx`    | 12        | 🟡 MÉDIA   | Tela secundária                        |
| `OnboardingStep1.tsx`      | 11        | 🔴 ALTA    | Primeira etapa (primeira impressão)    |
| `OnboardingStep2.tsx`      | 10        | 🔴 ALTA    | Segunda etapa onboarding               |
| `ProfileScreen.tsx`        | 7         | 🟡 MÉDIA   | Tela de perfil                         |
| `TermsOfServiceScreen.tsx` | 7         | 🟢 BAIXA   | Tela legal (menos visual)              |

---

## 🔴 Problemas Críticos Identificados

### 1. Cores Brancas Hardcoded (#FFFFFF)

**Frequência:** ~150 ocorrências  
**Impacto:** ALTO - Quebra dark mode

**Padrão encontrado:**

```typescript
// ❌ PROBLEMA
color: '#FFFFFF'
backgroundColor: '#FFFFFF'
<Icon color="#FFFFFF" />
```

**Solução:**

```typescript
// ✅ CORRETO
const colors = useThemeColors();
color: colors.text.inverse
backgroundColor: colors.background.card
<Icon color={colors.text.inverse} />
```

**Arquivos mais afetados:**

- `Badge.tsx` - 6 ocorrências
- `OnboardingStep8.tsx` - 5 ocorrências
- `OnboardingStep9.tsx` - 4 ocorrências
- `ProfileScreen.tsx` - 7 ocorrências

---

### 2. Cores de Background Hardcoded

**Frequência:** ~80 ocorrências  
**Impacto:** ALTO - Quebra dark mode

**Padrão encontrado:**

```typescript
// ❌ PROBLEMA
backgroundColor: '#0B1220';
backgroundColor: '#020617';
backgroundColor: isDark ? '#020617' : '#FFF8F3';
```

**Solução:**

```typescript
// ✅ CORRETO
const colors = useThemeColors();
backgroundColor: colors.background.canvas;
backgroundColor: colors.background.card;
backgroundColor: colors.background.canvas; // Auto-ajusta dark mode
```

**Arquivos mais afetados:**

- `RitualScreen.tsx` - 8 ocorrências
- `OnboardingStep8.tsx` - 4 ocorrências
- `OnboardingStep9.tsx` - 3 ocorrências

---

### 3. Cores de Borda RGBA Hardcoded

**Frequência:** 54 ocorrências  
**Impacto:** MÉDIO - Quebra consistência

**Padrão encontrado:**

```typescript
// ❌ PROBLEMA
borderColor: 'rgba(148, 163, 184, 0.24)';
borderColor: 'rgba(96, 165, 250, 0.1)';
```

**Solução:**

```typescript
// ✅ CORRETO
const colors = useThemeColors();
borderColor: colors.border.light;
borderColor: colors.border.medium;
```

---

### 4. Cores de Status Hardcoded

**Frequência:** ~40 ocorrências  
**Impacto:** MÉDIO - Quebra consistência visual

**Padrão encontrado:**

```typescript
// ❌ PROBLEMA
color: '#3B82F6'; // Azul
color: '#10B981'; // Verde
color: '#F59E0B'; // Amarelo
color: '#EF4444'; // Vermelho
```

**Solução:**

```typescript
// ✅ CORRETO
const colors = useThemeColors();
color: colors.primary.main;
color: colors.status.success;
color: colors.status.warning;
color: colors.status.error;
```

---

## 📋 Plano de Correção Prioritário

### Fase 1: Componentes Base (1-2 dias) 🔴 CRÍTICO

**Objetivo:** Corrigir componentes reutilizáveis primeiro

1. **Badge.tsx** (6 violações)
   - Substituir `#FFFFFF` por `colors.text.inverse`
   - Prioridade: ALTA (usado em múltiplas telas)

2. **AudioPlayer.tsx** (1 violação)
   - Substituir `rgba()` por `colors.shadows.card`
   - Prioridade: MÉDIA

### Fase 2: Onboarding Flow (2-3 dias) 🔴 CRÍTICO

**Objetivo:** Corrigir primeira impressão do usuário

1. **OnboardingStep1.tsx** (11 violações)
2. **OnboardingStep2.tsx** (10 violações)
3. **OnboardingStep8.tsx** (17 violações)
4. **OnboardingStep9.tsx** (20 violações)
5. **OnboardingFlowNew.tsx** (15 violações)

**Total:** 73 violações corrigidas

### Fase 3: Telas Principais (3-4 dias) 🟡 IMPORTANTE

1. **RitualScreen.tsx** (28 violações)
2. **ProfileScreen.tsx** (7 violações)
3. **RefugioNathScreen.tsx** (12 violações)

**Total:** 47 violações corrigidas

### Fase 4: Telas Secundárias (2-3 dias) 🟢 BAIXA

1. **PremiumOnboarding.tsx** (13 violações)
2. **TermsOfServiceScreen.tsx** (7 violações)
3. Outros arquivos menores

**Total:** ~30 violações corrigidas

---

## 🛠️ Guia de Correção Rápida

### Padrão 1: Cores Brancas

```typescript
// ❌ ANTES
color: '#FFFFFF'
<Icon color="#FFFFFF" />

// ✅ DEPOIS
const colors = useThemeColors();
color: colors.text.inverse
<Icon color={colors.text.inverse} />
```

### Padrão 2: Backgrounds

```typescript
// ❌ ANTES
backgroundColor: '#0B1220';
backgroundColor: isDark ? '#020617' : '#FFFFFF';

// ✅ DEPOIS
const colors = useThemeColors();
backgroundColor: colors.background.canvas;
backgroundColor: colors.background.card;
```

### Padrão 3: Bordas RGBA

```typescript
// ❌ ANTES
borderColor: 'rgba(148, 163, 184, 0.24)';

// ✅ DEPOIS
const colors = useThemeColors();
borderColor: colors.border.light;
```

### Padrão 4: Cores de Status

```typescript
// ❌ ANTES
color: '#3B82F6';
color: '#10B981';
color: '#F59E0B';

// ✅ DEPOIS
const colors = useThemeColors();
color: colors.primary.main;
color: colors.status.success;
color: colors.status.warning;
```

---

## 📈 Métricas de Progresso

### Meta por Fase

| Fase      | Violações | Meta    | Status      |
| --------- | --------- | ------- | ----------- |
| Fase 1    | 7         | 0       | ⏳ Pendente |
| Fase 2    | 73        | 0       | ⏳ Pendente |
| Fase 3    | 47        | 0       | ⏳ Pendente |
| Fase 4    | ~30       | 0       | ⏳ Pendente |
| **Total** | **409**   | **<50** | ⏳ Pendente |

### Critérios de Sucesso

- ✅ **Fase 1:** Componentes base 100% compliant
- ✅ **Fase 2:** Onboarding flow 100% compliant
- ✅ **Fase 3:** Telas principais < 5 violações cada
- ✅ **Fase 4:** Todas telas < 50 violações totais

---

## 🚀 Próximos Passos Imediatos

1. **Começar por Badge.tsx** (mais rápido, maior impacto)
2. **Corrigir OnboardingStep1.tsx** (primeira impressão)
3. **Validar após cada correção:** `npm run validate:design`
4. **Commit incremental:** Uma tela/componente por commit

---

## 💡 Dicas de Produtividade

### Buscar e Substituir Inteligente

```powershell
# Encontrar todas ocorrências de #FFFFFF
cd nossaMaternidade
Select-String -Path "src/**/*.tsx" -Pattern "#FFFFFF" | Select-Object Path, LineNumber
```

### Validação Incremental

```powershell
# Validar apenas um arquivo específico
npm run validate:design | Select-String "Badge.tsx"
```

---

**Última atualização:** Janeiro 2025  
**Próxima revisão:** Após Fase 1 completa
