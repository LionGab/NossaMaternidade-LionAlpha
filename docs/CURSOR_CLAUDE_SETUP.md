# 🚀 Guia Completo: Claude no Cursor com Plano Max

**Data de Atualização:** 29/11/2025  
**Projeto:** Nossa Maternidade  
**Status:** Configuração Otimizada + Melhores Práticas Avançadas

---

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Pré-requisitos](#pré-requisitos)
3. [Configuração Passo a Passo](#configuração-passo-a-passo)
4. [Otimizações de Performance](#otimizações-de-performance)
   - [Configurações de Context Window](#1-configurações-de-context-window)
   - [Codebase Indexing](#2-codebase-indexing)
   - [Exclusões de Arquivos com .cursorignore](#3-exclusões-de-arquivos-com-cursorignore)
   - [Configurações de Editor](#4-configurações-de-editor)
5. [Verificação e Troubleshooting Básico](#verificação-e-troubleshooting-básico)
6. [Melhores Práticas Avançadas](#melhores-práticas-avançadas)
   - [Escolha o Modelo Claude Certo](#1-escolha-o-modelo-claude-certo)
     - [Testes A/B: Você vs Claude](#testes-ab-você-vs-claude)
   - [Gerencie o Contexto de Forma Eficiente](#2-gerencie-o-contexto-de-forma-eficiente)
   - [Configure Rules Específicas para Claude](#3-configure-rules-específicas-para-claude)
   - [Otimize para Custo-Benefício](#4-otimize-para-custo-benefício)
   - [Use o Modo Certo para Cada Situação](#5-use-o-modo-certo-para-cada-situação)
   - [Estruture Prompts para Claude](#6-estruture-prompts-para-claude)
   - [Max Mode: Quando Usar](#7-max-mode-quando-usar)
   - [Workflow Visual: Decisão em 10 Segundos](#8-workflow-visual-decisão-em-10-segundos)
   - [Performance e Velocidade](#9-performance-e-velocidade)
   - [Segurança e Privacy Mode](#10-segurança-e-privacy-mode)
   - [Monitoramento de Uso e Calculadora de Custos](#11-monitoramento-de-uso-e-calculadora-de-custos)
   - [Trabalhando com Este Projeto Específico](#12-trabalhando-com-este-projeto-específico)
7. [Antipadrões Comuns: Erros que Custam Caro](#antipadrões-comuns-erros-que-custam-caro)
8. [Curva de Aprendizado: Semana 1-4](#curva-de-aprendizado-semana-1-4)
9. [Troubleshooting Expandido](#troubleshooting-expandido)
10. [Métricas de Sucesso: Como Saber se Está Usando Bem?](#métricas-de-sucesso-como-saber-se-está-usando-bem)
11. [FAQ](#faq)

---

## 🎯 Visão Geral

Este guia fornece instruções completas para configurar e otimizar o uso do **Claude no Cursor** com o **Plano Max** do Claude, maximizando a produtividade no desenvolvimento do projeto Nossa Maternidade.

### Benefícios da Configuração Otimizada

- ✅ **Contexto Ampliado**: Codebase Indexing ativo para melhor compreensão do projeto
- ✅ **Performance**: Configurações otimizadas para projetos React Native grandes
- ✅ **Economia**: Uso eficiente dos limites do Plano Max
- ✅ **Qualidade**: TypeScript strict + validações automáticas

---

## 📦 Pré-requisitos

### 1. Assinatura do Plano Max do Claude

Você precisa ter uma das opções ativas:

| Plano                          | Preço       | Limite (a cada 5h) | Recomendado Para   |
| ------------------------------ | ----------- | ------------------ | ------------------ |
| **Uso Expandido (5x)**         | US$ 100/mês | ~225 mensagens     | Uso frequente      |
| **Flexibilidade Máxima (20x)** | US$ 200/mês | ~900 mensagens     | Uso intenso diário |

**Como verificar:**

1. Acesse [claude.ai/settings](https://claude.ai/settings)
2. Vá em "Billing" ou "Cobrança"
3. Confirme que está no plano Max

**Como assinar (se ainda não tiver):**

1. Acesse [claude.ai](https://claude.ai)
2. Faça login na sua conta
3. Vá em **Configurações** > **Cobrança**
4. Selecione "Atualizar para Max"
5. Escolha o nível (5x ou 20x)
6. Complete o pagamento

### 2. Cursor Instalado e Atualizado

- ✅ Cursor versão mais recente instalada
- ✅ Verificar atualizações: `Help` > `Check for Updates`

### 3. API Key do Claude

Você precisará da sua API Key do Claude:

1. Acesse [console.anthropic.com](https://console.anthropic.com)
2. Faça login
3. Vá em **API Keys**
4. Clique em **Create Key**
5. Copie a chave (formato: `sk-ant-...`)

⚠️ **IMPORTANTE**: Guarde a chave em local seguro. Ela não será exibida novamente.

---

## ⚙️ Configuração Passo a Passo

### Passo 1: Configurar API Key no Cursor

1. **Abra o Cursor**
2. **Acesse Settings:**
   - **Windows/Linux**: `Ctrl + ,`
   - **Mac**: `Cmd + ,`
3. **Navegue até AI Models:**
   - No menu lateral, procure por **"Features"** ou **"AI"**
   - Clique em **"AI Models"** ou **"Model Settings"**
4. **Adicione a API Key:**
   - Procure por **"Claude API Key"** ou **"Anthropic API Key"**
   - Cole sua chave (formato: `sk-ant-...`)
   - Salve as configurações

### Passo 2: Selecionar Claude como Modelo Padrão

1. **Nas mesmas configurações de AI Models:**
2. **Selecione o modelo:**
   - **Recomendado**: `Claude Sonnet 4.5` (melhor custo/benefício)
   - **Alternativa**: `Claude Opus 4` (mais preciso, mais caro)
3. **Configure como modelo padrão**

### Passo 3: Ativar Codebase Indexing

1. **Nas configurações do Cursor:**
2. **Procure por "Index Codebase"** ou **"Codebase Indexing"**
3. **Ative a opção:**
   - Isso permite que o Claude entenda melhor o contexto do projeto
   - Pode levar alguns minutos na primeira vez

### Passo 4: Aplicar Configurações do Projeto

O arquivo `.cursor/settings.json` já está configurado com otimizações. O Cursor deve ler automaticamente, mas você pode verificar:

1. **Abra o arquivo**: `.cursor/settings.json`
2. **Verifique se as configurações estão aplicadas**
3. **Reinicie o Cursor** se necessário

### Passo 5: Verificar Configuração

Execute o script de verificação:

```bash
node scripts/verify-cursor-setup.js
```

Este script verifica:

- ✅ API Key configurada
- ✅ Modelo Claude selecionado
- ✅ Codebase Indexing ativo
- ✅ Configurações do projeto aplicadas

---

## 🚀 Otimizações de Performance

### 1. Configurações de Context Window

O arquivo `.cursor/settings.json` já está configurado com:

```json
{
  "cursor.ai.contextWindow": "large",
  "cursor.ai.maxTokens": 8192
}
```

**O que isso faz:**

- Permite que o Claude veja mais código de uma vez
- Melhora a compreensão de arquivos grandes
- Otimiza para projetos React Native complexos

### 2. Codebase Indexing

**Benefícios:**

- Claude entende a estrutura completa do projeto
- Melhor sugestão de imports
- Compreensão de padrões do projeto

**Como funciona:**

- Cursor indexa automaticamente o código
- Primeira indexação pode levar 5-10 minutos
- Atualizações incrementais são rápidas

### 3. Exclusões de Arquivos com .cursorignore

**Arquivos excluídos da indexação (para performance):**

O arquivo `.cursorignore` na raiz do projeto já está configurado e exclui:

```
- node_modules/
- .expo/
- dist/
- build/
- coverage/
- *.log, *.tmp
- Assets grandes (imagens, PDFs)
- Lock files
```

**Impacto:** Isso acelera a indexação e reduz 30-50% do uso de tokens.

**Verificar se está funcionando:**

```bash
# No Cursor, teste:
@src/  # Deve incluir apenas código fonte
@node_modules/  # Não deve aparecer nada
```

**Template completo:** O arquivo `.cursorignore` está na raiz do projeto e pode ser customizado conforme necessário.

### 4. Configurações de Editor

Otimizações automáticas:

```json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit",
    "source.organizeImports": "explicit"
  }
}
```

**Benefícios:**

- Código formatado automaticamente
- Imports organizados
- Correções ESLint aplicadas

---

## 🔍 Verificação e Troubleshooting Básico

### Script de Verificação

Execute para verificar se tudo está configurado:

```bash
npm run verify:cursor
# ou
node scripts/verify-cursor-setup.js
```

### Problemas Comuns de Configuração

> **Nota:** Para troubleshooting avançado (performance, custos, qualidade), veja a seção [Troubleshooting Expandido](#troubleshooting-expandido).

#### 1. "API Key inválida"

**Sintomas:**

- Erro ao tentar usar Claude
- Mensagem "Invalid API Key"

**Solução:**

1. Verifique se copiou a chave completa (começa com `sk-ant-`)
2. Verifique se não há espaços extras
3. Gere uma nova chave em [console.anthropic.com](https://console.anthropic.com)
4. Cole novamente no Cursor

#### 2. "Limite de uso excedido"

**Sintomas:**

- Mensagem de limite atingido
- Claude não responde

**Solução:**

1. Verifique seu uso em [claude.ai/settings](https://claude.ai/settings)
2. Limites resetam a cada 5 horas
3. Considere upgrade para plano 20x se usar muito
4. Use novas conversas para cada tópico (economiza tokens)

#### 3. "Modelo não disponível"

**Sintomas:**

- Claude Sonnet 4.5 não aparece nas opções
- Erro ao selecionar modelo

**Solução:**

1. Atualize o Cursor para versão mais recente
2. Verifique se o Plano Max está ativo
3. Tente `Claude Opus 4` como alternativa
4. Reinicie o Cursor

#### 4. Codebase Indexing lento

**Sintomas:**

- Indexação demora muito
- Cursor fica lento

**Solução:**

1. Verifique se `node_modules` está excluído
2. Feche arquivos desnecessários
3. Aguarde a primeira indexação (pode levar 10-15 min)
4. Reinicie o Cursor se necessário

#### 5. Autocomplete não funciona

**Sintomas:**

- Sugestões do Claude não aparecem
- Tab não aceita sugestões

**Solução:**

1. Verifique se "Enable Autocomplete" está ativo
2. Verifique se API Key está configurada
3. Reinicie o Cursor
4. Verifique se há conexão com internet

---

## 💡 Melhores Práticas Avançadas

### 📊 1. Escolha o Modelo Claude Certo

O Cursor oferece vários modelos Claude da Anthropic. Escolha baseado na sua necessidade:

| Modelo                | Melhor Para                            | Context Window | Custo    | TPS Médio |
| --------------------- | -------------------------------------- | -------------- | -------- | --------- |
| **Claude Sonnet 4.5** | Uso geral, equilíbrio qualidade/custo  | 200k tokens    | Moderado | ~50-70    |
| **Claude Opus 4**     | Tarefas complexas, raciocínio profundo | 200k tokens    | Alto     | ~30-50    |
| **Claude Haiku**      | Tarefas rápidas e simples              | 200k tokens    | Baixo    | ~80-100   |

**Recomendação:** Use **Claude Sonnet 4.5** como padrão - ele oferece o melhor equilíbrio entre qualidade, velocidade e custo.

**Quando usar cada modelo:**

- **Sonnet 4.5**: Desenvolvimento diário, refatorações, implementações
- **Opus 4**: Análise profunda, arquitetura complexa, debugging difícil
- **Haiku**: Exploração rápida do codebase, perguntas simples, autocomplete

#### 🆚 Testes A/B: Você vs Claude

**Quando cada um é mais eficiente:**

| Tarefa                  | Humano          | Claude                 | Vencedor          | Quando Usar                        |
| ----------------------- | --------------- | ---------------------- | ----------------- | ---------------------------------- |
| **Naming criativo**     | 2 min           | 30s + review           | **Claude**        | Sempre que possível                |
| **Debug visual (UI)**   | 5 min           | Impossível             | **Humano**        | Problemas de layout/UX             |
| **Boilerplate CRUD**    | 20 min          | 2 min                  | **Claude**        | Templates, repetição               |
| **Arquitetura inicial** | 30 min          | 5 min + validação      | **Híbrido**       | Planejar com Claude, validar você  |
| **Escolher biblioteca** | 15 min pesquisa | Contexto desatualizado | **Humano + @Web** | Pesquisa + Claude para implementar |
| **Refatoração grande**  | 2-4h            | 30 min + review        | **Claude**        | Com contexto bom                   |
| **Decisão de negócio**  | 10 min          | Não aplicável          | **Humano**        | Sempre                             |

**Insight:** Claude acelera 80% das tarefas técnicas, mas decisões estratégicas ainda são suas.

**Estratégia Híbrida Recomendada:**

1. **Você decide** o que fazer (arquitetura, bibliotecas, padrões)
2. **Claude implementa** seguindo suas decisões
3. **Você revisa** e valida o resultado

### 💡 2. Gerencie o Contexto de Forma Eficiente

O Claude é particularmente sensível à qualidade do contexto fornecido.

**✅ Boas Práticas de Contexto:**

```typescript
// ❌ EVITE: Contexto vago
"Melhore esse código"

// ✅ PREFIRA: Contexto específico
@arquivo.ts
"Refatore essa função para:
- Melhorar performance usando memoização
- Adicionar tratamento de erros
- Seguir o padrão do @exemplo-service.ts"
```

**📌 Use @mentions estrategicamente:**

- `@arquivo.ts` - Arquivo específico
- `@pasta/` - Estrutura de diretório
- `@Codebase` - Busca semântica em todo projeto
- `@Web` - Buscar informação online
- `@Docs` - Documentação relevante

**Dica:** Claude responde especialmente bem a exemplos concretos (`@arquivo-exemplo.ts`).

### ⚙️ 3. Configure Rules (Regras) Específicas para Claude

Claude responde muito bem a instruções claras e estruturadas.

**Exemplo de Regra Otimizada para Claude:**

```markdown
---
globs: src/**/*.ts
alwaysApply: false
---

# Padrões de Código TypeScript

## Estrutura

- Use interfaces para tipos públicos
- Prefira composição sobre herança
- Mantenha funções com < 50 linhas

## Nomenclatura

- camelCase para funções/variáveis
- PascalCase para classes/interfaces
- UPPER_SNAKE_CASE para constantes

## Exemplos

@patterns/service-pattern.ts
@patterns/error-handling.ts

## Resposta

- Seja conciso mas completo
- Sempre explique o raciocínio para mudanças complexas
- Sugira alternativas quando relevante
```

**Para este projeto:** As regras já estão configuradas em `.cursor/rules` e incluem:

- Design tokens obrigatórios
- Componentes primitivos
- Acessibilidade WCAG AAA
- Performance mobile
- TypeScript strict mode

### 🎯 4. Otimize para Custo-Benefício

Claude cobra por tokens de entrada (input) e saída (output).

**💰 Estratégias de Economia de Tokens:**

| Estratégia               | Economia | Impacto |
| ------------------------ | -------- | ------- |
| User Rules concisas      | ~10-20%  | Baixo   |
| Arquivos `.cursorignore` | ~30-50%  | Médio   |
| Novos chats frequentes   | ~20-40%  | Médio   |
| Prompts específicos      | ~15-25%  | Alto    |

**Exemplo Prático:**

```typescript
// ❌ Consome muito contexto (tokens desnecessários)
@projeto/ (toda pasta com node_modules)
"Faça algo com autenticação"

// ✅ Contexto focado
@src/auth/
"Adicione validação JWT seguindo @auth-service.ts"
```

**Arquivos já excluídos (`.cursorignore`):**

- `node_modules/`
- `.expo/`
- `dist/`, `build/`
- `coverage/`

### 🔄 5. Use o Modo Certo para Cada Situação

**Mapeamento Claude + Modos do Cursor:**

| Tarefa                         | Modo        | Modelo Claude         | Atalho                |
| ------------------------------ | ----------- | --------------------- | --------------------- |
| Explorar codebase desconhecido | Ask         | Haiku (rápido/barato) | `Ctrl+L`              |
| Planejamento de features       | Plan        | Sonnet 4.5            | `Ctrl+Shift+I` → Plan |
| Implementação complexa         | Agent       | Sonnet 4.5 ou Opus    | `Ctrl+I`              |
| Refatoração simples            | Inline Edit | Sonnet 4.5            | `Ctrl+K`              |
| Autocomplete                   | Tab         | Modelo próprio Cursor | `Tab`                 |

**Atalhos Úteis:**

| Ação             | Windows/Linux      | Mac               |
| ---------------- | ------------------ | ----------------- |
| Abrir Chat       | `Ctrl + L`         | `Cmd + L`         |
| Composer (Agent) | `Ctrl + Shift + I` | `Cmd + Shift + I` |
| Inline Edit      | `Ctrl + K`         | `Cmd + K`         |
| Trocar Modos     | `Ctrl + .`         | `Cmd + .`         |
| Aceitar Sugestão | `Tab`              | `Tab`             |
| Settings         | `Ctrl + ,`         | `Cmd + ,`         |

### 📝 6. Estruture Prompts para Claude

Claude responde excepcionalmente bem a prompts estruturados.

**Template de Prompt Efetivo:**

```markdown
## Contexto

@src/features/checkout/

## Objetivo

Implementar validação de cartão de crédito

## Requisitos

1. Validar número usando algoritmo de Luhn
2. Verificar data de expiração
3. Validar CVV (3-4 dígitos)
4. Retornar erros específicos

## Padrões

Seguir estrutura de @src/features/payment/validator.ts

## Testes

Incluir testes unitários com casos válidos e inválidos
```

**✅ BOM (Específico):**

```
"Refatore @src/screens/HomeScreen.tsx para usar design tokens.
Mantenha mesma funcionalidade, apenas style updates.
Use @src/theme/tokens.ts como referência."
```

**❌ RUIM (Vago):**

```
"Refatore este arquivo"
```

### 🚦 7. Max Mode: Quando Usar

**✅ Use Max Mode (1M tokens) quando:**

- Analisar múltiplos arquivos grandes simultaneamente
- Refatoração de sistema inteiro
- Migração de framework/biblioteca
- Análise de codebase legado extenso

**❌ NÃO use Max Mode para:**

- Perguntas simples
- Edições em 1-2 arquivos
- Autocomplete/snippets
- Exploração inicial

**⚠️ Custo:** Max Mode consome ~5-10x mais tokens. Use estrategicamente!

### 🎓 8. Workflow Visual: Decisão em 10 Segundos

**Fluxo Decisório Prático:**

```
┌─────────────────────────────────────────────────────────┐
│  Você sabe EXATAMENTE o que fazer?                      │
└─────────────────────────────────────────────────────────┘
                    │
        ┌───────────┴───────────┐
        │                       │
       SIM                     NÃO
        │                       │
        ▼                       ▼
┌───────────────────┐  ┌──────────────────────────────┐
│ Cmd+K (Inline)    │  │ Precisa entender código?    │
│ Sonnet 4.5        │  └──────────────────────────────┘
│ Edição direta     │              │
└───────────────────┘      ┌───────┴───────┐
                           │               │
                          SIM             NÃO
                           │               │
                           ▼               ▼
                ┌──────────────────┐  ┌──────────────────────┐
                │ Cmd+L (Ask)      │  │ Tarefa tem >3        │
                │ "Explique        │  │ arquivos?             │
                │  @arquivo.ts"    │  └──────────────────────┘
                │ Haiku            │          │
                └──────────────────┘    ┌─────┴─────┐
                                        │           │
                                       SIM         NÃO
                                        │           │
                                        ▼           ▼
                            ┌──────────────────┐  ┌──────────────┐
                            │ Cmd+. (Plan)    │  │ Cmd+I (Agent)│
                            │ Sonnet 4.5      │  │ Sonnet 4.5   │
                            │ Planejar antes  │  │ Implementar  │
                            └──────────────────┘  └──────────────┘
```

**Decisão Final: Orçamento**

```
┌─────────────────────────────────────────┐
│  Orçamento apertado hoje?              │
└─────────────────────────────────────────┘
              │
      ┌───────┴───────┐
      │               │
     SIM             NÃO
      │               │
      ▼               ▼
┌──────────────┐  ┌──────────────┐
│ Haiku +      │  │ Sonnet 4.5   │
│ Prompts      │  │ sem culpa    │
│ Ultra-focados│  │              │
└──────────────┘  └──────────────┘
```

**Exemplos Práticos:**

**Cenário 1: Edição Simples**

```
Você sabe: Adicionar validação de email
→ Cmd+K → "Adicione validação email em @src/utils/validation.ts"
→ Sonnet 4.5 → Aceita sugestão
→ Tempo: 30 segundos
```

**Cenário 2: Entender Código**

```
Você não sabe: Como funciona @src/services/chatService.ts
→ Cmd+L → "Explique @src/services/chatService.ts"
→ Haiku → Lê explicação
→ Tempo: 1 minuto
```

**Cenário 3: Refatoração Grande**

```
Tarefa: Refatorar 5 telas para usar design tokens
→ Cmd+. → "Planeje refatoração de 5 telas para tokens"
→ Sonnet 4.5 → Revisa plano
→ Cmd+I → "Implemente plano anterior"
→ Tempo: 15 minutos total
```

### ⚡ 9. Performance e Velocidade

**Tokens por Segundo (TPS) - Claude:**

| Modelo     | TPS Médio | Uso Ideal                     |
| ---------- | --------- | ----------------------------- |
| Haiku      | ~80-100   | Respostas rápidas, exploração |
| Sonnet 4.5 | ~50-70    | Uso geral, desenvolvimento    |
| Opus 4     | ~30-50    | Raciocínio profundo, análise  |

**Dica:** Para respostas mais rápidas, prefira prompts concisos e use Haiku para exploração inicial.

**Otimizações de Performance:**

- ✅ Codebase Indexing ativo (melhor contexto)
- ✅ `.cursorignore` configurado (menos arquivos indexados)
- ✅ Context Window: Large (8192 tokens)
- ✅ Autocomplete habilitado (sugestões rápidas)

### 🛡️ 10. Segurança e Privacy Mode

**Com Claude Code:**

- ✅ **Privacy Mode ativado**: Nenhum dado é armazenado pela Anthropic
- ✅ **Dados deletados**: Após cada request
- ✅ **Criptografia**: Paths/código durante indexação

**Ativar Privacy Mode:**

1. Cursor Settings > Privacy
2. Enable Privacy Mode
3. Confirmar para todos projetos sensíveis

**⚠️ Importante:** Para projetos com dados sensíveis (como Nossa Maternidade com dados de saúde), sempre ative Privacy Mode.

### 📊 11. Monitoramento de Uso e Calculadora de Custos

**Verificar uso:**

- **Cursor**: `Settings` > `Account` > `Usage`
- **Claude**: [claude.ai/settings](https://claude.ai/settings) > `Usage`

**Dicas:**

- Limites resetam a cada 5 horas
- Use avisos de uso para planejar
- Considere upgrade se usar muito
- Monitore tokens por conversa

**Economia de Tokens - Resumo:**

| Prática                           | Economia Estimada |
| --------------------------------- | ----------------- |
| Usar `@mentions` vs copiar código | ~30-40%           |
| Novos chats para novos tópicos    | ~20-30%           |
| Prompts específicos vs vagos      | ~15-25%           |
| `.cursorignore` configurado       | ~30-50%           |
| Evitar Max Mode desnecessário     | ~80-90%           |

#### 💰 Calculadora de Custos Real

**Exemplo Prático: CRUD Completo de Usuários**

| Abordagem                            | Tokens Input | Tokens Output | Custo Aprox.\* | Tempo  | Qualidade |
| ------------------------------------ | ------------ | ------------- | -------------- | ------ | --------- |
| ❌ Sem regras + contexto genérico    | ~40k         | ~10k          | **$0.25**      | 15 min | 60%       |
| ✅ Com rules + @exemplos             | ~15k         | ~5k           | **$0.10**      | 8 min  | 85%       |
| 🚀 Haiku explore → Sonnet implementa | ~10k         | ~5k           | **$0.06**      | 10 min | 90%       |

\*Custos aproximados Claude API (2024), Plano Max

**ROI de Boas Práticas:**

**Investimento Inicial:**

- 1h configurando rules + .cursorignore
- 30min criando templates de prompts
- **Total: 1.5h**

**Retorno (100 requests/mês):**

- Economia: 40% em tokens = ~$20-50/mês
- Tempo economizado: 2-3h/semana = ~10h/mês
- Qualidade: 60% → 85% código útil

**Break-even:**

- Financeiro: ~5 dias de uso ativo
- Tempo: Imediato (economia de tempo > investimento)

**Estimativa de Custos por Tipo de Tarefa:**

| Tarefa               | Modelo     | Tokens Médio | Custo Aprox. |
| -------------------- | ---------- | ------------ | ------------ |
| Pergunta simples     | Haiku      | ~2k          | $0.01        |
| Refatoração pequena  | Sonnet 4.5 | ~15k         | $0.08        |
| Feature completa     | Sonnet 4.5 | ~50k         | $0.25        |
| Arquitetura complexa | Opus 4     | ~100k        | $0.75        |
| Max Mode (1M tokens) | Sonnet 4.5 | ~500k        | $2.50        |

**Dica:** Monitore custos semanais e ajuste modelo conforme necessário.

### 🎯 12. Trabalhando com Este Projeto Específico

**Para Nossa Maternidade:**

1. **Sempre use @mentions:**

   ```
   @src/theme/tokens.ts
   @src/components/primitives
   @package.json
   @.cursor/rules
   ```

2. **Siga as regras do projeto:**
   - Leia `.cursor/rules` antes de começar
   - Use design tokens (não hardcoded colors)
   - TypeScript strict mode sempre
   - Componentes primitivos obrigatórios
   - WCAG AAA compliance

3. **Use Composer para refatorações:**
   - Edições multi-arquivo
   - Refatorações grandes
   - Setup inicial
   - Migrações de design system

4. **Exemplos de Prompts Eficientes:**

   ```
   "Crie @src/components/organisms/MaternalCard.tsx com 6 variants.
   Use apenas primitives de @src/components/primitives.
   TypeScript strict, memoized, testes incluídos."
   ```

   ```
   "Refatore @src/screens/HomeScreen.tsx.
   Aplique design tokens de @src/theme/tokens.ts.
   WCAG AAA, dark mode, performance otimizada."
   ```

   ```
   "Integre Gemini chat no @src/services/chatService.ts.
   Roteamento via @src/ai/config/llmRouter.ts.
   Crisis detection, logging Supabase, fallback GPT-4o."
   ```

---

## ❌ Antipadrões Comuns: Erros que Custam Caro

### 1. Contexto Acumulado (O Pior!)

**❌ Erro:**
Manter chat com 50+ mensagens acumuladas

**💰 Custo:**

- Cada nova mensagem reprocessa TODO o histórico
- 50 mensagens = ~200k tokens reprocessados por interação
- Custo: 5-10x mais caro que necessário

**✅ Solução:**

- Chat novo a cada 10-15 interações
- Use "Nova Conversa" para novos tópicos
- Exporte contexto importante antes de fechar

**Exemplo:**

```
❌ Chat com 47 mensagens sobre auth + UI + testes
✅ Chat 1: Auth (10 mensagens) → Nova conversa
✅ Chat 2: UI (8 mensagens) → Nova conversa
✅ Chat 3: Testes (12 mensagens)
```

### 2. Incluir node_modules/dist no Contexto

**❌ Erro:**

```
@projeto/ (sem .cursorignore)
"Adicione feature X"
```

**💰 Custo:**

- `node_modules/` pode ter 100k+ arquivos
- Cada arquivo indexado = tokens desperdiçados
- Impacto: 30-50% do orçamento em contexto inútil

**✅ Solução:**

- Configure `.cursorignore` robusto (já criado na raiz)
- Use `@src/` em vez de `@projeto/`
- Sempre especifique pasta exata: `@src/services/`

### 3. "Faça Tudo de Uma Vez"

**❌ Erro:**

```
"Refatore todo sistema de auth + adicione OAuth +
implemente testes + adicione logging + crie documentação"
```

**💰 Custo:**

- Respostas gigantes (50k+ tokens)
- Alta chance de erro ou código incompleto
- Difícil revisar e validar

**✅ Solução:**
Quebrar em chats específicos e sequenciais:

```
Chat 1: "Refatore @src/auth/ seguindo @exemplo-service.ts"
Chat 2: "Adicione OAuth ao sistema refatorado em Chat 1"
Chat 3: "Crie testes para @src/auth/ usando @test-pattern.ts"
```

### 4. Prompts Vagos Sem Referências

**❌ Erro:**

```
"Melhore esse código"
"Adicione validação"
"Refatore isso"
```

**💰 Custo:**

- Claude precisa adivinhar o que você quer
- Múltiplas iterações necessárias
- Código genérico que não segue seus padrões

**✅ Solução:**
Sempre inclua referências concretas:

```
✅ "Refatore @src/auth/validator.ts para seguir padrão de
@src/utils/validation.ts. Adicione tratamento de erros
como em @src/services/errorHandler.ts"
```

### 5. Usar Modelo Errado para Tarefa

**❌ Erro:**

- Opus 4 para perguntas simples (exploração)
- Haiku para arquitetura complexa
- Sonnet 4.5 sempre, sem considerar contexto

**💰 Custo:**

- Opus desnecessário: 3-5x mais caro
- Haiku para tarefas complexas: Múltiplas iterações

**✅ Solução:**
Siga o fluxo decisório (ver seção 8: Workflow Visual)

### 6. Ignorar .cursorignore

**❌ Erro:**
Projeto sem `.cursorignore` ou arquivo incompleto

**💰 Custo:**

- 30-50% economia perdida
- Indexação lenta
- Contexto poluído

**✅ Solução:**
O arquivo `.cursorignore` já está criado na raiz do projeto. Verifique se está funcionando.

---

## 📈 Curva de Aprendizado: Semana 1-4

### Semana 1: Descoberta (Custo Alto)

**Comportamento:**

- ❌ Prompts vagos, contexto excessivo
- ❌ Usa sempre mesmo modelo
- ❌ Chats muito longos (30+ mensagens)

**Métricas Esperadas:**

- 💰 Custo: 2-3x acima do ideal
- ⏱️ Tempo: Mais lento que manual em algumas tarefas
- ✅ Taxa de aceitação: ~40-50%

**🎯 Foco:**

- Experimentar @mentions
- Observar qualidade das respostas
- Identificar padrões que funcionam

### Semana 2: Calibração

**Comportamento:**

- ✅ Começa usar .cursorignore
- ✅ Descobre seus padrões de prompt
- ✅ Testa diferentes modelos

**Métricas Esperadas:**

- 💰 Custo: 1.5x ideal
- ⏱️ Tempo: Paridade com manual
- ✅ Taxa de aceitação: ~60-70%

**🎯 Foco:**

- Criar primeira Rule reutilizável
- Mapear quando usar Haiku vs Sonnet
- Otimizar prompts mais comuns

### Semana 3: Eficiência

**Comportamento:**

- ✅ Contexto focado, chats curtos (10-15 mensagens)
- ✅ Rules para 80% dos casos
- ✅ Sabe qual modelo usar

**Métricas Esperadas:**

- 💰 Custo: ~1.1x ideal
- ⏱️ Tempo: 2-3x mais rápido que manual
- ✅ Taxa de aceitação: ~75-80%

**🎯 Foco:**

- Refinar Rules existentes
- Criar templates de prompts
- Compartilhar aprendizados

### Semana 4: Maestria

**Comportamento:**

- ✅ Sabe qual modelo/modo sem pensar
- ✅ Prompts estruturados naturalmente
- ✅ Workflow otimizado

**Métricas Esperadas:**

- 💰 Custo: Ótimo (dentro do ideal)
- ⏱️ Tempo: 3-5x mais rápido que manual
- ✅ Taxa de aceitação: >80%

**🎯 Próximo:**

- Compartilhar rules com time
- Documentar padrões do projeto
- Mentorear outros desenvolvedores

---

## 🚨 Troubleshooting Expandido

### Problema 1: "Claude está lento hoje"

**Sintomas:**

- Respostas lentas mesmo com Haiku
- Delay de 10-30 segundos entre mensagens
- Cursor parece "travado"

**Diagnóstico:**

1. Verifique contexto: `Cmd+L` → veja quantos arquivos estão incluídos
2. Verifique histórico: Quantas mensagens no chat atual?
3. Verifique modelo: Está usando Opus desnecessariamente?

**Soluções:**

1. **Inicie chat novo** (histórico pesado é o problema mais comum)
2. **Use @arquivo.ts específico**, não `@pasta/` inteira
3. **Reduza contexto:** Remova arquivos não essenciais do chat
4. **Verifique conexão:** Problemas de rede podem causar lentidão

**Prevenção:**

- Chats curtos (máx 15 mensagens)
- Contexto focado (1-3 arquivos por vez)
- Use Haiku para exploração inicial

### Problema 2: "Respostas genéricas/irrelevantes"

**Sintomas:**

- Claude não segue seus padrões
- Código genérico, não específico do projeto
- Múltiplas iterações necessárias

**Diagnóstico:**

1. Prompt tem referências concretas? (`@exemplo.ts`)
2. Rules configuradas para essa pasta?
3. Contexto inclui arquivos relevantes?

**Soluções:**

1. **Adicione `@exemplo-concreto.ts`** no prompt
2. **Crie Rule com `alwaysApply: true`** para a pasta
3. **Use formato explícito:** "Siga EXATAMENTE o padrão de @X"
4. **Inclua contexto de design system:** `@src/theme/tokens.ts`

**Exemplo:**

```
❌ "Crie componente Button"
✅ "Crie componente Button seguindo padrão de @src/components/primitives/Button.tsx.
Use design tokens de @src/theme/tokens.ts. TypeScript strict."
```

### Problema 3: "Custando muito"

**Sintomas:**

- Fatura alta no fim do mês
- Limite atingido rapidamente
- Custo por feature muito alto

**Diagnóstico:**

1. **Cursor Settings → Usage** → veja tokens por feature
2. **Identifique pico:** Max Mode descontrolado? Opus desnecessário?
3. **Analise padrões:** Qual tipo de tarefa consome mais?

**Soluções:**

1. **Implemente .cursorignore** completo (30-50% economia) ✅ Já feito
2. **Use Haiku** para exploração (economia imediata)
3. **Quebre chats longos** (novo chat a cada 10-15 mensagens)
4. **Crie Rules** para reduzir contexto necessário
5. **Evite Max Mode** a menos que realmente necessário

**Checklist de Economia:**

- [x] `.cursorignore` configurado? ✅
- [ ] Rules criadas para padrões comuns?
- [ ] Chats curtos (<15 mensagens)?
- [ ] Modelo correto para cada tarefa?
- [ ] Contexto focado (não `@projeto/` inteiro)?

### Problema 4: "Código não compila/erros TypeScript"

**Sintomas:**

- Claude sugere código com erros
- Imports incorretos
- Tipos incompatíveis

**Soluções:**

1. **Inclua `@tsconfig.json`** no contexto
2. **Referencie arquivos similares:** "Siga estrutura de @X"
3. **Peça validação:** "Garanta que compila sem erros TypeScript"
4. **Use Inline Edit:** Mais preciso que chat para correções

**Prevenção:**

- Sempre inclua contexto de tipos: `@src/types/`
- Referencie exemplos que compilam
- Configure Rules com padrões TypeScript

---

## 🎯 Métricas de Sucesso: Como Saber se Está Usando Bem?

### KPIs Semanais (Track Manual)

**Taxa de Aceitação:**

- **Meta:** >70% do código sugerido usado com ajustes mínimos
- **Como medir:** Anote quantas sugestões você aceita vs rejeita
- **Red flag:** <50% = Prompt ou modelo errado

**Prompts por Feature:**

- **Meta:** <5 iterações para tarefas médias
- **Como medir:** Conte mensagens até feature completa
- **Red flag:** >10 prompts = Contexto ruim ou tarefa muito complexa

**Custo por Feature:**

- **Meta:** Benchmark pessoal (ex: "$0.15 por CRUD")
- **Como medir:** Cursor Settings → Usage → Soma tokens por feature
- **Red flag:** 2x+ acima do benchmark = Antipadrões ativos

**Tempo até Primeiro Código Útil:**

- **Meta:** <2 minutos
- **Como medir:** Tempo desde prompt até primeira sugestão aceitável
- **Red flag:** >5 minutos = Modelo errado ou contexto muito grande

### Red Flags 🚩

| Sintoma                                    | Causa Provável               | Ação                               |
| ------------------------------------------ | ---------------------------- | ---------------------------------- |
| Precisando >10 prompts para tarefa simples | Contexto ruim                | Use `@arquivo.ts` específico       |
| Sempre editando 80%+ do código sugerido    | Modelo errado ou prompt vago | Melhore prompt, considere Opus     |
| Custo 2x+ que o esperado                   | Antipadrões ativos           | Revise .cursorignore, quebre chats |
| Respostas genéricas                        | Falta de referências         | Adicione `@exemplo.ts`             |
| Código não compila                         | Falta contexto de tipos      | Inclua `@src/types/`               |

### Dashboard Semanal (Template)

```
Semana de [DATA]

✅ Taxa de Aceitação: 75% (Meta: >70%) ✓
✅ Prompts/Feature: 4.2 (Meta: <5) ✓
💰 Custo/Feature: $0.12 (Meta: $0.15) ✓
⏱️ Tempo até útil: 1.5min (Meta: <2min) ✓

📊 Análise:
- Melhorou: Uso de Haiku para exploração
- Precisa melhorar: Ainda usando Opus desnecessariamente
- Próxima semana: Criar Rule para componentes
```

---

## ❓ FAQ

### P: Preciso do Plano Max para usar Claude no Cursor?

**R:** Não necessariamente. O Cursor funciona com Claude mesmo sem o Plano Max, mas com limites menores. O Plano Max oferece:

- Mais mensagens por sessão
- Melhor para projetos grandes
- Uso intenso sem preocupação

### P: Posso usar outros modelos além do Claude?

**R:** Sim! O Cursor suporta múltiplos modelos. Você pode:

- Alternar entre modelos conforme necessário
- Configurar fallback automático
- Usar modelos diferentes para tarefas diferentes

### P: Como economizar tokens?

**R:**

1. Use `@mentions` em vez de copiar código
2. Inicie novas conversas para novos tópicos
3. Evite anexar arquivos muito grandes
4. Use Composer para edições (mais eficiente)

### P: O Codebase Indexing consome tokens?

**R:** Não diretamente. A indexação é feita localmente pelo Cursor. O consumo de tokens acontece apenas quando você usa o Claude para gerar código ou fazer perguntas.

### P: Posso usar o mesmo Plano Max em múltiplos projetos?

**R:** Sim! O Plano Max é por conta, não por projeto. Você pode usar em quantos projetos quiser, mas os limites são compartilhados.

### P: Como saber qual modelo usar?

**R:**

- **Claude Sonnet 4.5**: Uso geral, melhor custo/benefício
- **Claude Opus 4**: Tarefas complexas, análise profunda
- **Fallback automático**: Configurado no `.cursor/settings.json`

### P: O que fazer se o Claude não entender o contexto?

**R:**

1. Use `@mentions` para referenciar arquivos específicos
2. Forneça contexto explícito no prompt
3. Verifique se Codebase Indexing está ativo
4. Reinicie a conversa com contexto mais claro

---

## 📚 Recursos Adicionais

### Documentação Oficial

- **Cursor Docs**: [docs.cursor.com](https://docs.cursor.com)
- **Claude Docs**: [docs.anthropic.com](https://docs.anthropic.com)
- **Anthropic Console**: [console.anthropic.com](https://console.anthropic.com)

### Suporte

- **Cursor Support**: [cursor.com/support](https://cursor.com/support)
- **Claude Support**: [support.claude.com](https://support.claude.com)

### Projeto Específico

- **Regras do Projeto**: `.cursorrules`
- **Configurações**: `.cursor/settings.json`
- **Estrutura**: `docs/PROJECT_STRUCTURE.md`

---

## ✅ Checklist Final

Antes de começar a trabalhar, verifique:

- [ ] Plano Max do Claude ativo
- [ ] API Key configurada no Cursor
- [ ] Claude Sonnet 4.5 selecionado como modelo padrão
- [ ] Codebase Indexing ativo
- [ ] `.cursor/settings.json` aplicado
- [ ] Script de verificação executado com sucesso
- [ ] Atalhos conhecidos e testados
- [ ] Documentação lida e compreendida

---

## 🎉 Pronto para Começar!

Agora você está configurado para usar o Claude no Cursor com máxima eficiência.

**Próximos passos:**

1. Execute `node scripts/verify-cursor-setup.js` para confirmar
2. Teste o chat com `Ctrl+L` (ou `Cmd+L` no Mac)
3. Experimente o Composer com `Ctrl+Shift+I`
4. Comece a desenvolver com confiança!

**Dúvidas?** Consulte este guia ou a documentação oficial.

---

**Última atualização:** 29/11/2025  
**Versão:** 3.0.0 (Guia Completo com Antipadrões, Troubleshooting e Métricas)  
**Mantido por:** Equipe Nossa Maternidade

---

## 🏆 Resumo: Mudanças Priorizadas

| Mudança                       | Impacto     | Status          |
| ----------------------------- | ----------- | --------------- |
| **Template .cursorignore**    | 🔥🔥🔥 Alto | ✅ Implementado |
| **Antipadrões**               | 🔥🔥🔥 Alto | ✅ Implementado |
| **Troubleshooting expandido** | 🔥🔥 Médio  | ✅ Implementado |
| **Calculadora custos**        | 🔥🔥 Médio  | ✅ Implementado |
| **Workflow visual**           | 🔥🔥 Médio  | ✅ Implementado |
| **Curva aprendizado**         | 🔥 Baixo    | ✅ Implementado |
| **KPIs de sucesso**           | 🔥 Baixo    | ✅ Implementado |

**Ação Imediata (15 minutos):**

1. ✅ Criar `.cursorignore` (5 min) - **FEITO**
2. ✅ Ler seção Antipadrões (10 min) - **DISPONÍVEL**

**Esta semana:** 3. ✅ Implementar workflow visual na prática 4. ✅ Começar tracking de KPIs

**Filosofia do Guia:**

- **Antes:** Guia descritivo (o que existe)
- **Agora:** Guia prescriptivo (o que fazer em cada situação)

**Adicionado:**

- ✅ Checklists práticos
- ✅ Troubleshooting baseado em sintomas
- ✅ Exemplos de custos reais
- ✅ ROI mensurável das práticas
- ✅ Templates prontos para usar
