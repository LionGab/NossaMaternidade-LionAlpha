# 📱 Plano de Implementação React Native com Expo (SDK 54.0.0)

Este guia detalha a migração completa para React Native com Expo, focando em Supabase para autenticação e backend.

---

## Passo 1: Configuração Inicial do Projeto Expo

```bash
# 1. Instalar a CLI do Expo se ainda não tiver
npm install -g expo-cli

# 2. Criar um novo projeto Expo com TypeScript
#    O SDK 54.0.0 e RN 0.81.5 serão o padrão se você usar `npx create-expo-app` hoje,
#    mas é bom verificar após a criação.
npx create-expo-app nossa-maternidade-mobile --template expo-template-blank-typescript

# 3. Navegar para a pasta do projeto
cd nossa-maternidade-mobile

# 4. Verificar as versões (apenas para confirmar)
#    Abra o arquivo package.json e verifique se as dependências
#    "react-native" está em "0.81.5" e "expo" está em "54.0.0".
#    Se não estiverem, você pode tentar ajustá-las manualmente e rodar `npm install`.
#    Ex: "react": "19.1.0", "react-native": "0.81.5", "expo": "54.0.0"

# 5. Instalar React 19.1.0 (se ainda não for a versão padrão)
npm install react@19.1.0 react-dom@19.1.0

# 6. Iniciar o projeto para testar
npm start

# Ou, para rodar diretamente no Android/iOS (requer emuladores/dispositivos):
# npm run android
# npm run ios
```

---

## Passo 2: Instalação das Dependências Essenciais

```bash
# 1. Navegação (Expo Router é o mais recomendado para Expo)
#    Ele simplifica o roteamento baseado em sistema de arquivos.
npx expo install expo-router react-native-safe-area-context react-native-screens expo-linking expo-constants

# 2. Estilização (NativeWind para usar Tailwind CSS em React Native)
#    Isso vai te poupar MUITO trabalho de reescrever estilos.
npm install nativewind

# Configure o babel.config.js (veja abaixo)

# 3. Armazenamento local (substituto do localStorage)
npx expo install @react-native-async-storage/async-storage

# 4. Ícones (Lucide React Native)
npm install lucide-react-native

# 5. Haptic Feedback
npx expo install expo-haptics

# 6. Áudio/Vídeo (Reprodução e Gravação)
npx expo install expo-av expo-media-library expo-microphone

# 7. Câmera e Manipulação de Imagens (para upload/análise)
npx expo install expo-camera expo-image-picker expo-image-manipulator

# 8. Integração com IA (Google Gemini API)
#    A biblioteca @google/genai que você está usando é compatível.
npm install @google/genai

# 9. Backend e Autenticação (Supabase - tudo em um!)
npm install @supabase/supabase-js

# 10. Variáveis de Ambiente (para API Keys seguras)
npm install react-native-dotenv --save-dev

# E adicione `plugins: ["module:react-native-dotenv"]` no babel.config.js

# 11. Notificações (Well-being Alerts)
npx expo install expo-notifications
```

---

## Passo 3: Configuração de Arquivos

### babel.config.js

Substitua o conteúdo do seu `babel.config.js` por:

```javascript
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      'nativewind/babel', // Adicione esta linha para NativeWind
      [
        'module:react-native-dotenv',
        {
          // Adicione esta para variáveis de ambiente
          env: ['production'],
          moduleName: '@env',
          path: '.env',
          blocklist: null,
          allowlist: null,
          safe: false,
          allowUndefined: true,
          verbose: false,
        },
      ],
      'expo-router/babel', // Adicione esta para Expo Router
    ],
  };
};
```

### tailwind.config.js

Crie um arquivo `tailwind.config.js` na raiz do projeto:

```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./App.{js,jsx,ts,tsx}', './app/**/*.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Design System - Primary Colors
        primary: {
          50: '#F0F7FF',
          100: '#E0EFFF',
          200: '#BAD4FF',
          300: '#7CACFF',
          400: '#4285F4', // Main - Google Blue
          500: '#0D5FFF', // Brand principal
          600: '#0047E6',
          700: '#0036B8',
          800: '#002D96',
          900: '#002979',
          DEFAULT: '#4285F4',
        },
        // Design System - Secondary Colors
        secondary: {
          50: '#FFF0F6',
          100: '#FFE0EC',
          200: '#FFC2D9',
          300: '#FF94BA',
          400: '#FF8FA3', // Rosa coral
          500: '#FF2576', // Brand secondary
          600: '#E60A5B',
          700: '#C10048',
          800: '#A0003D',
          900: '#840036',
          DEFAULT: '#FF8FA3',
        },
        // Background
        background: {
          DEFAULT: '#F8F9FA',
          canvas: '#F8F9FA',
          card: '#FFFFFF',
          elevated: '#FFFFFF',
          input: '#FFFFFF',
        },
        // Text
        text: {
          DEFAULT: '#5D4E4B',
          primary: '#5D4E4B',
          secondary: '#9CA3AF',
          tertiary: '#6B7280',
          light: '#F9FAFB',
          placeholder: '#9CA3AF',
        },
      },
    },
  },
  plugins: [],
};
```

### .env

Crie um arquivo `.env` na raiz do projeto:

```env
# Google Gemini API
GEMINI_API_KEY=sua_chave_gemini_aqui

# Supabase
SUPABASE_URL=sua_url_supabase_aqui
SUPABASE_ANON_KEY=sua_chave_anon_supabase_aqui

# Supabase Functions (se usar)
SUPABASE_FUNCTIONS_URL=sua_url_supabase_aqui/functions/v1
```

**Importante**: Adicione `.env` ao `.gitignore` e crie um `.env.example` com as mesmas variáveis sem valores.

---

## Passo 4: Estrutura do Projeto e Adaptação da Lógica

### Estrutura de Pastas Recomendada

```
nossa-maternidade-mobile/
├── app/                    # Expo Router (páginas)
│   ├── (auth)/            # Rotas de autenticação
│   │   ├── login.tsx
│   │   └── signup.tsx
│   ├── (tabs)/            # Rotas com tab navigation
│   │   ├── index.tsx      # Home
│   │   ├── chat.tsx
│   │   ├── community.tsx
│   │   └── mundo-nath.tsx
│   └── _layout.tsx        # Layout raiz
├── src/
│   ├── components/         # Componentes reutilizáveis
│   ├── services/          # Serviços (Gemini, Supabase)
│   ├── hooks/             # Custom hooks
│   ├── types/             # TypeScript types
│   ├── constants/         # Constantes
│   ├── theme/             # Sistema de tema
│   └── utils/             # Utilitários
├── assets/                 # Imagens, fontes, etc.
├── .env                    # Variáveis de ambiente (não commitado)
├── .env.example            # Template de variáveis
├── app.json                # Configuração Expo
├── eas.json                # Configuração EAS Build
└── package.json
```

### App.tsx Principal

Se usar Expo Router, o `app/_layout.tsx` será o ponto de entrada:

```typescript
// app/_layout.tsx
import { Stack } from 'expo-router';
import { ThemeProvider } from '../src/theme/ThemeContext';
import { SupabaseProvider } from '../src/services/supabase/SupabaseProvider';

export default function RootLayout() {
  return (
    <SupabaseProvider>
      <ThemeProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(auth)/login" />
          <Stack.Screen name="(tabs)" />
        </Stack>
      </ThemeProvider>
    </SupabaseProvider>
  );
}
```

Use `SafeAreaView` do `react-native-safe-area-context` para respeitar as áreas seguras do dispositivo (notch, barra de navegação).

---

## Passo 5: Integração com Supabase

### Configuração do Cliente Supabase

```typescript
// src/services/supabase/supabaseClient.ts
import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '@env';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
```

### Provider de Autenticação

```typescript
// src/services/supabase/SupabaseProvider.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from './supabaseClient';

interface SupabaseContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithApple: () => Promise<void>;
}

const SupabaseContext = createContext<SupabaseContextType | undefined>(undefined);

export function SupabaseProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar sessão atual
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Ouvir mudanças de autenticação
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
  };

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });
    if (error) throw error;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: 'nossa-maternidade://auth/callback',
      },
    });
    if (error) throw error;
  };

  const signInWithApple = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'apple',
      options: {
        redirectTo: 'nossa-maternidade://auth/callback',
      },
    });
    if (error) throw error;
  };

  return (
    <SupabaseContext.Provider
      value={{
        session,
        user,
        loading,
        signIn,
        signUp,
        signOut,
        signInWithGoogle,
        signInWithApple,
      }}
    >
      {children}
    </SupabaseContext.Provider>
  );
}

export function useSupabase() {
  const context = useContext(SupabaseContext);
  if (context === undefined) {
    throw new Error('useSupabase must be used within a SupabaseProvider');
  }
  return context;
}
```

### Exemplo de Uso na Tela de Login

```typescript
// app/(auth)/login.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSupabase } from '../../src/services/supabase/SupabaseProvider';
import { useRouter } from 'expo-router';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { signIn, signInWithGoogle, signInWithApple, loading } = useSupabase();
  const router = useRouter();

  const handleLogin = async () => {
    try {
      await signIn(email, password);
      router.replace('/(tabs)');
    } catch (error: any) {
      Alert.alert('Erro', error.message);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await signInWithGoogle();
    } catch (error: any) {
      Alert.alert('Erro', error.message);
    }
  };

  const handleAppleLogin = async () => {
    try {
      await signInWithApple();
    } catch (error: any) {
      Alert.alert('Erro', error.message);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, padding: 24 }}>
      {/* Seu UI de login aqui */}
      <TouchableOpacity onPress={handleLogin} disabled={loading}>
        <Text>Entrar</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={handleGoogleLogin}>
        <Text>Continuar com Google</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={handleAppleLogin}>
        <Text>Continuar com Apple</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}
```

### Operações com Banco de Dados

```typescript
// src/services/supabase/database.ts
import { supabase } from './supabaseClient';

// Exemplo: Buscar hábitos do usuário
export async function getUserHabits(userId: string) {
  const { data, error } = await supabase.from('habits').select('*').eq('user_id', userId);

  if (error) throw error;
  return data;
}

// Exemplo: Salvar progresso de hábito
export async function saveHabitProgress(habitId: string, progress: number) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data, error } = await supabase.from('habit_progress').insert({
    habit_id: habitId,
    user_id: user?.id,
    progress,
    date: new Date().toISOString(),
  });

  if (error) throw error;
  return data;
}

// Exemplo: Buscar posts da comunidade
export async function getCommunityPosts(limit = 10) {
  const { data, error } = await supabase
    .from('community_posts')
    .select('*, user:users(*)')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data;
}
```

---

## Passo 6: Adaptação de UI e Estilos (NativeWind)

### Exemplo de Componente com NativeWind

```typescript
// src/components/Button.tsx
import { TouchableOpacity, Text } from 'react-native';
import { styled } from 'nativewind';

const StyledButton = styled(TouchableOpacity);
const StyledText = styled(Text);

interface ButtonProps {
  children: React.ReactNode;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
  className?: string;
}

export function Button({ children, onPress, variant = 'primary', className = '' }: ButtonProps) {
  const baseClasses = 'py-4 px-6 rounded-xl font-bold';
  const variantClasses = variant === 'primary'
    ? 'bg-primary-400'
    : 'bg-secondary-400';

  return (
    <StyledButton
      className={`${baseClasses} ${variantClasses} ${className}`}
      onPress={onPress}
    >
      <StyledText className="text-white text-center">
        {children}
      </StyledText>
    </StyledButton>
  );
}
```

### Substituições de Componentes HTML → React Native

| HTML                    | React Native                                  |
| ----------------------- | --------------------------------------------- |
| `<div>`                 | `<View>`                                      |
| `<span>`, `<p>`, `<h1>` | `<Text>`                                      |
| `<button>`              | `<TouchableOpacity>` ou `<Pressable>`         |
| `<input>`               | `<TextInput>`                                 |
| `<img>`                 | `<Image>` (de `react-native` ou `expo-image`) |
| `<video>`               | `<Video>` (de `expo-av`)                      |
| `<audio>`               | `Audio.Sound` (de `expo-av`)                  |

---

## Passo 7: Persistência de Dados (AsyncStorage)

Substitua todas as chamadas `localStorage.getItem` e `localStorage.setItem` por `AsyncStorage.getItem` e `AsyncStorage.setItem`.

```typescript
// src/utils/storage.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

// Salvar dados
export async function saveData(key: string, value: any) {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('Erro ao salvar:', error);
  }
}

// Ler dados
export async function getData(key: string) {
  try {
    const value = await AsyncStorage.getItem(key);
    return value ? JSON.parse(value) : null;
  } catch (error) {
    console.error('Erro ao ler:', error);
    return null;
  }
}

// Exemplo de uso
import { saveData, getData } from '../utils/storage';

// Salvar perfil do usuário
await saveData('nath_user', newUser);

// Ler perfil do usuário
const savedUser = await getData('nath_user');
```

---

## Passo 8: Gerenciamento de Mídia

### Permissões

```typescript
// src/utils/permissions.ts
import * as ImagePicker from 'expo-image-picker';
import * as Camera from 'expo-camera';
import * as MediaLibrary from 'expo-media-library';

// Solicitar permissão de câmera
export async function requestCameraPermission() {
  const { status } = await Camera.requestCameraPermissionsAsync();
  return status === 'granted';
}

// Solicitar permissão de galeria
export async function requestMediaLibraryPermission() {
  const { status } = await MediaLibrary.requestPermissionsAsync();
  return status === 'granted';
}
```

### Upload de Imagens

```typescript
// src/utils/imagePicker.ts
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { supabase } from '../services/supabase/supabaseClient';

export async function pickAndUploadImage() {
  // Solicitar permissão
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status !== 'granted') {
    throw new Error('Permissão negada');
  }

  // Abrir seletor de imagem
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    quality: 0.8,
  });

  if (result.canceled) {
    return null;
  }

  // Redimensionar se necessário
  const manipulated = await ImageManipulator.manipulateAsync(
    result.assets[0].uri,
    [{ resize: { width: 800 } }],
    { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
  );

  // Upload para Supabase Storage
  const fileExt = manipulated.uri.split('.').pop();
  const fileName = `${Math.random()}.${fileExt}`;
  const filePath = `uploads/${fileName}`;

  const response = await fetch(manipulated.uri);
  const blob = await response.blob();

  const { data, error } = await supabase.storage.from('images').upload(filePath, blob);

  if (error) throw error;

  // Obter URL pública
  const {
    data: { publicUrl },
  } = supabase.storage.from('images').getPublicUrl(filePath);

  return publicUrl;
}
```

### Reprodução de Áudio/Vídeo

```typescript
// src/utils/mediaPlayer.ts
import { Audio, Video } from 'expo-av';

// Reproduzir áudio
export async function playAudio(uri: string) {
  const { sound } = await Audio.Sound.createAsync({ uri });
  await sound.playAsync();
  return sound;
}

// Reproduzir vídeo
export function VideoPlayer({ uri }: { uri: string }) {
  return (
    <Video
      source={{ uri }}
      useNativeControls
      resizeMode="contain"
      style={{ width: '100%', height: 200 }}
    />
  );
}
```

---

## Passo 9: Haptic Feedback

```typescript
// src/utils/haptics.ts
import * as Haptics from 'expo-haptics';

export const triggerHaptic = {
  light: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light),
  medium: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium),
  heavy: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy),
  success: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success),
  error: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error),
};
```

---

## Passo 10: Integração Google Gemini API

```typescript
// src/services/gemini/geminiService.ts
import { GoogleGenerativeAI } from '@google/genai';
import { GEMINI_API_KEY } from '@env';

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

export async function sendMessageToNathIA(message: string, userProfile: any) {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

  const prompt = `
    Você é a NathIA, uma assistente virtual acolhedora para mães.
    Perfil do usuário: ${JSON.stringify(userProfile)}
    Mensagem: ${message}
  `;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  return response.text();
}

// Para TTS (Text-to-Speech)
export async function generateSpeech(text: string) {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

  // Usar a API de TTS do Gemini (se disponível)
  // Ou integrar com outro serviço de TTS
  return text;
}
```

---

## Passo 11: Notificações (Well-being Alerts)

```typescript
// src/services/notifications/notificationService.ts
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configurar handler de notificações
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// Solicitar permissão
export async function requestNotificationPermission() {
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

// Agendar notificação
export async function scheduleWellbeingReminder(hour: number, minute: number) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Lembrete de Autocuidado',
      body: 'Que tal fazer uma pausa e cuidar de si mesma? 💙',
      sound: true,
    },
    trigger: {
      hour,
      minute,
      repeats: true,
    },
  });
}
```

---

## Passo 12: EAS Build (Compilação e Deploy)

### Instalar EAS CLI

```bash
npm install -g eas-cli
```

### Logar

```bash
eas login
```

### Configurar Build

```bash
eas build:configure
```

Isso criará um arquivo `eas.json` na raiz do projeto. Exemplo:

```json
{
  "cli": {
    "version": ">= 3.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "android": {
        "buildType": "app-bundle"
      }
    }
  },
  "submit": {
    "production": {}
  }
}
```

### Iniciar Build

```bash
# Para Android:
eas build -p android --profile production

# Para iOS:
eas build -p ios --profile production

# Para ambos:
eas build -p all --profile production
```

O EAS enviará seu projeto para a nuvem da Expo, construirá os binários (.apk, .aab, .ipa) e fornecerá links para download ou para submissão às lojas.

---

## Resumo das Vantagens do Supabase

✅ **Tudo em um lugar**: Backend, autenticação, storage e banco de dados  
✅ **Autenticação completa**: Email/Password, Google, Apple, OAuth  
✅ **RLS (Row Level Security)**: Segurança no nível do banco de dados  
✅ **Real-time**: Atualizações em tempo real sem configuração extra  
✅ **Storage**: Upload de imagens/vídeos integrado  
✅ **Functions**: Edge Functions para lógica serverless  
✅ **Gratuito**: Plano gratuito generoso para começar

---

## Próximos Passos

1. ✅ Configurar projeto Expo
2. ✅ Instalar dependências
3. ✅ Configurar Supabase
4. ✅ Adaptar componentes para React Native
5. ✅ Migrar lógica de negócio
6. ✅ Testar em dispositivos reais
7. ✅ Configurar EAS Build
8. ✅ Deploy para lojas

---

**Boa sorte na construção do "Nossa Maternidade Mobile"!** 🚀

Este plano fornece uma base sólida para migrar seu projeto para React Native com Expo, usando Supabase como solução completa de backend e autenticação.
