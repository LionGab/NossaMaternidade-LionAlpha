# 📦 Checklist de Assets - Nossa Maternidade

**Data:** 05/12/2025  
**Status:** ❌ **Assets faltando** (bloqueia build de produção)

---

## 🎯 RESUMO

Para fazer o build de produção, você precisa criar os seguintes assets e salvá-los na pasta `assets/`:

| Asset                   | Tamanho     | Status      | Prioridade        |
| ----------------------- | ----------- | ----------- | ----------------- |
| `icon.png`              | 1024x1024   | ❌ Faltando | 🔴 **CRÍTICO**    |
| `splash.png`            | 1242x2436+  | ❌ Faltando | 🔴 **CRÍTICO**    |
| `adaptive-icon.png`     | 1024x1024   | ❌ Faltando | 🔴 **CRÍTICO**    |
| `notification-icon.png` | 96x96       | ❌ Faltando | 🟡 **IMPORTANTE** |
| `splash-icon.png`       | 200px width | ❌ Faltando | 🟡 **IMPORTANTE** |
| `favicon.png`           | 32x32       | ❌ Faltando | 🟢 **OPCIONAL**   |

---

## 📋 ESPECIFICAÇÕES DETALHADAS

### 1. Ícone Principal (`icon.png`)

**Caminho:** `assets/icon.png`  
**Tamanho:** 1024x1024 px  
**Formato:** PNG (sem transparência)  
**Uso:** iOS e Android (base)

**Especificações:**

- ✅ Fundo sólido (rosa maternal #EC4899 ou branco)
- ✅ Logo centralizado
- ✅ Sem bordas ou padding (Expo adiciona automaticamente)
- ✅ Sem transparência
- ✅ Alta qualidade (sem compressão excessiva)

**Referência no código:**

```javascript
// app.config.js
icon: './assets/icon.png',
ios: { icon: './assets/icon.png' },
android: { icon: './assets/icon.png' },
```

---

### 2. Splash Screen (`splash.png`)

**Caminho:** `assets/splash.png`  
**Tamanho:** 1242x2436 px (iPhone 6.5") ou maior  
**Formato:** PNG  
**Uso:** Tela de splash inicial

**Especificações:**

- ✅ Fundo: Rosa maternal (#EC4899) - já configurado em `splash.backgroundColor`
- ✅ Logo centralizado (opcional)
- ✅ Texto "Nossa Maternidade" (opcional)
- ✅ Safe area considerada (não colocar conteúdo nas bordas)
- ✅ Resize mode: `cover` (já configurado)

**Referência no código:**

```javascript
// app.config.js
splash: {
  image: './assets/splash.png',
  resizeMode: 'cover',
  backgroundColor: '#EC4899',
},
```

---

### 3. Adaptive Icon Android (`adaptive-icon.png`)

**Caminho:** `assets/adaptive-icon.png`  
**Tamanho:** 1024x1024 px  
**Formato:** PNG (com transparência no foreground)  
**Uso:** Android 8.0+ (adaptive icons)

**Especificações:**

- ✅ **Foreground:** Logo/ícone centralizado
  - Tamanho máximo: 432x432 px no centro
  - Pode ter transparência
  - Conteúdo importante dentro da "safe zone" central
- ✅ **Background:** Cor sólida (rosa #EC4899)
  - Definida em `adaptiveIcon.backgroundColor`
  - Não precisa estar na imagem (Expo aplica automaticamente)
- ✅ Safe zone: Conteúdo importante dentro de 432x432 px central

**Referência no código:**

```javascript
// app.config.js
android: {
  adaptiveIcon: {
    foregroundImage: './assets/adaptive-icon.png',
    backgroundColor: '#EC4899',
    monochromeImage: './assets/adaptive-icon.png', // Android 13+
  },
},
```

**Nota:** O mesmo arquivo é usado para `monochromeImage` (Android 13+ themed icons).

---

### 4. Notification Icon (`notification-icon.png`)

**Caminho:** `assets/notification-icon.png`  
**Tamanho:** 96x96 px (Android)  
**Formato:** PNG (sem transparência)  
**Uso:** Notificações push

**Especificações:**

- ✅ Fundo sólido (branco ou rosa)
- ✅ Ícone simples e reconhecível
- ✅ Alta legibilidade em tamanho pequeno
- ✅ Sem transparência (Android)

**Referência no código:**

```javascript
// app.config.js
notification: {
  icon: './assets/notification-icon.png',
  color: '#EC4899',
  // ...
},
```

---

### 5. Splash Icon (`splash-icon.png`)

**Caminho:** `assets/splash-icon.png`  
**Tamanho:** 200px width (conforme configurado)  
**Formato:** PNG  
**Uso:** Plugin `expo-splash-screen` (ícone na splash)

**Especificações:**

- ✅ Logo ou ícone centralizado
- ✅ Tamanho: 200px de largura (altura proporcional)
- ✅ Fundo transparente ou sólido
- ✅ Alta qualidade

**Referência no código:**

```javascript
// app.config.js
plugins: [
  [
    'expo-splash-screen',
    {
      backgroundColor: '#EC4899',
      image: './assets/splash-icon.png',
      imageWidth: 200,
      // ...
    },
  ],
],
```

---

### 6. Favicon Web (`favicon.png`)

**Caminho:** `assets/favicon.png`  
**Tamanho:** 32x32 px ou 16x16 px  
**Formato:** PNG ou ICO  
**Uso:** Web (opcional, mas recomendado)

**Especificações:**

- ✅ Ícone simples e reconhecível
- ✅ Alta legibilidade em tamanho pequeno
- ✅ Formato PNG ou ICO

**Referência no código:**

```javascript
// app.config.js
web: {
  favicon: './assets/favicon.png',
},
```

---

## 🛠️ COMO CRIAR OS ASSETS

### Opção 1: Ferramentas Online (Recomendado para Início Rápido)

1. **AppIcon.co** - [https://www.appicon.co/](https://www.appicon.co/)
   - Upload de um ícone base
   - Gera todos os tamanhos automaticamente
   - Download direto

2. **IconKitchen** - [https://icon.kitchen/](https://icon.kitchen/)
   - Especializado em Adaptive Icons Android
   - Gera foreground e background separados

3. **Splash Screen Generator (Figma)**
   - Plugin do Figma
   - Gera splash screens para todas as plataformas

### Opção 2: Criar Manualmente (Figma/Photoshop/Canva)

#### Passo a Passo:

1. **Criar Ícone Base (1024x1024)**
   - Abrir Figma/Photoshop/Canva
   - Canvas: 1024x1024 px
   - Design do logo/ícone
   - Fundo sólido (rosa #EC4899 ou branco)
   - Exportar como `icon.png`

2. **Criar Splash Screen (1242x2436)**
   - Canvas: 1242x2436 px
   - Fundo: Rosa #EC4899
   - Logo centralizado (opcional)
   - Exportar como `splash.png`

3. **Criar Adaptive Icon (1024x1024)**
   - Canvas: 1024x1024 px
   - Logo/ícone no centro (máx. 432x432 px)
   - Fundo transparente
   - Exportar como `adaptive-icon.png`

4. **Criar Notification Icon (96x96)**
   - Canvas: 96x96 px
   - Ícone simples
   - Fundo branco ou rosa
   - Exportar como `notification-icon.png`

5. **Criar Splash Icon (200px width)**
   - Canvas: 200px width (altura proporcional)
   - Logo/ícone
   - Exportar como `splash-icon.png`

6. **Criar Favicon (32x32)**
   - Canvas: 32x32 px
   - Ícone simples
   - Exportar como `favicon.png`

### Opção 3: Usar Expo CLI (Futuro)

```bash
# Gerar assets a partir de um ícone base
npx expo install @expo/image-utils
# (Funcionalidade em desenvolvimento)
```

---

## ✅ CHECKLIST DE VALIDAÇÃO

Após criar os assets, valide:

- [ ] `assets/icon.png` existe e tem 1024x1024 px
- [ ] `assets/splash.png` existe e tem pelo menos 1242x2436 px
- [ ] `assets/adaptive-icon.png` existe e tem 1024x1024 px
- [ ] `assets/notification-icon.png` existe e tem 96x96 px
- [ ] `assets/splash-icon.png` existe e tem 200px de largura
- [ ] `assets/favicon.png` existe (opcional)
- [ ] Todos os arquivos são PNG válidos
- [ ] Testar build local: `eas build --platform android --profile preview`

---

## 🚨 PROBLEMAS COMUNS

### "Asset not found" no build

- ✅ Verificar que o arquivo está em `assets/` (não `assets/images/`)
- ✅ Verificar que o nome do arquivo está exatamente como no `app.config.js`
- ✅ Verificar que o arquivo não está corrompido

### Ícone aparece distorcido

- ✅ Verificar que o ícone é quadrado (1024x1024)
- ✅ Verificar que não há padding extra na imagem
- ✅ Verificar que o logo está centralizado

### Splash screen não aparece

- ✅ Verificar que `splash.png` tem tamanho suficiente (1242x2436+)
- ✅ Verificar que `splash.backgroundColor` está correto
- ✅ Verificar que o plugin `expo-splash-screen` está configurado

---

## 📚 REFERÊNCIAS

- [Expo App Icons](https://docs.expo.dev/guides/app-icons/)
- [Expo Splash Screens](https://docs.expo.dev/guides/splash-screens/)
- [Android Adaptive Icons](https://developer.android.com/guide/practices/ui_guidelines/icon_design_adaptive)
- [iOS App Icons](https://developer.apple.com/design/human-interface-guidelines/app-icons)

---

**Próximo Passo:** Criar os assets e testar o build local antes de publicar.
