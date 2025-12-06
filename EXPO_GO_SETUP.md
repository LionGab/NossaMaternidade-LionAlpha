# Como Testar no Expo Go

## Passos Rápidos

1. **Instalar Expo Go no seu celular:**
   - **iOS**: [App Store - Expo Go](https://apps.apple.com/app/expo-go/id982107779)
   - **Android**: [Google Play - Expo Go](https://play.google.com/store/apps/details?id=host.exp.exponent)

2. **Iniciar o servidor de desenvolvimento:**

   ```bash
   npx expo start --clear
   ```

   (Já iniciado em background)

3. **Conectar seu dispositivo:**
   - **iOS**: Abra a câmera e escaneie o QR code
   - **Android**: Abra o app Expo Go e escaneie o QR code
   - **Ou**: Pressione `i` para iOS Simulator ou `a` para Android Emulator

## Comandos Úteis

```bash
# Iniciar servidor (limpar cache)
npx expo start --clear

# Iniciar apenas para web
npx expo start --web

# Iniciar para iOS Simulator (Mac apenas)
npx expo start --ios

# Iniciar para Android Emulator
npx expo start --android

# Ver todos os comandos disponíveis
# Pressione ? no terminal do Expo
```

## Troubleshooting

### Problema: QR Code não aparece

- Verifique se o celular e o computador estão na mesma rede Wi-Fi
- Tente usar o modo "Tunnel" (pressione `s` no terminal do Expo)

### Problema: Erro de conexão

- Verifique o firewall do Windows
- Tente desabilitar temporariamente o antivírus
- Use o modo Tunnel se estiver em redes diferentes

### Problema: App não carrega

- Limpe o cache: `npx expo start --clear`
- Reinicie o servidor
- Verifique se todas as dependências estão instaladas: `npm install`

## Notas Importantes

- **Expo Go** tem limitações: não suporta todas as bibliotecas nativas
- Se precisar de funcionalidades nativas específicas, use **Development Build** (`npm run build:dev`)
- O servidor está rodando em background - você verá o QR code no terminal

## Próximos Passos

Após testar no Expo Go:

1. Se tudo funcionar, pode fazer commit das mudanças
2. Se houver problemas, podemos corrigir antes de commitar
3. Para builds de produção, use `npm run build:android` ou `npm run build:ios`
