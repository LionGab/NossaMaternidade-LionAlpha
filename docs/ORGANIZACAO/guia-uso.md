# Guia Prático de Uso - Sistema de Organização Estruturado

> **Como usar o sistema completo de organização para desenvolvimento**
>
> **Para:** Desenvolvedores e IA trabalhando no projeto Nossa Maternidade

---

## Visão Geral

Este sistema transforma tarefas complexas em processos claros e gerenciáveis. É baseado em "Silêncio Estruturado: IA e Organização" e adaptado para desenvolvimento de software.

### Componentes do Sistema

1. **CONTEXTO.md** - Cérebro Externo (memória permanente)
2. **template-plano.md** - Template para criar planos de fases
3. **fluxo-trabalho.md** - Fluxo completo de 4 fases
4. **templates-prompts.md** - Prompts prontos para usar
5. **guia-uso.md** - Este documento

---

## Quando Usar Cada Componente

### CONTEXTO.md (Cérebro Externo)

**Use quando:**

- Iniciar nova conversa importante com IA
- Trabalhar em tarefa que requer contexto do projeto
- IA parece ter esquecido informações importantes
- Começar trabalho em nova área do projeto

**Como usar:**

```
Leia @CONTEXTO.md e use como base para todas as respostas.
```

### template-plano.md

**Use quando:**

- Tarefa é complexa e precisa ser quebrada em partes
- Não sabe por onde começar
- Tarefa tem múltiplas dependências
- Precisa de estrutura clara para progresso

**Como usar:**

1. Copie o template
2. Preencha com informações da sua tarefa
3. Peça à IA para criar plano usando o template
4. Salve em `docs/ORGANIZACAO/planos/`

### fluxo-trabalho.md

**Use quando:**

- Seguir processo estruturado para qualquer tarefa
- Precisar de guia passo a passo
- Quiser garantir que nada foi esquecido
- Trabalhar em tarefa complexa

**Como usar:**

1. Leia o fluxo completo
2. Siga as 4 fases em ordem
3. Adapte conforme necessário
4. Volte para Fase 2 se precisar ajustar plano

### templates-prompts.md

**Use quando:**

- Precisa de prompt específico para IA
- Quer garantir que pedido é claro e específico
- IA deu resposta genérica ("gradiente roxo")
- Precisa investigar erro da IA

**Como usar:**

1. Encontre template relevante
2. Copie e adapte para sua situação
3. Substitua [placeholders]
4. Use com IA

---

## Exemplos Práticos

### Exemplo 1: Refatorar Tela para Design Tokens

**Situação:** HomeScreen.tsx usa cores hardcoded, precisa migrar para design tokens.

**Passo 1: Preparação**

- ✅ Revisar CONTEXTO.md (já existe)
- ✅ Abrir HomeScreen.tsx
- ✅ Verificar tokens.ts

**Passo 2: Planejamento**

```
Crie um plano em 3 fases para refatorar HomeScreen.tsx usando design tokens.

Contexto:
- HomeScreen.tsx usa cores hardcoded (#FFFFFF, rgba(...))
- Preciso migrar para useThemeColors() e Tokens.spacing
- Deve manter mesma funcionalidade
- Deve suportar dark mode

Use o formato do template em docs/ORGANIZACAO/template-plano.md
```

**Passo 3: Execução**

- Fase 1: Substituir cores hardcoded
- Fase 2: Substituir espaçamentos
- Fase 3: Adicionar accessibility labels

**Passo 4: Verificação**

- `npm run validate:design` → 0 violations
- Testar dark mode
- Commit

### Exemplo 2: Criar Novo Componente

**Situação:** Precisa criar MaternalCard com 6 variants.

**Passo 1: Preparação**

- ✅ Revisar CONTEXTO.md
- ✅ Verificar componentes primitivos existentes
- ✅ Verificar tokens.ts

**Passo 2: Planejamento**

```
Crie um plano em 4 fases para criar MaternalCard.tsx.

Contexto:
- Componente em src/components/organisms/
- 6 variants: hero, insight, action, progress, content, emotional
- TypeScript strict, zero any
- WCAG AAA compliance

Use o formato do template em docs/ORGANIZACAO/template-plano.md
```

**Passo 3: Execução**

- Fase 1: Criar estrutura base
- Fase 2: Implementar variants
- Fase 3: Adicionar accessibility
- Fase 4: Testes

**Passo 4: Verificação**

- `npm run type-check` → 0 errors
- Testar todos variants
- Commit

### Exemplo 3: Quando Sobrecarregado

**Situação:** Não sabe por onde começar com refatoração grande.

**Solução: Entrevista Estruturada**

```
Estou tentando organizar a refatoração do sistema de design do projeto, mas estou me sentindo sobrecarregado(a).

Faça-me 20 perguntas para me ajudar a esclarecer:
- Meus objetivos
- Restrições e limitações
- Recursos disponíveis
- Próximos passos

Depois das minhas respostas, crie um plano de ação detalhado em fases.
```

**Resultado:** IA faz perguntas, você responde, IA cria plano personalizado.

---

## Dicas para Desenvolvedores Neurodivergentes

### 1. Quebre em Partes Menores

**Problema:** Tarefa parece grande e intimidadora.

**Solução:**

- Se uma fase parece grande, quebre em sub-fases
- Cada sub-fase deve ser completável em 25-30 minutos
- Marque progresso após cada sub-fase

**Exemplo:**

- ❌ "Refatorar todo o app"
- ✅ "Refatorar HomeScreen.tsx" → "Refatorar ChatScreen.tsx" → etc.

### 2. Use Estimativas de Tempo e Energia

**Problema:** Não sabe quanto tempo vai levar ou se tem energia.

**Solução:**

- Sempre inclua estimativa de tempo no plano
- Sempre inclua nível de energia necessário
- Planeje conforme seu nível de energia atual

**Exemplo:**

- "Fase 1: Tempo estimado 30min, Nível de energia: Baixo"
- Se está cansado, escolha fases de baixo nível de energia

### 3. Valide Frequentemente

**Problema:** Espera até o final e descobre que está errado.

**Solução:**

- Valide após cada fase ou sub-fase
- Não espere até o final
- Ajuste plano se necessário

**Exemplo:**

- Após Fase 1: `npm run type-check` → Se erro, corrige antes de Fase 2

### 4. Ajuste o Plano Quando Necessário

**Problema:** Plano não está funcionando, mas continua seguindo.

**Solução:**

- Planos não são escritos em pedra
- Se algo não funciona, ajuste
- Volte para Fase 2 (Planejamento) se necessário

**Exemplo:**

- Fase 1 muito difícil? Quebre em 2 sub-fases
- Dependência não está pronta? Ajuste ordem das fases

### 5. Use Prompts Específicos

**Problema:** IA dá resposta genérica e inútil.

**Solução:**

- Use templates de `templates-prompts.md`
- Seja específico: "Refatore X para fazer Y, mantendo Z"
- Inclua restrições positivas

**Exemplo:**

- ❌ "Melhore este código"
- ✅ "Refatore HomeScreen.tsx para usar design tokens, mantendo mesma funcionalidade"

---

## Dicas para Trabalhar com IA

### 1. Sempre Forneça Contexto

**No início de conversas importantes:**

```
Leia @CONTEXTO.md e use como base para todas as respostas.
```

**Por quê?** IA não tem memória de longo prazo. Cada nova conversa é como "novo dia".

### 2. Seja Específico nos Prompts

**❌ Genérico:**

```
Crie um componente de botão
```

**✅ Específico:**

```
Crie Button.tsx em src/components/primitives/ com:
- TypeScript strict, zero any
- 3 variants: primary, secondary, outline
- Touch target 44pt mínimo
- Suporte dark mode
- Accessibility labels obrigatórios

Arquivos de referência:
- @src/components/primitives/Box.tsx
- @src/theme/tokens.ts
```

### 3. Use Restrições Positivas

**❌ Negativo:**

```
Não use cores hardcoded
```

**✅ Positivo:**

```
Use apenas useThemeColors() para cores, importando de @src/theme/tokens.ts
```

### 4. Referencie Arquivos Específicos

**❌ Vago:**

```
O arquivo de tema
```

**✅ Específico:**

```
@src/theme/tokens.ts
```

### 5. Inicie Novo Chat Entre Fases Complexas

**Quando:**

- Conversa está muito longa (50+ mensagens)
- Muitas mudanças de contexto
- IA parece confusa

**Como:**

1. Salve progresso (commit, notas)
2. Inicie novo chat
3. Forneça CONTEXTO.md e plano
4. Diga: "Vamos focar apenas na Fase X"

---

## Troubleshooting

### Problema: IA esqueceu o contexto

**Sintomas:**

- IA sugere coisas que já foram feitas
- IA não lembra de decisões anteriores
- Respostas não fazem sentido no contexto

**Solução:**

1. Inicie novo chat
2. Forneça CONTEXTO.md no início
3. Referencie plano se tiver
4. Diga: "Leia @CONTEXTO.md e use como base"

### Problema: IA deu resposta genérica ("gradiente roxo")

**Sintomas:**

- Resposta é vaga e não ajuda
- Sugestões são genéricas
- Não atende requisitos específicos

**Solução:**

1. Seja mais específico no prompt
2. Use templates de `templates-prompts.md`
3. Adicione restrições positivas
4. Dê exemplos concretos

**Exemplo:**

- ❌ "Melhore este código"
- ✅ "Refatore esta função para usar design tokens, mantendo mesma funcionalidade. Arquivo: @src/screens/HomeScreen.tsx"

### Problema: Plano não está funcionando

**Sintomas:**

- Fases são muito difíceis
- Dependências não estão prontas
- Progresso está travado

**Solução:**

1. Volte para Fase 2 (Planejamento)
2. Ajuste o plano
3. Quebre fases grandes em sub-fases
4. Reordene fases se necessário

### Problema: Sobrecarregado, não sei por onde começar

**Sintomas:**

- Tarefa parece uma névoa
- Não sabe o primeiro passo
- Ansiedade ao pensar na tarefa

**Solução:**

1. Use prompt de entrevista estruturada
2. Deixe IA fazer perguntas
3. Responda honestamente
4. IA criará plano personalizado

**Prompt:**

```
Estou tentando organizar [situação], mas estou me sentindo sobrecarregado(a).

Faça-me 20 perguntas para me ajudar a esclarecer meus objetivos, restrições e próximos passos.

Depois das minhas respostas, crie um plano de ação detalhado em fases.
```

### Problema: Erro da IA, não sei o que fazer

**Sintomas:**

- IA deu resposta completamente errada
- Código não funciona
- Frustração

**Solução:**

1. Use prompt de investigação sistemática
2. Pergunte: Contexto suficiente? Pedido específico? Memória esgotou?
3. Ajuste e tente novamente

**Prompt:**

```
A IA deu uma resposta inesperada. Vamos investigar:

1. CONTEXTO ERA SUFICIENTE?
   - Ela tinha CONTEXTO.md?
   - Arquivos foram referenciados?

2. PEDIDO FOI ESPECÍFICO?
   - Prompt foi vago?
   - Incluí restrições?

3. MEMÓRIA ESGOTOU?
   - Conversa muito longa?

SOLUÇÃO: [descreva o que fazer]
```

---

## Checklist de Uso

### Antes de Começar Tarefa Complexa

- [ ] Li CONTEXTO.md (ou revisar se já existe)
- [ ] Entendi o objetivo da tarefa
- [ ] Tenho todas as informações necessárias
- [ ] Ambiente de trabalho está pronto

### Durante Execução

- [ ] Seguindo plano de fases (se tiver)
- [ ] Focando em uma fase por vez
- [ ] Validando após cada fase
- [ ] Usando prompts específicos
- [ ] Referenciando arquivos com @

### Ao Completar

- [ ] Validei com `npm run type-check`
- [ ] Validei com `npm run lint`
- [ ] Validei com `npm run validate:design` (se aplicável)
- [ ] Testei funcionalidade
- [ ] Commit com mensagem apropriada
- [ ] Atualizei documentação se necessário

---

## Próximos Passos

1. **Experimente o sistema** com uma tarefa pequena
2. **Adapte conforme necessário** para seu estilo
3. **Crie seus próprios templates** para tarefas recorrentes
4. **Compartilhe aprendizados** com a equipe

---

## Referências

- **CONTEXTO.md** - Cérebro Externo completo
- **template-plano.md** - Template para planos
- **fluxo-trabalho.md** - Fluxo completo de 4 fases
- **templates-prompts.md** - Prompts prontos

---

**Última atualização:** Janeiro 2025
