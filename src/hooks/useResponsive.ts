// hooks/useResponsive.ts
import { useMemo } from 'react';
import { useWindowDimensions } from 'react-native';

/**
 * Hook simplificado para responsividade
 * Usado no onboarding para determinar tamanhos de tela
 */
export const useResponsive = () => {
  const { width, height } = useWindowDimensions();

  return useMemo(
    () => ({
      width,
      height,
      isSmallScreen: width < 375,
      isXL: width >= 768,
      containerStyle: {
        flex: 1,
        maxWidth: width >= 768 ? 640 : 560,
        alignSelf: 'center' as const,
        paddingHorizontal: width < 375 ? 16 : 24,
      },
    }),
    [width, height]
  );
};
