# 🚀 Quick Start - Nossa Maternidade

## ⚠️ Problema Comum: Diretório Errado

Se você ver este erro:
```
Unable to find expo in this project - have you run yarn / npm install yet?
```

**Causa:** Você está no diretório errado!

## ✅ Solução

### 1. Navegue para o diretório correto:

```powershell
cd "C:\Users\Usuario\Documents\NossaMaternidade\NossaMaternidade"
```

**Importante:** O projeto está em `NossaMaternidade\NossaMaternidade` (pasta duplicada)

### 2. Verifique se está no lugar certo:

```powershell
# Deve mostrar package.json
dir package.json

# Deve mostrar node_modules
dir node_modules
```

### 3. Inicie o servidor:

```powershell
npm start
```

Ou com cache limpo:

```powershell
npm start -- --clear
```

---

## 📋 Comandos Úteis

### Desenvolvimento

```powershell
# Iniciar Metro Bundler
npm start

# Iniciar com cache limpo
npm start -- --clear

# iOS Simulator
npm run ios

# Android Emulator
npm run android

# Web (porta 8082)
npm run web
```

### Build

```powershell
# Build development
npm run build:dev

# Build produção Android
npm run build:android

# Build produção iOS
npm run build:ios
```

### Validação

```powershell
# TypeScript check
npm run type-check

# ESLint
npm run lint

# Testes
npm test

# Validação completa
npm run validate
```

---

## 🔧 Troubleshooting

### Erro: "Unable to find expo"

**Solução:**
1. Verifique se está no diretório correto: `NossaMaternidade\NossaMaternidade`
2. Execute: `npm install`
3. Execute: `npm start`

### Erro: "Metro bundler não conecta"

**Solução:**
```powershell
# Limpar cache
npm start -- --clear

# Ou
npx expo start -c
```

### Erro: "Module not found"

**Solução:**
```powershell
# Reinstalar dependências
rm -rf node_modules
npm install

# Limpar cache
npm start -- --clear
```

---

## 📁 Estrutura de Diretórios

```
C:\Users\Usuario\Documents\NossaMaternidade\
├── NossaMaternidade\          ← PROJETO AQUI!
│   ├── package.json           ← Verifique se existe
│   ├── node_modules\          ← Dependências
│   ├── src\                   ← Código fonte
│   └── ...
└── ...
```

**Sempre trabalhe dentro de `NossaMaternidade\NossaMaternidade`!**

---

## ✅ Checklist Antes de Começar

- [ ] Está no diretório correto: `NossaMaternidade\NossaMaternidade`
- [ ] `package.json` existe
- [ ] `node_modules` existe (se não, execute `npm install`)
- [ ] `.env` está configurado
- [ ] Supabase migrations aplicadas (veja `SUPABASE_SETUP_GUIDE.md`)

---

**Última atualização:** 6 de dezembro de 2025

