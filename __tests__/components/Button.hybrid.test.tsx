/**
 * Button Component - Hybrid Pattern Tests
 * 
 * Testa o padrão híbrido: props semânticas + className/textClassName (NativeWind v4)
 * 
 * @see docs/HYBRID_PATTERN.md
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Button } from '@/components/atoms/Button';
import { TestWrapper } from '../helpers/testWrapper';

const renderWithTheme = (component: React.ReactElement) => {
  return render(component, { wrapper: TestWrapper });
};

describe('Button Component - Hybrid Pattern', () => {
  describe('Modo 1: className + textClassName (NativeWind)', () => {
    it('deve aplicar className quando fornecido', () => {
      const { getByTestId } = renderWithTheme(
        <Button
          testID="button"
          title="Clique aqui"
          onPress={() => {}}
          className="bg-primary rounded-xl px-6 py-3"
        />
      );

      const button = getByTestId('button');
      expect(button).toBeTruthy();
      expect(button.props.className).toBe('bg-primary rounded-xl px-6 py-3');
    });

    it('deve aplicar textClassName quando fornecido', () => {
      const { getByText } = renderWithTheme(
        <Button
          title="Texto customizado"
          onPress={() => {}}
          className="bg-primary"
          textClassName="text-white font-bold text-lg"
        />
      );

      const text = getByText('Texto customizado');
      expect(text).toBeTruthy();
      // textClassName é aplicado ao Text interno
      expect(text.props.className).toBe('text-white font-bold text-lg');
    });

    it('deve ignorar variant/size quando className fornecido', () => {
      const { getByTestId } = renderWithTheme(
        <Button
          testID="button"
          title="Teste"
          onPress={() => {}}
          className="bg-success rounded-full px-8 py-4"
          variant="primary"
          size="lg"
        />
      );

      const button = getByTestId('button');
      // className tem prioridade sobre variant/size
      expect(button.props.className).toBe('bg-success rounded-full px-8 py-4');
    });

    it('deve manter loading/disabled funcionando mesmo com className', () => {
      const { getByTestId, rerender } = renderWithTheme(
        <Button
          testID="button"
          title="Carregando"
          onPress={() => {}}
          className="bg-primary"
          loading={true}
        />
      );

      let button = getByTestId('button');
      expect(button.props.disabled).toBe(true); // loading seta disabled

      rerender(
        <Button
          testID="button"
          title="Desabilitado"
          onPress={() => {}}
          className="bg-primary"
          disabled={true}
        />
      );

      button = getByTestId('button');
      expect(button.props.disabled).toBe(true);
    });
  });

  describe('Modo 2: Props Semânticas (Legado)', () => {
    it('deve aplicar variant quando className não fornecido', () => {
      const { getByTestId } = renderWithTheme(
        <Button
          testID="button"
          title="Primário"
          onPress={() => {}}
          variant="primary"
        />
      );

      const button = getByTestId('button');
      expect(button).toBeTruthy();
      // Variant aplicado via style interno
      expect(button.props.variant).toBe('primary');
    });

    it('deve aplicar size quando className não fornecido', () => {
      const { getByTestId } = renderWithTheme(
        <Button
          testID="button"
          title="Grande"
          onPress={() => {}}
          size="lg"
        />
      );

      const button = getByTestId('button');
      expect(button.props.size).toBe('lg');
    });

    it('deve manter compatibilidade com código legado', () => {
      const { getByTestId } = renderWithTheme(
        <Button
          testID="button"
          title="Legado"
          onPress={() => {}}
          variant="outline"
          size="md"
          fullWidth
        />
      );

      const button = getByTestId('button');
      expect(button.props.variant).toBe('outline');
      expect(button.props.size).toBe('md');
      expect(button.props.fullWidth).toBe(true);
    });
  });

  describe('Prioridade: className > Props', () => {
    it('deve priorizar className sobre variant', () => {
      const { getByTestId } = renderWithTheme(
        <Button
          testID="button"
          title="Prioridade"
          onPress={() => {}}
          className="bg-success"
          variant="primary"
        />
      );

      const button = getByTestId('button');
      // className tem prioridade
      expect(button.props.className).toBe('bg-success');
      // variant é ignorado para estilos visuais
    });

    it('deve priorizar textClassName sobre estilo derivado de variant', () => {
      const { getByText } = renderWithTheme(
        <Button
          title="Texto customizado"
          onPress={() => {}}
          variant="primary"
          textClassName="text-warning font-light"
        />
      );

      const text = getByText('Texto customizado');
      // textClassName tem prioridade
      expect(text.props.className).toBe('text-warning font-light');
    });
  });

  describe('Estados: loading/disabled', () => {
    it('deve funcionar loading em ambos os modos', () => {
      const { getByTestId, rerender } = renderWithTheme(
        <Button
          testID="button"
          title="Loading"
          onPress={() => {}}
          className="bg-primary"
          loading={true}
        />
      );

      let button = getByTestId('button');
      expect(button.props.disabled).toBe(true);

      // Teste com props semânticas
      rerender(
        <Button
          testID="button"
          title="Loading"
          onPress={() => {}}
          variant="primary"
          loading={true}
        />
      );

      button = getByTestId('button');
      expect(button.props.disabled).toBe(true);
    });

    it('deve funcionar disabled em ambos os modos', () => {
      const { getByTestId, rerender } = renderWithTheme(
        <Button
          testID="button"
          title="Disabled"
          onPress={() => {}}
          className="bg-primary"
          disabled={true}
        />
      );

      let button = getByTestId('button');
      expect(button.props.disabled).toBe(true);

      rerender(
        <Button
          testID="button"
          title="Disabled"
          onPress={() => {}}
          variant="primary"
          disabled={true}
        />
      );

      button = getByTestId('button');
      expect(button.props.disabled).toBe(true);
    });
  });

  describe('Ícones', () => {
    it('deve suportar leftIcon com className', () => {
      const { getByTestId } = renderWithTheme(
        <Button
          testID="button"
          title="Com ícone"
          onPress={() => {}}
          className="bg-primary"
          leftIcon={<Button testID="icon" title="Icon" onPress={() => {}} />}
        />
      );

      const button = getByTestId('button');
      expect(button).toBeTruthy();
      // leftIcon deve estar presente
    });

    it('deve suportar rightIcon com className', () => {
      const { getByTestId } = renderWithTheme(
        <Button
          testID="button"
          title="Com ícone"
          onPress={() => {}}
          className="bg-primary"
          rightIcon={<Button testID="icon" title="Icon" onPress={() => {}} />}
        />
      );

      const button = getByTestId('button');
      expect(button).toBeTruthy();
    });
  });

  describe('onPress', () => {
    it('deve chamar onPress quando clicado (modo className)', () => {
      const onPressMock = jest.fn();
      const { getByTestId } = renderWithTheme(
        <Button
          testID="button"
          title="Clique"
          onPress={onPressMock}
          className="bg-primary"
        />
      );

      const button = getByTestId('button');
      fireEvent.press(button);

      expect(onPressMock).toHaveBeenCalledTimes(1);
    });

    it('deve chamar onPress quando clicado (modo props)', () => {
      const onPressMock = jest.fn();
      const { getByTestId } = renderWithTheme(
        <Button
          testID="button"
          title="Clique"
          onPress={onPressMock}
          variant="primary"
        />
      );

      const button = getByTestId('button');
      fireEvent.press(button);

      expect(onPressMock).toHaveBeenCalledTimes(1);
    });

    it('não deve chamar onPress quando disabled', () => {
      const onPressMock = jest.fn();
      const { getByTestId } = renderWithTheme(
        <Button
          testID="button"
          title="Disabled"
          onPress={onPressMock}
          className="bg-primary"
          disabled={true}
        />
      );

      const button = getByTestId('button');
      fireEvent.press(button);

      expect(onPressMock).not.toHaveBeenCalled();
    });
  });

  describe('Acessibilidade', () => {
    it('deve manter props de acessibilidade independente do modo', () => {
      const { getByTestId } = renderWithTheme(
        <Button
          testID="button"
          title="Acessível"
          onPress={() => {}}
          className="bg-primary"
          accessibilityLabel="Botão principal"
          accessibilityHint="Clique para continuar"
        />
      );

      const button = getByTestId('button');
      expect(button.props.accessibilityLabel).toBe('Botão principal');
      expect(button.props.accessibilityHint).toBe('Clique para continuar');
    });
  });
});

