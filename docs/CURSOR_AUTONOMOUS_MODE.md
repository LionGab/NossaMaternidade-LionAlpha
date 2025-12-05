# 🤖 Modo Autônomo 2h - Cursor IDE

> Guia completo para configurar e usar o modo autônomo de 2 horas no Cursor

---

## ⚡ Modo Turbo - Início Rápido (2 minutos)

### ✅ Checklist Rápido

- [ ] Cursor versão 0.40+ (`Help` > `About Cursor`)
- [ ] API Key configurada (`Settings` > `AI Models`)
- [ ] Plano Max ativo ([claude.ai/settings](https://claude.ai/settings))
- [ ] Arquivos de estado prontos (`.claude/state/`)

### 🚀 Como Iniciar (3 Passos)

1. **Abra o Chat:** `Ctrl+L` (ou `Cmd+L` no Mac)

2. **Copie um prompt pronto:**
   - Ver `.claude/autonomous-prompts.md` para prompts completos
   - Ou use o template abaixo

3. **Cole e envie:**

```
@CLAUDE.md
@CONTEXTO.md
@.claude/state/tasks.json
@.claude/state/progress.txt

Iniciar modo autônomo por 2h para:
- [SUA TAREFA AQUI]
- Seguir padrões em CLAUDE.md
- Atualizar tasks.json e progress.txt a cada checkpoint (5 min)
- Rodar type-check e lint após mudanças significativas
- Parar se houver 3 erros consecutivos ou 15 min sem progresso
```

### 📊 Monitoramento Durante Execução

```bash
# Ver progresso
cat .claude/state/progress.txt

# Ver tarefas
cat .claude/state/tasks.json

# Ver mudanças
git status
git diff
```

### ✅ Validação Após Execução

```bash
# Revisar mudanças
git diff --stat

# Validar tudo
npm run validate

# Testar
npm test
npm start
```

---

## 📋 Índice Completo

1. [Modo Turbo - Início Rápido](#-modo-turbo---início-rápido-2-minutos)
2. [O que é o Modo Autônomo?](#o-que-é-o-modo-autônomo)
3. [Pré-requisitos](#pré-requisitos)
4. [Configuração Passo a Passo](#configuração-passo-a-passo)
5. [Como Usar](#como-usar)
6. [Prompts Prontos](#prompts-prontos)
7. [Melhores Práticas](#melhores-práticas)
8. [Troubleshooting](#troubleshooting)

---

## O que é o Modo Autônomo?

O **Modo Autônomo** (também chamado de **Agent Mode** ou **Autonomous Mode**) permite que o Claude Code trabalhe de forma contínua por até **2 horas**, executando tarefas complexas sem intervenção manual constante.

### Características

- ✅ **Trabalho contínuo:** Executa múltiplas tarefas em sequência
- ✅ **Auto-decisão:** Toma decisões sobre próximos passos
- ✅ **Auto-correção:** Corrige erros encontrados
- ✅ **Progresso rastreado:** Mantém estado entre ações
- ✅ **Limite de tempo:** 2 horas (configurável)

### Quando Usar

- ✅ Refatorações grandes (múltiplos arquivos)
- ✅ Implementação de features complexas
- ✅ Correção de bugs em cascata
- ✅ Migrações de código
- ✅ Testes e validações extensas

### Quando NÃO Usar

- ❌ Tarefas simples (use Chat normal)
- ❌ Edições pontuais (use Inline Edit)
- ❌ Experimentos rápidos (use Composer)

---

## Pré-requisitos

### 1. Cursor Versão Compatível

- ✅ Cursor versão **0.40+** (verificar: `Help` > `About Cursor`)
- ✅ Atualizar se necessário: `Help` > `Check for Updates`

### 2. Plano Max do Claude Ativo

- ✅ Plano Max 5x ou 20x ativo
- ✅ Verificar em: [claude.ai/settings](https://claude.ai/settings)

### 3. API Key Configurada

- ✅ Claude API Key configurada no Cursor
- ✅ Verificar em: `Settings` > `AI Models` > `Claude API Key`

### 4. Configurações do Projeto

- ✅ `.cursor/settings.json` configurado
- ✅ `.cursor/rules` configurado
- ✅ Codebase Indexing ativo

---

## Configuração Passo a Passo

### Passo 1: Atualizar `.cursor/settings.json`

Adicione as configurações de modo autônomo:

```json
{
  "// Configurações de modo autônomo": "",
  "cursor.ai.autonomousMode": {
    "enabled": true,
    "maxDuration": 7200,
    "autoSave": true,
    "checkpointInterval": 300,
    "maxIterations": 100,
    "errorRetryLimit": 3,
    "progressTracking": true
  },

  "// Configurações de contexto para modo autônomo": "",
  "cursor.ai.autonomousContext": {
    "includeTests": true,
    "includeDocumentation": true,
    "includeGitHistory": false,
    "maxFiles": 50,
    "priorityFiles": ["src/theme/tokens.ts", "CLAUDE.md", "CONTEXTO.md", ".cursor/rules"]
  }
}
```

**Explicação das Configurações:**

| Configuração         | Valor  | Descrição                               |
| -------------------- | ------ | --------------------------------------- |
| `enabled`            | `true` | Ativa modo autônomo                     |
| `maxDuration`        | `7200` | Duração máxima em segundos (2h = 7200s) |
| `autoSave`           | `true` | Salva automaticamente após cada mudança |
| `checkpointInterval` | `300`  | Cria checkpoint a cada 5 minutos        |
| `maxIterations`      | `100`  | Máximo de iterações/acoes               |
| `errorRetryLimit`    | `3`    | Tentativas de retry em caso de erro     |
| `progressTracking`   | `true` | Rastreia progresso em `.claude/state/`  |

### Passo 2: Configurar Regras no `.cursor/rules`

Adicione instruções específicas para modo autônomo:

```markdown
## Modo Autônomo - Instruções Especiais

Quando em modo autônomo, siga estas regras:

1. **Checkpoints Frequentes:**
   - Criar checkpoint a cada 5 minutos
   - Salvar estado em `.claude/state/tasks.json`
   - Atualizar `progress.txt` após cada etapa

2. **Validação Contínua:**
   - Rodar `npm run type-check` após cada mudança significativa
   - Rodar `npm run lint` antes de prosseguir
   - Testar funcionalidade após cada feature completa

3. **Comunicação:**
   - Reportar progresso a cada 10 minutos
   - Alertar sobre bloqueadores imediatamente
   - Documentar decisões importantes

4. **Limites:**
   - Parar se encontrar mais de 3 erros consecutivos
   - Parar se progresso estagnar por 15 minutos
   - Parar se exceder 2 horas de trabalho
```

### Passo 3: Preparar Arquivos de Estado

Certifique-se de que os arquivos de estado estão prontos:

```bash
# Verificar estrutura
ls -la .claude/state/

# Deve conter:
# - README.md
# - tests.json
# - tasks.json
# - progress.txt
```

### Passo 4: Verificar Configuração

Execute o script de verificação:

```bash
npm run verify:cursor
```

---

## Prompts Prontos

Para facilitar o uso, criamos prompts prontos que você pode copiar e colar diretamente:

📁 **Arquivo:** `.claude/autonomous-prompts.md`

### Prompts Disponíveis:

1. **Test Coverage** - Aumentar de 1.4% para 40%+
2. **ESLint Warnings** - Reduzir de 272 para <50
3. **Design Tokens** - Migrar componentes para tokens
4. **WCAG AAA** - Compliance 100%
5. **Dark Mode** - Coverage 100%
6. **Template Customizado** - Para suas próprias tarefas

**Como usar:**

1. Abra `.claude/autonomous-prompts.md`
2. Copie o prompt completo da tarefa desejada
3. Cole no Chat do Cursor (`Ctrl+L`)
4. Envie e monitore o progresso

---

## Como Usar

### Método 1: Via Chat (Recomendado)

1. **Abra o Chat:**
   - `Ctrl+L` (Windows/Linux)
   - `Cmd+L` (Mac)

2. **Inicie o Modo Autônomo:**

   ```
   @CLAUDE.md
   @CONTEXTO.md
   @.claude/state/tasks.json

   Iniciar modo autônomo por 2 horas para:
   - Aumentar test coverage de 1.4% para 40%+
   - Focar em services críticos primeiro
   - Seguir padrões em CLAUDE.md
   - Atualizar .claude/state/tasks.json com progresso
   - Criar checkpoints a cada 5 minutos
   ```

3. **O Claude iniciará o modo autônomo:**
   - Confirmará início
   - Estabelecerá plano de ação
   - Começará execução

### Método 2: Via Composer

1. **Abra o Composer:**
   - `Ctrl+Shift+I` (Windows/Linux)
   - `Cmd+Shift+I` (Mac)

2. **Configure a tarefa:**

   ```
   Modo autônomo: Implementar testes para services críticos

   Objetivo: Aumentar test coverage de 1.4% para 40%+

   Prioridade:
   1. src/services/authService.ts
   2. src/services/chatService.ts
   3. src/services/profileService.ts

   Regras:
   - Seguir padrões em CLAUDE.md
   - Atualizar .claude/state/tasks.json
   - Validar com npm run type-check após cada service
   - Duração máxima: 2 horas
   ```

### Método 3: Via Comando Direto

Se disponível, use o comando:

```
/autonomous 2h
```

Ou com instruções específicas:

```
/autonomous 2h Focus on test coverage, update state files, create checkpoints every 5min
```

---

## Melhores Práticas

### 1. Preparação Antes de Iniciar

- ✅ **Definir objetivo claro:** O que você quer alcançar?
- ✅ **Priorizar tarefas:** Lista ordenada de prioridades
- ✅ **Verificar estado:** Revisar `.claude/state/tasks.json`
- ✅ **Backup:** Commit atual do código
- ✅ **Limpar contexto:** Fechar outras conversas

### 2. Durante a Execução

- ✅ **Monitorar progresso:** Verificar `.claude/state/progress.txt`
- ✅ **Revisar checkpoints:** Verificar mudanças a cada 5 minutos
- ✅ **Validar continuamente:** Rodar testes após cada feature
- ✅ **Documentar decisões:** Adicionar notas em `progress.txt`

### 3. Após Conclusão

- ✅ **Revisar mudanças:** `git diff` para ver todas as alterações
- ✅ **Validar tudo:** `npm run validate`
- ✅ **Testar funcionalidade:** Rodar app e testar features
- ✅ **Atualizar estado:** Finalizar `.claude/state/tasks.json`
- ✅ **Commit:** Fazer commit com mensagem descritiva

### 4. Estrutura de Tarefas

**Formato recomendado para tarefas autônomas:**

```markdown
## Tarefa: [Nome da Tarefa]

### Objetivo

[O que você quer alcançar]

### Prioridades

1. [Tarefa 1]
2. [Tarefa 2]
3. [Tarefa 3]

### Critérios de Sucesso

- [ ] Critério 1
- [ ] Critério 2
- [ ] Critério 3

### Restrições

- Não fazer X
- Manter Y
- Seguir padrão Z

### Validação

- Rodar `npm run type-check` após cada mudança
- Rodar `npm test` após cada feature
- Validar com `npm run validate` no final
```

---

## Troubleshooting

### Problema: Modo Autônomo não inicia

**Soluções:**

1. Verificar versão do Cursor (precisa ser 0.40+)
2. Verificar API Key configurada
3. Verificar Plano Max ativo
4. Reiniciar Cursor
5. Verificar `.cursor/settings.json` está correto

### Problema: Para antes de 2 horas

**Possíveis causas:**

- Erros consecutivos (limite de retry atingido)
- Progresso estagnado (sem mudanças por 15 min)
- Limite de iterações atingido
- Erro crítico não recuperável

**Soluções:**

1. Verificar logs em `.claude/state/progress.txt`
2. Corrigir erros manualmente
3. Reiniciar modo autônomo com contexto atualizado
4. Ajustar `errorRetryLimit` se necessário

### Problema: Muitas mudanças de uma vez

**Soluções:**

1. Reduzir `maxIterations` em `settings.json`
2. Aumentar `checkpointInterval` para mais frequente
3. Dividir tarefa em partes menores
4. Usar modo autônomo em sessões menores (30min-1h)

### Problema: Não segue regras do projeto

**Soluções:**

1. Verificar `.cursor/rules` está atualizado
2. Referenciar `@CLAUDE.md` no início
3. Adicionar instruções específicas no prompt
4. Revisar e corrigir manualmente se necessário

---

## Exemplos Práticos

### Exemplo 1: Aumentar Test Coverage

```
@CLAUDE.md
@.claude/state/tasks.json

Modo autônomo 2h: Aumentar test coverage

Objetivo: 1.4% → 40%+

Prioridades:
1. src/services/authService.ts (testes completos)
2. src/services/chatService.ts (testes principais)
3. src/services/profileService.ts (testes críticos)

Regras:
- Seguir padrões em __tests__/services/
- Usar mocks de Supabase
- Atualizar tasks.json após cada service
- Validar com npm test após cada grupo
```

### Exemplo 2: Migrar Design Tokens

```
@CLAUDE.md
@src/theme/tokens.ts
@docs/design/

Modo autônomo 2h: Migrar componentes para design tokens

Objetivo: Eliminar todas as cores hardcoded

Prioridades:
1. src/screens/HomeScreen.tsx
2. src/screens/ChatScreen.tsx
3. src/components/organisms/*.tsx

Regras:
- Usar apenas useThemeColors()
- Validar com npm run validate:design
- Testar dark mode após cada tela
- Atualizar progress.txt
```

### Exemplo 3: Corrigir ESLint Warnings

```
@CLAUDE.md
@eslint.config.mjs

Modo autônomo 2h: Reduzir ESLint warnings

Objetivo: 272 → <50 warnings

Prioridades:
1. Auto-fix quando possível
2. Corrigir warnings de acessibilidade
3. Remover estilos não usados

Regras:
- Usar npm run lint -- --fix primeiro
- Corrigir manualmente warnings críticos
- Validar com npm run lint após cada grupo
- Documentar warnings aceitáveis
```

---

## Monitoramento

### Durante Execução

1. **Verificar progresso:**

   ```bash
   cat .claude/state/progress.txt
   ```

2. **Verificar tarefas:**

   ```bash
   cat .claude/state/tasks.json
   ```

3. **Verificar mudanças:**
   ```bash
   git status
   git diff
   ```

### Após Execução

1. **Revisar todas as mudanças:**

   ```bash
   git diff --stat
   git diff
   ```

2. **Validar código:**

   ```bash
   npm run validate
   ```

3. **Testar funcionalidade:**
   ```bash
   npm test
   npm start
   ```

---

## Limites e Considerações

### Limites Técnicos

- ⏱️ **Duração máxima:** 2 horas (7200 segundos)
- 🔄 **Iterações máximas:** 100 (configurável)
- 🔁 **Retry máximo:** 3 tentativas por erro
- 📁 **Arquivos máximos:** 50 por contexto

### Considerações de Custo

- 💰 **Tokens:** Modo autônomo usa mais tokens
- 📊 **Monitorar:** Verificar uso em console.anthropic.com
- ⚡ **Otimizar:** Usar para tarefas que justifiquem o custo

### Considerações de Qualidade

- ✅ **Revisar sempre:** Nunca commitar sem revisar
- ✅ **Testar sempre:** Validar funcionalidade após execução
- ✅ **Documentar:** Adicionar notas sobre decisões importantes

---

## Referências

- **CLAUDE.md:** Regras e padrões do projeto
- **CONTEXTO.md:** Estado atual e próximos passos
- **`.claude/state/README.md`:** Gerenciamento de estado
- **docs/CONTEXT_COMPRESSION.md:** Compactação de contexto

---

**Última atualização:** 5 de dezembro de 2025  
**Mantido por:** Equipe Nossa Maternidade + Claude Code
