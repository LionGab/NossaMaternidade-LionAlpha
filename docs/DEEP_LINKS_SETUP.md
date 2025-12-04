# 🔗 Configuração de Deep Links Android

Guia completo para configurar e validar deep links (App Links) no app Android.

## 📋 O que são Deep Links?

Deep links permitem que usuários abram o app diretamente através de links web. Por exemplo:

- `https://nossamaternidade.com.br/chat` → Abre o app na tela de chat
- `https://nossamaternidade.com.br/content/123` → Abre conteúdo específico

## ✅ Configuração Atual

O app já está configurado em `app.config.js`:

```javascript
android: {
  intentFilters: [
    {
      action: 'VIEW',
      autoVerify: true,
      data: [
        {
          scheme: 'https',
          host: 'nossamaternidade.com.br',
          pathPrefix: '/',
        },
      ],
      category: ['BROWSABLE', 'DEFAULT'],
    },
  ],
}
```

## 🔧 Passo a Passo

### 1. Obter SHA-256 Fingerprint

Após fazer o primeiro build de produção, você precisa obter o SHA-256 fingerprint do certificado de assinatura.

#### Opção A: Via EAS (Recomendado)

1. Faça build de produção:

   ```bash
   eas build --platform android --profile production
   ```

2. Após o build, o EAS fornecerá o fingerprint. Você também pode encontrá-lo em:
   - Dashboard do EAS → Builds → Seu build → Detalhes

#### Opção B: Via Keystore Local (se tiver)

```bash
keytool -list -v -keystore android/app/debug.keystore \
  -alias androiddebugkey \
  -storepass android \
  -keypass android
```

Procure por `SHA256:` na saída.

### 2. Criar arquivo assetlinks.json

Crie o arquivo `.well-known/assetlinks.json` no servidor web do domínio `nossamaternidade.com.br`.

**Estrutura do arquivo:**

````json
[
  {
    "relation": ["delegate_permission/common.handle_all_urls"],
    "target": {
      "namespace": "android_app",
      "package_name": "com.nossamaternidade.app",
      "sha256_cert_fingerprints": [
        "SEU_SHA256_FINGERPRINT_AQUI:SEU_SHA256_FINGERPRINT_AQUI:..."
      ]
    }
  }
]
]

**Exemplo real:**

```json
[
  {
    "relation": ["delegate_permission/common.handle_all_urls"],
    "target": {
      "namespace": "android_app",
      "package_name": "com.nossamaternidade.app",
      "sha256_cert_fingerprints": [
        "AA:BB:CC:DD:EE:FF:00:11:22:33:44:55:66:77:88:99:AA:BB:CC:DD:EE:FF:00:11:22:33:44:55:66:77:88:99"
      ]
    }
  }
]
````

**⚠️ IMPORTANTE:**

- O fingerprint deve estar em formato `AA:BB:CC:...` (com dois pontos)
- Remova espaços e quebras de linha
- O arquivo deve ser acessível via HTTPS
- Content-Type deve ser `application/json`

### 3. Hospedar assetlinks.json

O arquivo deve estar acessível em:

```
https://nossamaternidade.com.br/.well-known/assetlinks.json
```

**Configuração no servidor:**

#### Nginx

```nginx
location /.well-known/assetlinks.json {
    add_header Content-Type application/json;
    root /var/www/nossamaternidade;
}
```

#### Apache (.htaccess)

```apache
<Files "assetlinks.json">
    Header set Content-Type "application/json"
</Files>
```

#### Cloud Run / Servidor Node.js

```javascript
app.get('/.well-known/assetlinks.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.sendFile(path.join(__dirname, '.well-known', 'assetlinks.json'));
});
```

### 4. Validar Asset Links

#### Opção A: Ferramenta do Google

Acesse:

```
https://digitalassetlinks.googleapis.com/v1/statements:list?source.web.site=https://nossamaternidade.com.br&relation=delegate_permission/common.handle_all_urls
```

Deve retornar o JSON com a configuração do app.

#### Opção B: Teste Local (ADB)

```bash
# Verificar se o app está verificando os links
adb shell pm get-app-links com.nossamaternidade.app

# Deve mostrar:
# com.nossamaternidade.app:
#   ID: ...
#   Signatures: [SEU_FINGERPRINT]
#   Domain verification state:
#     nossamaternidade.com.br: verified
```

#### Opção C: Teste de Link

```bash
# Testar deep link
adb shell am start -a android.intent.action.VIEW \
  -d "https://nossamaternidade.com.br/chat" \
  com.nossamaternidade.app
```

### 5. Implementar Navegação no App

No código do app, configure o `expo-linking` para lidar com deep links:

```typescript
import * as Linking from 'expo-linking';

// No componente principal
useEffect(() => {
  // Lidar com deep link quando app está aberto
  const subscription = Linking.addEventListener('url', handleDeepLink);

  // Lidar com deep link quando app é aberto
  Linking.getInitialURL().then((url) => {
    if (url) handleDeepLink({ url });
  });

  return () => subscription.remove();
}, []);

function handleDeepLink({ url }: { url: string }) {
  const { hostname, path, queryParams } = Linking.parse(url);

  if (hostname === 'nossamaternidade.com.br') {
    if (path === '/chat') {
      // Navegar para tela de chat
      navigation.navigate('Chat');
    } else if (path?.startsWith('/content/')) {
      const contentId = path.split('/content/')[1];
      // Navegar para conteúdo específico
      navigation.navigate('ContentDetail', { id: contentId });
    }
  }
}
```

## 🧪 Testes

### Teste 1: Link Direto

```bash
adb shell am start -a android.intent.action.VIEW \
  -d "https://nossamaternidade.com.br/chat"
```

### Teste 2: Link com Parâmetros

```bash
adb shell am start -a android.intent.action.VIEW \
  -d "https://nossamaternidade.com.br/content/123?ref=email"
```

### Teste 3: Link do Navegador

1. Abra o navegador no dispositivo
2. Digite: `https://nossamaternidade.com.br/chat`
3. O app deve abrir automaticamente (se instalado)

## ⚠️ Troubleshooting

### Problema: "App não abre com link"

**Soluções:**

1. Verifique se `assetlinks.json` está acessível via HTTPS
2. Verifique se o SHA-256 fingerprint está correto
3. Aguarde até 24h para propagação (Google verifica periodicamente)
4. Limpe cache do app: `adb shell pm clear com.nossamaternidade.app`

### Problema: "assetlinks.json retorna 404"

**Soluções:**

1. Verifique se o arquivo está no caminho correto: `/.well-known/assetlinks.json`
2. Verifique permissões do arquivo no servidor
3. Teste acesso direto no navegador

### Problema: "Fingerprint não confere"

**Soluções:**

1. Use o fingerprint do build de produção (não debug)
2. Verifique se está no formato correto (com dois pontos)
3. Remova espaços e quebras de linha

### Problema: "App abre mas não navega"

**Soluções:**

1. Verifique se o handler de deep links está implementado no código
2. Adicione logs para debugar o parsing do URL
3. Verifique se a navegação está configurada corretamente

## 📝 Checklist

- [ ] SHA-256 fingerprint obtido do build de produção
- [ ] Arquivo `assetlinks.json` criado com fingerprint correto
- [ ] Arquivo hospedado em `https://nossamaternidade.com.br/.well-known/assetlinks.json`
- [ ] Content-Type configurado como `application/json`
- [ ] Validação via ferramenta do Google bem-sucedida
- [ ] Handler de deep links implementado no app
- [ ] Testes locais com `adb` funcionando
- [ ] Teste no navegador funcionando

## 🔗 Recursos

- [Android App Links Documentation](https://developer.android.com/training/app-links)
- [Digital Asset Links Validator](https://developers.google.com/digital-asset-links/tools/generator)
- [Expo Linking Documentation](https://docs.expo.dev/guides/linking/)

---

**Última atualização**: Dezembro 2024
