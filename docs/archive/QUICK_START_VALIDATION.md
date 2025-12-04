# 🚀 Guia Rápido - Validação de Design

## ⚠️ IMPORTANTE: Execute do diretório correto!

Os scripts estão configurados em `nossaMaternidade/`. Você precisa estar dentro dessa pasta.

## 📍 Como executar:

### Opção 1: Navegar para a pasta primeiro

```powershell
# Windows PowerShell
cd nossaMaternidade
npm run validate:design
```

```bash
# Linux/Mac
cd nossaMaternidade
npm run validate:design
```

### Opção 2: Executar direto do diretório raiz

```powershell
# Windows PowerShell
cd nossaMaternidade; npm run validate:design
```

```bash
# Linux/Mac
cd nossaMaternidade && npm run validate:design
```

## ✅ Scripts Disponíveis

```bash
# Validar design tokens
npm run validate:design

# Validar tudo (design + types + lint)
npm run precommit
```

## 📊 Resultado Esperado

```
🔍 Analisando 179 arquivos...

📊 RELATÓRIO DE VALIDAÇÃO DE DESIGN TOKENS
📁 Arquivos analisados: 179
⚠️  Arquivos com violações: 49
🔴 Total de violações: 415
```

## 🔧 Troubleshooting

**Erro: "Missing script: validate:design"**

- ✅ Solução: Certifique-se de estar em `nossaMaternidade/`
- ✅ Verifique: `ls package.json` deve mostrar o arquivo

**Erro: "Cannot find module"**

- ✅ Solução: Execute `npm install` primeiro

---

**Dica:** Adicione um alias no seu shell para facilitar:

```powershell
# PowerShell Profile (~/.config/powershell/profile.ps1)
function Validate-Design {
    cd nossaMaternidade
    npm run validate:design
    cd ..
}
```
