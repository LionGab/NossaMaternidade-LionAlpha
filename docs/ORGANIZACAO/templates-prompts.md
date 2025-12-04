# Templates de Prompts Específicos

> **Prompts prontos para usar com IA, baseados em "Silêncio Estruturado: IA e Organização"**
>
> **Como usar:** Copie e cole o prompt, substituindo [placeholders] pelos seus valores específicos.

---

## 1. Criar Plano de Fases

### Prompt Básico

```
Crie um plano em [X] fases para [objetivo específico].

Contexto:
- [Contexto relevante]
- [Restrições ou requisitos]

Para cada fase, inclua:
- Objetivo claro e verificável
- Tempo estimado
- Nível de energia necessário (baixo/médio/alto)
- Dependências
- Checklist de ações
- Critérios de sucesso

Use o formato do template em docs/ORGANIZACAO/template-plano.md
```

### Exemplo Prático

```
Crie um plano em 4 fases para refatorar HomeScreen.tsx usando design tokens.

Contexto:
- HomeScreen.tsx atualmente usa cores hardcoded (#FFFFFF, rgba(...))
- Preciso migrar para usar useThemeColors() e Tokens.spacing
- Deve manter mesma funcionalidade
- Deve suportar dark mode

Para cada fase, inclua:
- Objetivo claro e verificável
- Tempo estimado
- Nível de energia necessário (baixo/médio/alto)
- Dependências
- Checklist de ações
- Critérios de sucesso

Use o formato do template em docs/ORGANIZACAO/template-plano.md
```

---

## 2. Entrevista Estruturada (Quando Sobrecarregado)

### Prompt Mágico

```
Estou tentando organizar [descreva a situação de forma vaga], mas estou me sentindo sobrecarregado(a).

Faça-me 20 perguntas para me ajudar a esclarecer:
- Meus objetivos
- Restrições e limitações
- Recursos disponíveis
- Próximos passos

Depois das minhas respostas, crie um plano de ação detalhado em fases.
```

### Exemplo Prático

```
Estou tentando organizar a refatoração do sistema de design do projeto, mas estou me sentindo sobrecarregado(a).

Faça-me 20 perguntas para me ajudar a esclarecer:
- Meus objetivos
- Restrições e limitações
- Recursos disponíveis
- Próximos passos

Depois das minhas respostas, crie um plano de ação detalhado em fases.
```

### Por que funciona?

- As perguntas quebram a inércia e estruturam seu pensamento
- Você externaliza informação da sua cabeça de forma guiada
- A IA usa suas próprias respostas para criar plano personalizado

---

## 3. Pedidos Específicos (Com Restrições Positivas)

### Estrutura

```
[VERBO] [O QUÊ] [ONDE] [COMO] [RESTRIÇÕES POSITIVAS]

Evite: "Não faça X"
Use: "Faça Y desta forma"
```

### Exemplos

#### ❌ Genérico (Ruim)

```
Refatore HomeScreen.tsx
```

#### ✅ Específico (Bom)

```
Refatore HomeScreen.tsx para usar design tokens.

Requisitos:
- Substitua todas as cores hardcoded por useThemeColors()
- Substitua espaçamentos hardcoded por Tokens.spacing['X']
- Mantenha mesma funcionalidade (apenas style updates)
- Adicione accessibility labels em todos componentes interativos
- Garanta touch targets mínimos de 44pt
- Teste dark mode após refatoração

Arquivo: @src/screens/HomeScreen.tsx
Design System: @src/theme/tokens.ts
```

#### ❌ Genérico (Ruim)

```
Crie um componente de botão
```

#### ✅ Específico (Bom)

```
Crie um componente Button.tsx em src/components/primitives/ com as seguintes características:

Requisitos:
- TypeScript strict mode, zero any
- Use apenas primitives (Box, Text) de src/components/primitives/
- Suporte 3 variants: primary, secondary, outline
- Touch target mínimo 44pt (WCAG AAA)
- Suporte dark mode via useThemeColors()
- Accessibility labels obrigatórios
- Memoizado com memo() para performance

Arquivos de referência:
- @src/components/primitives/Box.tsx
- @src/theme/tokens.ts
```

### Usando Restrições Positivas

#### ❌ Negativo (Ruim)

```
Não use bullet points na resposta.
```

#### ✅ Positivo (Bom)

```
Escreva sua resposta em parágrafos curtos, como uma conversa natural.
```

#### ❌ Negativo (Ruim)

```
Não use cores hardcoded.
```

#### ✅ Positivo (Bom)

```
Use apenas useThemeColors() para cores, importando de @src/theme/tokens.ts
```

---

## 4. Investigar Erros da IA

### Estrutura Sistemática

```
A IA deu uma resposta inesperada ou inútil. Vamos investigar sistematicamente:

1. CONTEXTO ERA SUFICIENTE?
   - Ela tinha o CONTEXTO.md?
   - Eu forneci todos os documentos relevantes?
   - Arquivos específicos foram referenciados com @?

2. PEDIDO FOI ESPECÍFICO?
   - Meu prompt foi vago ou aberto a interpretações?
   - Incluí restrições positivas?
   - Dei exemplos concretos?

3. MEMÓRIA DE CURTO PRAZO ESGOTOU?
   - A conversa está muito longa?
   - Muitas mudanças de contexto?

SOLUÇÃO:
- Iniciar novo chat
- Fornecer CONTEXTO.md e plano
- Reformular pedido de forma mais específica
```

### Exemplo Prático

```
A IA sugeriu usar cores hardcoded (#FFFFFF) quando pedi para refatorar HomeScreen.

Vamos investigar:

1. CONTEXTO ERA SUFICIENTE?
   - ✅ Ela tinha CONTEXTO.md (forneci no início)
   - ✅ Referenciei @src/theme/tokens.ts
   - ❌ Não referenciei @src/screens/HomeScreen.tsx diretamente

2. PEDIDO FOI ESPECÍFICO?
   - ❌ Pedi apenas "refatore HomeScreen"
   - ❌ Não especifiquei "use design tokens"
   - ❌ Não dei restrições positivas

3. MEMÓRIA DE CURTO PRAZO ESGOTOU?
   - ✅ Conversa tinha 50+ mensagens
   - ✅ Muitas mudanças de contexto

SOLUÇÃO:
- Iniciar novo chat
- Fornecer CONTEXTO.md e plano de refatoração
- Reformular: "Refatore @src/screens/HomeScreen.tsx substituindo TODAS as cores hardcoded por useThemeColors() de @src/theme/tokens.ts. Mantenha mesma funcionalidade."
```

---

## 5. Gerar Diagramas Mermaid

### Prompt Básico

```
Excelente plano. Agora, descreva este [processo/fluxo/arquitetura] no formato Mermaid.js para que eu possa visualizá-lo.

Tipo de diagrama: [flowchart/sequence diagram/gantt chart/etc]
```

### Exemplos

#### Flowchart

```
Excelente plano de refatoração. Agora, descreva este fluxo de trabalho no formato Mermaid.js flowchart.

Mostre:
- Fase 1: Preparação → Fase 2: Planejamento → Fase 3: Execução → Fase 4: Verificação
- Ciclo de volta para Planejamento se não completo
- Estados finais (Concluído)
```

#### Sequence Diagram

```
Descreva a interação entre HomeScreen, useThemeColors(), e Tokens no formato Mermaid.js sequence diagram.

Mostre:
- HomeScreen chama useThemeColors()
- useThemeColors() retorna cores do tema atual
- HomeScreen usa Tokens.spacing para espaçamentos
```

#### Gantt Chart

```
Crie um diagrama Gantt no formato Mermaid.js para este plano de 4 fases.

Mostre:
- Duração de cada fase
- Dependências entre fases
- Timeline total
```

### Como Visualizar

1. Copie o código Mermaid gerado
2. Cole em [Mermaid.live](https://mermaid.live)
3. Visualize e ajuste se necessário
4. Exporte como PNG/SVG se quiser

---

## 6. Refatoração Específica

### Template

```
Refatore [ARQUIVO] para [OBJETIVO].

Requisitos:
- [Requisito 1 específico]
- [Requisito 2 específico]
- [Requisito 3 específico]

Restrições:
- [Restrição positiva 1]
- [Restrição positiva 2]

Arquivos de referência:
- @arquivo1.tsx
- @arquivo2.ts

Validação:
- [Como validar que está correto]
```

### Exemplo

```
Refatore @src/screens/HomeScreen.tsx para usar design tokens.

Requisitos:
- Substitua TODAS as cores hardcoded por useThemeColors()
- Substitua TODOS os espaçamentos hardcoded por Tokens.spacing
- Adicione accessibility labels em todos componentes interativos
- Garanta touch targets mínimos de 44pt
- Mantenha mesma funcionalidade (apenas style updates)

Restrições:
- Use apenas @src/theme/tokens.ts (NUNCA @src/design-system/)
- Use useThemeColors() para cores theme-aware
- Use Tokens.spacing['X'] para espaçamentos

Arquivos de referência:
- @src/components/primitives/Button.tsx (exemplo correto)
- @src/theme/tokens.ts

Validação:
- npm run validate:design deve retornar 0 violations
- npm run type-check deve retornar 0 errors
- Testar dark mode toggle
```

---

## 7. Criar Componente Novo

### Template

```
Crie [COMPONENTE] em [LOCALIZAÇÃO] com as seguintes características:

Requisitos:
- TypeScript strict mode, zero any
- Use apenas primitives de [PASTA]
- Suporte [VARIANTS] variants
- [REQUISITOS ESPECÍFICOS]

Arquivos de referência:
- @arquivo1.tsx
- @arquivo2.ts

Validação:
- [Como validar]
```

### Exemplo

```
Crie MaternalCard.tsx em src/components/organisms/ com 6 variants.

Requisitos:
- TypeScript strict mode, zero any
- Use apenas primitives (Box, Text, Button) de src/components/primitives/
- Suporte 6 variants: hero, insight, action, progress, content, emotional
- Touch target mínimo 44pt (WCAG AAA)
- Suporte dark mode via useThemeColors()
- Accessibility labels obrigatórios
- Memoizado com memo() para performance

Arquivos de referência:
- @src/components/primitives/Box.tsx
- @src/components/primitives/Card.tsx
- @src/theme/tokens.ts

Validação:
- npm run type-check → 0 errors
- npm run validate:design → 0 violations
- Testar todos os 6 variants
```

---

## 8. Debugging com Contexto

### Template

```
[ARQUIVO] está com erro ao [AÇÃO].

Erro: [COPIAR ERRO COMPLETO]
Arquivo: @caminho/arquivo.tsx
Linha: [LINHA]

Contexto:
- [O que estava tentando fazer]
- [O que mudou recentemente]

Investigue:
1. O contexto era suficiente? (IA tinha CONTEXTO.md?)
2. O pedido foi específico?
3. A memória esgotou?

Solução esperada:
- [O que deveria acontecer]
```

### Exemplo

```
HomeScreen.tsx está com erro ao renderizar MaternalCard.

Erro: TypeError: Cannot read property 'colors' of undefined
Arquivo: @src/screens/HomeScreen.tsx
Linha: 45

Contexto:
- Acabei de refatorar HomeScreen para usar design tokens
- MaternalCard foi criado recentemente
- Erro acontece apenas em dark mode

Investigue:
1. O contexto era suficiente? (IA tinha CONTEXTO.md?)
2. O pedido foi específico?
3. A memória esgotou?

Solução esperada:
- useThemeColors() deve retornar cores do tema atual
- MaternalCard deve funcionar em light e dark mode
```

---

## Dicas de Uso

### 1. Sempre inclua CONTEXTO.md

No início de conversas importantes:

```
Leia @CONTEXTO.md e use como base para todas as respostas.
```

### 2. Seja específico

❌ "Melhore este código"
✅ "Refatore esta função para usar design tokens, mantendo mesma funcionalidade"

### 3. Use restrições positivas

❌ "Não use cores hardcoded"
✅ "Use apenas useThemeColors() para cores"

### 4. Referencie arquivos específicos

❌ "O arquivo de tema"
✅ "@src/theme/tokens.ts"

### 5. Inclua validação

Sempre termine com:

```
Validação:
- npm run type-check → 0 errors
- npm run validate:design → 0 violations
```

---

## Próximos Passos

1. **Experimente os templates** com tarefas reais
2. **Adapte conforme necessário** para seu estilo
3. **Crie seus próprios templates** para tarefas recorrentes
4. **Compartilhe templates úteis** com a equipe

---

**Referências:**

- `CONTEXTO.md` - Cérebro Externo
- `template-plano.md` - Template para planos
- `fluxo-trabalho.md` - Fluxo completo
- `guia-uso.md` - Guia completo

---

**Última atualização:** Janeiro 2025
