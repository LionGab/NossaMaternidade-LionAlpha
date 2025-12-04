# 🔧 Fix Rápido: Claude Code Git Bash no Windows

**Erro:** `Error: Claude Code on Windows requires git-bash`

---

## ⚡ SOLUÇÃO RÁPIDA (Recomendado)

Execute este comando no terminal do projeto:

```powershell
npm run fix:claude-bash
```

Isso vai:

1. ✅ Verificar se Git está instalado
2. ✅ Encontrar o caminho do `bash.exe`
3. ✅ Configurar a variável de ambiente `CLAUDE_CODE_GIT_BASH_PATH`
4. ✅ Verificar se tudo está correto

**Depois, feche e reabra o Cursor completamente!**

---

## 🔍 VERIFICAR CONFIGURAÇÃO

Para verificar se está tudo certo:

```powershell
npm run verify:claude-bash
```

---

## 📋 SOLUÇÃO MANUAL (Se o script não funcionar)

### Opção 1: Interface Gráfica (Mais Fácil)

1. Pressione `Win + R`
2. Digite: `sysdm.cpl` e pressione Enter
3. Aba "Avançado" → "Variáveis de Ambiente"
4. Em "Variáveis do usuário", clique "Novo"
5. **Nome:** `CLAUDE_CODE_GIT_BASH_PATH`
6. **Valor:** `C:\Program Files\Git\bin\bash.exe`
7. Clique "OK" em todas as janelas
8. **Feche e reabra o Cursor**

### Opção 2: PowerShell

```powershell
[Environment]::SetEnvironmentVariable(
    "CLAUDE_CODE_GIT_BASH_PATH",
    "C:\Program Files\Git\bin\bash.exe",
    "User"
)
```

**Depois, feche e reabra o Cursor!**

---

## ⚠️ IMPORTANTE

- **O Cursor precisa ser FECHADO COMPLETAMENTE e REABERTO** para reconhecer a variável
- Se o caminho `C:\Program Files\Git\bin\bash.exe` não existir, o script vai encontrar o caminho correto automaticamente
- Se o Git não estiver instalado, instale em: https://git-scm.com/downloads/win

---

## 🚨 SE AINDA NÃO FUNCIONAR

O **Cursor AI** (que você está usando agora) **não precisa** do git-bash. Ele funciona nativamente.

O **Claude Code** é uma extensão opcional. Se o erro persistir, você pode continuar usando o Cursor AI normalmente.

---

## 📚 DOCUMENTAÇÃO COMPLETA

Para mais detalhes, veja: [`FIX_CLAUDE_CODE_BASH.md`](./FIX_CLAUDE_CODE_BASH.md)

---

**Última atualização:** 2025-01-27
