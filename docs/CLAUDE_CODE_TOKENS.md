# 🔧 Como Habilitar Exibição de Tokens no Claude Code

Este guia explica como habilitar e monitorar o uso de tokens no Claude Code (terminal/IDE).

## 🚀 Método Rápido

Execute o script de configuração:

```bash
npm run enable:claude-tokens
```

Ou diretamente:

```bash
pwsh -ExecutionPolicy Bypass -File scripts/enable-claude-code-tokens.ps1
```

## 📋 O que o Script Faz

O script configura as seguintes variáveis de ambiente:

- `ANTHROPIC_SHOW_TOKEN_USAGE=true` - Habilita exibição de uso de tokens
- `ANTHROPIC_DISPLAY_METRICS=true` - Habilita exibição de métricas
- `CLAUDE_CODE_SHOW_TOKENS=true` - Habilita tokens no Claude Code
- `CLAUDE_CODE_VERBOSE=true` - Modo verboso
- `ANTHROPIC_VERBOSE_LOGGING=true` - Logging verboso

## ⚠️ Importante

**O Claude Code pode não ter suporte nativo para exibição de tokens diretamente na interface.**

Nesse caso, você precisará verificar o uso via:

### 1. Console da Anthropic (Recomendado)

Acesse: https://console.anthropic.com/settings/usage

Você verá:
- Tokens usados no período
- Custo estimado
- Histórico de uso
- Limites e quotas

### 2. Monitor via Script

Execute:

```bash
npm run monitor:tokens
```

Este script verifica se a API key está configurada e fornece instruções.

### 3. Verificação Manual

No terminal PowerShell:

```powershell
# Verificar variáveis de ambiente configuradas
echo $env:ANTHROPIC_SHOW_TOKEN_USAGE
echo $env:CLAUDE_CODE_SHOW_TOKENS
```

## 🔄 Após Configurar

1. **Feche completamente o Cursor/Claude Code**
2. **Reabra o aplicativo**
3. **Verifique se os tokens aparecem na interface**

Se não aparecerem, use o Console da Anthropic para monitorar.

## 📊 Monitoramento Contínuo

Para monitorar tokens durante o desenvolvimento:

1. Mantenha o Console da Anthropic aberto em uma aba
2. Atualize periodicamente para ver o uso
3. Configure alertas de uso (se disponível)

## 💡 Dicas

- **Economize tokens**: Use `@mentions` em vez de copiar código
- **Novos chats**: Inicie novas conversas para novos tópicos
- **Prompts específicos**: Seja específico para reduzir iterações

## 🆘 Troubleshooting

### Tokens não aparecem na interface

**Solução**: O Claude Code pode não suportar exibição nativa. Use o Console da Anthropic.

### Variáveis de ambiente não funcionam

**Solução**: 
1. Verifique se executou o script como administrador (se necessário)
2. Reinicie completamente o Cursor/Claude Code
3. Verifique se as variáveis estão definidas: `echo $env:CLAUDE_CODE_SHOW_TOKENS`

### Não consigo ver uso no Console

**Solução**:
1. Verifique se está logado na conta correta
2. Verifique se a API key está associada à mesma conta
3. Aguarde alguns minutos (pode haver delay na atualização)

## 📚 Referências

- [Anthropic Console](https://console.anthropic.com)
- [Anthropic API Docs](https://docs.anthropic.com)
- [Claude Code Documentation](https://docs.claude.com/pt/docs/claude-code/overview)

