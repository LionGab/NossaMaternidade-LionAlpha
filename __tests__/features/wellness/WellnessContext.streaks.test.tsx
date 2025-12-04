/**
 * Testes para cálculo de streaks no WellnessContext
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { renderHook, waitFor } from '@testing-library/react-native';
import React from 'react';

import WellnessProvider, { useWellness } from '@/features/wellness/context/WellnessContext';
import type { CheckInData } from '@/features/wellness/types';

// Mock do AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  multiRemove: jest.fn(),
}));

// Mock do onboardingService
jest.mock('@/services/onboardingService', () => ({
  onboardingService: {
    isOnboardingCompleted: jest.fn().mockResolvedValue(true),
    getCurrentStep: jest.fn().mockResolvedValue(12),
    completeOnboarding: jest.fn().mockResolvedValue(true),
    saveOnboardingStep: jest.fn().mockResolvedValue(true),
  },
}));

// Mock do logger
jest.mock('@/utils/logger', () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

describe('WellnessContext - Streaks', () => {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <WellnessProvider>{children}</WellnessProvider>
  );

  beforeEach(() => {
    jest.clearAllMocks();
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
  });

  describe('Cálculo de streak básico', () => {
    it('deve_calcular_streak_ignorando_checkins_duplicados_no_mesmo_dia', async () => {
      const today = new Date();
      const todayStr = today.toISOString().split('T')[0];
      
      const checkIns: CheckInData[] = [
        {
          id: '1',
          date: todayStr,
          mood: 4,
          energy: 3,
          created_at: new Date().toISOString(),
        },
        {
          id: '2',
          date: todayStr, // Duplicado do mesmo dia
          mood: 5,
          energy: 4,
          created_at: new Date().toISOString(),
        },
      ];

      (AsyncStorage.getItem as jest.Mock).mockImplementation((key: string) => {
        if (key === 'nath_wellness_checkins') {
          return Promise.resolve(JSON.stringify(checkIns));
        }
        return Promise.resolve(null);
      });

      const { result } = renderHook(() => useWellness(), { wrapper });

      await waitFor(() => {
        expect(result.current.isProfileLoading).toBe(false);
      });

      // Deve contar apenas 1 dia, não 2
      expect(result.current.currentStreak).toBe(1);
    });

    it('deve_calcular_streak_corretamente_com_checkins_fora_de_ordem', async () => {
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const twoDaysAgo = new Date(today);
      twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

      const checkIns: CheckInData[] = [
        {
          id: '1',
          date: yesterday.toISOString().split('T')[0],
          mood: 4,
          energy: 3,
          created_at: new Date().toISOString(),
        },
        {
          id: '2',
          date: today.toISOString().split('T')[0], // Fora de ordem cronológica
          mood: 5,
          energy: 4,
          created_at: new Date().toISOString(),
        },
        {
          id: '3',
          date: twoDaysAgo.toISOString().split('T')[0],
          mood: 3,
          energy: 3,
          created_at: new Date().toISOString(),
        },
      ];

      (AsyncStorage.getItem as jest.Mock).mockImplementation((key: string) => {
        if (key === 'nath_wellness_checkins') {
          return Promise.resolve(JSON.stringify(checkIns));
        }
        return Promise.resolve(null);
      });

      const { result } = renderHook(() => useWellness(), { wrapper });

      await waitFor(() => {
        expect(result.current.isProfileLoading).toBe(false);
      });

      // Deve calcular streak de 3 dias consecutivos mesmo fora de ordem
      expect(result.current.currentStreak).toBe(3);
    });

    it('deve_ignorar_checkins_com_data_no_futuro_ao_calcular_streak', async () => {
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const checkIns: CheckInData[] = [
        {
          id: '1',
          date: today.toISOString().split('T')[0],
          mood: 4,
          energy: 3,
          created_at: new Date().toISOString(),
        },
        {
          id: '2',
          date: tomorrow.toISOString().split('T')[0], // Data futura
          mood: 5,
          energy: 4,
          created_at: new Date().toISOString(),
        },
      ];

      (AsyncStorage.getItem as jest.Mock).mockImplementation((key: string) => {
        if (key === 'nath_wellness_checkins') {
          return Promise.resolve(JSON.stringify(checkIns));
        }
        return Promise.resolve(null);
      });

      const { result } = renderHook(() => useWellness(), { wrapper });

      await waitFor(() => {
        expect(result.current.isProfileLoading).toBe(false);
      });

      // Deve ignorar check-in futuro - apenas check-in de hoje deve ser filtrado
      expect(result.current.checkIns.length).toBe(1);
      expect(result.current.currentStreak).toBe(1);
    });

    it('deve_retornar_zero_quando_nao_existem_checkins_validos', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

      const { result } = renderHook(() => useWellness(), { wrapper });

      await waitFor(() => {
        expect(result.current.isProfileLoading).toBe(false);
      });

      expect(result.current.currentStreak).toBe(0);
    });
  });

  describe('Streak quebrado', () => {
    it('deve_quebrar_streak_quando_existir_gap_maior_que_um_dia', async () => {
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const threeDaysAgo = new Date(today);
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

      const checkIns: CheckInData[] = [
        {
          id: '1',
          date: today.toISOString().split('T')[0],
          mood: 4,
          energy: 3,
          created_at: new Date().toISOString(),
        },
        {
          id: '2',
          date: yesterday.toISOString().split('T')[0],
          mood: 5,
          energy: 4,
          created_at: new Date().toISOString(),
        },
        {
          id: '3',
          date: threeDaysAgo.toISOString().split('T')[0], // Gap de 1 dia
          mood: 3,
          energy: 3,
          created_at: new Date().toISOString(),
        },
      ];

      (AsyncStorage.getItem as jest.Mock).mockImplementation((key: string) => {
        if (key === 'nath_wellness_checkins') {
          return Promise.resolve(JSON.stringify(checkIns));
        }
        return Promise.resolve(null);
      });

      const { result } = renderHook(() => useWellness(), { wrapper });

      await waitFor(() => {
        expect(result.current.isProfileLoading).toBe(false);
      });

      // Deve contar apenas hoje e ontem (streak = 2), parando no gap
      expect(result.current.currentStreak).toBe(2);
    });

    it('deve_retornar_zero_quando_ultimo_checkin_for_ha_mais_de_um_dia', async () => {
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

      const checkIns: CheckInData[] = [
        {
          id: '1',
          date: threeDaysAgo.toISOString().split('T')[0],
          mood: 4,
          energy: 3,
          created_at: new Date().toISOString(),
        },
      ];

      (AsyncStorage.getItem as jest.Mock).mockImplementation((key: string) => {
        if (key === 'nath_wellness_checkins') {
          return Promise.resolve(JSON.stringify(checkIns));
        }
        return Promise.resolve(null);
      });

      const { result } = renderHook(() => useWellness(), { wrapper });

      await waitFor(() => {
        expect(result.current.isProfileLoading).toBe(false);
      });

      // Streak deve ser 0 pois último check-in foi há 3 dias
      expect(result.current.currentStreak).toBe(0);
    });
  });

  describe('Dados inválidos', () => {
    it('deve_filtrar_checkins_com_campos_criticos_invalidos', async () => {
      const today = new Date().toISOString().split('T')[0];

      const checkIns = [
        {
          id: '1',
          date: today,
          mood: 4,
          energy: 3,
          created_at: new Date().toISOString(),
        },
        {
          // Sem id
          date: today,
          mood: 3,
          energy: 2,
          created_at: new Date().toISOString(),
        },
        {
          id: '3',
          // Sem date
          mood: 5,
          energy: 4,
          created_at: new Date().toISOString(),
        },
        {
          id: '4',
          date: today,
          // Sem mood
          energy: 3,
          created_at: new Date().toISOString(),
        },
      ];

      (AsyncStorage.getItem as jest.Mock).mockImplementation((key: string) => {
        if (key === 'nath_wellness_checkins') {
          return Promise.resolve(JSON.stringify(checkIns));
        }
        return Promise.resolve(null);
      });

      const { result } = renderHook(() => useWellness(), { wrapper });

      await waitFor(() => {
        expect(result.current.isProfileLoading).toBe(false);
      });

      // Apenas o primeiro check-in é válido
      expect(result.current.checkIns.length).toBe(1);
      expect(result.current.currentStreak).toBe(1);
    });

    it('deve_usar_lista_vazia_quando_json_de_checkins_estiver_corrompido', async () => {
      (AsyncStorage.getItem as jest.Mock).mockImplementation((key: string) => {
        if (key === 'nath_wellness_checkins') {
          return Promise.resolve('{ invalid json }');
        }
        return Promise.resolve(null);
      });

      const { result } = renderHook(() => useWellness(), { wrapper });

      await waitFor(() => {
        expect(result.current.isProfileLoading).toBe(false);
      });

      expect(result.current.checkIns).toEqual([]);
      expect(result.current.currentStreak).toBe(0);
    });
  });

  describe('TodayCheckIn', () => {
    it('deve_manter_todayCheckIn_correto_com_datas_normalizadas', async () => {
      const today = new Date();
      const todayStr = today.toISOString().split('T')[0];
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      const checkIns: CheckInData[] = [
        {
          id: '1',
          date: todayStr,
          mood: 4,
          energy: 3,
          created_at: new Date().toISOString(),
        },
        {
          id: '2',
          date: yesterday.toISOString().split('T')[0],
          mood: 3,
          energy: 2,
          created_at: new Date().toISOString(),
        },
      ];

      (AsyncStorage.getItem as jest.Mock).mockImplementation((key: string) => {
        if (key === 'nath_wellness_checkins') {
          return Promise.resolve(JSON.stringify(checkIns));
        }
        return Promise.resolve(null);
      });

      const { result } = renderHook(() => useWellness(), { wrapper });

      await waitFor(() => {
        expect(result.current.isProfileLoading).toBe(false);
      });

      expect(result.current.todayCheckIn).not.toBeNull();
      expect(result.current.todayCheckIn?.date).toBe(todayStr);
      expect(result.current.todayCheckIn?.mood).toBe(4);
    });
  });
});

