/**
 * Supabase Edge Function: chat-ai
 * Processa mensagens de chat usando Gemini 2.0 Flash
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { GoogleGenerativeAI } from 'npm:@google/generative-ai@0.24.1';

// CORS Configuration
// Em produção, restringir às origens permitidas
const ALLOWED_ORIGINS = [
  'https://nossamaternidade.com.br',
  'https://www.nossamaternidade.com.br',
  'capacitor://localhost', // Capacitor/iOS
  'http://localhost', // Android WebView
  'http://localhost:8081', // Metro bundler development
  'http://localhost:19006', // Expo web development
];

// Verificar se está em produção
const IS_PRODUCTION = Deno.env.get('ENVIRONMENT') === 'production';

function getCorsHeaders(requestOrigin: string | null): Record<string, string> {
  // Em desenvolvimento, permitir todas as origens
  if (!IS_PRODUCTION) {
    return {
      'Access-Control-Allow-Origin': requestOrigin || '*',
      'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
    };
  }

  // Em produção, verificar origem
  // React Native mobile não envia Origin header, então aceitamos null/undefined
  if (!requestOrigin || ALLOWED_ORIGINS.includes(requestOrigin)) {
    return {
      'Access-Control-Allow-Origin': requestOrigin || 'https://nossamaternidade.com.br',
      'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
    };
  }

  // Origem não permitida
  return {
    'Access-Control-Allow-Origin': 'https://nossamaternidade.com.br',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };
}

const GEMINI_MODEL = Deno.env.get('GEMINI_MODEL') || 'gemini-2.5-flash';

interface ChatRequest {
  message: string;
  history?: Array<{
    role: string;
    parts: Array<{ text: string }>;
  }>;
  systemInstruction?: string;
}

serve(async (req) => {
  // Obter origem da requisição para CORS dinâmico
  const origin = req.headers.get('Origin');
  const corsHeaders = getCorsHeaders(origin);

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Verificar autenticação
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Parse request body
    const { message, history = [], systemInstruction }: ChatRequest = await req.json();

    if (!message) {
      return new Response(JSON.stringify({ error: 'Message is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Inicializar Gemini
    const genAI = new GoogleGenerativeAI(Deno.env.get('GEMINI_API_KEY') || '');
    const model = genAI.getGenerativeModel({
      model: GEMINI_MODEL,
      systemInstruction: systemInstruction || 'Você é uma assistente maternal empática.',
    });

    // Iniciar chat com histórico
    const chat = model.startChat({
      history: history,
      generationConfig: {
        maxOutputTokens: 1024,
        temperature: 0.9,
        topP: 0.95,
      },
    });

    // Enviar mensagem
    const result = await chat.sendMessage(message);
    const response = await result.response;
    const text = response.text();

    console.log('[chat-ai] Success:', {
      messageLength: message.length,
      responseLength: text.length,
      historySize: history.length,
    });

    return new Response(
      JSON.stringify({
        text,
        model: GEMINI_MODEL,
        tokensUsed: response.usageMetadata?.totalTokenCount || 0,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    console.error('[chat-ai] Error:', error);
    return new Response(
      JSON.stringify({
        error: error.message || 'Internal server error',
        details: error.toString(),
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
