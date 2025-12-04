# Estratégia para Redução de ESLint Warnings

**Última atualização:** Janeiro 2025  
**Status:** Em progresso (591 warnings → meta: <50 críticos)

---

## 📊 Situação Atual

### Distribuição de Warnings (591 total)

| Categoria | Quantidade | Prioridade | Ação |
|-----------|-----------|------------|------|
| **Acessibilidade (a11y)** | 211 | 🟡 Baixa | Documentar como aceitáveis para MVP |
| **Cores hardcoded** | 244 | 🔴 Alta | Corrigir progressivamente |
| **Ordem de imports** | 6 | 🟢 Baixa | Auto-fix disponível |
| **Hooks dependencies** | 20 | 🟡 Média | Revisar caso a caso |
| **Entidades não escapadas** | 22 | 🟢 Baixa | Auto-fix parcial |
| **Outros** | 88 | 🟡 Média | Variados |

**Warnings críticos (sem a11y):** 380  
**Meta:** < 50 warnings críticos

---

## 🎯 Estratégia de Redução

### Fase 1: Auto-Fix ✅ (Já disponível)

```bash
# Corrigir automaticamente o que for possível
npm run lint:fix
```

**Resultado esperado:**
- Ordem de imports corrigida
- Algumas entidades escapadas
- **Redução estimada:** ~30 warnings

---

### Fase 2: Documentar Warnings Aceitáveis

#### 2.1 Acessibilidade (211 warnings)

**Decisão:** Manter como `warn` (não bloquear)

**Justificativa:**
- Melhorias de UX, não crítico para MVP
- Pode ser tratado na fase de WCAG AAA compliance
- Não afeta funcionalidade

**Exemplo:**
```typescript
// ✅ Aceitável para MVP
<Button 
  accessibilityLabel="Salvar"
  // accessibilityHint não é obrigatório para MVP
/>
```

---

#### 2.2 Cores Hardcoded (244 warnings)

**Decisão:** Corrigir progressivamente

**Priorização:**

1. **Alta prioridade:**
   - Telas principais (HomeScreen, ChatScreen)
   - Componentes primitivos (Box, Text, Button)
   - ErrorBoundary (já tem override, mas revisar)

2. **Média prioridade:**
   - Telas secundárias
   - Componentes organizacionais

3. **Baixa prioridade:**
   - Arquivos de configuração
   - Scripts

**Ferramenta:** `npm run validate:design` já identifica violações

---

### Fase 3: Correções Manuais Progressivas

#### 3.1 Scripts Disponíveis

```bash
# Analisar warnings
npm run lint:analyze

# Auto-fix
npm run lint:fix

# Validar design tokens
npm run validate:design
```

#### 3.2 Padrão de Correção

**Antes:**
```typescript
// ❌ Cores hardcoded
<View style={{ backgroundColor: '#FFFFFF' }} />
```

**Depois:**
```typescript
// ✅ Design tokens
import { useThemeColors } from '@/theme';

const colors = useThemeColors();
<View style={{ backgroundColor: colors.background.card }} />
```

---

## 📋 Checklist de Ação

### ✅ Já Feito

- [x] Script de análise criado (`scripts/reduce-eslint-warnings.js`)
- [x] Comando `lint:analyze` adicionado ao package.json
- [x] Documentação criada

### 🟡 Em Progresso

- [ ] Auto-fix executado (reduzir ~30 warnings)
- [ ] Warnings de acessibilidade documentados como aceitáveis
- [ ] Correção progressiva de cores hardcoded (prioridade alta)

### ⏳ Próximos Passos

1. **Curto prazo (1-2h):**
   - Executar auto-fix
   - Documentar warnings aceitáveis no `.eslintrc.js`
   - Meta: Reduzir para ~350 warnings críticos

2. **Médio prazo (2-4h):**
   - Corrigir cores hardcoded em componentes primitivos
   - Corrigir cores hardcoded em telas principais
   - Meta: Reduzir para ~150 warnings críticos

3. **Longo prazo (4-6h):**
   - Corrigir cores hardcoded restantes
   - Revisar hooks dependencies
   - Meta: Reduzir para <50 warnings críticos

---

## 🔧 Configuração ESLint

### Overrides Recomendados

Adicione ao `.eslintrc.js` para ignorar warnings aceitáveis:

```javascript
overrides: [
  // ... existing overrides ...
  {
    // Arquivos de tokens - permitir cores hardcoded
    files: ['**/tokens.ts', '**/colors.ts', '**/ThemeContext.tsx'],
    rules: {
      'no-restricted-syntax': 'off',
    },
  },
  {
    // Scripts - regras mais relaxadas
    files: ['scripts/**/*.js', 'scripts/**/*.ts'],
    rules: {
      'no-restricted-syntax': 'off',
      'import/order': 'off',
    },
  },
]
```

---

## 📈 Métricas de Progresso

Execute periodicamente:

```bash
npm run lint:analyze
```

Isso gera `eslint-warnings-report.json` com estatísticas atualizadas.

---

## 📚 Referências

- [Design Tokens Guide](../docs/DESIGN_VALIDATION_GUIDE.md)
- [Estado de Qualidade](./STATE_OF_QUALITY.md)
- [Análise de Violações](./DESIGN_VIOLATIONS_ANALYSIS.md)

---

**Última atualização:** Janeiro 2025

