/**
 * HomeScreen Components
 *
 * Componentes extraídos para reduzir duplicação e melhorar performance.
 *
 * @version 1.0.0
 */

import { LinearGradient } from 'expo-linear-gradient';
import React, { memo } from 'react';
import { View } from 'react-native';

import { ColorTokens } from '@/theme/tokens';

import { LAYOUT } from './HomeScreen.constants';

/**
 * Efeitos visuais do header (gradientes + círculos de brilho)
 * Extraído para evitar duplicação entre iOS (BlurView) e Android
 */
export const HeaderEffects = memo(() => {
  return (
    <>
      {/* Gradiente azul suave de fundo */}
      <LinearGradient
        colors={[
          `${ColorTokens.info[50]}99`,
          `${ColorTokens.accent.oceanLight}80`,
          `${ColorTokens.info[100]}66`,
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ position: 'absolute', inset: 0 }}
      />

      {/* Círculo de brilho superior direito */}
      <View
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: LAYOUT.blurCircleLarge,
          height: LAYOUT.blurCircleLarge,
          borderRadius: LAYOUT.blurCircleLarge / 2,
          backgroundColor: `${ColorTokens.info[200]}26`,
          transform: [
            { translateX: LAYOUT.blurCircleLarge / 2 },
            { translateY: -LAYOUT.blurCircleLarge / 2 },
          ],
        }}
      />

      {/* Círculo de brilho inferior esquerdo */}
      <View
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          width: LAYOUT.blurCircleMedium,
          height: LAYOUT.blurCircleMedium,
          borderRadius: LAYOUT.blurCircleMedium / 2,
          backgroundColor: `${ColorTokens.accent.oceanLight}1F`,
          transform: [
            { translateX: -LAYOUT.blurCircleMedium / 2 },
            { translateY: LAYOUT.blurCircleMedium / 2 },
          ],
        }}
      />
    </>
  );
});

HeaderEffects.displayName = 'HeaderEffects';

/**
 * Círculos de brilho decorativos para cards
 */
interface CardBlurEffectProps {
  position: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  color: string;
  size?: number;
}

export const CardBlurEffect = memo<CardBlurEffectProps>(({ position, color, size = LAYOUT.blurCircleMedium }) => {
  const getPositionStyles = () => {
    switch (position) {
      case 'top-right':
        return { top: 0, right: 0, translateX: size / 2, translateY: -size / 2 };
      case 'top-left':
        return { top: 0, left: 0, translateX: -size / 2, translateY: -size / 2 };
      case 'bottom-right':
        return { bottom: 0, right: 0, translateX: size / 2, translateY: size / 2 };
      case 'bottom-left':
        return { bottom: 0, left: 0, translateX: -size / 2, translateY: size / 2 };
      default:
        return { top: 0, right: 0, translateX: size / 2, translateY: -size / 2 };
    }
  };

  const pos = getPositionStyles();

  return (
    <View
      style={{
        position: 'absolute',
        ...('top' in pos && { top: pos.top }),
        ...('right' in pos && { right: pos.right }),
        ...('bottom' in pos && { bottom: pos.bottom }),
        ...('left' in pos && { left: pos.left }),
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: color,
        transform: [{ translateX: pos.translateX }, { translateY: pos.translateY }],
      }}
    />
  );
});

CardBlurEffect.displayName = 'CardBlurEffect';
