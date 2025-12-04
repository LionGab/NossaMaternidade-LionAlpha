# Guia de Deploy Android - Nossa Maternidade

## Pré-requisitos

1. Conta Google Play Developer ativa
2. EAS CLI instalado (`npm install -g eas-cli`)
3. Java JDK instalado (para builds locais)

## Passo 1: Configuração Inicial

### 1.1 Verificar app.config.js

```javascript
expo: {
  android: {
    package: 'com.nossamaternidade.app',
    versionCode: 1, // Incrementar a cada build
    versionName: '1.0.0',
  }
}
```

### 1.2 Verificar eas.json

```json
{
  "build": {
    "production": {
      "android": {
        "autoIncrement": true,
        "buildType": "app-bundle"
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
# Build para Google Play (AAB)
eas build --platform android --profile production
```

### 3.2 Build de Preview (APK)

```bash
# Build para teste interno (APK)
eas build --platform android --profile preview
```

## Passo 4: Submissão

### 4.1 Submissão Automática

```bash
# Submeter para Google Play automaticamente
eas submit --platform android --profile production
```

### 4.2 Submissão Manual

1. Abrir Google Play Console
2. Criar nova versão
3. Fazer upload do AAB
4. Preencher informações da versão
5. Enviar para revisão

## Checklist Final

- [ ] Build gerado com sucesso (AAB)
- [ ] Versão testada em dispositivo real
- [ ] Screenshots atualizados (se necessário)
- [ ] Descrição da versão escrita
- [ ] Submetido para revisão

## Troubleshooting

### Erro: Package name já existe

- Verificar se está usando o package name correto
- Verificar permissões na conta Google Play

### Erro: Keystore não encontrado

- Executar: `eas credentials`
- Criar novo keystore se necessário

## Próximos Passos

Após submissão:

1. Acompanhar status na Google Play Console
2. Responder a perguntas da revisão (se necessário)
3. Publicar após aprovação
