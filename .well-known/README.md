# Asset Links Configuration

Este diretório contém o template do arquivo `assetlinks.json` necessário para configurar deep links (App Links) no Android.

## 📋 O que fazer

1. **Após o primeiro build de produção**, obtenha o SHA-256 fingerprint do certificado
2. **Substitua** `REPLACE_WITH_YOUR_SHA256_FINGERPRINT` no arquivo `assetlinks.json` pelo fingerprint real
3. **Hospede** este arquivo no servidor web em:
   ```
   https://nossamaternidade.com.br/.well-known/assetlinks.json
   ```

## 📖 Documentação Completa

Veja [docs/DEEP_LINKS_SETUP.md](../docs/DEEP_LINKS_SETUP.md) para instruções detalhadas.

## ⚠️ Importante

- Este arquivo deve estar acessível via HTTPS
- O Content-Type deve ser `application/json`
- O fingerprint deve estar no formato correto (com dois pontos: `AA:BB:CC:...`)
