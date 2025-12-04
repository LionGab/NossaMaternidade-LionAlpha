# 🏆 Documento Definitivo Final: Nossa Maternidade Mobile
## Guia Completo para Deploy nas Stores (Dezembro 2025)

> **Consolidação de 5 análises especializadas + fontes oficiais atualizadas**

---

## 📋 Índice

1. [Resumo Executivo](#1-resumo-executivo)
2.  [Estratégia de Documentos](#2-estratégia-de-documentos)
3.  [Análise de Bugs Críticos](#3-análise-de-bugs-críticos)
4. [Atualizações Obrigatórias 2025](#4-atualizações-obrigatórias-2025)
5. [Segurança e Backend](#5-segurança-e-backend)
6. [Código Refatorado Completo](#6-código-refatorado-completo)
7. [Checklist de Deploy](#7-checklist-de-deploy)
8. [Melhores Práticas](#8-melhores-práticas)
9. [Cronograma de Ação](#9-cronograma-de-ação)
10.  [Comandos Finais](#10-comandos-finais)

---

## 1. Resumo Executivo

### 🎯 O Que É Este App? 

**Nossa Maternidade** é um aplicativo mobile-first para apoiar mães durante toda a jornada da maternidade. Funciona como um "amigo inteligente no bolso" com:

| Funcionalidade | Descrição | Status |
|----------------|-----------|--------|
| 🤖 Chat com IA (NathIA) | Conversa empática usando Google Gemini | ✅ Funcional |
| 📚 Recomendações | Conteúdo personalizado por fase | ✅ Funcional |
| 📊 Análise de Hábitos | Padrões de bem-estar e streaks | ⚠️ MVP Desabilitado |
| 👩‍👩‍👧 Comunidade | Conexão entre mães | ✅ Funcional |
| 📔 Diário | Registro de momentos | ✅ Funcional |
| 🍼 Tracker | Amamentação e sono | ✅ Funcional |

### 🛠️ Stack Tecnológica

```
┌─────────────────────────────────────────────────────────────────┐
│  FRONTEND                                                        │
│  ├── Expo SDK ~54. 0.25 (Dezembro 2025)                          │
│  ├── React Native 0.81.5                                        │
│  ├── React 19.1.0                                               │
│  ├── TypeScript 5.9.2                                           │
│  ├── React Navigation 7.x                                       │
│  └── NativeWind 4.2.1 (Tailwind CSS)                           │
│                                                                  │
│  BACKEND                                                         │
│  ├── Supabase (Auth, Database, Storage, Edge Functions)        │
│  ├── Google Gemini 2.0 Flash (IA)                              │
│  └── Sentry (Monitoramento de erros)                           │
│                                                                  │
│  BUILD & DEPLOY                                                  │
│  ├── EAS Build                                                  │
│  ├── EAS Submit                                                 │
│  └── EAS Update (OTA)                                           │
└─────────────────────────────────────────────────────────────────┘
```

### 📊 Nota de Qualidade Consolidada

| Fonte | Nota | Observação |
|-------|------|------------|
| Doc 1 (Best Practices) | 8. 5/10 | Foco em segurança |
| Doc 2 (Grok) | 7/10 | Visão geral |
| Doc 3 (Manual 2025) | 8.5/10 | Atualizações plataforma |
| Doc 4 (ChatGPT) | 9/10 | Análise de código |
| Doc 5 (Análise Profunda) | 9/10 | Bugs de lógica |
| **CONSOLIDADO** | **8.8/10** | Facilmente vira 9. 5+ |

> O código é como um castelo bem construído – estrutura sólida, arquitetura moderna (orquestrador de agentes IA), documentação excelente.  Faltam apenas ajustes finais para a perfeição.

---

## 2.  Estratégia de Documentos

### 🧠 Qual Documento Usar Para Quê?

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                  │
│   🧠 CÉREBRO (Código) = Doc 4 + Doc 5                           │
│      → Bugs concretos, refatorações, linha por linha            │
│                                                                  │
│   🦴 CORPO (Plataformas 2025) = Doc 3                           │
│      → Android 16, React 19, SafeArea, TextDecoder              │
│                                                                  │
│   🛡️ ESCUDO (Segurança) = Doc 1                                 │
│      → Edge Functions, RLS, API Keys                            │
│                                                                  │
│   🗣️ VOZ (Comunicação) = Doc 2                                  │
│      → README, docs públicas, onboarding de devs                │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 📚 Fontes Oficiais Utilizadas

| Fonte | Link | Uso |
|-------|------|-----|
| Expo SDK 54 Changelog | [expo.dev/changelog/sdk-54](https://expo.dev/changelog/sdk-54) | Configurações atuais |
| React Native 0.81 Blog | [reactnative.dev/blog/2025/08/12/react-native-0.81](https://reactnative.dev/blog/2025/08/12/react-native-0.81) | Edge-to-edge, Android 16 |
| Google Play Target API | [support. google.com](https://support.google.com/googleplay/android-developer/answer/11926878) | Requisitos API 35+ |
| Apple App Review | [developer.apple.com](https://developer.apple.com/app-store/review/guidelines/) | Guidelines iOS |
| React Compiler RC | [react.dev/blog](https://uk.react.dev/blog/2025/04/21/react-compiler-rc) | Otimizações React 19 |
| Expo Encoding | [docs.expo.dev](https://docs.expo.dev/versions/v52.0. 0/sdk/encoding) | TextEncoder/Decoder |
| Apple Privacy Details | [developer.apple.com](https://developer.apple.com/app-store/app-privacy-details/) | Privacy Manifest |
| Android 16 para RN | [blog.mrinalmaheshwari.com](https://blog.mrinalmaheshwari.com/android-16-what-react-native-developers-need-to-know-a66530375209) | Predictive back |

---

## 3.  Análise de Bugs Críticos

### 🔴 Bug #1: Analytics Quebra o Chat (CRÍTICO)

**Arquivos Afetados:**
- `src/agents/maternal/MaternalChatAgent.ts` (linhas 151-158, 377-385)
- `src/agents/content/ContentRecommendationAgent.ts`
- `src/agents/habits/HabitsAnalysisAgent.ts`

**O Problema:**
```typescript
// Se o analytics falhar, TODO o chat para! 
async startSession(userId: string, userContext?: UserContext): Promise<ChatSession> {
  // ...  código criando sessão ... 
  
  // ❌ PROBLEMA: Sem try/catch, erro aqui cancela tudo! 
  await this.callMCP('analytics', 'event. track', {
    name: 'chat_session_started',
    properties: { sessionId: this.currentSession.id, userId, context: userContext }
  });
  // Se analytics falhar → catch geral → usuária recebe mensagem de erro
  // Mesmo que a IA tenha respondido corretamente! 
}
```

> 🎯 **Analogia:** É como parar o jogo de futebol porque o placar eletrônico travou. O gol foi marcado, mas ninguém pode comemorar! 

**Impacto:**
- Usuária vê "Erro técnico" mesmo quando a IA respondeu
- Experiência quebrada por serviço secundário
- Perda de confiança no app

---

### 🔴 Bug #2: Filtro de Tags Elimina Tudo (MÉDIO)

**Arquivo:** `src/agents/content/ContentRecommendationAgent.ts` (linhas 147-154)

**O Problema:**
```typescript
// ❌ Se tags for array vazio [], NADA passa no filtro!
private applyFilters(content: ContentItem[], filters?: RecommendationFilters): ContentItem[] {
  return content.filter(item => {
    // ... 
    if (filters. tags) {
      const hasTag = item.tags.some(tag => filters.tags! .includes(tag));
      if (!hasTag) return false; // []. includes(qualquer) = false sempre! 
    }
    return true;
  });
}
```

> 🎯 **Analogia:** É como uma peneira que segura TUDO quando você não especifica o tamanho dos buracos. Deveria deixar tudo passar!

**Impacto:**
- Zero recomendações exibidas
- Tela vazia sem explicação
- Usuária pensa que não há conteúdo

---

### 🔴 Bug #3: Ordenação de Hábitos Quebrada (CRÍTICO)

**Arquivo:** `src/agents/habits/HabitsAnalysisAgent. ts` (linhas 240-248)

**O Problema:**
```typescript
// ❌ Calcula bestStreak com dados FORA DE ORDEM!
private analyzeHabitPatterns(entries: HabitEntry[]): HabitPattern[] {
  for (const entry of entries) { // ← Ordem original, não cronológica!
    // Se entries = [Dia10, Dia8, Dia9]
    // O cálculo pensa que a sequência "quebrou" no Dia8
  }
}
```

> 🎯 **Analogia:** É como ler as páginas de um diário embaralhadas e achar que a pessoa "parou" de fazer exercício, quando na verdade você só leu fora de ordem!

**Impacto:**
- Streaks calculados incorretamente
- Tendências invertidas (melhora parece piora)
- Dados de progresso não confiáveis

---

### 🔴 Bug #4: Streak Conta Dias Duplicados (MÉDIO)

**Arquivo:** `src/features/wellness/context/WellnessContext.tsx`

**O Problema:**
```typescript
// ❌ Se 2 check-ins no mesmo dia, conta 2x!
const currentStreak = useMemo(() => {
  const sorted = [...checkIns].sort(... );
  // Não filtra datas únicas!
  // Dia 1: check-in A, check-in B → conta como 2 dias! 
}, [checkIns]);
```

**Impacto:**
- Streak inflado artificialmente
- Gamificação perde credibilidade
- Usuária pode perder motivação ao ver número "cair" após correção

---

### 🔴 Bug #5: JSON Parse Sem Proteção (MÉDIO)

**Arquivo:** `src/features/wellness/context/WellnessContext.tsx`

**O Problema:**
```typescript
// ❌ Se JSON estiver corrompido, TODO o carregamento falha!
const loadInitialData = async () => {
  const profileData = await AsyncStorage.getItem('nath_wellness_profile');
  const profile = JSON.parse(profileData); // 💥 Pode crashar!
  setProfile(profile);
};
```

**Impacto:**
- App crasha ao abrir
- Usuária perde acesso a seus dados
- Sem fallback para estado inicial

---

### 🔴 Bug #6: Privacy Policy Não Implementada (CRÍTICO para Stores)

**Arquivo:** `src/features/consent/ConsentScreen.tsx`

**O Problema:**
```typescript
const openPrivacyPolicy = () => {
  logger.info('Abrindo política de privacidade.. .');
  // TODO: Implementar navegação para política ← NÃO FAZ NADA!
};
```

> 🚨 **Apple e Google REJEITAM apps sem link funcional para Política de Privacidade!**

**Impacto:**
- Rejeição garantida em ambas as stores
- Violação de LGPD/GDPR
- Perda de tempo no processo de review

---

### 🔴 Bug #7: Throw Desnecessário Trava Tela (MÉDIO)

**Arquivo:** `src/agents/content/ContentRecommendationAgent.ts`

**O Problema:**
```typescript
async process(input: RecommendationRequest): Promise<RecommendationResult> {
  try {
    // ...  lógica ... 
  } catch (error) {
    logger.error('Erro ao gerar recomendações', error);
    throw error; // ❌ Por que propagar?  Isso trava a tela! 
  }
}
```

**Impacto:**
- Tela congela ou mostra erro genérico
- Sem fallback para conteúdo padrão
- Experiência quebrada

---

### 🟡 Bug #8: useCallback Faltando (PERFORMANCE)

**Arquivo:** `src/contexts/AgentsContext.tsx`

**O Problema:**
```typescript
// ❌ Funções recriadas a cada render!
const AgentsProvider = ({ children }) => {
  const initializeAgent = async (agentName: string) => { ...  };
  const isAgentReady = (agentName: string) => agentStatus[agentName] === true;
  
  // Isso faz o useMemo recriar o value do contexto toda hora
  const value = useMemo(() => ({
    initializeAgent,  // Nova referência a cada render! 
    isAgentReady,     // Nova referência a cada render!
  }), [...]); 
};
```

**Impacto:**
- Re-renders desnecessários em toda a árvore
- Performance degradada em dispositivos mais fracos
- Bateria consumida mais rápido

---

## 4. Atualizações Obrigatórias 2025

### 🔴 4.1 Android 16 Edge-to-Edge (CRÍTICO)

**Fonte:** [React Native 0.81 Blog](https://reactnative.dev/blog/2025/08/12/react-native-0.81)

O Android 16 **proibiu** as barras pretas no topo e fundo.  O app DEVE desenhar a tela inteira. 

**O Problema:**
```typescript
// ❌ SafeAreaView do React Native está DEPRECATED!
import { SafeAreaView } from 'react-native';
```

**A Correção:**

1. **Instalar dependência:**
```bash
npx expo install react-native-safe-area-context
```

2. **Migrar imports:**
```typescript
// ✅ Usar a biblioteca correta
import { SafeAreaView } from 'react-native-safe-area-context';
```

3. **Envolver o App:**
```typescript
// App.tsx
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function App() {
  return (
    <SafeAreaProvider>
      <QueryProvider>
        <ThemeProvider>
          {/* Resto do app */}
        </ThemeProvider>
      </QueryProvider>
    </SafeAreaProvider>
  );
}
```

4. **Configurar Android:**
```properties
# android/gradle.properties
edgeToEdgeEnabled=true
```

5. **Testar em dispositivos:**
- Com notch
- Sem notch
- Com navigation bar gestural
- Com navigation bar de 3 botões

---

### 🔴 4.2 TextDecoder Polyfill (CRÍTICO)

**Fonte:** [Expo Encoding Docs](https://docs.expo.dev/versions/v52. 0.0/sdk/encoding)

O Supabase usa `TextDecoder`, mas o Hermes (motor JS do React Native) precisa de polyfill em algumas situações.

**O Problema:**
```
Error: TextDecoder is not defined
// App crasha no login! 
```

**A Correção:**

1. **Instalar dependências:**
```bash
npm install text-encoding react-native-get-random-values
```

2. **Criar arquivo de polyfills:**

```typescript
// src/polyfills. ts
// =============================================================================
// POLYFILLS PARA REACT NATIVE + SUPABASE
// Este arquivo DEVE ser importado PRIMEIRO no index.ts ou App.tsx
// =============================================================================

import 'react-native-get-random-values';

// TextEncoder/TextDecoder para Supabase
import { TextEncoder, TextDecoder } from 'text-encoding';

if (typeof global. TextEncoder === 'undefined') {
  // @ts-ignore - Polyfill necessário
  global. TextEncoder = TextEncoder;
}

if (typeof global.TextDecoder === 'undefined') {
  // @ts-ignore - Polyfill necessário
  global.TextDecoder = TextDecoder;
}

// URL para algumas libs que esperam
if (typeof global.URL === 'undefined') {
  // @ts-ignore
  global.URL = require('react-native-url-polyfill'). URL;
}

console.log('[Polyfills] Carregados com sucesso');
```

3.  **Importar no index.ts:**
```typescript
// index.ts - PRIMEIRA LINHA! 
import './src/polyfills';

import { registerRootComponent } from 'expo';
import App from './App';

registerRootComponent(App);
```

4. **Configurar para Jest:**
```typescript
// jest.setup.js
import { TextEncoder, TextDecoder } from 'util';

global.TextEncoder = TextEncoder;
global. TextDecoder = TextDecoder;
```

---

### 🟡 4.3 React 19 Compiler (RECOMENDADO)

**Fonte:** [React Compiler RC](https://uk.react.dev/blog/2025/04/21/react-compiler-rc)

O React 19 tem um compilador que otimiza automaticamente.  Menos `useMemo` e `useCallback` manuais! 

**Configuração no `app.config.js`:**
```javascript
module.exports = {
  expo: {
    // ... outras configs
    experiments: {
      reactCompiler: true,
      typedRoutes: true,
      tsconfigPaths: true,
    },
  },
};
```

**Benefícios:**
- Memoização automática
- Menos código boilerplate
- Performance melhor sem esforço

**Cuidados:**
- Testar bem antes de ativar em produção
- Começar por telas menos críticas
- Monitorar comportamento

---

### 🟡 4.4 NativeWind v5 (PERFORMANCE)

A versão 5 compila estilos em tempo de build (mais rápido que runtime). 

**`metro.config.js`:**
```javascript
const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

module.exports = withNativeWind(config, { 
  input: './global.css',
  inlineRem: 16,
});
```

**`babel.config.js`:**
```javascript
module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
      "nativewind/babel",
    ],
  };
};
```

---

### 🟡 4.5 Predictive Back Navigation (Android 16)

**Fonte:** [Android 16 para React Native](https://blog.mrinalmaheshwari.com/android-16-what-react-native-developers-need-to-know-a66530375209)

O Android 16 mostra uma prévia da tela anterior ao arrastar para voltar.

**Verificar:**
- [ ] App não "quebra" o gesto de voltar
- [ ] Transições são suaves
- [ ] Não sobrescreve back com lógicas estranhas
- [ ] Cada tela tem navegação clara

**Configurar:**
```javascript
// app.config.js
android: {
  // ... 
  predictiveBackGestureEnabled: true,
}
```

---

## 5.  Segurança e Backend

### 🔴 5.1 API Key do Gemini Exposta (CRÍTICO)

**Fonte:** [Expo Environment Variables](https://docs. expo.dev/guides/environment-variables/)

**O Problema:**
```typescript
// ❌ A chave está visível no bundle do app!
const GEMINI_KEY = process.env. EXPO_PUBLIC_GEMINI_API_KEY;
// Qualquer pessoa pode extrair essa chave do APK/IPA
```

> 🚨 A Expo documenta oficialmente: "Nunca coloque segredos em variáveis EXPO_PUBLIC_"

**A Correção: Edge Function no Supabase**

1. **Criar função `supabase/functions/chat-gemini/index.ts`:**

```typescript
// supabase/functions/chat-gemini/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server. ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ChatRequest {
  messages: Array<{ role: string; content: string }>;
  systemPrompt?: string;
  context?: Record<string, unknown>;
}

serve(async (req: Request) => {
  // Preflight CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { messages, systemPrompt, context } = await req.json() as ChatRequest;

    // 🔐 Chave segura no servidor - NUNCA vai para o app!
    const GEMINI_KEY = Deno.env. get('GEMINI_API_KEY');
    if (! GEMINI_KEY) {
      console.error('GEMINI_API_KEY não configurada');
      throw new Error('Configuração de IA inválida');
    }

    // Formatar mensagens para Gemini
    const contents = messages.map((msg) => ({
      role: msg.role === 'user' ?  'user' : 'model',
      parts: [{ text: msg.content }],
    }));

    // Adicionar system prompt na primeira mensagem
    if (systemPrompt && contents.length > 0 && contents[0]. role === 'user') {
      contents[0].parts[0].text = `${systemPrompt}\n\nUsuária: ${contents[0].parts[0].text}`;
    }

    // Chamar Gemini 2.0 Flash
    const response = await fetch(
      'https://generativelanguage.googleapis. com/v1beta/models/gemini-2.0-flash:generateContent',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': GEMINI_KEY,
        },
        body: JSON.stringify({
          contents,
          generationConfig: {
            temperature: 0.7,
            topP: 0. 95,
            topK: 40,
            maxOutputTokens: 2048,
          },
          safetySettings: [
            { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
            { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
            { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
            { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
          ],
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response. json();
      console.error('Erro Gemini:', errorData);
      throw new Error(errorData. error?.message || 'Erro na API Gemini');
    }

    const data = await response.json();
    const text = data.candidates? .[0]?.content?. parts?.[0]?.text || '';

    return new Response(
      JSON.stringify({ 
        text, 
        success: true,
        model: 'gemini-2.0-flash',
        timestamp: Date.now(),
      }),
      { 
        headers: { 
          ... corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error('Erro na função chat-gemini:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Não foi possível processar sua mensagem.  Tente novamente.',
        success: false,
        timestamp: Date.now(),
      }),
      { 
        status: 500, 
        headers: { 
          ... corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
});
```

2. **Deploy:**
```bash
# Configurar secret (só precisa fazer uma vez)
npx supabase secrets set GEMINI_API_KEY=sua_chave_real_aqui

# Deploy da função
npx supabase functions deploy chat-gemini

# Testar
curl -X POST 'https://SEU_PROJETO.supabase. co/functions/v1/chat-gemini' \
  -H 'Authorization: Bearer SEU_ANON_KEY' \
  -H 'Content-Type: application/json' \
  -d '{"messages":[{"role":"user","content":"Olá! "}]}'
```

3. **Usar no app:**
```typescript
// src/services/geminiService.ts
import { supabase } from './supabase';
import { logger } from '@/utils/logger';

interface Message {
  role: 'user' | 'assistant' | 'model';
  content: string;
}

interface GeminiResponse {
  text: string;
  error?: string;
}

export async function sendMessageToGemini(
  messages: Message[],
  systemPrompt: string,
  context?: Record<string, unknown>
): Promise<GeminiResponse> {
  try {
    const { data, error } = await supabase. functions. invoke('chat-gemini', {
      body: { messages, systemPrompt, context },
    });

    if (error) {
      logger.error('[GeminiService] Erro na Edge Function', error);
      throw error;
    }

    if (!data?.success) {
      throw new Error(data?.error || 'Resposta inválida');
    }

    return { text: data.text };
    
  } catch (error) {
    logger.error('[GeminiService] Erro ao enviar mensagem', error);
    return {
      text: '',
      error: 'Desculpe, não consegui processar sua mensagem.  Tente novamente.',
    };
  }
}
```

---

### 🔴 5.2 Row Level Security (RLS) no Supabase

Garanta que cada usuária só veja seus próprios dados! 

```sql
-- =============================================================================
-- RLS POLICIES PARA NOSSA MATERNIDADE
-- Execute no SQL Editor do Supabase
-- =============================================================================

-- 1.  HABILITAR RLS EM TODAS AS TABELAS COM DADOS PESSOAIS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE diary_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE habit_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE check_ins ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_consents ENABLE ROW LEVEL SECURITY;

-- 2.  PROFILES: Usuária só vê/edita seu próprio perfil
CREATE POLICY "profiles_select_own" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "profiles_update_own" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "profiles_insert_own" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- 3. DIARY: Usuária só acessa suas próprias entradas
CREATE POLICY "diary_all_own" ON diary_entries
  FOR ALL USING (auth.uid() = user_id);

-- 4. HABITS: Usuária só acessa seus próprios hábitos
CREATE POLICY "habits_all_own" ON habit_entries
  FOR ALL USING (auth.uid() = user_id);

-- 5. CHECK-INS: Usuária só acessa seus próprios check-ins
CREATE POLICY "checkins_all_own" ON check_ins
  FOR ALL USING (auth.uid() = user_id);

-- 6. CHAT: Usuária só acessa suas próprias sessões
CREATE POLICY "chat_sessions_all_own" ON chat_sessions
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "chat_messages_all_own" ON chat_messages
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM chat_sessions 
      WHERE chat_sessions.id = chat_messages.session_id 
      AND chat_sessions.user_id = auth.uid()
    )
  );

-- 7.  CONSENTS: Usuária só acessa seus próprios consentimentos
CREATE POLICY "consents_all_own" ON user_consents
  FOR ALL USING (auth.uid() = user_id);

-- 8.  CONTENT: Conteúdo público pode ser lido por todos (autenticados)
CREATE POLICY "content_select_published" ON content
  FOR SELECT USING (is_published = true AND auth.role() = 'authenticated');

-- 9. VERIFICAR SE RLS ESTÁ ATIVO
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';
```

---

### 🟡 5.3 SecureStore para Tokens

O projeto já usa corretamente!  Verificar implementação:

```typescript
// src/utils/supabaseSecureStorage.ts
import * as SecureStore from 'expo-secure-store';
import { logger } from '@/utils/logger';

const STORAGE_PREFIX = 'supabase_';

export const supabaseSecureStorage = {
  getItem: async (key: string): Promise<string | null> => {
    try {
      const value = await SecureStore.getItemAsync(`${STORAGE_PREFIX}${key}`);
      return value;
    } catch (error) {
      logger.error('[SecureStorage] Erro ao ler', { key, error });
      return null;
    }
  },
  
  setItem: async (key: string, value: string): Promise<void> => {
    try {
      await SecureStore.setItemAsync(`${STORAGE_PREFIX}${key}`, value);
    } catch (error) {
      logger.error('[SecureStorage] Erro ao salvar', { key, error });
    }
  },
  
  removeItem: async (key: string): Promise<void> => {
    try {
      await SecureStore.deleteItemAsync(`${STORAGE_PREFIX}${key}`);
    } catch (error) {
      logger.error('[SecureStorage] Erro ao remover', { key, error });
    }
  },
};

// Migração de AsyncStorage para SecureStore (executar uma vez)
export async function migrateSupabaseSessionToSecureStore(): Promise<void> {
  try {
    const AsyncStorage = require('@react-native-async-storage/async-storage'). default;
    const legacyKey = 'supabase. auth.token';
    
    const legacyValue = await AsyncStorage.getItem(legacyKey);
    if (legacyValue) {
      await supabaseSecureStorage.setItem('auth.token', legacyValue);
      await AsyncStorage.removeItem(legacyKey);
      logger.info('[SecureStorage] Migração concluída com sucesso');
    }
  } catch (error) {
    logger.warn('[SecureStorage] Migração não necessária ou falhou', error);
  }
}
```

---

## 6. Código Refatorado Completo

### 6.1 MaternalChatAgent.ts

```typescript
// src/agents/maternal/MaternalChatAgent.ts
// =============================================================================
// AGENTE DE CHAT MATERNAL - VERSÃO CORRIGIDA
// Correções aplicadas:
// - Analytics em try/catch separado (não bloqueia chat)
// - Tratamento de erros robusto
// - Logging estruturado
// =============================================================================

import { BaseAgent } from '../base/BaseAgent';
import { logger } from '@/utils/logger';
import { sendMessageToGemini } from '@/services/geminiService';

interface UserContext {
  phase?: string;
  babyAge?: number;
  preferences?: Record<string, unknown>;
}

interface ChatSession {
  id: string;
  userId: string;
  startedAt: number;
  messages: ChatMessage[];
  context?: UserContext;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

interface ChatInput {
  message: string;
  userId: string;
  context?: UserContext;
}

interface ChatOutput {
  text: string;
  sessionId?: string;
  timestamp: number;
  error?: boolean;
}

export class MaternalChatAgent extends BaseAgent {
  private currentSession: ChatSession | null = null;
  private readonly MAX_HISTORY = 20;

  // =========================================================================
  // INICIAR SESSÃO
  // =========================================================================
  async startSession(userId: string, userContext?: UserContext): Promise<ChatSession> {
    try {
      // Criar ou recuperar sessão existente
      this.currentSession = await this.getOrCreateSession(userId, userContext);
      
      // ✅ Analytics em try/catch separado - não bloqueia o chat! 
      this.trackEventSafely('chat_session_started', {
        sessionId: this.currentSession.id,
        userId,
        hasContext: !!userContext,
        phase: userContext?. phase,
      });
      
      // Persistir sessão (fire and forget com tratamento)
      this.persistSession(). catch((error) => {
        logger.error('[MaternalChatAgent] Erro ao persistir sessão inicial', error);
      });
      
      logger.info('[MaternalChatAgent] Sessão iniciada', { 
        sessionId: this.currentSession.id 
      });
      
      return this. currentSession;
      
    } catch (error) {
      logger.error('[MaternalChatAgent] Erro ao iniciar sessão', error);
      
      // Criar sessão mínima para não bloquear o usuário
      this.currentSession = {
        id: `fallback-${Date. now()}`,
        userId,
        startedAt: Date.now(),
        messages: [],
        context: userContext,
      };
      
      return this.currentSession;
    }
  }

  // =========================================================================
  // PROCESSAR MENSAGEM
  // =========================================================================
  async process(input: ChatInput): Promise<ChatOutput> {
    const { message, userId, context } = input;
    const startTime = Date.now();
    
    try {
      // Garantir que temos uma sessão
      if (!this. currentSession) {
        await this.startSession(userId, context);
      }
      
      // 1. Verificar se é situação de crise
      const crisisCheck = await this.detectCrisis(message);
      if (crisisCheck. isCrisis) {
        logger.warn('[MaternalChatAgent] Crise detectada', { 
          type: crisisCheck. type,
          userId 
        });
        return this.handleCrisisResponse(crisisCheck);
      }
      
      // 2. Moderar conteúdo
      const moderation = await this.moderateContent(message);
      if (! moderation.isAppropriate) {
        return this.handleModerationResponse(moderation);
      }
      
      // 3. Preparar histórico para contexto
      const history = this.prepareHistory();
      
      // 4. Obter resposta da IA
      const systemPrompt = this.buildSystemPrompt(context);
      const response = await sendMessageToGemini(
        [... history, { role: 'user', content: message }],
        systemPrompt,
        context
      );
      
      if (response.error) {
        throw new Error(response. error);
      }
      
      // 5. Adicionar ao histórico
      await this.addToHistory(message, response.text);
      
      // 6. Analytics (não bloqueia resposta)
      const latency = Date.now() - startTime;
      this.trackEventSafely('chat_message_exchanged', {
        sessionId: this. currentSession?. id,
        userId,
        latencyMs: latency,
        messageLength: message.length,
        responseLength: response.text.length,
      });
      
      logger.debug('[MaternalChatAgent] Mensagem processada', { latency });
      
      return {
        text: response.text,
        sessionId: this.currentSession?.id,
        timestamp: Date.now(),
      };
      
    } catch (error) {
      logger. error('[MaternalChatAgent] Erro ao processar mensagem', error);
      
      // ✅ Resposta amigável em vez de erro técnico
      return {
        text: 'Desculpe, estou tendo dificuldades técnicas no momento. Pode repetir sua mensagem?  💕',
        sessionId: this.currentSession?.id,
        timestamp: Date.now(),
        error: true,
      };
    }
  }

  // =========================================================================
  // HELPERS PRIVADOS
  // =========================================================================
  
  /**
   * Tracking seguro - NUNCA bloqueia o fluxo principal
   */
  private trackEventSafely(name: string, properties: Record<string, unknown>): void {
    try {
      // Fire and forget - não espera resultado
      this.callMCP('analytics', 'event. track', { name, properties })
        .catch((error) => {
          logger.warn(`[MaternalChatAgent] Analytics falhou para ${name}`, { error });
        });
    } catch (error) {
      // Nem o try/catch externo pode falhar
      logger. warn(`[MaternalChatAgent] Erro ao preparar analytics`, { error });
    }
  }

  private async getOrCreateSession(userId: string, context?: UserContext): Promise<ChatSession> {
    // Tentar recuperar sessão existente do dia
    const existingSession = await this. loadTodaySession(userId);
    
    if (existingSession) {
      existingSession.context = { ...existingSession.context, ...context };
      return existingSession;
    }
    
    // Criar nova sessão
    return {
      id: `session-${userId}-${Date.now()}`,
      userId,
      startedAt: Date.now(),
      messages: [],
      context,
    };
  }

  private async loadTodaySession(userId: string): Promise<ChatSession | null> {
    try {
      // Implementar busca de sessão do dia
      // Por enquanto retorna null (sempre cria nova)
      return null;
    } catch (error) {
      logger. warn('[MaternalChatAgent] Erro ao carregar sessão existente', error);
      return null;
    }
  }

  private prepareHistory(): Array<{ role: string; content: string }> {
    if (!this.currentSession) return [];
    
    // Pegar últimas N mensagens para contexto
    return this.currentSession.messages
      .slice(-this.MAX_HISTORY)
      .map(msg => ({
        role: msg.role,
        content: msg.content,
      }));
  }

  private buildSystemPrompt(context?: UserContext): string {
    const basePrompt = `
Você é a MãesValente, a assistente virtual de IA do app "Nossa Maternidade". 

Seu tom de voz é:
- Acolhedor, calmo, direto, sem infantilizar
- Você usa a 2ª pessoa ("você")
- Você fala português do Brasil
- Você é próxima, carinhosa, vulnerável, mas firme
- Você NÃO é uma guru perfeita; você entende que a maternidade é difícil

Regras OBRIGATÓRIAS:
1. Sempre comece acolhendo a emoção da usuária
2.  Faça perguntas abertas para entender melhor
3.  NUNCA dê diagnósticos médicos
4.  Mantenha as respostas concisas (máximo 3 parágrafos curtos)
5.  Se detectar sinais de crise, oriente a buscar ajuda profissional
`;

    if (context?.phase) {
      return `${basePrompt}\n\nContexto: A mãe está na fase "${context.phase}". `;
    }
    
    return basePrompt;
  }

  private async addToHistory(userMessage: string, assistantResponse: string): Promise<void> {
    if (!this.currentSession) return;
    
    this.currentSession. messages.push(
      { role: 'user', content: userMessage, timestamp: Date.now() },
      { role: 'assistant', content: assistantResponse, timestamp: Date.now() }
    );
    
    // Limitar tamanho do histórico
    if (this.currentSession.messages.length > this.MAX_HISTORY * 2) {
      this.currentSession.messages = this.currentSession. messages.slice(-this.MAX_HISTORY * 2);
    }
    
    await this.persistSession();
  }

  private async persistSession(): Promise<void> {
    // Implementar persistência (AsyncStorage, Supabase, etc.)
  }

  private async detectCrisis(message: string): Promise<{ isCrisis: boolean; type?: string }> {
    // Implementar detecção de crise
    const crisisKeywords = [
      'não aguento mais',
      'quero morrer',
      'me machucar',
      'suicídio',
      'desistir de tudo',
    ];
    
    const lowerMessage = message. toLowerCase();
    const foundKeyword = crisisKeywords.find(kw => lowerMessage.includes(kw));
    
    return {
      isCrisis: !!foundKeyword,
      type: foundKeyword ?  'mental_health' : undefined,
    };
  }

  private handleCrisisResponse(crisis: { isCrisis: boolean; type?: string }): ChatOutput {
    return {
      text: `Percebo que você está passando por um momento muito difícil. 💕

Quero que você saiba que não está sozinha. Se estiver pensando em se machucar, por favor ligue agora para o CVV (Centro de Valorização da Vida): 188. 

O atendimento é 24 horas, gratuito e sigiloso. Eles podem te ajudar. 

Você é importante e merece apoio profissional neste momento. ❤️`,
      sessionId: this. currentSession?.id,
      timestamp: Date.now(),
    };
  }

  private async moderateContent(message: string): Promise<{ isAppropriate: boolean; reason?: string }> {
    // Implementar moderação básica
    return { isAppropriate: true };
  }

  private handleModerationResponse(moderation: { isAppropriate: boolean; reason?: string }): ChatOutput {
    return {
      text: 'Desculpe, não consegui processar essa mensagem. Pode reformular de outra forma? ',
      sessionId: this.currentSession?.id,
      timestamp: Date.now(),
    };
  }
}

export const maternalChatAgent = new MaternalChatAgent();
```

---

### 6.2 ContentRecommendationAgent.ts

```typescript
// src/agents/content/ContentRecommendationAgent.ts
// =============================================================================
// AGENTE DE RECOMENDAÇÃO DE CONTEÚDO - VERSÃO CORRIGIDA
// Correções aplicadas:
// - Filtro de tags vazio não elimina tudo
// - Return fallback em vez de throw
// - Analytics seguro
// =============================================================================

import { BaseAgent } from '../base/BaseAgent';
import { logger } from '@/utils/logger';

interface ContentItem {
  id: string;
  title: string;
  description: string;
  type: 'article' | 'video' | 'tip' | 'story';
  category: string;
  tags: string[];
  score?: number;
}

interface RecommendationFilters {
  types?: string[];
  categories?: string[];
  tags?: string[];
}

interface UserProfile {
  phase?: string;
  interests?: string[];
  babyAge?: number;
}

interface RecommendationRequest {
  userId: string;
  userProfile: UserProfile;
  contentPool: ContentItem[];
  maxResults?: number;
  filters?: RecommendationFilters;
}

interface RecommendationResult {
  recommendations: ContentItem[];
  reasoning: string;
  confidence: number;
  timestamp: number;
}

export class ContentRecommendationAgent extends BaseAgent {
  
  async process(input: RecommendationRequest): Promise<RecommendationResult> {
    const { userId, userProfile, contentPool, maxResults = 10, filters } = input;
    const startTime = Date.now();
    
    try {
      // Analytics seguro (não bloqueia)
      this.trackEventSafely('content_recommendation_requested', {
        userId,
        poolSize: contentPool. length,
        hasFilters: !! filters,
        maxResults,
      });
      
      // 1. Aplicar filtros
      const filteredContent = this.applyFilters(contentPool, filters);
      
      if (filteredContent. length === 0) {
        logger.info('[ContentRecommendation] Nenhum conteúdo após filtros', {
          originalSize: contentPool.length,
          filters,
        });
        
        return {
          recommendations: [],
          reasoning: 'Não encontramos conteúdo com os filtros selecionados.  Tente remover alguns filtros.',
          confidence: 0,
          timestamp: Date. now(),
        };
      }
      
      // 2. Pontuar conteúdo baseado no perfil
      const scoredContent = await this.scoreContent(filteredContent, userProfile);
      
      // 3. Otimizar diversidade
      const diversifiedContent = this. optimizeDiversity(scoredContent);
      
      // 4. Limitar resultados
      const recommendations = diversifiedContent.slice(0, maxResults);
      
      // 5. Gerar explicação
      const reasoning = await this.generateReasoning(recommendations, userProfile);
      
      // 6. Calcular confiança
      const confidence = this.calculateConfidence(recommendations, userProfile);
      
      const result: RecommendationResult = {
        recommendations,
        reasoning,
        confidence,
        timestamp: Date.now(),
      };
      
      // Analytics de sucesso
      const latency = Date. now() - startTime;
      this. trackEventSafely('content_recommendations_delivered', {
        userId,
        count: recommendations.length,
        confidence,
        latencyMs: latency,
      });
      
      return result;
      
    } catch (error) {
      logger.error('[ContentRecommendation] Erro ao gerar recomendações', error);
      
      // ✅ Retornar resultado padrão em vez de throw! 
      return {
        recommendations: [],
        reasoning: 'Não foi possível carregar recomendações no momento. Tente novamente em alguns instantes.',
        confidence: 0,
        timestamp: Date. now(),
      };
    }
  }

  /**
   * Aplica filtros de forma robusta
   * ✅ CORREÇÃO: Arrays vazios não filtram (deixam passar tudo)
   */
  private applyFilters(content: ContentItem[], filters?: RecommendationFilters): ContentItem[] {
    if (! filters) return content;
    
    return content.filter(item => {
      // Filtro por tipo - SÓ aplica se tiver tipos especificados
      if (filters.types && filters.types.length > 0) {
        if (! filters.types.includes(item.type)) {
          return false;
        }
      }
      
      // Filtro por categoria - SÓ aplica se tiver categorias especificadas
      if (filters.categories && filters.categories.length > 0) {
        if (!filters. categories.includes(item.category)) {
          return false;
        }
      }
      
      // ✅ Filtro por tags - SÓ aplica se tiver tags especificadas E não for vazio
      if (filters.tags && filters.tags.length > 0) {
        const hasMatchingTag = item.tags.some(tag => filters.tags! .includes(tag));
        if (!hasMatchingTag) {
          return false;
        }
      }
      
      return true;
    });
  }

  private async scoreContent(content: ContentItem[], profile: UserProfile): Promise<ContentItem[]> {
    return content.map(item => {
      let score = 50; // Base score
      
      // Boost por fase da mãe
      if (profile.phase && item.tags.includes(profile. phase)) {
        score += 20;
      }
      
      // Boost por interesses
      if (profile. interests) {
        const matchingInterests = item.tags.filter(tag => 
          profile.interests! .includes(tag)
        );
        score += matchingInterests.length * 10;
      }
      
      // Boost por idade do bebê
      if (profile.babyAge !== undefined) {
        // Lógica de relevância por idade
        score += 5;
      }
      
      return { ...item, score };
    }). sort((a, b) => (b.score || 0) - (a.score || 0));
  }

  private optimizeDiversity(content: ContentItem[]): ContentItem[] {
    // Garantir variedade de tipos
    const result: ContentItem[] = [];
    const typeCount: Record<string, number> = {};
    const maxPerType = 3;
    
    for (const item of content) {
      const currentCount = typeCount[item.type] || 0;
      if (currentCount < maxPerType) {
        result.push(item);
        typeCount[item.type] = currentCount + 1;
      }
    }
    
    return result;
  }

  private async generateReasoning(recommendations: ContentItem[], profile: UserProfile): Promise<string> {
    if (recommendations.length === 0) {
      return 'Não encontramos conteúdo relevante para seu perfil no momento.';
    }
    
    const types = [... new Set(recommendations. map(r => r.type))];
    const typeNames: Record<string, string> = {
      article: 'artigos',
      video: 'vídeos',
      tip: 'dicas',
      story: 'histórias',
    };
    
    const typeList = types.map(t => typeNames[t] || t). join(', ');
    
    return `Selecionamos ${recommendations.length} conteúdos para você: ${typeList}. ` +
           `Baseado no seu momento${profile.phase ? ` (${profile.phase})` : ''} e interesses.`;
  }

  private calculateConfidence(recommendations: ContentItem[], profile: UserProfile): number {
    if (recommendations.length === 0) return 0;
    
    const avgScore = recommendations.reduce((sum, r) => sum + (r.score || 50), 0) / recommendations.length;
    return Math.min(100, Math. round(avgScore));
  }

  private trackEventSafely(name: string, properties: Record<string, unknown>): void {
    try {
      this.callMCP('analytics', 'event.track', { name, properties })
        .catch((error) => {
          logger.warn(`[ContentRecommendation] Analytics falhou para ${name}`, { error });
        });
    } catch (error) {
      logger.warn(`[ContentRecommendation] Erro ao preparar analytics`, { error });
    }
  }
}

export const contentRecommendationAgent = new ContentRecommendationAgent();
```

---

### 6.3 HabitsAnalysisAgent.ts

```typescript
// src/agents/habits/HabitsAnalysisAgent.ts
// =============================================================================
// AGENTE DE ANÁLISE DE HÁBITOS - VERSÃO CORRIGIDA
// Correções aplicadas:
// - Ordenação por data ANTES de qualquer cálculo
// - Streak calculado corretamente
// - Tendência calculada corretamente
// =============================================================================

import { BaseAgent } from '../base/BaseAgent';
import { logger } from '@/utils/logger';

interface HabitEntry {
  id: string;
  habitId: string;
  habitName: string;
  date: string; // ISO date string
  completed: boolean;
  notes?: string;
}

interface HabitPattern {
  habitId: string;
  habitName: string;
  completionRate: number;
  currentStreak: number;
  bestStreak: number;
  trend: 'improving' | 'stable' | 'declining';
  insights: string[];
}

interface WellbeingAnalysis {
  patterns: HabitPattern[];
  overallScore: number;
  recommendations: string[];
  timestamp: number;
}

interface AnalysisInput {
  userId: string;
  entries: HabitEntry[];
  timeRange?: { start: string; end: string };
}

export class HabitsAnalysisAgent extends BaseAgent {

  async process(input: AnalysisInput): Promise<WellbeingAnalysis> {
    const { userId, entries, timeRange } = input;
    
    try {
      // Analytics seguro
      this.trackEventSafely('habits_analysis_requested', {
        userId,
        entriesCount: entries. length,
        hasTimeRange: !! timeRange,
      });
      
      // 1.  Filtrar por período se especificado
      let filteredEntries = entries;
      if (timeRange) {
        filteredEntries = this.filterByTimeRange(entries, timeRange);
      }
      
      // ✅ 2.  ORDENAR POR DATA ANTES DE QUALQUER ANÁLISE
      const sortedEntries = this.sortByDate(filteredEntries);
      
      // 3.  Analisar padrões (com dados ordenados!)
      const patterns = await this.analyzeHabitPatterns(sortedEntries);
      
      // 4. Calcular score geral
      const overallScore = this. calculateOverallScore(patterns);
      
      // 5.  Gerar recomendações
      const recommendations = await this.generateRecommendations(patterns, overallScore);
      
      const result: WellbeingAnalysis = {
        patterns,
        overallScore,
        recommendations,
        timestamp: Date.now(),
      };
      
      // Analytics de sucesso
      this.trackEventSafely('habits_analysis_completed', {
        userId,
        patternsCount: patterns.length,
        overallScore,
      });
      
      return result;
      
    } catch (error) {
      logger.error('[HabitsAnalysis] Erro na análise', error);
      
      // Retorno seguro
      return {
        patterns: [],
        overallScore: 0,
        recommendations: ['Não foi possível analisar seus hábitos no momento.  Tente novamente. '],
        timestamp: Date.now(),
      };
    }
  }

  /**
   * ✅ CORREÇÃO: Ordenar entradas por data CRESCENTE
   */
  private sortByDate(entries: HabitEntry[]): HabitEntry[] {
    return [... entries].sort((a, b) => {
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    });
  }

  private filterByTimeRange(
    entries: HabitEntry[], 
    range: { start: string; end: string }
  ): HabitEntry[] {
    const startDate = new Date(range.start). getTime();
    const endDate = new Date(range.end). getTime();
    
    return entries. filter(entry => {
      const entryDate = new Date(entry.date).getTime();
      return entryDate >= startDate && entryDate <= endDate;
    });
  }

  /**
   * Analisa padrões de cada hábito
   * IMPORTANTE: entries DEVE estar ordenado por data crescente!
   */
  private async analyzeHabitPatterns(entries: HabitEntry[]): Promise<HabitPattern[]> {
    // Agrupar por hábito
    const habitGroups = this.groupByHabit(entries);
    const patterns: HabitPattern[] = [];
    
    for (const [habitId, habitEntries] of Object.entries(habitGroups)) {
      // habitEntries já está ordenado (herdado de entries)
      const habitName = habitEntries[0]?.habitName || habitId;
      
      // Taxa de conclusão
      const completedCount = habitEntries. filter(e => e.completed). length;
      const completionRate = habitEntries.length > 0 
        ? (completedCount / habitEntries.length) * 100 
        : 0;
      
      // ✅ Calcular streaks corretamente (dados já ordenados!)
      const { currentStreak, bestStreak } = this. calculateStreaks(habitEntries);
      
      // ✅ Detectar tendência corretamente (dados já ordenados!)
      const trend = this. detectTrend(habitEntries);
      
      // Gerar insights
      const insights = this.generateInsights({
        completionRate,
        currentStreak,
        bestStreak,
        trend,
      });
      
      patterns.push({
        habitId,
        habitName,
        completionRate: Math.round(completionRate),
        currentStreak,
        bestStreak,
        trend,
        insights,
      });
    }
    
    // Ordenar por taxa de conclusão (melhor primeiro)
    return patterns.sort((a, b) => b. completionRate - a.completionRate);
  }

  private groupByHabit(entries: HabitEntry[]): Record<string, HabitEntry[]> {
    const groups: Record<string, HabitEntry[]> = {};
    
    for (const entry of entries) {
      if (!groups[entry. habitId]) {
        groups[entry. habitId] = [];
      }
      groups[entry.habitId].push(entry);
    }
    
    return groups;
  }

  /**
   * ✅ CORREÇÃO: Calcula streaks com dados ordenados por data
   * entries DEVE estar ordenado por data CRESCENTE
   */
  private calculateStreaks(entries: HabitEntry[]): { currentStreak: number; bestStreak: number } {
    if (entries.length === 0) {
      return { currentStreak: 0, bestStreak: 0 };
    }
    
    let currentStreak = 0;
    let bestStreak = 0;
    let tempStreak = 0;
    let lastDate: Date | null = null;
    
    // Iterar em ordem cronológica (já ordenado!)
    for (const entry of entries) {
      if (! entry.completed) {
        // Quebrou a sequência
        if (tempStreak > bestStreak) {
          bestStreak = tempStreak;
        }
        tempStreak = 0;
        lastDate = null;
        continue;
      }
      
      const entryDate = new Date(entry.date);
      entryDate.setHours(0, 0, 0, 0);
      
      if (lastDate) {
        const diffDays = Math.floor(
          (entryDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24)
        );
        
        if (diffDays === 1) {
          // Dia consecutivo
          tempStreak++;
        } else if (diffDays > 1) {
          // Pulou dias - reinicia streak
          if (tempStreak > bestStreak) {
            bestStreak = tempStreak;
          }
          tempStreak = 1;
        }
        // Se diffDays === 0, mesmo dia, não incrementa
      } else {
        // Primeiro dia completado
        tempStreak = 1;
      }

Agora monte a versão final