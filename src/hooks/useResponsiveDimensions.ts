/**
 * Hook para dimensoes responsivas
 * Centraliza logica de responsividade para diferentes tamanhos de tela
 *
 * @example
 * const { width, isTablet, cardWidth, spacing } = useResponsiveDimensions();
 */

import { useWindowDimensions } from 'react-native';

import { Tokens } from '@/theme/tokens';

/**
 * Tipos de dispositivo baseados em breakpoints
 */
export type DeviceType = 'small' | 'medium' | 'large' | 'tablet';

/**
 * Retorno do hook useResponsiveDimensions
 */
export interface ResponsiveDimensions {
  // Dimensoes da tela
  width: number;
  height: number;

  // Tipo de dispositivo
  deviceType: DeviceType;
  isSmallDevice: boolean;
  isMediumDevice: boolean;
  isLargeDevice: boolean;
  isTablet: boolean;

  // Dimensoes de cards (responsivas)
  cardWidth: number;
  cardHeight: number;
  cardColumns: number;

  // Spacing responsivo
  horizontalPadding: number;
  verticalPadding: number;
  cardGap: number;

  // Avatar sizes
  avatarSize: number;
  avatarSizeLarge: number;

  // Circle/chart sizes
  circleSize: number;
  circleSizeLarge: number;

  // Font scale (para tablets)
  fontScale: number;
}

/**
 * Hook para obter dimensoes responsivas baseadas no tamanho da tela
 *
 * Breakpoints (de tokens.ts):
 * - xs: 360px (small devices)
 * - sm: 390px (medium devices)
 * - md: 428px (large phones)
 * - lg: 768px (tablets)
 * - xl: 1024px (large tablets)
 */
export function useResponsiveDimensions(): ResponsiveDimensions {
  const { width, height } = useWindowDimensions();

  // Determinar tipo de dispositivo
  const isSmallDevice = width < Tokens.breakpoints.sm; // < 390px
  const isMediumDevice = width >= Tokens.breakpoints.sm && width < Tokens.breakpoints.md; // 390-428px
  const isLargeDevice = width >= Tokens.breakpoints.md && width < Tokens.breakpoints.lg; // 428-768px
  const isTablet = width >= Tokens.breakpoints.lg; // >= 768px

  const deviceType: DeviceType = isSmallDevice
    ? 'small'
    : isMediumDevice
      ? 'medium'
      : isLargeDevice
        ? 'large'
        : 'tablet';

  // Spacing responsivo
  const horizontalPadding = isTablet
    ? Tokens.spacing['8'] // 32px
    : isSmallDevice
      ? Tokens.spacing['3'] // 12px
      : Tokens.spacing['4']; // 16px

  const verticalPadding = isTablet
    ? Tokens.spacing['6'] // 24px
    : Tokens.spacing['4']; // 16px

  const cardGap = isTablet
    ? Tokens.spacing['4'] // 16px
    : Tokens.spacing['3']; // 12px

  // Colunas de cards (2 em mobile, 3 em tablet)
  const cardColumns = isTablet ? 3 : 2;

  // Card dimensions
  const totalGap = cardGap * (cardColumns - 1);
  const availableWidth = width - horizontalPadding * 2 - totalGap;
  const cardWidth = Math.floor(availableWidth / cardColumns);

  // Card height mantém aspect ratio aproximado
  const cardHeight = isTablet
    ? Math.floor(cardWidth * 0.75) // 4:3 ratio em tablets
    : isSmallDevice
      ? 140
      : 160;

  // Avatar sizes
  const avatarSize = isTablet
    ? Tokens.spacing['14'] // 56px
    : Tokens.touchTargets.min; // 44px (WCAG compliant)

  const avatarSizeLarge = isTablet
    ? Tokens.spacing['20'] // 80px
    : Tokens.spacing['16']; // 64px

  // Circle/chart sizes
  const circleSize = isTablet ? 100 : isSmallDevice ? 70 : 80;

  const circleSizeLarge = isTablet ? 140 : isSmallDevice ? 100 : 120;

  // Font scale para tablets (ligeiramente maior)
  const fontScale = isTablet ? 1.1 : 1;

  return {
    width,
    height,
    deviceType,
    isSmallDevice,
    isMediumDevice,
    isLargeDevice,
    isTablet,
    cardWidth,
    cardHeight,
    cardColumns,
    horizontalPadding,
    verticalPadding,
    cardGap,
    avatarSize,
    avatarSizeLarge,
    circleSize,
    circleSizeLarge,
    fontScale,
  };
}

/**
 * Hook simplificado para obter apenas o tipo de dispositivo
 */
export function useDeviceType(): DeviceType {
  const { deviceType } = useResponsiveDimensions();
  return deviceType;
}

/**
 * Hook para verificar se e tablet
 */
export function useIsTablet(): boolean {
  const { isTablet } = useResponsiveDimensions();
  return isTablet;
}

export default useResponsiveDimensions;
