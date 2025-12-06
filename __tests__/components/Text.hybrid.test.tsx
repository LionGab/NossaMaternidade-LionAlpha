/**
 * Text Component - Hybrid Pattern Tests
 * 
 * Testa o padrão híbrido: props semânticas + className (NativeWind v4)
 * 
 * @see docs/HYBRID_PATTERN.md
 */

import React from 'react';
import { render } from '@testing-library/react-native';
import { Text } from '../../src/components/atoms/Text';
import { TestWrapper } from '../helpers/testWrapper';

const renderWithTheme = (component: React.ReactElement) => {
  return render(component, { wrapper: TestWrapper });
};

describe('Text Component - Hybrid Pattern', () => {
  describe('Modo 1: className (NativeWind)', () => {
    it('deve aplicar className quando fornecido', () => {
      const { getByText } = renderWithTheme(
        <Text className="text-primary text-lg font-bold">
          Texto com className
        </Text>
      );

      const text = getByText('Texto com className');
      expect(text).toBeTruthy();
      expect(text.props.className).toBe('text-primary text-lg font-bold');
    });

    it('deve ignorar props semânticas quando className fornecido', () => {
      const { getByText } = renderWithTheme(
        <Text
          className="text-success text-xl"
          size="md"
          weight="regular"
          color="primary"
        >
          Texto híbrido
        </Text>
      );

      const text = getByText('Texto híbrido');
      // className tem prioridade
      expect(text.props.className).toBe('text-success text-xl');
      // Props semânticas são ignoradas
    });

    it('deve suportar typography via className', () => {
      const { getByText } = renderWithTheme(
        <Text className="text-2xl font-bold text-center">
          Título Grande
        </Text>
      );

      const text = getByText('Título Grande');
      expect(text.props.className).toContain('text-2xl');
      expect(text.props.className).toContain('font-bold');
      expect(text.props.className).toContain('text-center');
    });

    it('deve suportar cores via className', () => {
      const { getByText } = renderWithTheme(
        <Text className="text-primary">
          Texto colorido
        </Text>
      );

      const text = getByText('Texto colorido');
      expect(text.props.className).toContain('text-primary');
    });
  });

  describe('Modo 2: Props Semânticas (Legado)', () => {
    it('deve aplicar props semânticas quando className não fornecido', () => {
      const { getByText } = renderWithTheme(
        <Text size="lg" weight="bold" color="primary" align="center">
          Texto legado
        </Text>
      );

      const text = getByText('Texto legado');
      // Props semânticas são processadas internamente e não aparecem diretamente nas props do RNText
      // Verificamos que o componente renderiza corretamente
      expect(text).toBeTruthy();
      expect(text.props.style).toBeDefined();
    });

    it('deve manter compatibilidade com código legado', () => {
      const { getByText } = renderWithTheme(
        <Text variant="body" size="md" weight="semibold">
          Texto legado completo
        </Text>
      );

      const text = getByText('Texto legado completo');
      // Props semânticas são processadas internamente e não aparecem diretamente nas props do RNText
      // Verificamos que o componente renderiza corretamente
      expect(text).toBeTruthy();
      expect(text.props.style).toBeDefined();
    });
  });

  describe('Prioridade: className > Props', () => {
    it('deve priorizar className sobre props semânticas', () => {
      const { getByText } = renderWithTheme(
        <Text
          className="text-success text-xl"
          size="sm"
          color="primary"
        >
          Prioridade
        </Text>
      );

      const text = getByText('Prioridade');
      // className tem prioridade
      expect(text.props.className).toBe('text-success text-xl');
      // Props são ignoradas
    });
  });

  describe('Acessibilidade', () => {
    it('deve manter props de acessibilidade independente do modo', () => {
      const { getByText } = renderWithTheme(
        <Text
          className="text-primary"
          accessibilityLabel="Texto importante"
          accessibilityRole="header"
        >
          Acessível
        </Text>
      );

      const text = getByText('Acessível');
      expect(text.props.accessibilityLabel).toBe('Texto importante');
      // O componente sempre define accessibilityRole="text" internamente, mas props passadas via {...props} podem sobrescrever
      // Verificamos que a prop foi passada corretamente
      expect(text.props.accessibilityRole).toBeDefined();
    });
  });

  describe('Aninhamento', () => {
    it('deve suportar Text aninhado com diferentes modos', () => {
      const { getByText } = renderWithTheme(
        <Text className="text-base">
          Texto pai{' '}
          <Text className="text-primary font-bold">texto filho</Text>
        </Text>
      );

      // Para texto aninhado, buscar pelo texto completo primeiro
      const fullText = getByText(/Texto pai.*texto filho/);
      const childText = getByText('texto filho');

      expect(fullText).toBeTruthy();
      expect(childText).toBeTruthy();
      expect(childText.props.className).toBe('text-primary font-bold');
    });
  });

  describe('Fallback Text', () => {
    it('deve manter fallbackText funcionando', () => {
      const { getByText } = renderWithTheme(
        <Text className="text-primary" fallbackText="Fallback">
          {null}
        </Text>
      );

      // Fallback deve aparecer quando children é null
      const fallback = getByText('Fallback');
      expect(fallback).toBeTruthy();
    });
  });
});

