# Cursor.AI Workflows - Nossa Maternidade

Este documento descreve os workflows de desenvolvimento usando Cursor.AI com MCPs customizados.

## Índice

1. [Workflow 1: Desenvolver Nova Feature](#workflow-1-desenvolver-nova-feature)
2. [Workflow 2: Correção de Bug](#workflow-2-correção-de-bug)
3. [Workflow 3: Refatoração Complexa](#workflow-3-refatoração-complexa)
4. [Comandos MCPs](#comandos-mcps)
5. [Auto-fix Engine](#auto-fix-engine)
6. [Troubleshooting](#troubleshooting)

---

## Workflow 1: Desenvolver Nova Feature

### Passo a Passo

1. **Cursor Chat: Criar Componente**

   ```
   Crie componente MaternalCard em src/components/organisms com 6 variants.
   Use apenas primitives (Box, Text, Button) de src/components/primitives.
   TypeScript strict mode.
   ```

2. **Auto-validation com MCPs**
   - Cursor automaticamente valida com `@design-tokens`, `@accessibility`, `@mobile-optimization`
   - Violations são detectadas em tempo real

3. **Auto-fix Automático**
   - Violations de alta confiança (95%+) são corrigidas automaticamente
   - Para violations de média/baixa confiança, Cursor sugere correções

4. **Review + Commit**
   - Developer faz review rápido das mudanças
   - Commit com mensagem descritiva

### Exemplo Completo

```bash
# 1. Cursor cria o componente
# 2. Auto-validation detecta violations
@design-tokens validate src/components/organisms/MaternalCard.tsx

# 3. Auto-fix aplica correções
node scripts/cursor-auto-fix.js --file=src/components/organisms/MaternalCard.tsx --confidence=high

# 4. Review e commit
git add src/components/organisms/MaternalCard.tsx
git commit -m "feat(ui): MaternalCard organism component (6 variants)"
```

---

## Workflow 2: Correção de Bug

### Passo a Passo

1. **Descrever Bug no Cursor Chat**

   ```
   O HomeScreen está com erro ao renderizar MaternalCard.
   Erro: TypeError: Cannot read property 'colors' of undefined
   Arquivo: src/screens/HomeScreen.tsx, linha 45
   ```

2. **Análise com @code-quality**

   ```
   @code-quality analyze src/screens/HomeScreen.tsx
   ```

3. **Auto-validation**
   - Cursor valida design tokens e acessibilidade após correção

4. **Approve + Commit**
   - Developer aprova correção
   - Commit com mensagem de fix

### Exemplo Completo

```bash
# 1. Cursor analisa o problema
@code-quality analyze src/screens/HomeScreen.tsx

# 2. Cursor propõe fix
# 3. Auto-validation
@design-tokens validate src/screens/HomeScreen.tsx
@accessibility audit src/screens/HomeScreen.tsx

# 4. Commit
git commit -m "fix(home): corrige erro de renderização do MaternalCard"
```

---

## Workflow 3: Refatoração Complexa

### Passo a Passo

1. **Claude Code (Plan): Analisa Múltiplos Arquivos**
   - Usa modo Plan para analisar 40 arquivos com violations
   - Cria checklist de refatoração

2. **Cursor (Execute): Refatora com MCPs + Auto-fix**
   - Refatora arquivo por arquivo
   - Usa MCPs para validação em tempo real
   - Auto-fix aplica correções de alta confiança

3. **Claude Code (Review): Valida Consistência**
   - Valida consistência entre arquivos
   - Cria PR com descrição detalhada

### Exemplo Completo

```bash
# 1. Plan (Claude Code)
# Analisa 40 arquivos, cria checklist

# 2. Execute (Cursor)
# Para cada arquivo:
@design-tokens validate src/screens/HomeScreen.tsx
node scripts/cursor-auto-fix.js --file=src/screens/HomeScreen.tsx --confidence=high

# 3. Review (Claude Code)
# Valida consistência, cria PR
```

---

## Workflow 4: Design System Validation

### Quando Usar

Use este workflow ao:

- Criar ou modificar componentes UI
- Refatorar estilos ou layouts
- Migrar de sistema legado (`@/design-system`) para tokens modernos (`@/theme/tokens`)
- Validar conformidade WCAG AAA
- Garantir suporte consistente a dark mode

### Passo a Passo

1. **Claude Code: Design Agent para Análise Profunda**

   ```
   @design-agent Analise o componente Button.tsx em src/components/primitives/
   Valide: 1) Uso de design tokens, 2) Acessibilidade WCAG AAA,
   3) Dark mode, 4) Consistência com Design System
   ```

2. **Cursor: Implementação com MCPs**
   - Implementa correções sugeridas pelo design-agent
   - Valida em tempo real com `@design-tokens` e `@accessibility`

3. **Auto-fix para Valores Hardcoded**

   ```bash
   node scripts/cursor-auto-fix.js --file=src/components/primitives/Button.tsx --confidence=high
   ```

4. **Validação Final**
   - Type-check: `npm run type-check`
   - Teste dark mode manual
   - Commit com descrição detalhada

### Exemplo Completo

```bash
# 1. Claude Code analisa com design-agent
claude -p "@design-agent Analise Button.tsx para conformidade com Design System"

# 2. Cursor implementa correções
# (via chat com sugestões do design-agent)

# 3. Auto-validation com MCPs
@design-tokens validate src/components/primitives/Button.tsx
@accessibility audit.screen src/components/primitives/Button.tsx

# 4. Auto-fix valores hardcoded
node scripts/cursor-auto-fix.js --file=src/components/primitives/Button.tsx --dry-run
node scripts/cursor-auto-fix.js --file=src/components/primitives/Button.tsx --confidence=high

# 5. Validação TypeScript
npm run type-check

# 6. Commit
git add src/components/primitives/Button.tsx
git commit -m "refactor(ui): migra Button para useTheme() + tokens modernos (WCAG AAA)"
```

### Design System Validation Checklist

Antes de commitar componentes/telas, verificar:

- [ ] ✅ Usa `@/theme/tokens` (NUNCA `@/design-system`)
- [ ] ✅ Usa `useThemeColors()` para cores (suporta dark mode)
- [ ] ✅ Contraste WCAG AAA: 7:1 para texto normal, 4.5:1 para texto grande
- [ ] ✅ Touch targets >= 44pt (iOS) / 48dp (Android)
- [ ] ✅ Accessibility labels (`accessibilityLabel`, `accessibilityRole`, `accessibilityHint`)
- [ ] ✅ Testado em light mode e dark mode
- [ ] ✅ Sem valores hardcoded (`#FFFFFF`, `padding: 16`, `fontSize: 14`)
- [ ] ✅ TypeScript sem erros (`npm run type-check`)
- [ ] ✅ MCPs validados sem violations críticas

### Uso do Claude Code Design Agent

O design-agent é um agente especializado do Claude Code (definido em `.claude/agents/design-agent.md`) com expertise em:

- **Mobile-First Design**: iOS Human Interface Guidelines + Material Design 3
- **Design System da Nossa Maternidade**: Paleta, tokens, componentes
- **Arquitetura de Componentes**: Padrões existentes, Atomic Design
- **Acessibilidade WCAG AAA**: Contrast ratios, touch targets, screen readers
- **Platform-Specific**: SafeArea, haptics, gestures, App Store compliance

**Como Invocar:**

```bash
# Revisão de componente existente
claude -p "@design-agent Revise MaternalCard.tsx e identifique violations de design system e acessibilidade"

# Criação de novo componente
claude -p "@design-agent Crie EmotionalPrompt.tsx com 5 emojis interativos, WCAG AAA, dark mode, usando apenas primitives"

# Análise de consistência em múltiplos arquivos
claude -p "@design-agent Analise consistência visual entre HomeScreen, ChatScreen e ProfileScreen"

# Documentação de padrões
claude -p "@design-agent Documente padrões de uso do MaternalCard com exemplos de cada variant"
```

### Integração Claude Code + Cursor

**Workflow Ideal:**

1. **Claude Code (5%)**: Análise profunda, planejamento, design agent
   - Plan mode para refatorações complexas
   - Design agent para validação de componentes
   - Criação de PRs e documentação

2. **Cursor (95%)**: Implementação rápida, MCPs, auto-fix
   - Desenvolvimento diário com MCPs em tempo real
   - Auto-fix de violations de alta confiança
   - Refatorações individuais com validação

**Exemplo de Divisão:**

```
Task: Migrar 10 componentes para design tokens modernos

1. Claude Code (Plan): Analisa 10 componentes, cria checklist priorizada
2. Cursor: Refatora componentes 1-10 com MCPs + auto-fix
3. Claude Code (Review): Valida consistência entre componentes, cria PR
```

---

## Comandos MCPs

### Design Tokens

```bash
# Validar arquivo específico
@design-tokens validate src/components/Checkbox.tsx

# Validar tela
@design-tokens validate.screen src/screens/HomeScreen.tsx

# Sugerir fix para violation
@design-tokens suggest.fix { violation: {...} }

# Verificar dark mode
@design-tokens check.darkmode src/components/Checkbox.tsx
```

### Code Quality

```bash
# Analisar qualidade de design
@code-quality analyze.design src/screens/HomeScreen.tsx

# Encontrar valores hardcoded
@code-quality find.hardcoded pattern=colors filePath=src/components/Checkbox.tsx

# Sugerir refatoração
@code-quality refactor.suggest src/components/Checkbox.tsx violations=[...]
```

### Accessibility

```bash
# Verificar contraste
@accessibility check.contrast foreground=#000000 background=#FFFFFF

# Verificar touch targets
@accessibility check.touchTargets src/components/Button.tsx

# Verificar labels
@accessibility check.labels src/screens/HomeScreen.tsx

# Auditoria completa
@accessibility audit.screen src/screens/HomeScreen.tsx
```

### Mobile Optimization

```bash
# Verificar FlatList
@mobile-optimization check.flatlist src/screens/HomeScreen.tsx

# Verificar memo
@mobile-optimization check.memo src/components/HabitCard.tsx

# Verificar imagens
@mobile-optimization check.images src/components/Avatar.tsx

# Analisar bundle size
@mobile-optimization analyze.bundle src/screens/HomeScreen.tsx

# Verificar queries Supabase
@mobile-optimization check.queries src/services/habitService.ts

# Análise completa
@mobile-optimization analyze.all src/screens/HomeScreen.tsx
```

### Prompt Testing

```bash
# Validar segurança
@prompt-testing validate.safety promptPath=src/mcp/servers/OpenAIMCPServer.ts

# Validar clareza
@prompt-testing validate.clarity promptPath=src/mcp/servers/OpenAIMCPServer.ts

# Testar tokens
@prompt-testing test.tokens promptPath=src/mcp/servers/OpenAIMCPServer.ts provider=gemini

# Testar detecção de crise
@prompt-testing test.crisis promptPath=src/mcp/servers/OpenAIMCPServer.ts

# Validar fallback
@prompt-testing validate.fallback promptPath=src/services/chatService.ts

# Validação completa
@prompt-testing validate.all promptPath=src/mcp/servers/OpenAIMCPServer.ts provider=gemini
```

---

## Auto-fix Engine

### Uso Básico

```bash
# Dry-run (ver o que seria corrigido)
node scripts/cursor-auto-fix.js --file=src/components/Checkbox.tsx --dry-run

# Aplicar fixes de alta confiança
node scripts/cursor-auto-fix.js --file=src/components/Checkbox.tsx --confidence=high

# Aplicar fixes de média confiança também
node scripts/cursor-auto-fix.js --file=src/components/Checkbox.tsx --confidence=medium

# Batch mode (todos os arquivos)
node scripts/cursor-auto-fix.js --mode=batch --confidence=high

# Verbose mode
node scripts/cursor-auto-fix.js --file=src/components/Checkbox.tsx --verbose
```

### Confidence Levels

- **HIGH (95%+)**: Aplica automaticamente
  - `#FFFFFF` → `colors.background.card`
  - `#000000` → `colors.text.primary`
  - `padding: 16` → `Tokens.spacing["4"]`

- **MEDIUM (70-94%)**: Sugere mas não aplica (a menos que use `--force`)
  - `rgba(0, 0, 0, 0.1)` → `colors.border.light`

- **LOW (<70%)**: Ignora

### Exemplos

```bash
# Ver o que seria corrigido sem aplicar
node scripts/cursor-auto-fix.js --file=src/screens/HomeScreen.tsx --dry-run --verbose

# Aplicar apenas correções de alta confiança
node scripts/cursor-auto-fix.js --file=src/screens/HomeScreen.tsx --confidence=high

# Aplicar todas as correções possíveis
node scripts/cursor-auto-fix.js --mode=batch --confidence=all

# Forçar correções de média confiança
node scripts/cursor-auto-fix.js --file=src/components/Checkbox.tsx --confidence=medium --force
```

---

## Troubleshooting

### MCP não aparece no Cursor

1. **Verificar mcp.json**

   ```bash
   cat mcp.json | jq .
   ```

2. **Testar runner manualmente**

   ```bash
   echo '{"id":"1","method":"design.validate","params":{"filePath":"src/components/Checkbox.tsx"}}' | node src/mcp/runners/design-tokens-runner.js
   ```

3. **Reload Cursor**
   - `Cmd/Ctrl+Shift+P` → "Reload Window"

4. **Verificar logs**
   - Windows: `%APPDATA%\Cursor\logs`
   - Mac: `~/Library/Application Support/Cursor/logs`

### Auto-fix não funciona

1. **Verificar confidence level**

   ```bash
   node scripts/cursor-auto-fix.js --file=FILE --dry-run --verbose
   ```

2. **Testar manualmente**

   ```bash
   node scripts/cursor-auto-fix.js --file=src/components/Checkbox.tsx --confidence=medium --force
   ```

3. **Verificar se MCP está funcionando**
   ```bash
   node scripts/mcp-health-check.js
   ```

### CI/CD falhando

1. **Rodar localmente**

   ```bash
   node scripts/mcp-validate-all.js --mcp=design-tokens
   ```

2. **Testar MCPs individualmente**

   ```bash
   node scripts/mcp-health-check.js --verbose
   ```

3. **Verificar paths no mcp.json**
   - Garantir que paths são absolutos ou relativos corretos

---

## Divisão de Responsabilidades

| Tarefa                 | Ferramenta  | % Uso |
| ---------------------- | ----------- | ----- |
| Desenvolvimento diário | Cursor      | 70%   |
| Refatoração individual | Cursor      | 15%   |
| Auto-fix violations    | Cursor      | 10%   |
| Planejamento complexo  | Claude Code | 3%    |
| PRs e documentação     | Claude Code | 2%    |

**Total Cursor: 95% | Claude Code: 5%**

---

## Próximos Passos

1. Testar todos os MCPs: `node scripts/mcp-health-check.js`
2. Validar projeto: `node scripts/mcp-validate-all.js --mcp=all`
3. Aplicar auto-fix: `node scripts/cursor-auto-fix.js --mode=batch --confidence=high --dry-run`
4. Reload Cursor e começar a usar!

---

## Referências

- [CLAUDE.md](../CLAUDE.md) - Documentação principal do projeto
- [Design Validation Guide](./DESIGN_VALIDATION_GUIDE.md) - Guia de validação de design
- [MCP Health Check](../scripts/mcp-health-check.js) - Script de health check
