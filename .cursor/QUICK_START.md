# ⚡ Quick Start - Cursor Workbench

## 🎯 Instalação Rápida (3 passos)

### 1️⃣ Instalar Extensão

```
Ctrl/Cmd+Shift+X → Buscar "Cursor Workbench" → Install
```

### 2️⃣ Verificar

```
Ctrl/Cmd+Shift+P → "Cursor Workbench: Show Rules"
```

Deve mostrar 7 regras configuradas ✅

### 3️⃣ Testar

- Abra qualquer arquivo `.tsx` (ex: `src/screens/HomeScreen.tsx`)
- Inicie chat no Cursor (`Ctrl/Cmd+L`)
- **Como verificar se está funcionando:**
  - **Método 1:** No painel do chat, procure seção "Rules" ou "Context" no topo
  - **Método 2:** Faça pergunta: `"Quais cores devo usar?"` → Resposta deve mencionar `useThemeColors()` e `ColorTokens`
  - **Método 3:** Faça pergunta: `"Posso usar 'any'?"` → Resposta deve ser "Não, zero 'any'"
- ✅ **Se as respostas seguem as regras, está funcionando!**

> 📖 **Guia completo de verificação:** `.cursor/VERIFY_RULES.md`

---

## 📋 Regras Configuradas

| Regra                   | Tipo          | Quando Aplica              |
| ----------------------- | ------------- | -------------------------- |
| **Contexto do Projeto** | Always        | Sempre                     |
| **TypeScript Rules**    | Always        | Sempre                     |
| **Design System**       | Always + Auto | Sempre + `**/*.tsx`        |
| **IA Integration**      | Auto          | `src/ai/**`                |
| **Supabase Rules**      | Auto          | `src/services/supabase/**` |
| **Testing Rules**       | Auto          | `**/*.test.ts`             |
| **Code Quality**        | Always        | Sempre                     |
| **Accessibility**       | Always + Auto | Sempre + `**/*.tsx`        |

---

## 🔍 Como Funciona

### Always (Sempre Aplicadas)

- Anexadas automaticamente em **todas** as conversas
- Não precisa fazer nada
- Exemplo: Contexto, TypeScript, Qualidade

### Auto (Aplicadas por Globs)

- Anexadas quando você abre arquivos que correspondem aos padrões
- Exemplo: Abrir `src/ai/config/llmRouter.ts` → Regra "IA Integration" é anexada

---

## 🚨 Troubleshooting Rápido

| Problema                | Solução                                                     |
| ----------------------- | ----------------------------------------------------------- |
| Regras não aparecem     | Recarregue: `Ctrl/Cmd+Shift+P` → `Developer: Reload Window` |
| Extensão não encontrada | Verifique se está usando **Cursor** (não VS Code)           |
| Globs não funcionam     | Verifique padrões em `workbench.json`                       |

---

## 📖 Documentação Completa

- **Instalação detalhada:** `.cursor/INSTALL_WORKBENCH.md`
- **Estrutura de regras:** `.cursor/rules/README.md`
- **Configuração:** `.cursor/workbench.json`

---

**Pronto!** As regras estão configuradas e funcionando. 🎉
