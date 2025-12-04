/**
 * Testes para cálculo de streaks no HabitsAnalysisAgent
 *
 * Regras de negócio testadas:
 * - Trabalha em nível de DIA (YYYY-MM-DD), não de entrada individual
 * - Um dia é considerado completado se houver pelo menos uma entrada com completed = true
 * - currentStreak: sequência de dias consecutivos que termina no dia mais recente
 * - bestStreak: maior sequência contínua de dias completados
 * - Entradas duplicadas no mesmo dia contam como 1 dia
 * - Entradas fora de ordem não afetam o resultado
 */

import {
  HabitsAnalysisAgent,
  HabitEntry,
} from '../../src/agents/habits/HabitsAnalysisAgent';

// Mock do logger
jest.mock('../../src/utils/logger', () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

// Mock do orchestrator
jest.mock('../../src/agents/core/AgentOrchestrator', () => ({
  orchestrator: {
    callMCP: jest.fn().mockResolvedValue({ success: false }),
  },
}));

describe('HabitsAnalysisAgent - calculateStreaks', () => {
  let agent: HabitsAnalysisAgent;

  // Helper para criar entries de forma mais limpa
  const createEntry = (
    date: string,
    completed: boolean,
    habitId = 'habit-1',
    habitName = 'Exercício'
  ): HabitEntry => ({
    id: `entry-${Date.now()}-${Math.random()}`,
    habitId,
    habitName,
    date,
    completed,
    timestamp: new Date(date).getTime(),
  });

  // Helper para gerar data no formato YYYY-MM-DD com offset de dias
  const getDateOffset = (daysOffset: number): string => {
    const date = new Date();
    date.setDate(date.getDate() + daysOffset);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
      date.getDate()
    ).padStart(2, '0')}`;
  };

  beforeEach(() => {
    agent = new HabitsAnalysisAgent();
  });

  describe('Cálculos básicos', () => {
    it('deve_retornar_zero_quando_nao_existem_entries', async () => {
      const result = await agent.process({
        userId: 'user-1',
        entries: [],
      });

      expect(result.patterns).toHaveLength(0);
    });

    it('deve_retornar_streak_1_para_um_unico_dia_completado', async () => {
      const entries: HabitEntry[] = [createEntry(getDateOffset(0), true)];

      const result = await agent.process({
        userId: 'user-1',
        entries,
      });

      expect(result.patterns[0].streak).toBe(1);
      expect(result.patterns[0].bestStreak).toBe(1);
    });

    it('deve_calcular_streak_de_3_dias_consecutivos', async () => {
      const entries: HabitEntry[] = [
        createEntry(getDateOffset(-2), true),
        createEntry(getDateOffset(-1), true),
        createEntry(getDateOffset(0), true),
      ];

      const result = await agent.process({
        userId: 'user-1',
        entries,
      });

      expect(result.patterns[0].streak).toBe(3);
      expect(result.patterns[0].bestStreak).toBe(3);
    });
  });

  describe('Duplicados no mesmo dia', () => {
    it('deve_ignorar_duplicados_no_mesmo_dia_e_contar_como_um_dia', async () => {
      const today = getDateOffset(0);
      const entries: HabitEntry[] = [
        createEntry(today, true),
        createEntry(today, true), // Duplicado
        createEntry(today, true), // Outro duplicado
      ];

      const result = await agent.process({
        userId: 'user-1',
        entries,
      });

      // Deve contar apenas 1 dia, não 3
      expect(result.patterns[0].streak).toBe(1);
      expect(result.patterns[0].bestStreak).toBe(1);
    });

    it('deve_considerar_dia_completado_se_alguma_entry_for_completed', async () => {
      const today = getDateOffset(0);
      const yesterday = getDateOffset(-1);
      const entries: HabitEntry[] = [
        createEntry(today, false), // Não completado
        createEntry(today, true), // Mas este é completado
        createEntry(yesterday, true),
      ];

      const result = await agent.process({
        userId: 'user-1',
        entries,
      });

      // Ambos os dias devem contar como completados
      expect(result.patterns[0].streak).toBe(2);
      expect(result.patterns[0].bestStreak).toBe(2);
    });
  });

  describe('Entradas fora de ordem', () => {
    it('deve_calcular_streak_corretamente_com_entries_fora_de_ordem', async () => {
      const entries: HabitEntry[] = [
        createEntry(getDateOffset(-1), true), // Ontem
        createEntry(getDateOffset(0), true), // Hoje (fora de ordem)
        createEntry(getDateOffset(-2), true), // Anteontem (fora de ordem)
      ];

      const result = await agent.process({
        userId: 'user-1',
        entries,
      });

      // Deve calcular streak de 3 dias consecutivos independente da ordem
      expect(result.patterns[0].streak).toBe(3);
      expect(result.patterns[0].bestStreak).toBe(3);
    });
  });

  describe('Gaps e quebras de streak', () => {
    it('deve_quebrar_streak_quando_existir_gap_de_mais_de_1_dia', async () => {
      const entries: HabitEntry[] = [
        createEntry(getDateOffset(0), true), // Hoje
        createEntry(getDateOffset(-1), true), // Ontem
        // Gap de 1 dia
        createEntry(getDateOffset(-3), true), // 3 dias atrás
      ];

      const result = await agent.process({
        userId: 'user-1',
        entries,
      });

      // Streak atual deve ser 2 (hoje e ontem)
      expect(result.patterns[0].streak).toBe(2);
      // Best streak também é 2
      expect(result.patterns[0].bestStreak).toBe(2);
    });

    it('deve_ter_bestStreak_maior_que_currentStreak_quando_melhor_sequencia_foi_no_passado', async () => {
      const entries: HabitEntry[] = [
        // Sequência atual: 2 dias
        createEntry(getDateOffset(0), true),
        createEntry(getDateOffset(-1), true),
        // Gap
        createEntry(getDateOffset(-5), true),
        // Melhor sequência no passado: 3 dias
        createEntry(getDateOffset(-6), true),
        createEntry(getDateOffset(-7), true),
        createEntry(getDateOffset(-8), true),
      ];

      const result = await agent.process({
        userId: 'user-1',
        entries,
      });

      expect(result.patterns[0].streak).toBe(2); // Sequência atual
      expect(result.patterns[0].bestStreak).toBe(4); // 4 dias consecutivos (-5 a -8)
    });
  });

  describe('Nenhuma entry completed', () => {
    it('deve_retornar_zero_quando_nenhuma_entry_esta_completed', async () => {
      const entries: HabitEntry[] = [
        createEntry(getDateOffset(0), false),
        createEntry(getDateOffset(-1), false),
        createEntry(getDateOffset(-2), false),
      ];

      const result = await agent.process({
        userId: 'user-1',
        entries,
      });

      expect(result.patterns[0].streak).toBe(0);
      expect(result.patterns[0].bestStreak).toBe(0);
    });
  });

  describe('Datas inválidas', () => {
    it('deve_ignorar_entries_com_datas_invalidas', async () => {
      const entries: HabitEntry[] = [
        createEntry(getDateOffset(0), true),
        createEntry('invalid-date', true), // Data inválida
        createEntry(getDateOffset(-1), true),
      ];

      const result = await agent.process({
        userId: 'user-1',
        entries,
      });

      // Deve ignorar a data inválida e contar apenas os 2 dias válidos
      expect(result.patterns[0].streak).toBe(2);
      expect(result.patterns[0].bestStreak).toBe(2);
    });
  });

  describe('Múltiplos hábitos', () => {
    it('deve_calcular_streaks_separadamente_para_cada_habito', async () => {
      const entries: HabitEntry[] = [
        // Hábito 1: 3 dias consecutivos
        createEntry(getDateOffset(0), true, 'habit-1', 'Exercício'),
        createEntry(getDateOffset(-1), true, 'habit-1', 'Exercício'),
        createEntry(getDateOffset(-2), true, 'habit-1', 'Exercício'),
        // Hábito 2: 2 dias consecutivos
        createEntry(getDateOffset(0), true, 'habit-2', 'Meditação'),
        createEntry(getDateOffset(-1), true, 'habit-2', 'Meditação'),
      ];

      const result = await agent.process({
        userId: 'user-1',
        entries,
      });

      // Deve ter 2 patterns, um para cada hábito
      expect(result.patterns).toHaveLength(2);

      const exercicio = result.patterns.find((p) => p.habitName === 'Exercício');
      const meditacao = result.patterns.find((p) => p.habitName === 'Meditação');

      expect(exercicio?.streak).toBe(3);
      expect(exercicio?.bestStreak).toBe(3);
      expect(meditacao?.streak).toBe(2);
      expect(meditacao?.bestStreak).toBe(2);
    });
  });
});

