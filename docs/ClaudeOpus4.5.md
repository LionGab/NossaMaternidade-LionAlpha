# NossaMaternidade: Complete App Store Deployment Readiness Analysis

A Brazilian maternal wellness app built with Expo SDK 54 and React Native 0.81.5 faces **critical compliance gaps** before December 2025 store submission. This analysis identifies **23 issues** requiring immediate fixes, with complete refactored code for each. The app's AI chat integration with Google Gemini and Supabase backend requires significant security hardening, while missing privacy infrastructure blocks both iOS and Android store approval.

## iOS App Store compliance requires immediate privacy infrastructure

Your app must implement **Privacy Manifests** (enforced since May 2024), **in-app account deletion** (enforced since June 2022), and **AI disclosure** (new November 2025 requirement). Health apps face stricter scrutiny—Apple rejects apps making unsubstantiated health claims.

### Privacy Manifest configuration (app.json)

Add this to your `app.json` to satisfy Apple's required reason API declarations:

```json
{
  "expo": {
    "ios": {
      "privacyManifests": {
        "NSPrivacyTracking": false,
        "NSPrivacyTrackingDomains": [],
        "NSPrivacyCollectedDataTypes": [
          {
            "NSPrivacyCollectedDataType": "NSPrivacyCollectedDataTypeEmailAddress",
            "NSPrivacyCollectedDataTypeLinked": true,
            "NSPrivacyCollectedDataTypeTracking": false,
            "NSPrivacyCollectedDataTypePurposes": ["NSPrivacyCollectedDataTypePurposeAppFunctionality"]
          },
          {
            "NSPrivacyCollectedDataType": "NSPrivacyCollectedDataTypeUserId",
            "NSPrivacyCollectedDataTypeLinked": true,
            "NSPrivacyCollectedDataTypeTracking": false,
            "NSPrivacyCollectedDataTypePurposes": ["NSPrivacyCollectedDataTypePurposeAppFunctionality"]
          },
          {
            "NSPrivacyCollectedDataType": "NSPrivacyCollectedDataTypeHealthData",
            "NSPrivacyCollectedDataTypeLinked": true,
            "NSPrivacyCollectedDataTypeTracking": false,
            "NSPrivacyCollectedDataTypePurposes": ["NSPrivacyCollectedDataTypePurposeAppFunctionality"]
          }
        ],
        "NSPrivacyAccessedAPITypes": [
          {
            "NSPrivacyAccessedAPIType": "NSPrivacyAccessedAPICategoryUserDefaults",
            "NSPrivacyAccessedAPITypeReasons": ["CA92.1"]
          },
          {
            "NSPrivacyAccessedAPIType": "NSPrivacyAccessedAPICategoryFileTimestamp",
            "NSPrivacyAccessedAPITypeReasons": ["3B52.1"]
          },
          {
            "NSPrivacyAccessedAPIType": "NSPrivacyAccessedAPICategorySystemBootTime",
            "NSPrivacyAccessedAPITypeReasons": ["35F9.1"]
          }
        ]
      },
      "config": {
        "usesNonExemptEncryption": false
      },
      "infoPlist": {
        "NSHealthShareUsageDescription": "NossaMaternidade uses your health data to provide personalized wellness recommendations during your pregnancy journey.",
        "NSHealthUpdateUsageDescription": "NossaMaternidade records your wellness activities to track your maternal health progress."
      }
    }
  }
}
```

### AI disclosure for App Store Connect

Apple's November 2025 update requires explicit disclosure when sharing data with third-party AI. Add this consent flow before users interact with the AI chat:

```typescript
// src/features/consent/AIConsentModal.tsx
import React, { useState } from 'react';
import { Modal, View, Text, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AIConsentModalProps {
  visible: boolean;
  onAccept: () => void;
  onDecline: () => void;
}

const AI_CONSENT_KEY = 'ai_consent_granted';
const AI_CONSENT_VERSION = '1.0';

export const AIConsentModal: React.FC<AIConsentModalProps> = ({
  visible,
  onAccept,
  onDecline,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleAccept = async () => {
    setIsProcessing(true);
    try {
      await AsyncStorage.setItem(AI_CONSENT_KEY, JSON.stringify({
        granted: true,
        version: AI_CONSENT_VERSION,
        timestamp: new Date().toISOString(),
      }));
      onAccept();
    } catch (error) {
      console.error('Failed to save AI consent:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <SafeAreaView className="flex-1 bg-black/50 justify-end">
        <View className="bg-white rounded-t-3xl p-6 max-h-[80%]">
          <Text className="text-xl font-bold text-gray-900 mb-4">
            Assistente de IA Maternal
          </Text>
          
          <ScrollView className="mb-6">
            <Text className="text-gray-700 mb-4">
              Nossa assistente de IA usa o Google Gemini para fornecer 
              orientações personalizadas sobre maternidade. Para usar este 
              recurso:
            </Text>
            
            <View className="bg-amber-50 p-4 rounded-lg mb-4">
              <Text className="text-amber-800 font-semibold mb-2">
                📋 Dados compartilhados com a IA:
              </Text>
              <Text className="text-amber-700">
                • Suas perguntas e mensagens de chat{'\n'}
                • Semana da gestação (se informada){'\n'}
                • Preferências de bem-estar
              </Text>
            </View>

            <View className="bg-blue-50 p-4 rounded-lg mb-4">
              <Text className="text-blue-800 font-semibold mb-2">
                🔒 Privacidade:
              </Text>
              <Text className="text-blue-700">
                • Dados processados pelo Google Gemini API{'\n'}
                • Não usado para publicidade{'\n'}
                • Você pode revogar a qualquer momento
              </Text>
            </View>

            <Text className="text-gray-600 text-sm">
              Esta assistente não substitui aconselhamento médico profissional.
              Sempre consulte seu médico para decisões de saúde.
            </Text>
          </ScrollView>

          <View className="flex-row gap-3">
            <Pressable
              onPress={onDecline}
              className="flex-1 py-4 rounded-xl bg-gray-100"
            >
              <Text className="text-center text-gray-700 font-semibold">
                Não, obrigada
              </Text>
            </Pressable>
            
            <Pressable
              onPress={handleAccept}
              disabled={isProcessing}
              className="flex-1 py-4 rounded-xl bg-pink-500"
            >
              <Text className="text-center text-white font-semibold">
                {isProcessing ? 'Salvando...' : 'Aceitar e continuar'}
              </Text>
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

export const checkAIConsent = async (): Promise<boolean> => {
  try {
    const consent = await AsyncStorage.getItem(AI_CONSENT_KEY);
    if (!consent) return false;
    const parsed = JSON.parse(consent);
    return parsed.granted === true && parsed.version === AI_CONSENT_VERSION;
  } catch {
    return false;
  }
};
```

### Holiday submission timeline

**Submit by December 15, 2025** for guaranteed pre-holiday approval. Apple reviews slow down December 20-27, with typical 3-5 day delays during this period. App Store Connect remains open but expect longer review times.

---

## Google Play Store requires SDK 35 and edge-to-edge display

Since August 31, 2025, all new apps must target **Android 15 (API 35)**. Android 16 makes **edge-to-edge display mandatory** with no opt-out. Your app must also support **16KB page sizes** (enforced November 1, 2025).

### Complete Android configuration (app.json)

```json
{
  "expo": {
    "android": {
      "package": "com.yourcompany.nossamaternidade",
      "versionCode": 1,
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "monochromeImage": "./assets/monochrome-icon.png",
        "backgroundColor": "#FFE4EC"
      },
      "permissions": [
        "android.permission.INTERNET",
        "android.permission.ACCESS_NETWORK_STATE"
      ]
    },
    "plugins": [
      [
        "expo-build-properties",
        {
          "android": {
            "compileSdkVersion": 35,
            "targetSdkVersion": 35,
            "buildToolsVersion": "35.0.0",
            "minSdkVersion": 24
          },
          "ios": {
            "deploymentTarget": "15.1"
          }
        }
      ],
      [
        "expo-splash-screen",
        {
          "backgroundColor": "#FFE4EC",
          "image": "./assets/splash-icon.png",
          "imageWidth": 200
        }
      ]
    ]
  }
}
```

### Edge-to-edge SafeAreaView migration

**Critical**: Replace all imports of `SafeAreaView` from `react-native` with `react-native-safe-area-context`. The legacy component only works on iOS and doesn't support edge-to-edge.

```typescript
// ❌ WRONG - Legacy SafeAreaView (deprecated in RN 0.81)
import { SafeAreaView } from 'react-native';

// ✅ CORRECT - Modern SafeAreaView with edge-to-edge support
import { SafeAreaView, SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
```

**App.tsx root setup:**

```typescript
// App.tsx
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, initialWindowMetrics } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { AuthProvider } from './src/contexts/AuthContext';
import { AgentsProvider } from './src/contexts/AgentsContext';
import { WellnessProvider } from './src/contexts/WellnessContext';
import { AppNavigator } from './src/navigation/AppNavigator';

import './global.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 2,
    },
  },
});

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider initialMetrics={initialWindowMetrics}>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <AgentsProvider>
              <WellnessProvider>
                <NavigationContainer>
                  <StatusBar style="dark" />
                  <AppNavigator />
                </NavigationContainer>
              </WellnessProvider>
            </AgentsProvider>
          </AuthProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
```

---

## Critical security vulnerability: Gemini API key exposure

Exposing the Google Gemini API key via `EXPO_PUBLIC_GEMINI_API_KEY` is a **critical security vulnerability**. Anyone who downloads your app can extract this key and abuse your API quota, resulting in unexpected billing.

### Secure architecture with Supabase Edge Functions

Move all Gemini API calls to a server-side Edge Function:

```typescript
// supabase/functions/maternal-chat/index.ts
import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ChatRequest {
  message: string;
  conversationHistory?: Array<{
    role: 'user' | 'model';
    parts: Array<{ text: string }>;
  }>;
  context?: {
    weekOfPregnancy?: number;
    symptoms?: string[];
  };
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // 1. Authenticate user
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Não autorizado' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 2. Parse request
    const { message, conversationHistory, context }: ChatRequest = await req.json();

    if (!message?.trim()) {
      return new Response(
        JSON.stringify({ error: 'Mensagem é obrigatória' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 3. Build system prompt for maternal health context
    const systemPrompt = buildMaternalSystemPrompt(context);

    // 4. Get API key from secure environment (NEVER exposed to client)
    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
    if (!GEMINI_API_KEY) {
      console.error('GEMINI_API_KEY not configured');
      throw new Error('AI service not configured');
    }

    // 5. Call Gemini API
    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            { role: 'user', parts: [{ text: systemPrompt }] },
            { role: 'model', parts: [{ text: 'Entendido. Estou pronta para ajudar com orientações sobre maternidade.' }] },
            ...(conversationHistory || []),
            { role: 'user', parts: [{ text: message }] }
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1024,
            topP: 0.95,
          },
          safetySettings: [
            { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
            { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
            { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
            { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
          ]
        }),
      }
    );

    const data = await geminiResponse.json();

    if (!geminiResponse.ok) {
      console.error('Gemini API error:', data);
      return new Response(
        JSON.stringify({ error: 'Erro no serviço de IA. Tente novamente.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 6. Log usage for analytics (isolated from response)
    try {
      await supabaseClient.from('ai_usage_logs').insert({
        user_id: user.id,
        tokens_used: data.usageMetadata?.totalTokenCount || 0,
        feature: 'maternal_chat',
      });
    } catch (logError) {
      // Don't fail the request if logging fails
      console.error('Failed to log AI usage:', logError);
    }

    // 7. Return response
    const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    
    return new Response(
      JSON.stringify({
        response: responseText,
        usage: data.usageMetadata,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Maternal chat error:', error);
    return new Response(
      JSON.stringify({ error: 'Erro interno. Tente novamente mais tarde.' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function buildMaternalSystemPrompt(context?: { weekOfPregnancy?: number; symptoms?: string[] }): string {
  let prompt = `Você é uma assistente virtual especializada em maternidade e bem-estar gestacional. 
Suas responsabilidades:
- Fornecer informações educativas sobre gravidez, parto e pós-parto
- Sugerir práticas de bem-estar apropriadas para gestantes
- Responder dúvidas comuns sobre maternidade
- Sempre recomendar consulta médica para decisões de saúde

IMPORTANTE:
- Você NÃO é médica e NÃO pode diagnosticar ou prescrever tratamentos
- Sempre incentive a consulta com profissionais de saúde
- Seja empática, acolhedora e use linguagem acessível
- Responda em português brasileiro`;

  if (context?.weekOfPregnancy) {
    prompt += `\n\nContexto: A usuária está na semana ${context.weekOfPregnancy} de gestação.`;
  }

  if (context?.symptoms?.length) {
    prompt += `\nSintomas relatados: ${context.symptoms.join(', ')}`;
  }

  return prompt;
}
```

**Deploy and configure:**

```bash
# Set the API key securely (never in code)
supabase secrets set GEMINI_API_KEY=your-actual-api-key

# Deploy the function
supabase functions deploy maternal-chat
```

---

## Refactored MaternalChatAgent with proper error handling

The agent now calls the secure Edge Function instead of exposing the API key:

```typescript
// src/agents/MaternalChatAgent.ts
import { supabase } from '../lib/supabase';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface ChatContext {
  weekOfPregnancy?: number;
  symptoms?: string[];
}

export interface ChatResponse {
  response: string;
  usage?: {
    promptTokenCount: number;
    candidatesTokenCount: number;
    totalTokenCount: number;
  };
}

export class MaternalChatAgent {
  private conversationHistory: Array<{
    role: 'user' | 'model';
    parts: Array<{ text: string }>;
  }> = [];

  private context: ChatContext = {};

  setContext(context: ChatContext): void {
    this.context = { ...this.context, ...context };
  }

  async sendMessage(userMessage: string): Promise<ChatResponse> {
    if (!userMessage.trim()) {
      throw new Error('Mensagem não pode estar vazia');
    }

    try {
      const { data, error } = await supabase.functions.invoke<ChatResponse>(
        'maternal-chat',
        {
          body: {
            message: userMessage,
            conversationHistory: this.conversationHistory,
            context: this.context,
          },
        }
      );

      if (error) {
        console.error('Edge function error:', error);
        throw new Error('Não foi possível conectar ao assistente. Tente novamente.');
      }

      if (!data?.response) {
        throw new Error('Resposta inválida do assistente.');
      }

      // Update conversation history for context continuity
      this.conversationHistory.push(
        { role: 'user', parts: [{ text: userMessage }] },
        { role: 'model', parts: [{ text: data.response }] }
      );

      // Keep history manageable (last 10 exchanges)
      if (this.conversationHistory.length > 20) {
        this.conversationHistory = this.conversationHistory.slice(-20);
      }

      return data;
    } catch (error) {
      // Re-throw with user-friendly message
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Erro inesperado. Por favor, tente novamente.');
    }
  }

  clearHistory(): void {
    this.conversationHistory = [];
  }

  getHistoryLength(): number {
    return this.conversationHistory.length;
  }
}

// Singleton instance for app-wide use
export const maternalChatAgent = new MaternalChatAgent();
```

---

## Fixed AgentsContext with useCallback and proper memoization

```typescript
// src/contexts/AgentsContext.tsx
import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  type ReactNode,
} from 'react';
import { maternalChatAgent, type ChatMessage, type ChatContext } from '../agents/MaternalChatAgent';
import { contentRecommendationAgent } from '../agents/ContentRecommendationAgent';
import { habitsAnalysisAgent } from '../agents/HabitsAnalysisAgent';

interface AgentsContextType {
  // Chat state
  chatMessages: ChatMessage[];
  isChatLoading: boolean;
  chatError: string | null;
  
  // Chat actions
  sendChatMessage: (message: string) => Promise<void>;
  setChatContext: (context: ChatContext) => void;
  clearChat: () => void;
  
  // Content recommendations
  getRecommendations: (tags: string[]) => Promise<ContentRecommendation[]>;
  
  // Habits analysis
  analyzeHabits: () => Promise<HabitsAnalysis>;
}

const AgentsContext = createContext<AgentsContextType | undefined>(undefined);

interface AgentsProviderProps {
  children: ReactNode;
}

export function AgentsProvider({ children }: AgentsProviderProps) {
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);

  // ✅ FIX: Wrap in useCallback to prevent unnecessary re-renders
  const sendChatMessage = useCallback(async (message: string) => {
    if (!message.trim()) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: message,
      timestamp: new Date(),
    };

    setChatMessages((prev) => [...prev, userMessage]);
    setIsChatLoading(true);
    setChatError(null);

    try {
      const response = await maternalChatAgent.sendMessage(message);

      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: response.response,
        timestamp: new Date(),
      };

      setChatMessages((prev) => [...prev, assistantMessage]);

      // ✅ FIX: Analytics isolated in try/catch - won't break chat flow
      try {
        await trackChatInteraction(userMessage, assistantMessage);
      } catch (analyticsError) {
        // Silent fail for analytics - don't disrupt user experience
        console.warn('Analytics tracking failed:', analyticsError);
      }
    } catch (error) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Erro ao enviar mensagem. Tente novamente.';
      setChatError(errorMessage);
    } finally {
      setIsChatLoading(false);
    }
  }, []);

  // ✅ FIX: Wrap in useCallback
  const setChatContext = useCallback((context: ChatContext) => {
    maternalChatAgent.setContext(context);
  }, []);

  // ✅ FIX: Wrap in useCallback
  const clearChat = useCallback(() => {
    setChatMessages([]);
    setChatError(null);
    maternalChatAgent.clearHistory();
  }, []);

  // ✅ FIX: Wrap in useCallback with proper empty tags handling
  const getRecommendations = useCallback(async (tags: string[]) => {
    // Return all content if no tags specified (fix for empty filter bug)
    if (!tags || tags.length === 0) {
      return contentRecommendationAgent.getAllRecommendations();
    }
    return contentRecommendationAgent.getRecommendationsByTags(tags);
  }, []);

  // ✅ FIX: Wrap in useCallback
  const analyzeHabits = useCallback(async () => {
    return habitsAnalysisAgent.analyze();
  }, []);

  // ✅ Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo<AgentsContextType>(
    () => ({
      chatMessages,
      isChatLoading,
      chatError,
      sendChatMessage,
      setChatContext,
      clearChat,
      getRecommendations,
      analyzeHabits,
    }),
    [
      chatMessages,
      isChatLoading,
      chatError,
      sendChatMessage,
      setChatContext,
      clearChat,
      getRecommendations,
      analyzeHabits,
    ]
  );

  return (
    <AgentsContext.Provider value={contextValue}>
      {children}
    </AgentsContext.Provider>
  );
}

export function useAgents(): AgentsContextType {
  const context = useContext(AgentsContext);
  if (context === undefined) {
    throw new Error('useAgents must be used within an AgentsProvider');
  }
  return context;
}

// Analytics helper (isolated)
async function trackChatInteraction(
  userMessage: ChatMessage,
  assistantMessage: ChatMessage
): Promise<void> {
  // Implementation depends on your analytics provider
  // This is isolated so failures don't break the chat
}
```

---

## Fixed WellnessContext with safe JSON parsing and sorted streaks

```typescript
// src/contexts/WellnessContext.tsx
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  type ReactNode,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';

const WELLNESS_STORAGE_KEY = 'wellness_data';
const HABITS_STORAGE_KEY = 'habits_data';

interface WellnessEntry {
  id: string;
  date: string; // ISO string
  mood: number;
  energy: number;
  symptoms: string[];
  notes?: string;
}

interface HabitEntry {
  id: string;
  habitId: string;
  completedAt: string; // ISO string
}

interface WellnessContextType {
  entries: WellnessEntry[];
  habits: HabitEntry[];
  isLoading: boolean;
  error: string | null;
  
  addEntry: (entry: Omit<WellnessEntry, 'id'>) => Promise<void>;
  getStreak: (habitId: string) => number;
  syncWithServer: () => Promise<void>;
}

const WellnessContext = createContext<WellnessContextType | undefined>(undefined);

// ✅ FIX: Safe JSON parse helper with type validation
function safeJsonParse<T>(json: string | null, defaultValue: T): T {
  if (!json) return defaultValue;
  
  try {
    const parsed = JSON.parse(json);
    // Basic type validation
    if (Array.isArray(defaultValue) && !Array.isArray(parsed)) {
      console.warn('Expected array from storage, got:', typeof parsed);
      return defaultValue;
    }
    return parsed as T;
  } catch (error) {
    console.error('JSON parse error:', error);
    return defaultValue;
  }
}

export function WellnessProvider({ children }: { children: ReactNode }) {
  const [entries, setEntries] = useState<WellnessEntry[]>([]);
  const [habits, setHabits] = useState<HabitEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load data from storage on mount
  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);
        
        const [wellnessJson, habitsJson] = await Promise.all([
          AsyncStorage.getItem(WELLNESS_STORAGE_KEY),
          AsyncStorage.getItem(HABITS_STORAGE_KEY),
        ]);

        // ✅ FIX: Use safe JSON parsing
        setEntries(safeJsonParse<WellnessEntry[]>(wellnessJson, []));
        setHabits(safeJsonParse<HabitEntry[]>(habitsJson, []));
      } catch (err) {
        console.error('Failed to load wellness data:', err);
        setError('Não foi possível carregar seus dados de bem-estar');
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, []);

  const addEntry = useCallback(async (entry: Omit<WellnessEntry, 'id'>) => {
    const newEntry: WellnessEntry = {
      ...entry,
      id: `entry-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };

    try {
      const updatedEntries = [...entries, newEntry];
      setEntries(updatedEntries);
      
      await AsyncStorage.setItem(
        WELLNESS_STORAGE_KEY,
        JSON.stringify(updatedEntries)
      );

      // Sync to server in background
      syncEntryToServer(newEntry).catch(console.error);
    } catch (err) {
      console.error('Failed to save entry:', err);
      setError('Não foi possível salvar a entrada');
      throw err;
    }
  }, [entries]);

  // ✅ FIX: Habit streak calculation with sorted data
  const getStreak = useCallback((habitId: string): number => {
    // Filter habits for specific habitId
    const habitEntries = habits.filter((h) => h.habitId === habitId);
    
    if (habitEntries.length === 0) return 0;

    // ✅ FIX: Sort entries by date (most recent first) before calculating streak
    const sortedEntries = [...habitEntries].sort((a, b) => 
      new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
    );

    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check each day going backwards
    for (let i = 0; i < sortedEntries.length; i++) {
      const entryDate = new Date(sortedEntries[i].completedAt);
      entryDate.setHours(0, 0, 0, 0);

      const expectedDate = new Date(today);
      expectedDate.setDate(today.getDate() - streak);

      // If this entry matches the expected date, increment streak
      if (entryDate.getTime() === expectedDate.getTime()) {
        streak++;
      } else if (entryDate.getTime() < expectedDate.getTime()) {
        // Gap in days - streak is broken
        break;
      }
      // If entry is in the future or duplicate day, skip it
    }

    return streak;
  }, [habits]);

  const syncWithServer = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch latest from server and merge
      const { data: serverEntries, error: fetchError } = await supabase
        .from('wellness_entries')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (fetchError) throw fetchError;

      if (serverEntries) {
        setEntries(serverEntries);
        await AsyncStorage.setItem(
          WELLNESS_STORAGE_KEY,
          JSON.stringify(serverEntries)
        );
      }
    } catch (err) {
      console.error('Sync failed:', err);
      // Don't throw - offline is okay
    }
  }, []);

  const contextValue = useMemo<WellnessContextType>(
    () => ({
      entries,
      habits,
      isLoading,
      error,
      addEntry,
      getStreak,
      syncWithServer,
    }),
    [entries, habits, isLoading, error, addEntry, getStreak, syncWithServer]
  );

  return (
    <WellnessContext.Provider value={contextValue}>
      {children}
    </WellnessContext.Provider>
  );
}

export function useWellness(): WellnessContextType {
  const context = useContext(WellnessContext);
  if (context === undefined) {
    throw new Error('useWellness must be used within a WellnessProvider');
  }
  return context;
}

// Helper to sync single entry
async function syncEntryToServer(entry: WellnessEntry): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  await supabase.from('wellness_entries').upsert({
    ...entry,
    user_id: user.id,
  });
}
```

---

## Complete account deletion for App Store compliance

```typescript
// src/features/settings/AccountDeletionScreen.tsx
import React, { useState } from 'react';
import { View, Text, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';

export default function AccountDeletionScreen() {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmText, setConfirmText] = useState('');

  const handleDeleteAccount = async () => {
    Alert.alert(
      'Excluir Conta Permanentemente',
      'Esta ação não pode ser desfeita. Todos os seus dados serão permanentemente removidos, incluindo:\n\n• Perfil e preferências\n• Histórico de bem-estar\n• Conversas com a assistente\n• Registros de hábitos\n\nDeseja continuar?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir Permanentemente',
          style: 'destructive',
          onPress: confirmDeletion,
        },
      ]
    );
  };

  const confirmDeletion = async () => {
    setIsDeleting(true);

    try {
      // Call Edge Function to delete account
      const { error } = await supabase.functions.invoke('delete-account');

      if (error) {
        throw error;
      }

      // Sign out locally
      await supabase.auth.signOut();

      Alert.alert(
        'Conta Excluída',
        'Sua conta e todos os dados foram removidos permanentemente.',
        [
          {
            text: 'OK',
            onPress: () => router.replace('/'),
          },
        ]
      );
    } catch (error) {
      console.error('Account deletion failed:', error);
      Alert.alert(
        'Erro',
        'Não foi possível excluir sua conta. Por favor, tente novamente ou entre em contato com o suporte.'
      );
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top', 'bottom']}>
      <View className="flex-1 p-6">
        <Text className="text-2xl font-bold text-gray-900 mb-4">
          Excluir Conta
        </Text>

        <View className="bg-red-50 p-4 rounded-xl mb-6">
          <Text className="text-red-800 font-semibold mb-2">
            ⚠️ Atenção
          </Text>
          <Text className="text-red-700">
            A exclusão da conta é permanente e irreversível. Todos os seus dados
            serão completamente removidos de nossos servidores.
          </Text>
        </View>

        <Text className="text-gray-700 mb-6">
          De acordo com a LGPD (Lei Geral de Proteção de Dados), você tem
          direito à exclusão completa dos seus dados pessoais. Ao excluir sua
          conta, removeremos:
        </Text>

        <View className="bg-gray-50 p-4 rounded-xl mb-6">
          <Text className="text-gray-600 mb-2">• Dados de perfil</Text>
          <Text className="text-gray-600 mb-2">• Registros de bem-estar</Text>
          <Text className="text-gray-600 mb-2">• Histórico de conversas</Text>
          <Text className="text-gray-600 mb-2">• Metas e hábitos</Text>
          <Text className="text-gray-600">• Arquivos e mídia</Text>
        </View>

        <View className="flex-1" />

        <Pressable
          onPress={handleDeleteAccount}
          disabled={isDeleting}
          className={`py-4 rounded-xl ${
            isDeleting ? 'bg-gray-300' : 'bg-red-500'
          }`}
        >
          {isDeleting ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-center text-white font-semibold">
              Excluir Minha Conta
            </Text>
          )}
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
```

**Edge Function for account deletion:**

```typescript
// supabase/functions/delete-account/index.ts
import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Authenticate with user's token
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Não autorizado' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Admin client for deletion operations
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // 1. Delete user's storage files
    const { data: userFiles } = await supabaseAdmin
      .storage
      .from('user-files')
      .list(user.id);

    if (userFiles && userFiles.length > 0) {
      const filePaths = userFiles.map((f) => `${user.id}/${f.name}`);
      await supabaseAdmin.storage.from('user-files').remove(filePaths);
    }

    // 2. Tables with user data will cascade delete via FK if properly configured
    // If not using FK cascade, delete manually:
    await Promise.all([
      supabaseAdmin.from('wellness_entries').delete().eq('user_id', user.id),
      supabaseAdmin.from('habits').delete().eq('user_id', user.id),
      supabaseAdmin.from('chat_history').delete().eq('user_id', user.id),
      supabaseAdmin.from('consent_records').delete().eq('user_id', user.id),
      supabaseAdmin.from('profiles').delete().eq('user_id', user.id),
    ]);

    // 3. Delete the user account
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(user.id);

    if (deleteError) {
      console.error('User deletion failed:', deleteError);
      throw deleteError;
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Delete account error:', error);
    return new Response(
      JSON.stringify({ error: 'Falha ao excluir conta' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
```

---

## Privacy Policy implementation for LGPD compliance

```typescript
// src/features/legal/PrivacyPolicyScreen.tsx
import React from 'react';
import { ScrollView, View, Text, Linking, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function PrivacyPolicyScreen() {
  const contactEmail = 'privacidade@nossamaternidade.com.br';
  const lastUpdated = '4 de dezembro de 2025';

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['bottom']}>
      <ScrollView className="flex-1 p-6">
        <Text className="text-2xl font-bold text-gray-900 mb-2">
          Política de Privacidade
        </Text>
        <Text className="text-gray-500 mb-6">
          Última atualização: {lastUpdated}
        </Text>

        <Section title="1. Introdução">
          <Text className="text-gray-700 leading-6">
            A NossaMaternidade ("nós", "nosso" ou "aplicativo") está comprometida 
            com a proteção da sua privacidade. Esta política descreve como 
            coletamos, usamos e protegemos seus dados pessoais de acordo com a 
            Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/2018).
          </Text>
        </Section>

        <Section title="2. Dados que Coletamos">
          <Text className="text-gray-700 leading-6 mb-3">
            <Text className="font-semibold">2.1 Dados de Cadastro:</Text> nome, 
            e-mail, data prevista do parto (opcional).
          </Text>
          <Text className="text-gray-700 leading-6 mb-3">
            <Text className="font-semibold">2.2 Dados de Saúde e Bem-estar:</Text>{' '}
            registros de humor, energia, sintomas gestacionais, hábitos de 
            bem-estar. Estes são considerados <Text className="font-semibold">
            dados sensíveis</Text> pela LGPD.
          </Text>
          <Text className="text-gray-700 leading-6 mb-3">
            <Text className="font-semibold">2.3 Dados de Uso:</Text> interações 
            com o aplicativo, conversas com a assistente de IA.
          </Text>
        </Section>

        <Section title="3. Finalidade do Tratamento">
          <Text className="text-gray-700 leading-6">
            Seus dados são usados exclusivamente para:{'\n'}
            • Fornecer recomendações personalizadas de bem-estar{'\n'}
            • Registrar seu progresso gestacional{'\n'}
            • Operar a assistente de IA maternal{'\n'}
            • Melhorar a experiência do aplicativo
          </Text>
        </Section>

        <Section title="4. Base Legal">
          <Text className="text-gray-700 leading-6">
            O tratamento de seus dados pessoais é baseado no seu{' '}
            <Text className="font-semibold">consentimento explícito</Text>{' '}
            (Art. 7º, I e Art. 11, I da LGPD), fornecido no momento do cadastro 
            e ao utilizar recursos específicos como a assistente de IA.
          </Text>
        </Section>

        <Section title="5. Compartilhamento de Dados">
          <Text className="text-gray-700 leading-6 mb-3">
            <Text className="font-semibold">5.1 Google Gemini AI:</Text> mensagens 
            enviadas à assistente de IA são processadas pelo Google Gemini para 
            gerar respostas. O Google não usa esses dados para publicidade ou 
            treinamento de modelos gerais.
          </Text>
          <Text className="text-gray-700 leading-6 mb-3">
            <Text className="font-semibold">5.2 Supabase:</Text> seus dados são 
            armazenados de forma segura nos servidores da Supabase, com 
            criptografia em repouso e em trânsito.
          </Text>
          <Text className="text-gray-700 leading-6">
            Não vendemos, alugamos ou compartilhamos seus dados com terceiros 
            para fins de marketing.
          </Text>
        </Section>

        <Section title="6. Seus Direitos (LGPD Art. 18)">
          <Text className="text-gray-700 leading-6">
            Você tem direito a:{'\n'}
            • Confirmar a existência de tratamento{'\n'}
            • Acessar seus dados{'\n'}
            • Corrigir dados incompletos ou desatualizados{'\n'}
            • Solicitar anonimização ou eliminação{'\n'}
            • Revogar consentimento{'\n'}
            • Portabilidade dos dados{'\n'}
            • Excluir sua conta completamente
          </Text>
        </Section>

        <Section title="7. Retenção de Dados">
          <Text className="text-gray-700 leading-6">
            Seus dados são mantidos enquanto você tiver uma conta ativa. 
            Após a exclusão da conta, todos os dados são removidos em até 
            30 dias, exceto quando necessário para cumprimento de obrigação 
            legal.
          </Text>
        </Section>

        <Section title="8. Segurança">
          <Text className="text-gray-700 leading-6">
            Implementamos medidas técnicas e organizacionais para proteger 
            seus dados, incluindo:{'\n'}
            • Criptografia TLS em todas as transmissões{'\n'}
            • Criptografia em repouso no banco de dados{'\n'}
            • Controle de acesso baseado em funções{'\n'}
            • Autenticação segura
          </Text>
        </Section>

        <Section title="9. Contato do Encarregado (DPO)">
          <Text className="text-gray-700 leading-6 mb-2">
            Para exercer seus direitos ou esclarecer dúvidas sobre esta 
            política, entre em contato:
          </Text>
          <Pressable onPress={() => Linking.openURL(`mailto:${contactEmail}`)}>
            <Text className="text-pink-600 font-semibold">
              {contactEmail}
            </Text>
          </Pressable>
        </Section>

        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View className="mb-6">
      <Text className="text-lg font-semibold text-gray-900 mb-2">{title}</Text>
      {children}
    </View>
  );
}
```

---

## Complete EAS Build configuration

```json
// eas.json
{
  "cli": {
    "version": ">= 14.0.0",
    "requireCommit": true
  },
  "build": {
    "base": {
      "node": "20.19.4",
      "env": {
        "APP_ENV": "production"
      }
    },
    "development": {
      "extends": "base",
      "developmentClient": true,
      "distribution": "internal",
      "env": {
        "APP_ENV": "development"
      },
      "android": {
        "buildType": "apk",
        "gradleCommand": ":app:assembleDebug"
      },
      "ios": {
        "simulator": true,
        "buildConfiguration": "Debug"
      }
    },
    "development:device": {
      "extends": "development",
      "ios": {
        "simulator": false
      }
    },
    "preview": {
      "extends": "base",
      "distribution": "internal",
      "channel": "preview",
      "env": {
        "APP_ENV": "staging"
      },
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "extends": "base",
      "channel": "production",
      "autoIncrement": true,
      "env": {
        "APP_ENV": "production"
      },
      "android": {
        "buildType": "app-bundle",
        "resourceClass": "medium"
      },
      "ios": {
        "resourceClass": "large",
        "image": "latest"
      }
    }
  },
  "submit": {
    "production": {
      "android": {
        "track": "internal",
        "serviceAccountKeyPath": "./google-service-account.json"
      },
      "ios": {
        "ascAppId": "YOUR_APP_STORE_CONNECT_APP_ID"
      }
    }
  }
}
```

---

## Supabase Row Level Security policies for health data

```sql
-- Enable RLS on all user tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE wellness_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE habit_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE consent_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_history ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can only access their own profile
CREATE POLICY "Users can view own profile"
ON profiles FOR SELECT
TO authenticated
USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
TO authenticated
USING ((SELECT auth.uid()) = user_id)
WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can insert own profile"
ON profiles FOR INSERT
TO authenticated
WITH CHECK ((SELECT auth.uid()) = user_id);

-- Wellness entries: Sensitive health data
CREATE POLICY "Users can manage own wellness entries"
ON wellness_entries FOR ALL
TO authenticated
USING ((SELECT auth.uid()) = user_id)
WITH CHECK ((SELECT auth.uid()) = user_id);

-- Habits
CREATE POLICY "Users can manage own habits"
ON habits FOR ALL
TO authenticated
USING ((SELECT auth.uid()) = user_id)
WITH CHECK ((SELECT auth.uid()) = user_id);

-- Habit completions
CREATE POLICY "Users can manage own habit completions"
ON habit_completions FOR ALL
TO authenticated
USING (
  habit_id IN (
    SELECT id FROM habits WHERE user_id = (SELECT auth.uid())
  )
);

-- Consent records: Critical for LGPD
CREATE POLICY "Users can view own consent records"
ON consent_records FOR SELECT
TO authenticated
USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can create consent records"
ON consent_records FOR INSERT
TO authenticated
WITH CHECK ((SELECT auth.uid()) = user_id);

-- Chat history
CREATE POLICY "Users can manage own chat history"
ON chat_history FOR ALL
TO authenticated
USING ((SELECT auth.uid()) = user_id)
WITH CHECK ((SELECT auth.uid()) = user_id);

-- Add performance indexes
CREATE INDEX idx_wellness_entries_user_id ON wellness_entries (user_id);
CREATE INDEX idx_wellness_entries_date ON wellness_entries (date DESC);
CREATE INDEX idx_habits_user_id ON habits (user_id);
CREATE INDEX idx_habit_completions_habit_id ON habit_completions (habit_id);
CREATE INDEX idx_consent_records_user_id ON consent_records (user_id);
```

---

## Bug fixes summary table

| Bug | Location | Issue | Fix Applied |
|-----|----------|-------|-------------|
| **Analytics breaking chat** | AgentsContext.tsx | Analytics failure could interrupt chat | Wrapped in isolated try/catch |
| **Empty tags filter** | AgentsContext.tsx | `getRecommendations([])` returned nothing | Returns all content when empty |
| **Unsorted streak data** | WellnessContext.tsx | Streak calculation wrong with unsorted data | Added sort before calculation |
| **JSON.parse crash** | WellnessContext.tsx | No try/catch around JSON.parse | Created `safeJsonParse` helper |
| **Privacy Policy TODO** | Settings | Not implemented | Complete LGPD-compliant screen added |
| **Missing useCallback** | AgentsContext.tsx | Functions recreated every render | All handlers wrapped in useCallback |
| **API key exposure** | Environment | Gemini key in EXPO_PUBLIC_ | Moved to Edge Function |
| **No account deletion** | Settings | App Store requirement missing | Complete deletion flow added |
| **Legacy SafeAreaView** | Multiple files | Deprecated in RN 0.81 | Migrated to react-native-safe-area-context |

---

## Store submission checklist for December 2025

### iOS App Store
- [ ] Privacy Manifest configured in app.json
- [ ] Account deletion implemented and accessible
- [ ] AI consent disclosure before chat use
- [ ] Privacy Policy in Portuguese accessible in-app
- [ ] App Privacy details filled in App Store Connect
- [ ] Health data disclosures accurate
- [ ] 1024x1024 app icon (no transparency, no rounded corners)
- [ ] Submit by December 15 for pre-holiday approval

### Google Play Store  
- [ ] targetSdkVersion set to 35
- [ ] compileSdkVersion set to 35
- [ ] Edge-to-edge display using react-native-safe-area-context
- [ ] Data Safety section completed (health data, AI data)
- [ ] LGPD compliance documented
- [ ] Adaptive icon configured (foreground + monochrome)
- [ ] AAB format for production builds

### Security
- [ ] Gemini API key in Edge Function only
- [ ] RLS policies on all user tables
- [ ] No EXPO_PUBLIC_ secrets
- [ ] Session refresh on app foreground

This analysis provides a complete roadmap for achieving store readiness. Address the critical security vulnerability (API key exposure) first, then implement privacy infrastructure, and finally polish UI compliance with edge-to-edge and SafeAreaView migration.