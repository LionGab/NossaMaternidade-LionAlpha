# 🔧 Troubleshooting - Rotas Web no Navegador

## Problema: Rotas não funcionam no navegador

### ✅ Solução Rápida

1. **Inicie o servidor web na porta correta:**

   ```bash
   npm run web
   ```

   Isso inicia na porta **8082** (não 8081).

2. **Acesse a URL correta:**
   - ✅ `http://localhost:8082/main/chat`
   - ✅ `http://localhost:8082/main/comunidade`
   - ✅ `http://localhost:8082/comunidade` (redireciona automaticamente)
   - ❌ `http://localhost:8081/...` (porta errada - Metro bundler, não web)

### 📋 Portas do Projeto

| Porta    | Uso                        | Comando       |
| -------- | -------------------------- | ------------- |
| **8081** | Metro Bundler (dev server) | `npm start`   |
| **8082** | Web Server                 | `npm run web` |

### 🔍 Verificações

1. **Servidor está rodando?**

   ```bash
   # Verificar se há processo na porta 8082
   netstat -ano | findstr :8082
   ```

2. **App carrega na raiz?**
   - Primeiro teste: `http://localhost:8082/`
   - Se não carregar, o servidor não está rodando

3. **Console do navegador:**
   - Abra DevTools (F12)
   - Verifique erros no console
   - Verifique a aba Network para ver se há requisições falhando

### 🐛 Problemas Comuns

#### Problema 1: "Cannot GET /main/chat"

**Causa:** Servidor web não está rodando ou porta errada  
**Solução:** Execute `npm run web` e acesse `http://localhost:8082/main/chat`

#### Problema 2: App carrega mas não navega

**Causa:** React Navigation não está processando a rota  
**Solução:** Verifique os logs no console do navegador. O redirecionamento deve aparecer nos logs.

#### Problema 3: Página em branco

**Causa:** Erro JavaScript ou problema de build  
**Solução:**

1. Abra DevTools (F12)
2. Verifique erros no console
3. Tente recarregar com Ctrl+Shift+R (hard refresh)

### 🧪 Teste Passo a Passo

1. **Inicie o servidor:**

   ```bash
   npm run web
   ```

2. **Aguarde a mensagem:**

   ```
   Web is waiting on http://localhost:8082
   ```

3. **Abra no navegador:**

   ```
   http://localhost:8082/
   ```

4. **Teste rotas:**
   - `http://localhost:8082/main/chat`
   - `http://localhost:8082/main/comunidade`
   - `http://localhost:8082/comunidade` (deve redirecionar)

### 📝 Logs de Debug

O app registra logs quando detecta rotas:

- `[Navigation] Initial URL: ...`
- `[Navigation] Redirected direct route: ...`

Verifique o console do navegador para ver esses logs.

### 🔄 Se Ainda Não Funcionar

1. **Limpe o cache:**

   ```bash
   # Limpar cache do Expo
   npx expo start --clear
   ```

2. **Reinstale dependências:**

   ```bash
   rm -rf node_modules
   npm install
   ```

3. **Verifique se há erros TypeScript:**

   ```bash
   npm run type-check
   ```

4. **Verifique se há erros de lint:**
   ```bash
   npm run lint
   ```
