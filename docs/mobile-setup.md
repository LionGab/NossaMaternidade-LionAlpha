# 📱 Setup Mobile (iOS/Android)

Guia completo para configurar e executar o app Nossa Maternidade em dispositivos iOS e Android.

## 📋 Pré-requisitos

### Para iOS

- **macOS** (necessário para desenvolvimento iOS)
- **Xcode** 14+ ([download](https://developer.apple.com/xcode/))
- **CocoaPods** (gerenciador de dependências iOS)
  ```bash
  sudo gem install cocoapods
  ```
- **Node.js** 18+ e npm
- **Expo CLI** (opcional, mas recomendado)
  ```bash
  npm install -g expo-cli
  ```

### Para Android

- **Android Studio** ([download](https://developer.android.com/studio))
- **Java Development Kit (JDK)** 17+
- **Android SDK** (instalado via Android Studio)
- **Node.js** 18+ e npm
- **Expo CLI** (opcional, mas recomendado)

### Comum (Ambas Plataformas)

- **Git**
- **Editor de código** (VS Code recomendado)

## 🚀 Instalação

### 1. Clone o Repositório

```bash
git clone https://github.com/seu-usuario/nossa-maternidade.git
cd nossa-maternidade
```

### 2. Instale Dependências

```bash
# Instalar dependências do projeto
npm install

# Se usar package.native.json separado
cp package.native.json package.json
npm install
```

### 3. Instale Dependências Nativas (iOS)

```bash
cd ios
pod install
cd ..
```

**Nota**: Se a pasta `ios` não existir, o Expo criará automaticamente quando você executar `npx expo prebuild`.

### 4. Configure Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
API_KEY=sua_chave_gemini_aqui
SENTRY_DSN=sua_dsn_sentry_aqui (opcional)
FIREBASE_MEASUREMENT_ID=seu_id_firebase (opcional)
```

## 🍎 Setup iOS

### 1. Abrir no Xcode

```bash
# Se usar Expo
npx expo prebuild --platform ios

# Abrir projeto
open ios/NossaMaternidade.xcworkspace
```

### 2. Configurar Signing

1. No Xcode, selecione o projeto
2. Vá em **Signing & Capabilities**
3. Selecione seu **Team** (Apple Developer Account)
4. Xcode configurará automaticamente

### 3. Executar no Simulador

```bash
# Via Expo
npm run ios

# Ou via Xcode
# Selecione um simulador e pressione Cmd+R
```

### 4. Executar em Dispositivo Físico

1. Conecte seu iPhone via USB
2. No Xcode, selecione seu dispositivo
3. Pressione **Run** (Cmd+R)
4. **Primeira vez**: Vá em Settings > General > VPN & Device Management e confie no desenvolvedor

## 🤖 Setup Android

### 1. Configurar Android Studio

1. Abra Android Studio
2. Vá em **Tools > SDK Manager**
3. Instale:
   - Android SDK Platform 33+
   - Android SDK Build-Tools
   - Android Emulator

### 2. Configurar Variáveis de Ambiente

Adicione ao seu `~/.bashrc` ou `~/.zshrc`:

```bash
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/platform-tools
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$ANDROID_HOME/tools/bin
```

Recarregue:

```bash
source ~/.bashrc  # ou source ~/.zshrc
```

### 3. Criar Emulador

1. Abra Android Studio
2. Vá em **Tools > Device Manager**
3. Clique em **Create Device**
4. Selecione um dispositivo (ex: Pixel 5)
5. Selecione uma imagem do sistema (ex: Android 13)
6. Finalize a criação

### 4. Executar no Emulador

```bash
# Iniciar emulador
emulator -avd NomeDoEmulador

# Em outro terminal, executar app
npm run android
```

### 5. Executar em Dispositivo Físico

1. **Habilite Developer Options**:
   - Vá em Settings > About Phone
   - Toque 7 vezes em "Build Number"

2. **Habilite USB Debugging**:
   - Settings > Developer Options > USB Debugging

3. **Conecte dispositivo via USB**

4. **Execute o app**:
   ```bash
   npm run android
   ```

## 🔧 Configurações Adicionais

### Expo

Se usar Expo, configure `app.json`:

```json
{
  "expo": {
    "name": "Nossa Maternidade",
    "slug": "nossa-maternidade",
    "version": "1.0.0",
    "platforms": ["ios", "android"],
    "ios": {
      "bundleIdentifier": "com.nossamaternidade.app"
    },
    "android": {
      "package": "com.nossamaternidade.app"
    }
  }
}
```

### Permissões

#### iOS (`ios/NossaMaternidade/Info.plist`)

```xml
<key>NSCameraUsageDescription</key>
<string>Precisamos acessar a câmera para editar fotos</string>
<key>NSPhotoLibraryUsageDescription</key>
<string>Precisamos acessar suas fotos para edição</string>
```

#### Android (`android/app/src/main/AndroidManifest.xml`)

```xml
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
```

## 🐛 Troubleshooting

### iOS

#### Erro: "No Podfile found"

```bash
cd ios
pod install
cd ..
```

#### Erro: "Signing for NossaMaternidade requires a development team"

1. Abra Xcode
2. Selecione o projeto
3. Vá em Signing & Capabilities
4. Selecione seu Team

#### Simulador não inicia

```bash
# Limpar cache do Xcode
rm -rf ~/Library/Developer/Xcode/DerivedData

# Reiniciar simulador
xcrun simctl shutdown all
```

### Android

#### Erro: "SDK location not found"

Configure `ANDROID_HOME` (veja seção acima).

#### Erro: "Gradle sync failed"

```bash
cd android
./gradlew clean
cd ..
```

#### Emulador lento

- Use **x86_64** images (não ARM)
- Aumente RAM do emulador (Settings > Advanced)
- Use dispositivo físico para desenvolvimento

#### "adb: command not found"

Adicione Android SDK platform-tools ao PATH (veja seção acima).

### Geral

#### Erro: "Metro bundler failed"

```bash
# Limpar cache
npm start -- --reset-cache

# Ou
watchman watch-del-all
rm -rf node_modules
npm install
```

#### Erro: "Module not found"

```bash
# Limpar e reinstalar
rm -rf node_modules package-lock.json
npm install

# iOS: reinstalar pods
cd ios && pod install && cd ..
```

## 📦 Build para Produção

### iOS

```bash
# Build via Expo
eas build --platform ios

# Ou build manual
cd ios
xcodebuild -workspace NossaMaternidade.xcworkspace \
  -scheme NossaMaternidade \
  -configuration Release \
  -archivePath build/NossaMaternidade.xcarchive \
  archive
```

### Android

```bash
# Build via Expo
eas build --platform android

# Ou build manual
cd android
./gradlew assembleRelease
# APK estará em android/app/build/outputs/apk/release/
```

## 🧪 Testes

### Executar Testes

```bash
npm test
```

### Testes em Dispositivos

- **iOS**: TestFlight (distribuição beta)
- **Android**: Google Play Internal Testing

## 📚 Recursos Adicionais

- [Expo Docs](https://docs.expo.dev/)
- [React Native Docs](https://reactnative.dev/)
- [Xcode Help](https://developer.apple.com/xcode/)
- [Android Studio Guide](https://developer.android.com/studio/intro)

## ❓ Precisa de Ajuda?

- Abra uma Issue no GitHub
- Consulte a documentação do projeto
- Entre em contato com os mantenedores

---

**Boa sorte com o desenvolvimento! 🚀**
