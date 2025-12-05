/**
 * MaternalCard - Componente unificado para todos os cards do app
 *
 * Substitui 8+ componentes de cards diferentes por um único componente
 * com 5 variants: hero | insight | action | progress | content
 *
 * Design maternal: calm, acolhedor, low cognitive load
 */

import { LinearGradient } from 'expo-linear-gradient';
import { Star } from 'lucide-react-native';
import React, { memo } from 'react';
import { ViewStyle, ImageBackground, StyleSheet } from 'react-native';

import { Box } from '@/components/atoms/Box';
import { HapticButton } from '@/components/atoms/HapticButton';
import { Heading } from '@/components/atoms/Heading';
import { ProgressIndicator } from '@/components/atoms/ProgressIndicator';
import { Text } from '@/components/atoms/Text';
import { useThemeColors, useTheme } from '@/theme';
import { Spacing, Radius, Shadows, ColorTokens } from '@/theme/tokens';

// ======================
// 🎨 TYPES
// ======================

export type MaternalCardVariant = 'hero' | 'insight' | 'action' | 'progress' | 'content';
export type MaternalCardSize = 'sm' | 'md' | 'lg' | 'xl';
export type MaternalCardEmotion =
  | 'calm'
  | 'warm'
  | 'energetic'
  | 'peaceful'
  | 'safe'
  | 'trust'
  | 'serenity';

export interface MaternalCardProps {
  // Core props
  variant: MaternalCardVariant;
  title: string;
  accessibilityLabel: string;

  // Optional common props
  subtitle?: string;
  icon?: React.ReactNode;
  image?: string;
  size?: MaternalCardSize;
  onPress?: () => void;

  // Variant-specific props
  emotion?: MaternalCardEmotion; // hero, insight
  badge?: string; // content
  badgeType?: 'default' | 'exclusive' | 'new'; // ⭐ NOVO: Tipos de badge
  warmBackground?: boolean; // ⭐ NOVO: Background warm para cards (dark mode)
  progress?: number; // progress (0-100)
  streak?: number; // progress (dias consecutivos)
  isCompleted?: boolean; // progress

  // Style override
  style?: ViewStyle;
}

// ======================
// 📐 SIZE MAPPINGS
// ======================

const SIZE_CONFIG: Record<MaternalCardSize, { height: number; padding: keyof typeof Spacing }> = {
  sm: { height: 120, padding: '3' },
  md: { height: 180, padding: '4' },
  lg: { height: 220, padding: '4' },
  xl: { height: 280, padding: '5' },
};

// ======================
// 🎨 EMOTION MAPPINGS
// ======================

/**
 * Helper para criar gradients baseados em tokens do design system
 * Usa tokens quando disponível, fallback para cores específicas quando necessário
 */
const getEmotionGradients = (
  colors: ReturnType<typeof useThemeColors>
): Record<MaternalCardEmotion, readonly string[]> => {
  // Usar cores raw dos tokens quando disponível
  const orangeColor = colors.raw?.accent?.orange || colors.raw?.warning?.[400] || '#FB923C';
  const coralColor = colors.raw?.primary?.[200] || '#FFCCD7'; // Rosa leitoso do token primary
  const deepMint = colors.raw?.mint?.[500] || '#0F5247'; // Deep mint do token
  const infoMain = colors.raw?.info?.[400] || '#60A5FA'; // Azul info
  const infoDeep = colors.raw?.info?.[600] || '#2563EB'; // Azul profundo
  const infoLight = colors.raw?.info?.[300] || '#93C5FD'; // Azul claro

  return {
    calm: [colors.primary.main, colors.primary.dark], // Ocean → Deep Navy - professional, trustworthy
    warm: [colors.secondary.light, coralColor], // Rosa leitoso - acolhimento maternal
    energetic: [colors.status.warning, orangeColor], // Sunshine → Orange - vibrante
    peaceful: [colors.status.success, deepMint], // Mint → Deep Mint - calmo, natureza
    safe: [colors.primary.main, colors.primary.light], // Light Ocean - confiável, suave (dark mode aware)
    // ⭐ NOVOS: Gradientes com Azul (preferência Nathália - Flo-inspired)
    trust: [infoMain, infoDeep], // Azul confiança - profissional, seguro
    serenity: [infoLight, coralColor], // Azul → Rosa suave - serenidade maternal
  };
};

// ======================
// 🧩 MAIN COMPONENT
// ======================

function MaternalCardComponent({
  variant,
  title,
  subtitle,
  icon,
  image,
  badge,
  badgeType = 'default',
  warmBackground = false,
  emotion = 'calm',
  progress,
  streak,
  isCompleted,
  size = 'md',
  onPress,
  accessibilityLabel,
  style,
}: MaternalCardProps) {
  const colors = useThemeColors();
  const sizeConfig = SIZE_CONFIG[size];
  const emotionGradients = getEmotionGradients(colors);
  const { isDark } = useTheme();

  // ⭐ Helper para badge styles baseado no tipo
  const getBadgeStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      alignSelf: 'flex-start',
      paddingHorizontal: Spacing['2'],
      paddingVertical: Spacing['1'],
      borderRadius: Radius.md,
      marginBottom: Spacing['2'],
    };

    if (badgeType === 'exclusive') {
      return {
        ...baseStyle,
        backgroundColor: ColorTokens.warning[400], // Amarelo sunshine (#FBBF24)
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
      };
    }
    if (badgeType === 'new') {
      return {
        ...baseStyle,
        backgroundColor: colors.primary.main,
      };
    }
    return {
      ...baseStyle,
      backgroundColor: colors.primary.main,
    };
  };

  // ⭐ Helper para overlay com warm background
  const getOverlayColor = () => {
    if (warmBackground && isDark) {
      // Overlay rosa suave no dark mode (inspirado nas imagens)
      return colors.raw?.overlay?.highlight || 'rgba(255, 122, 150, 0.15)';
    }
    return colors.background.overlay;
  };

  // ======================
  // 🎯 VARIANT RENDERERS
  // ======================

  const renderHero = () => {
    const gradient = emotionGradients[emotion];

    return (
      <HapticButton
        variant="primary"
        size="lg"
        onPress={onPress}
        accessibilityLabel={accessibilityLabel}
        style={StyleSheet.flatten([
          {
            height: sizeConfig.height,
            borderRadius: Radius['3xl'],
            overflow: 'hidden',
            ...Shadows.lg,
          },
          style,
        ])}
      >
        <LinearGradient
          colors={[gradient[0], gradient[1]]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            flex: 1,
            padding: Spacing[sizeConfig.padding],
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          {icon && <Box style={{ marginBottom: Spacing['3'] }}>{icon}</Box>}

          <Heading level="h3" color="inverse" align="center">
            {title}
          </Heading>

          {subtitle && (
            <Text color="inverse" align="center" style={{ marginTop: Spacing['2'], opacity: 0.9 }}>
              {subtitle}
            </Text>
          )}
        </LinearGradient>
      </HapticButton>
    );
  };

  const renderInsight = () => {
    return (
      <HapticButton
        variant="outline"
        size="md"
        onPress={onPress}
        accessibilityLabel={accessibilityLabel}
        style={StyleSheet.flatten([
          {
            height: sizeConfig.height,
            borderRadius: Radius['2xl'],
            backgroundColor: colors.background.card,
            borderWidth: 1,
            borderColor: colors.border.light, // Usar token de borda
            ...Shadows.sm, // Shadow suave
          },
          style,
        ])}
      >
        <Box
          style={{
            flex: 1,
            padding: Spacing[sizeConfig.padding],
            justifyContent: 'center',
          }}
        >
          {icon && <Box style={{ marginBottom: Spacing['2'] }}>{icon}</Box>}

          <Heading level="h4" color="primary">
            {title}
          </Heading>

          {subtitle && (
            <Text color="secondary" size="sm" style={{ marginTop: Spacing['2'] }}>
              {subtitle}
            </Text>
          )}
        </Box>
      </HapticButton>
    );
  };

  const renderAction = () => {
    return (
      <HapticButton
        variant="ghost"
        size="sm"
        onPress={onPress}
        accessibilityLabel={accessibilityLabel}
        style={StyleSheet.flatten([
          {
            height: sizeConfig.height,
            borderRadius: Radius.xl,
            backgroundColor: colors.background.elevated,
            ...Shadows.sm,
          },
          style,
        ])}
      >
        <Box
          style={{
            flex: 1,
            padding: Spacing[sizeConfig.padding],
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          {icon && <Box style={{ marginBottom: Spacing['2'] }}>{icon}</Box>}

          <Text color="primary" size="md" weight="semibold" align="center">
            {title}
          </Text>
        </Box>
      </HapticButton>
    );
  };

  const renderProgress = () => {
    return (
      <HapticButton
        variant="outline"
        size="md"
        onPress={onPress}
        accessibilityLabel={accessibilityLabel}
        style={StyleSheet.flatten([
          {
            height: sizeConfig.height,
            borderRadius: Radius['2xl'],
            backgroundColor: colors.background.card,
            ...Shadows.md,
          },
          style,
        ])}
      >
        <Box
          style={{
            flex: 1,
            padding: Spacing[sizeConfig.padding],
            justifyContent: 'space-between',
          }}
        >
          {/* Header: Título + Status */}
          <Box
            style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}
          >
            <Heading level="h5" color="primary">
              {title}
            </Heading>

            {isCompleted && (
              <Text size="xs" color="success" weight="semibold">
                ✓ Feito
              </Text>
            )}
          </Box>

          {/* Progress bar */}
          {progress !== undefined && (
            <Box style={{ marginVertical: Spacing['3'] }}>
              <ProgressIndicator progress={progress / 100} type="linear" size="sm" />
            </Box>
          )}

          {/* Footer: Streak */}
          {streak !== undefined && streak > 0 && (
            <Box style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text size="sm" color="secondary">
                🔥 {streak} {streak === 1 ? 'dia' : 'dias'} consecutivos
              </Text>
            </Box>
          )}
        </Box>
      </HapticButton>
    );
  };

  const renderContent = () => {
    return (
      <HapticButton
        variant="ghost"
        size="md"
        onPress={onPress}
        accessibilityLabel={accessibilityLabel}
        style={StyleSheet.flatten([
          {
            width: 280,
            height: sizeConfig.height,
            borderRadius: Radius['2xl'],
            overflow: 'hidden',
            ...Shadows.md,
          },
          style,
        ])}
      >
        {/* Imagem de fundo ou placeholder */}
        {image ? (
          <ImageBackground
            source={{ uri: image }}
            style={{ flex: 1 }}
            imageStyle={{ borderRadius: Radius['2xl'] }}
          >
            <Box
              style={{
                flex: 1,
                backgroundColor: warmBackground ? getOverlayColor() : colors.background.overlay,
                padding: Spacing[sizeConfig.padding],
                justifyContent: 'flex-end',
              }}
            >
              {badge && (
                <Box style={getBadgeStyle()}>
                  {/* ⭐ ESTRELA AMARELA para badge "exclusive" */}
                  {badgeType === 'exclusive' && (
                    <Star size={12} color={colors.text.inverse} fill={colors.text.inverse} />
                  )}
                  <Text
                    size="xs"
                    color="inverse"
                    weight="semibold"
                    style={{
                      textTransform: badgeType === 'exclusive' ? 'uppercase' : 'none',
                      letterSpacing: badgeType === 'exclusive' ? 0.5 : 0,
                    }}
                  >
                    {badge}
                  </Text>
                </Box>
              )}

              <Heading level="h5" color="inverse">
                {title}
              </Heading>
            </Box>
          </ImageBackground>
        ) : (
          <Box
            style={{
              flex: 1,
              backgroundColor: colors.background.card,
              padding: Spacing[sizeConfig.padding],
              justifyContent: 'flex-end',
            }}
          >
            {badge && (
              <Box
                style={{
                  alignSelf: 'flex-start',
                  backgroundColor: colors.primary.main,
                  paddingHorizontal: Spacing['2'],
                  paddingVertical: Spacing['1'],
                  borderRadius: Radius.md,
                  marginBottom: Spacing['2'],
                }}
              >
                <Text size="xs" color="inverse" weight="semibold">
                  {badge}
                </Text>
              </Box>
            )}

            <Heading level="h5" color="primary">
              {title}
            </Heading>
          </Box>
        )}
      </HapticButton>
    );
  };

  // ======================
  // 🎯 VARIANT SWITCH
  // ======================

  switch (variant) {
    case 'hero':
      return renderHero();
    case 'insight':
      return renderInsight();
    case 'action':
      return renderAction();
    case 'progress':
      return renderProgress();
    case 'content':
      return renderContent();
    default:
      return null;
  }
}

// ======================
// 📦 EXPORT
// ======================

export const MaternalCard = memo(MaternalCardComponent);
