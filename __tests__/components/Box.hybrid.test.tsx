/**
 * Box Component - Hybrid Pattern Tests
 * 
 * Testa o padrão híbrido: props semânticas + className (NativeWind v4)
 * 
 * @see docs/HYBRID_PATTERN.md
 */

import React from 'react';
import { render } from '@testing-library/react-native';
import { Box } from '@/components/atoms/Box';
import { Text } from '@/components/atoms/Text';
import { TestWrapper } from '../helpers/testWrapper';

const renderWithTheme = (component: React.ReactElement) => {
  return render(component, { wrapper: TestWrapper });
};

// Helper para encontrar elemento na árvore JSON por className ou testID
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const findInTree = (node: any, search: { testID?: string; className?: string }): any => {
  if (!node) return null;
  
  // Verifica se este nó corresponde à busca
  const props = node?.props || {};
  if (search.testID && props.testID === search.testID) {
    return node;
  }
  if (search.className && props.className === search.className) {
    return node;
  }
  
  // Busca nos filhos (pode ser array ou objeto único)
  const children = node?.children;
  if (children) {
    const childrenArray = Array.isArray(children) ? children : [children];
    for (const child of childrenArray) {
      if (child) {
        const found = findInTree(child, search);
        if (found) return found;
      }
    }
  }
  
  return null;
};

describe('Box Component - Hybrid Pattern', () => {
  describe('Modo 1: className (NativeWind)', () => {
    it('deve aplicar className quando fornecido', () => {
      const result = renderWithTheme(
        <Box testID="test-box" className="bg-primary p-4 rounded-xl">
          <Text>Conteúdo</Text>
        </Box>
      );

      const tree = result.toJSON();
      
      // Para React Native, verificamos que o componente foi renderizado
      // e que className está presente na árvore
      expect(tree).toBeTruthy();
      
      // Busca por className na árvore (mais confiável que testID em mocks)
      const box = findInTree(tree, { className: 'bg-primary p-4 rounded-xl' });
      
      // Se não encontrou por className, verifica se pelo menos o View foi renderizado
      if (!box) {
        // Verifica que a estrutura básica existe
        expect(tree?.type).toBe('View');
        expect(tree?.props?.className).toBe('bg-primary p-4 rounded-xl');
      } else {
        expect(box?.props?.className).toBe('bg-primary p-4 rounded-xl');
      }
    });

    it('deve ignorar props semânticas quando className fornecido', () => {
      const { toJSON } = renderWithTheme(
        <Box
          testID="test-box"
          className="bg-success p-6"
          bg="card"
          p="4"
        >
          <Text>Conteúdo</Text>
        </Box>
      );

      const tree = toJSON();
      const box = findInTree(tree, { testID: 'test-box' });
      // className tem prioridade
      expect(box?.props?.className).toBe('bg-success p-6');
      // Props semânticas são ignoradas quando className presente
    });

    it('deve suportar flexbox via className', () => {
      const { toJSON } = renderWithTheme(
        <Box testID="test-box" className="flex-1 flex-row items-center justify-between">
          <Text>Item 1</Text>
          <Text>Item 2</Text>
        </Box>
      );

      const tree = toJSON();
      const box = findInTree(tree, { testID: 'test-box' });
      const className = box?.props?.className || '';
      expect(className).toContain('flex-1');
      expect(className).toContain('flex-row');
      expect(className).toContain('items-center');
      expect(className).toContain('justify-between');
    });

    it('deve suportar spacing via className', () => {
      const { toJSON } = renderWithTheme(
        <Box testID="test-box" className="p-4 m-2 gap-3">
          <Text>Item 1</Text>
          <Text>Item 2</Text>
        </Box>
      );

      const tree = toJSON();
      const box = findInTree(tree, { testID: 'test-box' });
      const className = box?.props?.className || '';
      expect(className).toContain('p-4');
      expect(className).toContain('m-2');
      expect(className).toContain('gap-3');
    });
  });

  describe('Modo 2: Props Semânticas (Legado)', () => {
    it('deve aplicar props semânticas quando className não fornecido', () => {
      const { toJSON } = renderWithTheme(
        <Box testID="test-box" bg="card" p="4" gap="3">
          <Text>Conteúdo</Text>
        </Box>
      );

      const tree = toJSON();
      const box = findInTree(tree, { testID: 'test-box' });
      expect(box).toBeTruthy();
      // Props semânticas aplicadas via style (verificamos que não tem className)
      expect(box?.props?.className).toBeUndefined();
    });

    it('deve manter compatibilidade com código legado', () => {
      const { toJSON } = renderWithTheme(
        <Box
          testID="test-box"
          direction="row"
          align="center"
          justify="space-between"
          p="4"
        >
          <Text>Legado</Text>
        </Box>
      );

      const tree = toJSON();
      const box = findInTree(tree, { testID: 'test-box' });
      expect(box).toBeTruthy();
      // Verifica que o componente foi renderizado sem className
      expect(box?.props?.className).toBeUndefined();
    });
  });

  describe('Prioridade: className > Props', () => {
    it('deve priorizar className sobre props semânticas', () => {
      const { toJSON } = renderWithTheme(
        <Box
          testID="test-box"
          className="bg-primary"
          bg="card"
        >
          <Text>Teste</Text>
        </Box>
      );

      const tree = toJSON();
      const box = findInTree(tree, { testID: 'test-box' });
      // className tem prioridade
      expect(box?.props?.className).toBe('bg-primary');
      // bg="card" é ignorado quando className presente
    });

    it('deve permitir style adicional mesmo com className', () => {
      const { toJSON } = renderWithTheme(
        <Box
          testID="test-box"
          className="bg-primary p-4"
          style={{ opacity: 0.8 }}
        >
          <Text>Teste</Text>
        </Box>
      );

      const tree = toJSON();
      const box = findInTree(tree, { testID: 'test-box' });
      expect(box?.props?.className).toBe('bg-primary p-4');
      // style é mesclado com className
      expect(box?.props?.style).toBeDefined();
    });
  });

  describe('Acessibilidade', () => {
    it('deve manter props de acessibilidade independente do modo', () => {
      const { toJSON } = renderWithTheme(
        <Box
          testID="test-box"
          className="bg-primary"
          accessibilityLabel="Container principal"
          accessibilityRole="none"
        >
          <Text>Conteúdo</Text>
        </Box>
      );

      const tree = toJSON();
      const box = findInTree(tree, { testID: 'test-box' });
      expect(box?.props?.accessibilityLabel).toBe('Container principal');
      expect(box?.props?.accessibilityRole).toBe('none');
    });
  });

  describe('Aninhamento', () => {
    it('deve suportar aninhamento de Box híbridos', () => {
      const { toJSON } = renderWithTheme(
        <Box testID="parent" className="p-4">
          <Box testID="child" className="bg-card p-2">
            <Text>Nested</Text>
          </Box>
        </Box>
      );

      const tree = toJSON();
      const parent = findInTree(tree, { testID: 'parent' });
      const child = findInTree(tree, { testID: 'child' });

      expect(parent?.props?.className).toBe('p-4');
      expect(child?.props?.className).toBe('bg-card p-2');
    });
  });
});

