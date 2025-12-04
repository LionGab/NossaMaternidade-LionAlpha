/**
 * Supabase Edge Function: analyze-diary
 * Analisa entradas de diário maternal usando Gemini 2.0 Flash
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { GoogleGenerativeAI } from 'npm:@google/generative-ai@0.24.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const GEMINI_MODEL = Deno.env.get('GEMINI_MODEL') || 'gemini-2.5-flash';

interface AnalyzeDiaryRequest {
  entry: string;
  systemInstruction?: string;
}

serve(async (req) => {
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
    const { entry, systemInstruction }: AnalyzeDiaryRequest = await req.json();

    if (!entry) {
      return new Response(JSON.stringify({ error: 'Entry is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Inicializar Gemini
    const genAI = new GoogleGenerativeAI(Deno.env.get('GEMINI_API_KEY') || '');
    const model = genAI.getGenerativeModel({
      model: GEMINI_MODEL,
      systemInstruction: systemInstruction || 'Você é uma assistente maternal empática.',
      generationConfig: {
        maxOutputTokens: 512,
        temperature: 0.8,
        topP: 0.95,
      },
    });

    // Analisar entrada do diário
    const result = await model.generateContent([{ text: entry }]);

    const response = await result.response;
    const text = response.text();

    console.log('[analyze-diary] Success:', {
      entryLength: entry.length,
      responseLength: text.length,
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
    console.error('[analyze-diary] Error:', error);
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
