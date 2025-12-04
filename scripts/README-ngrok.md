# 🌐 Scripts Ngrok - Túnel para Expo Web

Scripts para facilitar a criação de túneis ngrok para compartilhar o app localhost.

## 🚀 Início Rápido (Recomendado)

**Para iniciar Expo Web + Ngrok automaticamente:**

```powershell
# PowerShell (recomendado)
npm run web:tunnel

# Ou diretamente
pwsh -ExecutionPolicy Bypass -File scripts/start-web-with-tunnel.ps1
```

Isso vai:

1. ✅ Iniciar Expo Web automaticamente
2. ✅ Aguardar Expo iniciar
3. ✅ Criar túnel ngrok
4. ✅ Manter ambos ativos até você pressionar Ctrl+C

## 📋 Pré-requisitos

1. **Ngrok instalado:**

   ```powershell
   npm install -g ngrok
   ```

2. **Authtoken configurado:**

   ```powershell
   npx ngrok config add-authtoken SEU_TOKEN
   ```

3. **Expo Web rodando:**
   ```powershell
   npm run web
   # ou
   npx expo start --web --port 8082
   ```

## 🚀 Como Usar

### ⭐ Opção 1: Iniciar Tudo Automaticamente (Recomendado)

```powershell
# PowerShell - Inicia Expo Web + Ngrok
npm run web:tunnel

# Windows CMD - Inicia Expo Web + Ngrok
npm run web:tunnel:bat
```

**Vantagens:**

- ✅ Inicia Expo Web automaticamente
- ✅ Aguarda Expo iniciar
- ✅ Cria túnel ngrok
- ✅ Mantém ambos ativos
- ✅ Encerra tudo com Ctrl+C

### Opção 2: Manual (Expo já rodando)

Se você já tem Expo Web rodando em outro terminal:

```powershell
# PowerShell
npm run tunnel:web

# Windows CMD
npm run tunnel:web:bat

# Ou direto
npx ngrok http 8082
```

### Opção 2: Batch (Windows)

```cmd
# Via npm script
npm run tunnel:web:bat

# Ou executar diretamente
scripts\start-ngrok-web.bat
```

### Opção 3: Comando Direto

```powershell
# Simples e direto
npx ngrok http 8082
```

## 📝 O que o script faz

1. ✅ Verifica se Expo Web está rodando (porta 8082)
2. ✅ Verifica se ngrok está instalado
3. ✅ Verifica se authtoken está configurado
4. ✅ Cria túnel público para porta 8082
5. ✅ Exibe URL pública para compartilhar

## 🔗 URL Gerada

Após executar, você verá algo como:

```
Forwarding  https://abc123.ngrok.io -> http://localhost:8082
```

Copie a URL `https://abc123.ngrok.io` e compartilhe!

## 🛠️ Troubleshooting

### Erro: "Porta 8082 não está em uso"

- Certifique-se de que Expo Web está rodando: `npm run web`

### Erro: "ngrok não encontrado"

- Instale: `npm install -g ngrok`
- Ou use: `npx ngrok http 8082`

### Erro: "Authtoken não configurado"

- Configure: `npx ngrok config add-authtoken SEU_TOKEN`

### Erro de permissão no PowerShell

- Execute: `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser`
- Ou use: `pwsh -ExecutionPolicy Bypass -File scripts/start-ngrok-web.ps1`

## 📚 Recursos

- [Documentação Ngrok](https://ngrok.com/docs)
- [Dashboard Ngrok](http://localhost:4040) (abre automaticamente)
