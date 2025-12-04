# 🔧 Instalar Cursor Workbench via CLI

## ⚠️ Importante

O comando `code` é do **VS Code**, não do Cursor. Para Cursor, use:

---

## ✅ Método Correto: Interface Gráfica (Recomendado)

O Cursor **não tem comando CLI** para instalar extensões. Use a interface:

### Passo a Passo:

1. **Abrir Extensions:**

   ```
   Ctrl+Shift+X
   ```

2. **Buscar:**

   ```
   Cursor Workbench
   ```

3. **Instalar:**
   - Clique em "Install"
   - Aguarde
   - Recarregue se solicitado

---

## 🔄 Alternativa: Instalar via VSIX (Se Disponível)

Se você tem o arquivo `.vsix` da extensão:

### Via Command Palette:

1. `Ctrl+Shift+P`
2. Digite: `Extensions: Install from VSIX...`
3. Selecione o arquivo `.vsix`

### Via CLI (Funciona! ✅):

```powershell
# Instalar via VSIX
cursor --install-extension dist/cursor-workbench-0.0.1.vsix

# Ou instalar do marketplace (se disponível)
cursor --install-extension zackiles.cursor-workbench
```

**Nota:** O Cursor suporta `--install-extension` via CLI! Use `cursor` (não `code`).

---

## 📦 Baixar VSIX do GitHub

Se a extensão não estiver no marketplace:

1. **Acesse:**

   ```
   https://github.com/zackiles/cursor-workbench/releases
   ```

2. **Baixe:**
   - Arquivo `.vsix` mais recente

3. **Instale:**
   - Via Command Palette: `Extensions: Install from VSIX...`
   - Ou arraste o `.vsix` para o Cursor

---

## ✅ Verificar Instalação

Após instalar (qualquer método):

```powershell
# Verificar se comando existe
Ctrl+Shift+P → "Cursor Workbench: Show Rules"
```

Se o comando aparecer, está instalado! ✅

---

## 🚨 Erro Comum: "code: command not found"

**Isso é normal!**

- `code` = VS Code
- Cursor = Use interface gráfica (`Ctrl+Shift+X`)

**Solução:** Não use `code`, use a interface do Cursor.

---

## 📚 Próximos Passos

Após instalar:

1. **Verificar:** `.cursor/VERIFY_RULES.md`
2. **Testar:** `.cursor/QUICK_START.md`
3. **Troubleshooting:** `.cursor/INSTALL_EXTENSION.md`

---

**Resumo:** Use `Ctrl+Shift+X` → Buscar "Cursor Workbench" → Install
