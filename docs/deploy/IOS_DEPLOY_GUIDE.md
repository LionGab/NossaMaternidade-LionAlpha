# Guia de Deploy iOS - Nossa Maternidade

## Pré-requisitos

1. Conta Apple Developer ativa
2. EAS CLI instalado (`npm install -g eas-cli`)
3. Xcode instalado (para builds locais)

## Passo 1: Configuração Inicial

### 1.1 Verificar app.config.js

```javascript
expo: {
  ios: {
    bundleIdentifier: 'com.nossamaternidade.app',
    buildNumber: '1', // Incrementar a cada build
  }
}
```

### 1.2 Verificar eas.json

```json
{
  "build": {
    "production": {
      "ios": {
        "autoIncrement": true
      }
    }
  }
}
```

## Passo 2: Validação Pré-Build

```bash
# Executar validação completa
npm run validate:pre-deploy

# Verificar se passou todas as validações
```

## Passo 3: Build

### 3.1 Build de Produção

```bash
# Build para App Store
eas build --platform ios --profile production
```

### 3.2 Build de Preview (TestFlight)

```bash
# Build para TestFlight
eas build --platform ios --profile preview
```

## Passo 4: Submissão

### 4.1 Submissão Automática

```bash
# Submeter para App Store automaticamente
eas submit --platform ios --profile production
```

### 4.2 Submissão Manual

1. Abrir App Store Connect
2. Criar nova versão
3. Fazer upload do build
4. Preencher informações da versão
5. Enviar para revisão

## Checklist Final

- [ ] Build gerado com sucesso
- [ ] Versão testada em dispositivo real
- [ ] Screenshots atualizados (se necessário)
- [ ] Descrição da versão escrita
- [ ] Submetido para revisão

## Troubleshooting

### Erro: Bundle identifier já existe

- Verificar se está usando o bundle identifier correto
- Verificar permissões na conta Apple Developer

### Erro: Certificados expirados

- Executar: `eas credentials`
- Renovar certificados

## Próximos Passos

Após submissão:

1. Acompanhar status na App Store Connect
2. Responder a perguntas da revisão (se necessário)
3. Publicar após aprovação
