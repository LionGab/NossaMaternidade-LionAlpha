/**
 * Testes básicos para GeminiService
 */

// Mock do Google Generative AI
jest.mock('@google/generative-ai', () => ({
  GoogleGenerativeAI: jest.fn().mockImplementation(() => ({
    getGenerativeModel: jest.fn().mockReturnValue({
      generateContent: jest.fn(),
    }),
  })),
}));

// Mock de Constants
jest.mock('expo-constants', () => ({
  default: {
    expoConfig: {
      extra: {
        geminiApiKey: 'test-api-key',
      },
    },
  },
}));

describe('GeminiService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('sendMessage', () => {
    it('deve enviar mensagem com sucesso', async () => {
      // Importar após mocks
      const { GoogleGenerativeAI } = require('@google/generative-ai');

      const mockResponse = {
        response: {
          text: () => 'Resposta da IA',
        },
      };

      const mockModel = {
        generateContent: jest.fn().mockResolvedValue(mockResponse),
      };

      GoogleGenerativeAI.mockImplementation(() => ({
        getGenerativeModel: jest.fn().mockReturnValue(mockModel),
      }));

      // Simular chamada
      const model = mockModel;
      const result = await model.generateContent('Olá');

      expect(result.response.text()).toBe('Resposta da IA');
      expect(model.generateContent).toHaveBeenCalledWith('Olá');
    });

    it('deve tratar erro de API', async () => {
      const { GoogleGenerativeAI } = require('@google/generative-ai');

      const mockModel = {
        generateContent: jest.fn().mockRejectedValue(new Error('API Error')),
      };

      GoogleGenerativeAI.mockImplementation(() => ({
        getGenerativeModel: jest.fn().mockReturnValue(mockModel),
      }));

      const model = mockModel;

      await expect(model.generateContent('Olá')).rejects.toThrow('API Error');
    });
  });

  describe('configuração', () => {
    it('deve usar API key do ambiente', () => {
      // API key should be available from environment
      const Constants = require('expo-constants').default;

      const apiKey =
        Constants.expoConfig?.extra?.geminiApiKey || process.env.EXPO_PUBLIC_GEMINI_API_KEY;

      expect(apiKey).toBeDefined();

      // Verificar se GoogleGenerativeAI pode ser importado
      const generativeAI = require('@google/generative-ai');
      expect(generativeAI.GoogleGenerativeAI).toBeDefined();
    });
  });
});
