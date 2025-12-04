/**
 * Cloud Run Backend Client
 * Centralized HTTP client for all Cloud Run endpoints
 */

import Constants from 'expo-constants';
import { Platform } from 'react-native';

import { supabase } from './supabase';
import { logger } from '../utils/logger';

/**
 * Get Cloud Run backend URL based on environment
 */
const getBackendUrl = (): string => {
  // Priority 1: Environment variable from app.config.js
  if (Constants.expoConfig?.extra?.backendUrl) {
    const url = Constants.expoConfig.extra.backendUrl;
    logger.info('[CloudRunClient] Using backend URL from config', { url });
    return url;
  }

  // Priority 2: Platform-specific fallbacks (dev mode)
  if (__DEV__) {
    const devUrl =
      Platform.OS === 'android'
        ? 'http://10.0.2.2:8080' // Android Emulator localhost
        : 'http://localhost:8080'; // iOS Simulator / Web
    logger.warn('[CloudRunClient] DEV MODE: Using local backend', { url: devUrl });
    return devUrl;
  }

  // Priority 3: Production fallback (update this with your actual Cloud Run URL)
  const prodUrl = 'https://copy-of-nossa-maternidade0555-854690283424.us-west1.run.app';
  logger.info('[CloudRunClient] Using production backend', { url: prodUrl });
  return prodUrl;
};

export const CLOUD_RUN_URL = getBackendUrl();

export interface CloudRunResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  statusCode?: number;
}

export interface ChatRequest extends Record<string, unknown> {
  message: string;
  history?: Array<{ role: string; parts: Array<{ text: string }> }>;
  systemInstruction?: string;
}

export interface ChatResponse {
  text: string;
  model?: string;
  tokensUsed?: number;
}

export interface AudioRequest extends Record<string, unknown> {
  audioBase64: string;
  mimeType: string;
  systemInstruction?: string;
  prompt?: string;
}

export interface AudioResponse {
  text: string;
  transcription?: string;
}

export interface AnalyzeDiaryRequest extends Record<string, unknown> {
  entry: string;
  systemInstruction?: string;
}

export interface AnalyzeDiaryResponse {
  text: string;
  emotions?: string[];
  sentiment?: string;
}

class CloudRunClient {
  private baseUrl: string;
  private authToken: string | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
    this.initializeAuthToken();
  }

  /**
   * Initialize auth token from Supabase session
   */
  private async initializeAuthToken() {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.access_token) {
        this.authToken = session.access_token;
        logger.debug('[CloudRunClient] Auth token initialized');
      }
    } catch (error) {
      logger.error('[CloudRunClient] Failed to initialize auth token', error);
    }
  }

  /**
   * Set Supabase JWT token for authenticated requests
   */
  setAuthToken(token: string | null) {
    this.authToken = token;
    logger.debug('[CloudRunClient] Auth token updated');
  }

  /**
   * Refresh auth token from current Supabase session
   */
  async refreshAuthToken(): Promise<void> {
    await this.initializeAuthToken();
  }

  /**
   * Generic POST request
   */
  async post<T = unknown>(
    endpoint: string,
    body: Record<string, unknown>,
    options?: RequestInit
  ): Promise<CloudRunResponse<T>> {
    try {
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...(this.authToken && { Authorization: `Bearer ${this.authToken}` }),
        ...options?.headers,
      };

      logger.debug(`[CloudRunClient] POST ${endpoint}`, {
        bodyKeys: Object.keys(body),
      });

      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
        ...options,
      });

      if (!response.ok) {
        const errorText = await response.text();
        logger.error(`[CloudRunClient] POST ${endpoint} failed:`, {
          status: response.status,
          error: errorText,
        });
        return {
          success: false,
          error: `HTTP ${response.status}: ${errorText}`,
          statusCode: response.status,
        };
      }

      const data = await response.json();
      logger.debug(`[CloudRunClient] POST ${endpoint} success`);
      return { success: true, data, statusCode: response.status };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Network error';
      logger.error(`[CloudRunClient] POST ${endpoint} network error:`, error);
      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Generic GET request
   */
  async get<T = unknown>(endpoint: string, options?: RequestInit): Promise<CloudRunResponse<T>> {
    try {
      const headers: HeadersInit = {
        ...(this.authToken && { Authorization: `Bearer ${this.authToken}` }),
        ...options?.headers,
      };

      logger.debug(`[CloudRunClient] GET ${endpoint}`);

      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'GET',
        headers,
        ...options,
      });

      if (!response.ok) {
        const errorText = await response.text();
        logger.error(`[CloudRunClient] GET ${endpoint} failed:`, {
          status: response.status,
          error: errorText,
        });
        return {
          success: false,
          error: `HTTP ${response.status}: ${errorText}`,
          statusCode: response.status,
        };
      }

      const data = await response.json();
      logger.debug(`[CloudRunClient] GET ${endpoint} success`);
      return { success: true, data, statusCode: response.status };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Network error';
      logger.error(`[CloudRunClient] GET ${endpoint} network error:`, error);
      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<boolean> {
    const result = await this.get('/health');
    return result.success;
  }

  /**
   * Send chat message to AI
   */
  async sendChatMessage(request: ChatRequest): Promise<CloudRunResponse<ChatResponse>> {
    return this.post<ChatResponse>('/api/chat', request);
  }

  /**
   * Send audio for transcription and AI response
   */
  async sendAudio(request: AudioRequest): Promise<CloudRunResponse<AudioResponse>> {
    return this.post<AudioResponse>('/api/audio', request);
  }

  /**
   * Analyze diary entry
   */
  async analyzeDiary(
    request: AnalyzeDiaryRequest
  ): Promise<CloudRunResponse<AnalyzeDiaryResponse>> {
    return this.post<AnalyzeDiaryResponse>('/api/analyze-diary', request);
  }

  /**
   * Get recommendations (example endpoint)
   */
  async getRecommendations(userId: string): Promise<CloudRunResponse<unknown>> {
    return this.get(`/api/recommendations?userId=${userId}`);
  }

  /**
   * Send emotional snapshot (example endpoint)
   */
  async sendEmotionalSnapshot(data: {
    emotion: string;
    intensity: number;
    context?: string;
  }): Promise<CloudRunResponse<unknown>> {
    return this.post('/api/emotional-snapshot', data as Record<string, unknown>);
  }
}

// Export singleton instance
export const cloudRunClient = new CloudRunClient(CLOUD_RUN_URL);
export default cloudRunClient;
