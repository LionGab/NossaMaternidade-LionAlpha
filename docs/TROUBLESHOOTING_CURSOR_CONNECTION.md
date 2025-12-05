# 🔧 Troubleshooting: Erro de Conexão do Cursor AI

## ❌ Erro Reportado

```
ConnectError: [unavailable] getaddrinfo ENOTFOUND api2.cursor.sh
```

**Causa:** O Cursor não consegue se conectar ao servidor da API (`api2.cursor.sh`).

---

## ✅ Soluções (Tente nesta ordem)

### 1. Verificar Status dos Servidores do Cursor

- Acesse: https://status.cursor.sh
- Verifique se há incidentes reportados
- Se houver, aguarde a resolução

### 2. Verificar Conexão de Internet

```powershell
# Teste DNS
nslookup api2.cursor.sh

# Teste conectividade
Test-NetConnection -ComputerName api2.cursor.sh -Port 443
```

**✅ Diagnóstico Atual:**
- DNS: ✅ Funcionando (resolvendo para múltiplos IPs)
- TCP 443: ✅ Funcionando (`TcpTestSucceeded: True`)
- **Problema:** Provavelmente na camada HTTP/TLS ou timeout da aplicação

### 2.1. Solução: Desabilitar HTTP/2 (Problema Comum)

O Cursor pode estar tendo problemas com HTTP/2. Tente desabilitar:

1. Abra `.cursor/settings.json`
2. Altere:
```json
{
  "cursor.general.disableHttp2": true
}
```
3. Reinicie o Cursor completamente

### 3. Verificar Firewall/Antivírus

- **Windows Firewall:**
  - Abra "Firewall do Windows Defender"
  - Verifique se o Cursor está permitido
  - Adicione exceção se necessário

- **Antivírus:**
  - Verifique se está bloqueando conexões do Cursor
  - Adicione Cursor à lista de exceções

### 4. Verificar Proxy/VPN

Se você usa **proxy corporativo ou VPN**:

1. **Desative temporariamente** para testar
2. **Configure proxy no Cursor:**
   - Settings → Network → Proxy
   - Configure proxy manual se necessário

### 5. Limpar Cache DNS

```powershell
# Executar como Administrador
ipconfig /flushdns
ipconfig /release
ipconfig /renew
```

### 6. Verificar Configurações de Rede do Cursor ⭐ **TENTE PRIMEIRO**

No arquivo `.cursor/settings.json`, **altere para `true`**:

```json
{
  "cursor.general.disableHttp2": true
}
```

**Esta é a solução mais comum** para este tipo de erro quando DNS/TCP estão OK.

### 7. Reiniciar Cursor

1. Feche completamente o Cursor
2. Abra o Gerenciador de Tarefas
3. Finalize todos os processos do Cursor
4. Reinicie o Cursor

### 8. Verificar Arquivo Hosts

```powershell
# Verificar se há bloqueio no hosts
notepad C:\Windows\System32\drivers\etc\hosts
```

**Procure por linhas com `api2.cursor.sh` ou `cursor.sh`** e remova se houver.

### 9. Testar com Outra Rede

- Conecte-se a outra rede Wi-Fi
- Use hotspot do celular
- Se funcionar, o problema é na sua rede/firewall

### 10. Reinstalar Cursor (Último recurso)

1. Desinstale o Cursor
2. Baixe a versão mais recente: https://cursor.sh
3. Reinstale

---

## 🔍 Diagnóstico Avançado

### Teste de Conectividade Completo

```powershell
# 1. Teste DNS
nslookup api2.cursor.sh

# 2. Teste HTTP
Invoke-WebRequest -Uri "https://api2.cursor.sh" -Method GET

# 3. Teste porta 443
Test-NetConnection -ComputerName api2.cursor.sh -Port 443

# 4. Verificar rota
tracert api2.cursor.sh
```

### Logs do Cursor

Os logs do Cursor ficam em:
- Windows: `%APPDATA%\Cursor\logs\`

Verifique os logs mais recentes para mais detalhes do erro.

---

## 📞 Suporte

Se nenhuma solução funcionar:

1. **Cursor Support:** https://cursor.sh/support
2. **Discord:** https://discord.gg/cursor
3. **GitHub Issues:** https://github.com/getcursor/cursor/issues

**Ao reportar, inclua:**
- Versão do Cursor
- Sistema Operacional
- Resultado dos testes acima
- Logs de erro completos

---

## ⚠️ Nota Importante

Este erro **NÃO é causado pelo código do projeto**. É um problema de infraestrutura/rede entre seu computador e os servidores do Cursor.

O projeto **Nossa Maternidade** está funcionando corretamente. O problema é apenas na comunicação do Cursor AI com seus servidores.

---

**Última atualização:** 4 de dezembro de 2025

