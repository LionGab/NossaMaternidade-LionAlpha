# 🔌 Instalar Cursor Workbench Extension

## ⚠️ Importante: Cursor vs VS Code

- **`code`** = Comando do **VS Code** (não funciona no Cursor)
- **Cursor** tem seu próprio sistema de extensões
- Use a **interface gráfica** para instalar

---

## ✅ Método Recomendado: Interface Gráfica

### Passo 1: Abrir Extensions

**Atalho:**

- `Ctrl+Shift+X` (Windows/Linux)
- `Cmd+Shift+X` (Mac)

**Ou via menu:**

- View → Extensions

### Passo 2: Buscar Extensão

1. Na barra de busca do painel Extensions, digite:

   ```
   Cursor Workbench
   ```

   Ou:

   ```
   @zackiles/cursor-workbench
   ```

2. Você deve ver:
   - **Nome:** Cursor Workbench
   - **Autor:** zackiles
   - **Descrição:** Manage and apply Cursor rules with ease

### Passo 3: Instalar

1. Clique no botão **"Install"**
2. Aguarde a instalação
3. Pode pedir para **reload** o Cursor → Clique em "Reload"

---

## 🔍 Verificar Instalação

### Método 1: Command Palette

1. `Ctrl+Shift+P` (ou `Cmd+Shift+P`)
2. Digite: `Cursor Workbench: Show Rules`
3. Se aparecer o comando, está instalado! ✅

### Método 2: Extensions Panel

1. `Ctrl+Shift+X` → Abrir Extensions
2. Busque: `@installed cursor workbench`
3. Deve aparecer como instalada

### Método 3: Status Bar

- Procure no rodapé do Cursor por ícone do Workbench
- Status: 🟢 (ativo) ou ⚪ (inativo)

---

## 🚨 Problemas Comuns

### "Extensão não encontrada"

**Possíveis causas:**

1. Marketplace do Cursor diferente do VS Code
2. Extensão ainda não publicada no marketplace do Cursor
3. Nome de busca incorreto

**Soluções:**

1. **Verifique se está usando Cursor** (não VS Code)
   - Cursor tem logo diferente
   - Menu: Help → About → Deve mostrar "Cursor"

2. **Instalação Manual (se disponível):**
   - Baixe `.vsix` do GitHub: https://github.com/zackiles/cursor-workbench
   - Command Palette: `Extensions: Install from VSIX...`
   - Selecione o arquivo `.vsix`

3. **Alternativa: Usar Rules sem extensão**
   - Cursor pode aplicar regras de `.cursorrules` automaticamente
   - Verifique se há arquivo `.cursorrules` na raiz

### "Comando 'Show Rules' não encontrado"

**Solução:**

1. Recarregue o Cursor: `Ctrl+Shift+P` → `Developer: Reload Window`
2. Verifique se extensão está **ativada** (não apenas instalada)
3. Tente reinstalar a extensão

### "code: command not found"

**Isso é normal!**

- `code` é comando do VS Code
- Cursor não usa esse comando
- Use interface gráfica (`Ctrl+Shift+X`) em vez disso

---

## 📦 Instalação Manual (Alternativa)

Se a extensão não estiver no marketplace do Cursor:

### Opção 1: Via GitHub

1. **Baixar release:**

   ```bash
   # Acesse: https://github.com/zackiles/cursor-workbench/releases
   # Baixe o arquivo .vsix mais recente
   ```

2. **Instalar via Cursor:**
   - `Ctrl+Shift+P` → `Extensions: Install from VSIX...`
   - Selecione o arquivo `.vsix` baixado

### Opção 2: Build Local (Desenvolvedores)

```bash
# Clone o repositório
git clone https://github.com/zackiles/cursor-workbench.git
cd cursor-workbench

# Build
npm install
npm run package

# Instalar local
# Use o arquivo .vsix gerado em dist/
```

---

## ✅ Checklist Pós-Instalação

Após instalar, verifique:

- [ ] Extensão aparece em Extensions (`Ctrl+Shift+X`)
- [ ] Comando `Cursor Workbench: Show Rules` funciona
- [ ] Painel mostra 7 regras configuradas
- [ ] `workbench.json` está na raiz do projeto
- [ ] Arquivos `.mdc` existem em `.cursor/rules/`
- [ ] Teste prático: Chat segue regras de design tokens

---

## 🎯 Próximos Passos

Após instalação bem-sucedida:

1. **Verificar regras:**
   - `.cursor/VERIFY_RULES.md` - Guia completo

2. **Testar aplicação:**
   - `.cursor/QUICK_START.md` - Teste rápido

3. **Documentação completa:**
   - `.cursor/INSTALL_WORKBENCH.md` - Detalhes técnicos

---

## 📚 Links Úteis

- **GitHub:** https://github.com/zackiles/cursor-workbench
- **Documentação:** Ver `.cursor/rules/README.md`
- **Troubleshooting:** Ver `.cursor/VERIFY_RULES.md`

---

**Nota:** Se a extensão não estiver disponível no marketplace do Cursor, você ainda pode usar as regras via arquivo `.cursorrules` na raiz do projeto. O Cursor aplica essas regras automaticamente.
