# Personalização do Resumo de Compactação - Nossa Maternidade

> Guia completo para gerenciamento de contexto e compactação em tarefas longas

---

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Personalização do Resumo](#personalização-do-resumo)
3. [Gerenciamento de Estado](#gerenciamento-de-estado)
4. [Fluxo de Trabalho](#fluxo-de-trabalho)
5. [Exemplos Práticos](#exemplos-práticos)

---

## Visão Geral

Quando trabalhamos em tarefas longas que exigem múltiplas sessões ou quando o contexto excede 80k-100k tokens, precisamos:

1. **Compactar contexto** preservando informações críticas
2. **Rastrear estado** entre sessões
3. **Manter progresso** de forma estruturada

Este sistema combina:

- **Compactação automática** com prompts personalizados
- **Arquivos de estado estruturados** (JSON) para dados
- **Notas de progresso** (texto) para contexto geral
- **Git** para rastreamento de mudanças

---

## Personalização do Resumo

### 1. Instruções Permanentes no CLAUDE.md

O arquivo `CLAUDE.md` contém instruções permanentes que o Claude Code seguirá ao usar `/compact`:

**Foco do Resumo:**

- Código: Mudanças de código, arquivos modificados, novas funções
- Testes: Output de testes, cobertura, testes quebrados
- Decisões: Decisões arquiteturais, trade-offs, restrições técnicas
- Estado: Progresso atual, bloqueadores, próximos passos
- Contexto de Domínio: Preferências do usuário, padrões do projeto, regras críticas

**Estrutura Padrão:**

```
<summary>
## Task Overview
[Solicitação principal, critérios de sucesso, restrições]

## Current State
[O que foi completado, arquivos modificados, artefatos produzidos]

## Important Discoveries
[Restrições técnicas, decisões tomadas, erros resolvidos, abordagens que falharam]

## Next Steps
[Ações específicas necessárias, bloqueadores, ordem de prioridade]

## Context to Preserve
[Preferências do usuário, detalhes específicos do domínio, compromissos assumidos]
</summary>
```

### 2. Comando Direto com `/compact`

Você pode fornecer instruções específicas ao usar o comando:

```
/compact Focus on code samples and API usage
/compact Preserve test output and error messages
/compact Emphasize architectural decisions and trade-offs
```

### 3. Configuração via SDK (Futuro)

Para integração programática (quando disponível):

```python
compaction_control = {
    "enabled": True,
    "context_token_threshold": 100000,
    "summary_prompt": """Summarize the research conducted so far, including:
- Sources consulted and key findings
- Questions answered and remaining unknowns
- Recommended next steps

Wrap your summary in <summary></summary> tags."""
}
```

---

## Gerenciamento de Estado

### Estrutura de Arquivos

```
.claude/state/
├── README.md           # Documentação completa
├── tests.json          # Estado de testes (estruturado)
├── tasks.json          # Estado de tarefas (estruturado)
├── progress.txt        # Notas de progresso (texto livre)
└── session-notes/      # Notas por sessão (opcional)
    ├── 2025-12-05-session-1.txt
    └── 2025-12-05-session-2.txt
```

### Arquivos Estruturados (JSON)

Use JSON para dados que precisam ser consultados programaticamente:

#### `tests.json`

Estado de testes, cobertura, resultados:

```json
{
  "lastUpdated": "2025-12-05T15:30:00Z",
  "coverage": {
    "total": 200,
    "passing": 150,
    "failing": 25,
    "notStarted": 25,
    "percentage": 75.0
  },
  "tests": [
    {
      "id": 1,
      "name": "authentication_flow",
      "status": "passing",
      "file": "__tests__/services/authService.test.ts"
    }
  ]
}
```

#### `tasks.json`

Estado de tarefas, progresso, bloqueadores:

```json
{
  "lastUpdated": "2025-12-05T15:30:00Z",
  "tasks": [
    {
      "id": "task-1",
      "title": "Aumentar Test Coverage",
      "status": "in_progress",
      "priority": "high",
      "progress": 40,
      "estimatedTime": "4-6 hours",
      "energyLevel": "medium"
    }
  ]
}
```

### Arquivos de Texto Livre

Use texto não estruturado para notas gerais e contexto:

#### `progress.txt`

```text
# Progresso - Sessão 3 (2025-12-05)

## O que foi feito
- Fixed authentication token validation
- Updated user model to handle edge cases

## Próximos passos
- Investigate user_management test failures
- Fix type error in userDataService
```

---

## Fluxo de Trabalho

### 1. Iniciar Nova Sessão

```bash
# Criar arquivo de notas da sessão
echo "# Sessão $(date +%Y-%m-%d)" > .claude/state/session-notes/$(date +%Y-%m-%d)-session-1.txt
```

### 2. Atualizar Estado Durante Trabalho

- **Testes:** Atualizar `tests.json` quando testes passam/falham
- **Tarefas:** Atualizar `tasks.json` quando progresso é feito
- **Notas:** Adicionar notas em `progress.txt` ou arquivo de sessão

### 3. Antes de Compactar Contexto

- Revisar `progress.txt` para contexto geral
- Revisar `tests.json` para estado de testes
- Revisar `tasks.json` para próximos passos
- Usar `/compact` com foco específico se necessário

### 4. Após Compactação

- Verificar se resumo preservou informações críticas
- Atualizar arquivos de estado se necessário
- Continuar trabalho com contexto preservado

---

## Exemplos Práticos

### Exemplo 1: Rastrear Progresso de Testes

```bash
# Rodar testes
npm test > test-output.txt

# Analisar output e atualizar tests.json
# Exemplo de atualização:
{
  "tests": [
    {
      "id": 2,
      "name": "user_management",
      "status": "passing",  # Atualizado de "failing"
      "notes": "Fixed null check issue"
    }
  ]
}
```

### Exemplo 2: Rastrear Tarefas

```json
// tasks.json - Atualizar progresso
{
  "tasks": [
    {
      "id": "task-1",
      "title": "Aumentar Test Coverage",
      "status": "in_progress",
      "progress": 60,  # Atualizado de 40
      "nextSteps": [
        "Adicionar testes para agents IA",  # Próximo passo
        "Testar componentes principais"
      ]
    }
  ]
}
```

### Exemplo 3: Notas de Sessão

```text
# 2025-12-05-session-1.txt

## Objetivo
Fix user_management test failure

## Descobertas
- Error: TypeError: Cannot read property 'id' of undefined
- Location: userDataService.ts:45
- Root cause: Missing null check before accessing user.id

## Solução
Added null check: if (!user) return { data: null, error: new Error('User not found') }

## Próximo
- Verify test passes
- Check for similar issues in other services
```

### Exemplo 4: Compactação com Foco Específico

```
/compact Focus on test output and code changes

# O Claude Code criará resumo focando em:
- Testes que passaram/falharam
- Mudanças de código feitas
- Erros encontrados e resolvidos
```

---

## 💡 Dicas e Melhores Práticas

### 1. Commit Frequente

Use git para marcar progresso:

```bash
git commit -m "feat: progress on test coverage (40% complete)"
```

### 2. Tags para Marcos

Use tags para marcos importantes:

```bash
git tag -a v0.1.0-test-coverage-40 -m "Test coverage reached 40%"
```

### 3. Branches para Experimentos

Use branches para experimentos:

```bash
git checkout -b experiment/new-testing-approach
```

### 4. Atualizar Regularmente

Mantenha arquivos de estado atualizados:

- Após cada tarefa completa
- Antes de compactar contexto
- Ao encontrar bloqueadores

### 5. Preservar Contexto Crítico

Sempre preserve:

- Preferências do usuário
- Decisões arquiteturais importantes
- Bloqueadores e próximos passos
- Padrões do projeto

---

## 🔄 Integração com Git

Git fornece um log do que foi feito e checkpoints que podem ser restaurados:

- **Commits frequentes:** Marcar progresso
- **Branches:** Experimentos e features
- **Tags:** Marcos importantes
- **Claude 4.5+:** Desempenho especialmente bom usando git para rastrear estado

---

## 📚 Referências

- **CLAUDE.md:** Instruções permanentes de compactação
- **`.claude/state/README.md`:** Documentação completa de gerenciamento de estado
- **CONTEXTO.md:** Estado atual do projeto e próximos passos
- **MEMORY.md:** Memória persistente entre sessões

---

**Última atualização:** 5 de dezembro de 2025  
**Mantido por:** Equipe Nossa Maternidade + Claude Code
