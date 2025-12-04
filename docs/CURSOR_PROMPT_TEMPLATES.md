# 📝 Templates de Prompts para Claude no Cursor

**Projeto:** Nossa Maternidade  
**Data:** 29/11/2025  
**Objetivo:** Prompts otimizados e prontos para uso rápido

---

## 🚀 Como Usar

1. Abra o Cursor Chat (`Ctrl+L` ou `Cmd+L`)
2. Cole o template apropriado
3. Substitua os placeholders (`@arquivo`, `@pasta`, etc.) pelos seus arquivos
4. Ajuste conforme necessário

---

## 🎯 Templates por Tipo de Tarefa

### 1. Criar Componente Novo

```
## Contexto
@src/components/primitives
@src/theme/tokens.ts

## Objetivo
Criar componente [NOME] em @src/components/[PRIMITIVES|MOLECULES|ORGANISMS]/[NomeComponent].tsx

## Requisitos
- TypeScript strict mode (zero `any`)
- Usar apenas componentes primitivos de @src/components/primitives
- Design tokens de @src/theme/tokens.ts (nunca cores hardcoded)
- Dark mode support completo
- WCAG AAA (acessibilidade: labels, contraste 7:1, touch targets 44pt+)
- Memoization quando apropriado
- Testes básicos incluídos

## Padrões
Seguir estrutura e padrões de @[COMPONENTE_SIMILAR].tsx

## Implementação
[Seguir padrões do projeto - ver .cursor/rules]
```

**Exemplo Prático:**

```
## Contexto
@src/components/primitives/Button.tsx
@src/theme/tokens.ts

## Objetivo
Criar componente IconButton em @src/components/primitives/IconButton.tsx

## Requisitos
- Aceita ícone (React Native Vector Icons)
- Tamanhos: sm, md, lg
- Variantes: primary, secondary, ghost
- Design tokens obrigatórios
- Dark mode support
- WCAG AAA
- Memoizado

## Padrões
Seguir estrutura de @src/components/primitives/Button.tsx
```

---

### 2. Refatorar Tela para Design Tokens

```
## Contexto
@src/screens/[NOME_TELA].tsx
@src/theme/tokens.ts
@src/components/primitives

## Objetivo
Refatorar @src/screens/[NOME_TELA].tsx para usar design tokens corretamente

## Mudanças Necessárias
1. Substituir TODAS as cores hardcoded (#xxx, rgba, 'white', etc.) por useThemeColors()
2. Substituir espaçamentos hardcoded por Tokens.spacing.*
3. Substituir tipografia hardcoded por Tokens.typography.*
4. Substituir View/Text nativos por componentes primitivos quando apropriado
5. Garantir dark mode funciona perfeitamente
6. Validar contraste WCAG AAA

## Manter
- Mesma funcionalidade
- Mesmo layout visual (cores ajustadas para tokens equivalentes)
- Performance atual

## Validação
Após refatoração, código deve passar: npm run validate:design
```

**Exemplo Prático:**

```
## Contexto
@src/screens/HomeScreen.tsx
@src/theme/tokens.ts

## Objetivo
Refatorar HomeScreen para usar design tokens

## Mudanças
1. Todas cores hardcoded → useThemeColors()
2. Espaçamentos → Tokens.spacing.*
3. Tipografia → Tokens.typography.*

## Manter
Funcionalidade e layout iguais

## Validação
npm run validate:design deve retornar 0 violations
```

---

### 3. Integrar Service com Supabase

```
## Contexto
@src/services/supabase/[SERVICE_SIMILAR].ts
@src/types/[RELEVANTE].ts
@supabase/types

## Objetivo
Criar @src/services/supabase/[NOME]Service.ts com funções:
- [FUNÇÃO_1]: [DESCRIÇÃO]
- [FUNÇÃO_2]: [DESCRIÇÃO]
- [FUNÇÃO_3]: [DESCRIÇÃO]

## Requisitos
- TypeScript strict (zero `any`)
- RLS policies ready (filtrar por user.id quando aplicável)
- Tratamento de erros robusto
- Tipos do Supabase (`@supabase/types`)
- Logging com logger (nunca console.log)
- AsyncStorage fallback para offline

## Padrões
Seguir estrutura de @src/services/supabase/[SERVICE_SIMILAR].ts

## Testes
Incluir testes básicos (mock Supabase, não DB real)
```

**Exemplo Prático:**

```
## Contexto
@src/services/supabase/profileService.ts
@src/types/user.ts

## Objetivo
Criar emotionService.ts com:
- saveEmotion(emotion: EmotionValue): Promise<void>
- getTodayEmotion(): Promise<EmotionValue | null>
- getEmotionHistory(days: number): Promise<EmotionLog[]>

## Requisitos
- TypeScript strict
- RLS ready (user.id)
- Error handling
- Logger, não console.log
- Offline cache AsyncStorage

## Padrões
Seguir @src/services/supabase/profileService.ts
```

---

### 4. Implementar Feature Completa

```
## Contexto
@src/screens/[TELA_RELEVANTE].tsx
@src/services/[SERVICES_RELEVANTES]
@src/types/[TYPES_RELEVANTES]
@src/theme/tokens.ts

## Objetivo
Implementar feature [NOME] completa:
- Tela: @src/screens/[NOME]Screen.tsx
- Service: @src/services/[NOME]Service.ts
- Types: @src/types/[NOME].ts
- Hooks: @src/hooks/use[NOME].ts (opcional)

## Funcionalidades
1. [FUNC_1]
2. [FUNC_2]
3. [FUNC_3]

## Requisitos Técnicos
- TypeScript strict (zero `any`)
- Design tokens obrigatórios
- Dark mode support
- WCAG AAA acessibilidade
- Performance otimizada (memo, FlatList se lista)
- Error handling
- Loading states
- Offline support (AsyncStorage)

## Validações
- npm run type-check → 0 errors
- npm run validate:design → 0 violations
- Testes básicos incluídos
```

---

### 5. Debug e Correção de Erros

```
## Contexto
@[ARQUIVO_COM_ERRO].tsx
@[ARQUIVOS_RELACIONADOS]

## Problema
[DESCREVER ERRO OU COMPORTAMENTO INCORRETO]

## Erro Específico
[COPIAR ERRO EXATO DO TERMINAL/LINTER]

## Objetivo
Corrigir o erro mantendo:
- Funcionalidade existente
- Padrões do projeto
- Design tokens
- Performance

## Validação
- Código deve compilar sem erros
- npm run type-check → 0 errors
- Testes existentes devem passar
```

**Exemplo Prático:**

```
## Contexto
@src/screens/ChatScreen.tsx
@src/services/chatService.ts

## Problema
ChatScreen está crashando ao enviar mensagem

## Erro Específico
TypeError: Cannot read property 'sendMessage' of undefined
at ChatScreen.tsx:45

## Objetivo
Corrigir erro mantendo funcionalidade

## Validação
- Compila sem erros
- Mensagem envia corretamente
- TypeScript 0 errors
```

---

### 6. Refatoração de Múltiplos Arquivos

```
## Contexto
@src/[PASTA_AFETADA]/
@src/theme/tokens.ts

## Objetivo
Refatorar todos arquivos em @src/[PASTA]/ para:
- [MUDANÇA_1]
- [MUDANÇA_2]
- [MUDANÇA_3]

## Estratégia
1. Criar plano de refatoração (lista de arquivos afetados)
2. Refatorar um arquivo por vez
3. Validar cada arquivo antes de prosseguir
4. Garantir consistência entre arquivos

## Padrões
- Seguir .cursor/rules
- Design tokens obrigatórios
- TypeScript strict
- WCAG AAA

## Validação Final
- npm run type-check → 0 errors
- npm run lint → 0 critical warnings
- npm run validate:design → 0 violations
```

---

### 7. Explorar e Entender Código

```
## Contexto
@[ARQUIVO_OU_PASTA]

## Objetivo
Explicar como funciona [ARQUIVO/PARTE_DO_CÓDIGO]

## Perguntas Específicas
1. [PERGUNTA_1]
2. [PERGUNTA_2]
3. [PERGUNTA_3]

## Resposta Desejada
- Fluxo de dados
- Dependências e imports
- Padrões usados
- Como modificar sem quebrar
```

**Exemplo Prático:**

```
## Contexto
@src/services/chatService.ts

## Objetivo
Explicar como funciona o chatService

## Perguntas
1. Como as mensagens são salvas no Supabase?
2. Como funciona o fallback entre providers de IA?
3. Onde está a crisis detection?

## Resposta
[Claude explica detalhadamente]
```

---

### 8. Otimização de Performance

```
## Contexto
@[ARQUIVO_LENTO].tsx

## Objetivo
Otimizar performance de @[ARQUIVO]

## Problemas Identificados
- [PROBLEMA_1]
- [PROBLEMA_2]

## Otimizações Desejadas
- [OTIMIZAÇÃO_1]
- [OTIMIZAÇÃO_2]

## Padrões
- FlatList em vez de ScrollView + map
- useMemo/useCallback quando apropriado
- Lazy loading de imagens
- getItemLayout se possível
- Evitar re-renders desnecessários

## Manter
- Funcionalidade idêntica
- Design tokens
- Acessibilidade
```

---

## 🎨 Templates Específicos do Projeto

### Criar MaternalCard Variant

```
## Contexto
@src/components/organisms/MaternalCard.tsx
@src/theme/tokens.ts
@src/components/primitives

## Objetivo
Adicionar variant "[NOME]" ao MaternalCard

## Variant Específica
- Tipo: [hero|insight|action|progress|content|emotional]
- Layout: [DESCREVER]
- Props específicos: [LISTAR]

## Requisitos
- Reutilizar código existente
- Design tokens
- Dark mode
- WCAG AAA
- Testes atualizados
```

---

### Integrar IA Multi-Provider

```
## Contexto
@src/ai/config/llmRouter.ts
@src/services/ai/[AGENT_RELEVANTE].ts

## Objetivo
Integrar [PROVIDER] no llmRouter para [CASO_DE_USO]

## Caso de Uso
- Quando usar: [DESCREVER]
- Fallback: [PROVIDER_FALLBACK]
- Prompt: [TIPO_DE_PROMPT]

## Requisitos
- Roteamento automático
- Fallback robusto
- Logging (provider, tokens, custo)
- Crisis detection se aplicável
- Error handling

## Padrões
Seguir estrutura de @src/ai/config/llmRouter.ts
```

---

## 💡 Dicas de Uso

### ✅ BOAS PRÁTICAS

1. **Seja específico**: Inclua arquivos concretos com `@`
2. **Forneça contexto**: Sempre inclua arquivos relacionados
3. **Defina objetivos claros**: Liste exatamente o que quer
4. **Mencione padrões**: Referencie arquivos similares
5. **Validação explícita**: Diga o que validar depois

### ❌ EVITE

1. Prompts vagos: "Melhore esse código"
2. Sem referências: Não usar `@arquivo.ts`
3. Múltiplos objetivos: Focar em uma coisa por vez
4. Sem contexto: Não incluir arquivos relacionados
5. Ignorar padrões: Não mencionar `.cursor/rules`

---

## 📚 Referências

- **Guia Completo**: `docs/CURSOR_CLAUDE_SETUP.md`
- **Regras do Projeto**: `.cursor/rules`
- **Design System**: `src/theme/tokens.ts`
- **Estrutura**: `docs/PROJECT_STRUCTURE.md`

---

**Última atualização:** 29/11/2025
