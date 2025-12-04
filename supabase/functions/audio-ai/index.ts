/**
 * Supabase Edge Function: audio-ai
 * Processa áudio usando Gemini 2.0 Flash (transcrição + resposta)
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { GoogleGenerativeAI } from 'npm:@google/generative-ai@0.24.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const GEMINI_MODEL = Deno.env.get('GEMINI_MODEL') || 'gemini-2.5-flash';

interface AudioRequest {
  audioBase64: string;
  mimeType: string;
  systemInstruction?: string;
  prompt?: string;
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
    const { audioBase64, mimeType, systemInstruction, prompt }: AudioRequest = await req.json();

    if (!audioBase64 || !mimeType) {
      return new Response(JSON.stringify({ error: 'audioBase64 and mimeType are required' }), {
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

    // Preparar partes do conteúdo (áudio + prompt)
    const parts = [
      {
        inlineData: {
          data: audioBase64,
          mimeType,
        },
      },
      {
        text: prompt || 'Por favor, ouça meu áudio e me responda.',
      },
    ];

    // Gerar conteúdo (formato correto: passar parts diretamente)
    const result = await model.generateContent(parts);
    const response = await result.response;
    const text = response.text();

    console.log('[audio-ai] Success:', {
      mimeType,
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
    console.error('[audio-ai] Error:', error);
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
