/**
 * useMobileOptimization - Hook para otimização mobile-first
 *
 * Centraliza todas as melhores práticas de otimização para iOS e Android:
 * - Touch targets WCAG AAA (44pt iOS / 48dp Android)
 * - Performance (memoização, lazy loading)
 * - Acessibilidade completa
 * - Platform-specific behaviors
 *
 * @version 1.0.0
 */

import { useCallback, useMemo, useEffect, useState } from 'react';
import { Platform, AccessibilityInfo, useWindowDimensions } from 'react-native';

import { Tokens } from '@/theme/tokens';

// ======================
// TIPOS
// ======================

export interface TouchTargetProps {
  /** Tamanho mínimo do touch target */
  minSize: number;
  /** Hit slop adicional */
  hitSlop: number;
  /** Padding interno recomendado */
  padding: number;
}

export interface MobileOptimization {
  /** Se é iOS */
  isIOS: boolean;
  /** Se é Android */
  isAndroid: boolean;
  /** Se é web */
  isWeb: boolean;
  /** Tamanho mínimo de touch target para a plataforma */
  touchTarget: TouchTargetProps;
  /** Se screen reader está ativo */
  isScreenReaderEnabled: boolean;
  /** Se reduce motion está ativo */
  isReduceMotionEnabled: boolean;
  /** Largura da tela */
  screenWidth: number;
  /** Altura da tela */
  screenHeight: number;
  /** Se é tela pequena (< 375px) */
  isSmallScreen: boolean;
  /** Se é tablet (>= 768px) */
  isTablet: boolean;
  /** Estilos base para touch targets acessíveis */
  accessibleTouchStyle: {
    minHeight: number;
    minWidth: number;
    justifyContent: 'center';
    alignItems: 'center';
  };
  /** Configuração de FlatList otimizada */
  flatListConfig: {
    removeClippedSubviews: boolean;
    maxToRenderPerBatch: number;
    updateCellsBatchingPeriod: number;
    windowSize: number;
    initialNumToRender: number;
  };
  /** Configuração de imagem otimizada */
  imageConfig: {
    priority: 'low' | 'normal' | 'high';
    cachePolicy: 'memory' | 'disk' | 'memory-disk';
    transition: number;
  };
}

// ======================
// CONSTANTES
// ======================

const PLATFORM = {
  isIOS: Platform.OS === 'ios',
  isAndroid: Platform.OS === 'android',
  isWeb: Platform.OS === 'web',
};

const TOUCH_TARGETS = {
  ios: {
    minSize: Tokens.touchTargets.min, // 44pt (Apple HIG)
    hitSlop: Tokens.touchTargets.hitSlop.medium,
    padding: Tokens.spacing['3'],
  },
  android: {
    minSize: Tokens.touchTargets.minAndroid, // 48dp (Material Design 3)
    hitSlop: Tokens.touchTargets.hitSlop.medium,
    padding: Tokens.spacing['3'],
  },
  web: {
    minSize: Tokens.touchTargets.min,
    hitSlop: 0, // Web não usa hit slop
    padding: Tokens.spacing['3'],
  },
};

// ======================
// HOOK PRINCIPAL
// ======================

export function useMobileOptimization(): MobileOptimization {
  const { width, height } = useWindowDimensions();
  const [isScreenReaderEnabled, setIsScreenReaderEnabled] = useState(false);
  const [isReduceMotionEnabled, setIsReduceMotionEnabled] = useState(false);

  // Detectar accessibility settings
  useEffect(() => {
    const checkAccessibility = async () => {
      const [screenReader, reduceMotion] = await Promise.all([
        AccessibilityInfo.isScreenReaderEnabled(),
        AccessibilityInfo.isReduceMotionEnabled(),
      ]);
      setIsScreenReaderEnabled(screenReader);
      setIsReduceMotionEnabled(reduceMotion);
    };

    checkAccessibility();

    // Listeners para mudanças
    const screenReaderSub = AccessibilityInfo.addEventListener(
      'screenReaderChanged',
      setIsScreenReaderEnabled
    );
    const reduceMotionSub = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      setIsReduceMotionEnabled
    );

    return () => {
      screenReaderSub.remove();
      reduceMotionSub.remove();
    };
  }, []);

  // Touch target para plataforma atual
  const touchTarget = useMemo((): TouchTargetProps => {
    if (PLATFORM.isIOS) return TOUCH_TARGETS.ios;
    if (PLATFORM.isAndroid) return TOUCH_TARGETS.android;
    return TOUCH_TARGETS.web;
  }, []);

  // Verificações de tamanho de tela
  const isSmallScreen = width < 375;
  const isTablet = width >= 768;

  // Estilo base para touch targets acessíveis
  const accessibleTouchStyle = useMemo(
    () => ({
      minHeight: touchTarget.minSize,
      minWidth: touchTarget.minSize,
      justifyContent: 'center' as const,
      alignItems: 'center' as const,
    }),
    [touchTarget.minSize]
  );

  // Configuração otimizada de FlatList
  const flatListConfig = useMemo(
    () => ({
      removeClippedSubviews: PLATFORM.isAndroid, // Só Android (iOS tem problemas)
      maxToRenderPerBatch: isSmallScreen ? 5 : 10,
      updateCellsBatchingPeriod: 50,
      windowSize: isSmallScreen ? 5 : 10,
      initialNumToRender: isSmallScreen ? 5 : 8,
    }),
    [isSmallScreen]
  );

  // Configuração otimizada de imagens
  const imageConfig = useMemo(
    () => ({
      priority: 'normal' as const,
      cachePolicy: 'memory-disk' as const,
      transition: isReduceMotionEnabled ? 0 : 200,
    }),
    [isReduceMotionEnabled]
  );

  return {
    ...PLATFORM,
    touchTarget,
    isScreenReaderEnabled,
    isReduceMotionEnabled,
    screenWidth: width,
    screenHeight: height,
    isSmallScreen,
    isTablet,
    accessibleTouchStyle,
    flatListConfig,
    imageConfig,
  };
}

// ======================
// HOOKS AUXILIARES
// ======================

/**
 * Hook para criar props de acessibilidade completas
 */
export function useAccessibleProps(config: {
  label: string;
  hint?: string;
  role?: 'button' | 'link' | 'header' | 'text' | 'image' | 'none';
  disabled?: boolean;
  selected?: boolean;
  busy?: boolean;
}) {
  return useMemo(
    () => ({
      accessible: true,
      accessibilityLabel: config.label,
      accessibilityHint: config.hint,
      accessibilityRole: config.role || 'button',
      accessibilityState: {
        disabled: config.disabled,
        selected: config.selected,
        busy: config.busy,
      },
    }),
    [config.label, config.hint, config.role, config.disabled, config.selected, config.busy]
  );
}

/**
 * Hook para criar hit slop otimizado
 */
export function useHitSlop(size: 'small' | 'medium' | 'large' = 'medium') {
  const slopValue = Tokens.touchTargets.hitSlop[size];

  return useMemo(
    () => ({
      top: slopValue,
      bottom: slopValue,
      left: slopValue,
      right: slopValue,
    }),
    [slopValue]
  );
}

/**
 * Hook para lazy loading de componentes
 */
export function useLazyLoad() {
  const [isVisible, setIsVisible] = useState(false);

  const onLayout = useCallback(() => {
    // Marca como visível após primeiro layout
    setIsVisible(true);
  }, []);

  return { isVisible, onLayout };
}

export default useMobileOptimization;
