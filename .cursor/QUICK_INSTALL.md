# ⚡ Instalação Rápida - Cursor Workbench

## 🎯 Método Mais Rápido (Interface Gráfica)

1. **Pressione:** `Ctrl+Shift+X`
2. **Busque:** `Cursor Workbench`
3. **Clique:** Install
4. **Pronto!** ✅

---

## 🔧 Método CLI (PowerShell)

### Opção 1: Marketplace (Se disponível)

```powershell
cursor --install-extension zackiles.cursor-workbench
```

### Opção 2: Script Automatizado

```powershell
.\scripts\install-cursor-workbench.ps1
```

O script vai:

- ✅ Verificar se já está instalado
- ✅ Tentar instalar do marketplace
- ✅ Oferecer opção de VSIX local
- ✅ Guiar você passo a passo

---

## ✅ Verificar Instalação

```powershell
# Listar extensões instaladas
cursor --list-extensions | Select-String "workbench"
```

Ou via Command Palette:

- `Ctrl+Shift+P` → `Cursor Workbench: Show Rules`

---

## 🚨 Erro: "code: command not found"

**Isso é normal!**

- ❌ `code` = VS Code (não funciona no Cursor)
- ✅ `cursor` = Comando correto do Cursor

**Use:** `cursor --install-extension` (não `code`)

---

## 📚 Documentação Completa

- **Interface gráfica:** `.cursor/INSTALL_EXTENSION.md`
- **CLI:** `.cursor/INSTALL_VIA_CLI.md`
- **Verificação:** `.cursor/VERIFY_RULES.md`
- **Quick Start:** `.cursor/QUICK_START.md`

---

**Resumo:** `Ctrl+Shift+X` → Buscar "Cursor Workbench" → Install 🚀
