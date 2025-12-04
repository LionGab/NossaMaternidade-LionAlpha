/**
 * HeroHeader - Header Hero com Imagem de Fundo
 *
 * Adaptado do InfluencerHeader do GeminiApp para React Native
 * Suporta overlays, conteudo sobreposto e cantos arredondados
 *
 * @version 1.0.0
 */

import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useMemo } from 'react';
import {
  View,
  ImageBackground,
  StyleSheet,
  ViewStyle,
  ImageSourcePropType,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '../theme/ThemeContext';
import { Spacing, ColorTokens } from '../theme/tokens';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export interface HeroHeaderProps {
  /** Imagem de fundo (local ou URL) */
  backgroundImage?: ImageSourcePropType | string;
  /** Altura do header (default: 320) */
  height?: number;
  /** Conteudo principal (dentro do header) */
  children?: React.ReactNode;
  /** Conteudo no canto superior direito */
  topRightContent?: React.ReactNode;
  /** Conteudo no canto superior esquerdo */
  topLeftContent?: React.ReactNode;
  /** Elemento que se sobrepoe ao final do header */
  overlapElement?: React.ReactNode;
  /** Quantidade de sobreposicao do overlap (default: 60) */
  overlapAmount?: number;
  /** Border radius inferior (default: 32) */
  bottomRadius?: number;
  /** Opacidade do overlay escuro (0-1, default: 0.3) */
  overlayOpacity?: number;
  /** Mostrar gradiente inferior (default: true) */
  showBottomGradient?: boolean;
  /** Cor de fundo quando sem imagem */
  fallbackColor?: string;
  /** Estilo customizado do container */
  style?: ViewStyle;
  /** Usar blur no overlay (iOS) */
  useBlur?: boolean;
}

export const HeroHeader: React.FC<HeroHeaderProps> = ({
  backgroundImage,
  height = 320,
  children,
  topRightContent,
  topLeftContent,
  overlapElement,
  overlapAmount = 60,
  bottomRadius = 32,
  overlayOpacity = 0.3,
  showBottomGradient = true,
  fallbackColor,
  style,
  useBlur = false,
}) => {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();

  // Resolve image source
  const imageSource = useMemo(() => {
    if (!backgroundImage) return null;
    if (typeof backgroundImage === 'string') {
      return { uri: backgroundImage };
    }
    return backgroundImage;
  }, [backgroundImage]);

  // Gradient colors for bottom fade
  const gradientColors = useMemo(() => {
    const bgColor = colors.background.canvas;
    return [
      'transparent',
      `${bgColor}00`,
      `${bgColor}40`,
      `${bgColor}80`,
      `${bgColor}CC`,
      bgColor,
    ] as const;
  }, [colors.background.canvas]);

  // Container style with overlap consideration
  const containerStyle: ViewStyle = useMemo(
    () => ({
      height: height + (overlapElement ? overlapAmount : 0),
      marginBottom: overlapElement ? -overlapAmount : 0,
    }),
    [height, overlapElement, overlapAmount]
  );

  const renderContent = () => (
    <>
      {/* Dark overlay */}
      {useBlur ? (
        <BlurView
          intensity={20}
          tint={isDark ? 'dark' : 'light'}
          style={[styles.overlay, { opacity: overlayOpacity }]}
        />
      ) : (
        <View
          style={[
            styles.overlay,
            { backgroundColor: ColorTokens.overlay.dark, opacity: overlayOpacity },
          ]}
        />
      )}

      {/* Bottom gradient */}
      {showBottomGradient && (
        <LinearGradient
          colors={gradientColors}
          style={[
            styles.gradient,
            { borderBottomLeftRadius: bottomRadius, borderBottomRightRadius: bottomRadius },
          ]}
          locations={[0, 0.3, 0.5, 0.7, 0.85, 1]}
        />
      )}

      {/* Top left content */}
      {topLeftContent && (
        <View style={[styles.topLeft, { top: insets.top + Spacing['3'] }]}>{topLeftContent}</View>
      )}

      {/* Top right content */}
      {topRightContent && (
        <View style={[styles.topRight, { top: insets.top + Spacing['3'] }]}>{topRightContent}</View>
      )}

      {/* Main content */}
      {children && (
        <View style={[styles.content, { paddingTop: insets.top + Spacing['10'] }]}>{children}</View>
      )}

      {/* Overlap element */}
      {overlapElement && (
        <View style={[styles.overlapContainer, { bottom: -overlapAmount / 2 }]}>
          {overlapElement}
        </View>
      )}
    </>
  );

  return (
    <View style={[containerStyle, style]}>
      {imageSource ? (
        <ImageBackground
          source={imageSource}
          style={[styles.imageBackground, { height }]}
          imageStyle={[
            styles.image,
            { borderBottomLeftRadius: bottomRadius, borderBottomRightRadius: bottomRadius },
          ]}
          resizeMode="cover"
        >
          {renderContent()}
        </ImageBackground>
      ) : (
        <View
          style={[
            styles.imageBackground,
            {
              height,
              backgroundColor:
                fallbackColor || (isDark ? colors.background.elevated : ColorTokens.accent.ocean),
              borderBottomLeftRadius: bottomRadius,
              borderBottomRightRadius: bottomRadius,
            },
          ]}
        >
          {renderContent()}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  imageBackground: {
    width: SCREEN_WIDTH,
    position: 'relative',
    overflow: 'hidden',
  },
  image: {
    transform: [{ scale: 1.05 }], // Slight zoom like web
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  gradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '60%',
  },
  topLeft: {
    position: 'absolute',
    left: Spacing['5'],
    zIndex: 60,
  },
  topRight: {
    position: 'absolute',
    right: Spacing['5'],
    zIndex: 60,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing['5'],
    paddingBottom: Spacing['6'],
    justifyContent: 'flex-end',
    zIndex: 40,
  },
  overlapContainer: {
    position: 'absolute',
    left: Spacing['5'],
    right: Spacing['5'],
    zIndex: 50,
  },
});

export default HeroHeader;
