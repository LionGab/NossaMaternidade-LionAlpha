import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenerativeAI, Part } from '@google/generative-ai';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080; // Cloud Run expects 8080

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' })); // Allow larger payloads for base64 if needed

// Initialize Gemini
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
  console.error('ERRO: GEMINI_API_KEY não definida nas variáveis de ambiente.');
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

// Helper to download file from URL and convert to Part
async function urlToPart(url: string, mimeType: string): Promise<Part> {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
    const arrayBuffer = await response.arrayBuffer();
    return {
      inlineData: {
        data: Buffer.from(arrayBuffer).toString('base64'),
        mimeType,
      },
    };
  } catch (error) {
    console.error('Error downloading file:', error);
    throw error;
  }
}

// --- Endpoints ---

// 1. Chat Endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { message, history, systemInstruction } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Configure model with system instruction if provided
    const chatModel = systemInstruction
      ? genAI.getGenerativeModel({
          model: 'gemini-2.0-flash-exp',
          systemInstruction: { role: 'system', parts: [{ text: systemInstruction }] },
        })
      : model;

    const chat = chatModel.startChat({
      history: history || [],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1024,
      },
    });

    const result = await chat.sendMessage(message);
    const response = await result.response;
    const text = response.text();

    res.json({ text });
  } catch (error: any) {
    console.error('Error in /api/chat:', error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
});

// 2. Audio/Multimodal Endpoint
app.post('/api/audio', async (req, res) => {
  try {
    const { prompt, audioUrl, audioBase64, mimeType, systemInstruction } = req.body;

    if ((!audioUrl && !audioBase64) || !mimeType) {
      return res
        .status(400)
        .json({ error: 'Audio source (URL or Base64) and mimeType are required' });
    }

    let mediaPart: Part;

    if (audioUrl) {
      // Download from URL (Supabase Storage flow)
      mediaPart = await urlToPart(audioUrl, mimeType);
    } else {
      // Use provided Base64
      mediaPart = {
        inlineData: {
          data: audioBase64,
          mimeType,
        },
      };
    }

    const parts = [mediaPart, { text: prompt || 'Por favor, ouça meu áudio e me responda.' }];

    // Use model with system instruction if provided
    const generativeModel = systemInstruction
      ? genAI.getGenerativeModel({
          model: 'gemini-2.0-flash-exp',
          systemInstruction: { role: 'system', parts: [{ text: systemInstruction }] },
        })
      : model;

    const result = await generativeModel.generateContent(parts);
    const response = await result.response;
    const text = response.text();

    res.json({ text });
  } catch (error: any) {
    console.error('Error in /api/audio:', error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
});

// 3. Diary Analysis Endpoint
app.post('/api/analyze-diary', async (req, res) => {
  try {
    const { entry, systemInstruction } = req.body;

    if (!entry) {
      return res.status(400).json({ error: 'Diary entry is required' });
    }

    const prompt = `Acabei de escrever no meu diário:\n\n"${entry}"\n\nO que você acha?`;

    const generativeModel = systemInstruction
      ? genAI.getGenerativeModel({
          model: 'gemini-2.0-flash-exp',
          systemInstruction: { role: 'system', parts: [{ text: systemInstruction }] },
        })
      : model;

    const result = await generativeModel.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.8,
        maxOutputTokens: 512,
      },
    });

    const response = await result.response;
    const text = response.text();

    res.json({ text });
  } catch (error: any) {
    console.error('Error in /api/analyze-diary:', error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
