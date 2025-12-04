# 🐛 Plano de Correção de Bugs - Nossa Maternidade

## **Status Atual**

Após análise do `npm run type-check`, identificamos **4 categorias** de erros:

---

## **Categoria 1: Erros CRÍTICOS (Bloqueiam App) 🔴**

### **1.1 HomeScreen - Erro de Tipo `width`**

**Arquivo:** `src/screens/HomeScreen.tsx:526`

**Erro:**

```
Type 'string' is not assignable to type 'DimensionValue | undefined'
```

**Causa:**

```typescript
const containerStyle = useMemo(
  () => ({
    maxWidth: isXL ? 1280 : 1100,
    alignSelf: 'center' as const,
    paddingHorizontal: isSmallScreen ? 16 : 24,
    width, // ❌ Problema: width é number, não string
  }),
  [isXL, isSmallScreen, width]
);
```

**Solução:**

```typescript
const containerStyle = useMemo(
  () => ({
    maxWidth: isXL ? 1280 : 1100,
    alignSelf: 'center' as const,
    paddingHorizontal: isSmallScreen ? 16 : 24,
    width: '100%', // ✅ Correção
  }),
  [isXL, isSmallScreen]
);
```

**Impacto:** ALTO - Pode causar crash na Home
**Prioridade:** P0 (Urgente)
**Tempo estimado:** 5 minutos

---

### **1.2 SettingsScreen - ThemeColors Incompleto**

**Arquivo:** `src/screens/SettingsScreen.tsx:237, 247, 252, 261`

**Erro:**

```
Property 'error' does not exist on type 'ThemeColors'
```

**Causa:**

```typescript
<Text style={{ color: colors.error }}> {/* ❌ 'error' não existe */}
```

**Solução 1: Adicionar `error` ao ThemeColors**

```typescript
// src/theme/tokens.ts
export const darkTheme = {
  ...
  colors: {
    ...
    error: '#EF4444', // ✅ Adicionar
    status: {
      error: '#EF4444',
      ...
    }
  }
};
```

**Solução 2: Usar colors.status.error**

```typescript
<Text style={{ color: colors.status?.error || '#EF4444' }}>
```

**Impacto:** MÉDIO - Settings pode não renderizar corretamente
**Prioridade:** P1 (Alta)
**Tempo estimado:** 10 minutos

---

### **1.3 PremiumOnboarding - Módulo Theme.ts Deletado**

**Arquivo:** `src/screens/PremiumOnboarding.tsx:21`

**Erro:**

```
Cannot find module '../constants/Theme' or its corresponding type declarations
```

**Causa:**

```typescript
import { Theme } from '../constants/Theme'; // ❌ Arquivo deletado
```

**Solução:**

```typescript
// Remover import antigo
// import { Theme } from '../constants/Theme';

// Usar novo theme context
import { useTheme } from '../theme/ThemeContext';

// Dentro do componente:
const { colors } = useTheme();
```

**Impacto:** ALTO - Tela Premium não funciona
**Prioridade:** P0 (Urgente)
**Tempo estimado:** 15 minutos

---

### **1.4 OnboardingFlowNew - Mesmo Erro de `width`**

**Arquivos:** `src/screens/Onboarding/OnboardingFlowNew.tsx:702, 728`

**Erro:** Igual ao 1.1 (type 'string' não assignable)

**Solução:** Mesma correção do HomeScreen

**Impacto:** ALTO - Onboarding pode não funcionar
**Prioridade:** P0 (Urgente)
**Tempo estimado:** 5 minutos

---

## **Categoria 2: Erros de COMPATIBILIDADE (Não Bloqueiam, Mas Podem Dar Warning) 🟡**

### **2.1 FileSystem API Changes**

**Arquivo:** `src/screens/SettingsScreen.tsx:79, 81`

**Erro:**

```
Property 'documentDirectory' does not exist on type '...'
Property 'EncodingType' does not exist on type '...'
```

**Causa:** Versão antiga da API do Expo FileSystem

**Solução:**

```typescript
// Antes (OLD):
const path = FileSystem.documentDirectory + 'data.json';
const content = await FileSystem.readAsStringAsync(path, {
  encoding: FileSystem.EncodingType.UTF8,
});

// Depois (NEW):
import * as FileSystem from 'expo-file-system';

const path = FileSystem.documentDirectory! + 'data.json';
const content = await FileSystem.readAsStringAsync(path, {
  encoding: 'utf8', // String literal em vez de enum
});
```

**Impacto:** BAIXO - Funciona no runtime, mas gera warnings
**Prioridade:** P2 (Média)
**Tempo estimado:** 10 minutos

---

### **2.2 sessionManager - Type Mismatch (null vs undefined)**

**Arquivo:** `src/services/sessionManager.ts:247, 263`

**Erro:**

```
Type 'string | null' is not assignable to type 'string | undefined'
```

**Solução:**

```typescript
// Antes:
setChatSessionId(sessionId: string | null)

// Depois:
setChatSessionId(sessionId: string | null | undefined) {
  this.chatSessionId = sessionId ?? undefined;
}
```

**Impacto:** BAIXO - TypeScript warning apenas
**Prioridade:** P3 (Baixa)
**Tempo estimado:** 5 minutos

---

## **Categoria 3: Erros de TESTE (Não Afetam App) 🔵**

### **3.1 Jest Types Missing**

**Arquivo:** `__tests__/userDataService.test.ts`

**Erro:**

```
Cannot use namespace 'jest' as a value
Cannot find name 'describe', 'it', 'expect'
```

**Solução:**

```bash
npm install --save-dev @types/jest @jest/globals
```

**Adicionar no `tsconfig.json`:**

```json
{
  "compilerOptions": {
    "types": ["jest", "@jest/globals"]
  }
}
```

**Impacto:** ZERO - Não afeta app
**Prioridade:** P4 (Baixíssima)
**Tempo estimado:** 2 minutos

---

## **Categoria 4: Erros de SUPABASE FUNCTIONS (Ambiente Deno) ⚪**

### **4.1 Deno Imports**

**Arquivo:** `supabase/functions/delete-account/index.ts:7, 8, 16`

**Erro:**

```
Cannot find module 'https://deno.land/std@0.168.0/http/server.ts'
```

**Causa:** TypeScript rodando em Node, não em Deno

**Solução:** Ignorar estes erros OU adicionar `// @ts-ignore` nas linhas

**Alternativa:** Configurar `tsconfig.json` para excluir `supabase/functions`:

```json
{
  "exclude": ["node_modules", "supabase/functions"]
}
```

**Impacto:** ZERO - Edge Functions usam Deno, não Node
**Prioridade:** P4 (Baixíssima)
**Tempo estimado:** 2 minutos

---

## **PLANO DE EXECUÇÃO (Ordem de Prioridade)**

### **SPRINT 1: Bugs Críticos (30 minutos)**

```bash
# 1. Corrigir HomeScreen (5 min)
# Arquivo: src/screens/HomeScreen.tsx:526

# 2. Corrigir PremiumOnboarding (15 min)
# Arquivo: src/screens/PremiumOnboarding.tsx:21

# 3. Corrigir OnboardingFlowNew (5 min)
# Arquivo: src/screens/Onboarding/OnboardingFlowNew.tsx:702, 728

# 4. Corrigir SettingsScreen ThemeColors (10 min)
# Arquivo: src/screens/SettingsScreen.tsx
```

### **SPRINT 2: Bugs de Compatibilidade (15 minutos)**

```bash
# 5. Atualizar FileSystem API (10 min)
# Arquivo: src/screens/SettingsScreen.tsx:79, 81

# 6. Corrigir sessionManager types (5 min)
# Arquivo: src/services/sessionManager.ts:247, 263
```

### **SPRINT 3: Limpeza (Opcional - 5 minutos)**

```bash
# 7. Instalar @types/jest (2 min)
# 8. Excluir supabase/functions do tsconfig (2 min)
```

---

## **COMANDOS AUTOMATIZADOS**

### **1. Verificar Bugs**

```bash
npm run type-check
```

### **2. Após Correções**

```bash
# Rodar type-check novamente
npm run type-check

# Testar no simulador
npm run ios
# ou
npm run android
```

### **3. Commit das Correções**

```bash
git add .
git commit -m "fix: resolve critical TypeScript errors

- Fix HomeScreen width type error
- Fix PremiumOnboarding Theme import
- Fix OnboardingFlowNew width type error
- Fix SettingsScreen ThemeColors error
- Update FileSystem API calls
- Fix sessionManager type mismatch

Closes #XX"
```

---

## **CHECKLIST DE VALIDAÇÃO**

Após todas as correções:

```
[ ] npm run type-check → 0 erros críticos
[ ] npm run ios → App abre sem crash
[ ] npm run android → App abre sem crash
[ ] Testar HomeScreen → Renderiza corretamente
[ ] Testar ChatScreen → IA responde
[ ] Testar SettingsScreen → Botões funcionam
[ ] Testar Onboarding → Fluxo completo
[ ] Testar Premium → (se aplicável)
[ ] Build EAS → npm run build:dev → Sucesso
```

---

## **RESUMO**

| Categoria            | Qtd   | Prioridade | Tempo Total |
| -------------------- | ----- | ---------- | ----------- |
| Críticos (🔴)        | 4     | P0-P1      | 30 min      |
| Compatibilidade (🟡) | 2     | P2-P3      | 15 min      |
| Testes (🔵)          | 1     | P4         | 2 min       |
| Supabase (⚪)        | 1     | P4         | 2 min       |
| **TOTAL**            | **8** |            | **49 min**  |

---

## **PRÓXIMOS PASSOS**

1. **Agora:** Corrigir bugs críticos (SPRINT 1)
2. **Depois:** Testar app end-to-end
3. **Então:** Deploy Supabase Edge Function
4. **Finalmente:** Build para TestFlight/Play Store

---

**Quer que eu corrija todos os bugs AGORA automaticamente?**

Digite:

- **"fix all"** → Eu corrijo tudo
- **"fix critical"** → Eu corrijo só P0 e P1
- **"show code"** → Eu mostro as correções primeiro

---

**Status:** ⏳ Aguardando comando
**ETA para correção completa:** 49 minutos
**ETA para bugs críticos:** 30 minutos
