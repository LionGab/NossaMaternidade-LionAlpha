# 🧪 Guia Completo de Testes - Nossa Maternidade

## 🚀 Testes Rápidos (Recomendado Começar Aqui)

### 1. **Verificação de TypeScript** ✅

```bash
npm run type-check
```

- Verifica se há erros de tipo
- **Resultado esperado:** 0 erros

### 2. **Verificação de Linting** ✅

```bash
npm run lint
```

- Verifica padrão de código
- **Resultado esperado:** 0 erros

### 3. **Ambos (Type + Lint)** ✅

```bash
npm run validate
```

- Executa type-check, design validation e lint
- **Resultado esperado:** Tudo verde ✅

---

## 🧬 Testes Unitários

### Rodar todos os testes

```bash
npm test
```

### Rodar testes em modo watch (atualiza em tempo real)

```bash
npm run test:watch
```

### Rodar testes com coverage (cobertura de código)

```bash
npm run test:coverage
```

### Rodar testes em modo desenvolvimento

```bash
npm run test:dev
```

### Rodar testes no CI (integração contínua)

```bash
npm run test:ci
```

---

## 🎮 Testes Manuais no Navegador/App

### Iniciar servidor web (melhor para testar visualmente)

```bash
npm run web
```

- Abre em: http://localhost:8082
- Acesse: `/home` para testar a HomeScreen

### Iniciar app normal (Expo)

```bash
npm start
```

- Escaneia QR code com Expo Go (celular)
- Ou pressiona `w` para abrir web automaticamente

### Testar em iOS (Mac apenas)

```bash
npm run ios
```

### Testar em Android

```bash
npm run android
```

---

## 🔍 Testes Específicos para Suas Mudanças

### 1. **Testar HomeScreen Reorganizada**

```bash
# Web - acesse http://localhost:8082/home
npm run web
```

**Checklist Visual:**

- [ ] Greeting "Olá, mãe" com ícone (sol/lua)
- [ ] Sleep Card (com imagem e botão "Registrar sono")
- [ ] Dica do dia (azul escuro)
- [ ] **Card Desculpa Hoje** (rosa claro) ← NOVO
- [ ] Featured Content (2 cards)
- [ ] Chat NathIA (gradiente 3 cores: rosa-roxo-azul)
- [ ] Mood Check (4 botões em grid 2x2)
- [ ] ✅ SEM SOS Mãe
- [ ] ✅ SEM NeedsPrompt

### 2. **Testar Navegação - Desculpa Hoje**

```bash
npm run web
```

**Passos:**

1. Acesse http://localhost:8083/home (ou localhost:8082/home)
2. Scroll até encontrar o card "Desculpa Hoje" (rosa claro)
3. Clique no botão "Responder"
4. Deve abrir uma modal com:
   - Ícone de coração
   - Pergunta: "Qual foi seu maior arrependimento hoje?"
   - Campo de texto (6 linhas)
   - Contador de caracteres
   - Dica motivacional
   - Botão "Refletir e Perdoar"
5. Digite algo e clique no botão
6. Deve aparecer mensagem de sucesso
7. Deve fechar automaticamente após 2 segundos

### 3. **Testar Colors e Gradientes**

```bash
npm run web
```

**Validar cores:**

- Dica do dia: Fundo `#1E3A8A` (azul escuro) ✅
- NathIA Card: Gradiente rosa (#FF6B9D) → roxo (#A855F7) → azul (#3B82F6) ✅
- Desculpa Hoje: Gradiente rosa claro (#FFE4F1 → #FFF1F8) ✅

### 4. **Testar Acessibilidade**

```bash
npm run web
```

**No Chrome DevTools:**

1. F12 → Lighthouse
2. Gera relatório de Acessibilidade
3. Verifica:
   - [ ] Contrast ratio ≥ 7:1 (WCAG AAA)
   - [ ] Touch targets ≥ 44px
   - [ ] Accessibility labels presentes

---

## ✅ Checklist Completo de Validação

```bash
# 1. TypeScript
npm run type-check
# Esperado: exit code 0

# 2. ESLint
npm run lint
# Esperado: exit code 0

# 3. Testes Unitários
npm test
# Esperado: todos passam

# 4. Coverage
npm run test:coverage
# Esperado: cobertura > 40%

# 5. Validação geral
npm run validate
# Esperado: tudo verde
```

---

## 🐛 Debug/Troubleshooting

### Se aparecer erro de memória em testes:

```bash
# Já configurado no package.json com --max-old-space-size=4096
npm test
```

### Se aparecer erro de imports:

```bash
# Limpar cache
npm run clean
npm install
npm run type-check
```

### Se a página web não atualizar:

```bash
# Limpar cache e restart
npm run web
# No navegador: Ctrl+Shift+R (hard refresh)
```

### Se quiser testar com dados reais do Supabase:

```bash
# Validar conexão
npm run test:connection
```

---

## 📱 Testar no Celular (Recomendado)

### iOS (via Expo Go)

```bash
npm start
# Scaneia o QR code com iPhone (app Expo Go)
```

### Android (via Expo Go)

```bash
npm start
# Scaneia o QR code com Android (app Expo Go)
```

### Web com tunnel (ver de outro computador)

```bash
npm run web:tunnel
# Acesse a URL gerada em outro PC/celular
```

---

## 🎯 Ordem Recomendada de Testes

### 1️⃣ **Validação Rápida** (5 min)

```bash
npm run type-check && npm run lint
```

### 2️⃣ **Testes Unitários** (10 min)

```bash
npm test
```

### 3️⃣ **Teste Visual no Browser** (10 min)

```bash
npm run web
# Navegue para /home e valide visualmente
```

### 4️⃣ **Teste em Celular** (5 min)

```bash
npm start
# Escaneia QR code
```

### 5️⃣ **Teste de Navegação** (5 min)

- Clique em "Desculpa Hoje"
- Preencha o formulário
- Valide o fluxo completo

---

## 💡 Dicas Profissionais

### 1. **Teste com DevTools aberto** (Chrome)

```
F12 → Console (aberto ao rodar npm run web)
Veja logs em tempo real e erros
```

### 2. **Use modo responsive** (Mobile)

```
Chrome DevTools → Toggle device toolbar (Ctrl+Shift+M)
Simula diferentes tamanhos de tela
```

### 3. **Veja a rede** (Network)

```
Chrome DevTools → Network tab
Valida requisições HTTP
```

### 4. **Teste acessibilidade**

```
Chrome DevTools → Lighthouse
Gera relatório completo de acessibilidade
```

### 5. **Teste em diferentes navegadores**

```bash
# Firefox
npm run web
# Edge
npm run web
# Safari (Mac)
npm run web
```

---

## 📊 Resultado Esperado

Após seguir este guia, você terá:

✅ **TypeScript:** 0 erros  
✅ **ESLint:** 0 warnings  
✅ **Testes:** Todos passando  
✅ **Visual:** HomeScreen idêntica à referência  
✅ **Navegação:** Desculpa Hoje funcional  
✅ **Acessibilidade:** WCAG AAA compliant

---

## 🚀 Próximos Passos

Após validar tudo:

```bash
# Commit com mensagem descritiva
git add .
git commit -m "feat: replicar design completo da HomeScreen com Card Desculpa Hoje"

# Push para repositório
git push origin seu-branch

# Abrir PR no GitHub/GitLab
```

---

**Dúvidas? Use `npm run health-check` para diagnostic completo do projeto!**
