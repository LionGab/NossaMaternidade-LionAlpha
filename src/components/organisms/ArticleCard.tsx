/**
 * ArticleCard
 *
 * Card de artigo/conteúdo com imagem e título.
 * Inspirado no design do Lofee - Health Woman UI Kit.
 *
 * @see https://www.figma.com/design/fqH3Ro3Ll8sL2s3EJuW22H/Lofee---Woman-Health-UI-Mobile-Design-Kit
 */

import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Clock, Heart } from 'lucide-react-native';
import React, { useMemo, memo } from 'react';
import { View, StyleSheet, Dimensions, ViewStyle } from 'react-native';

import { Box } from '@/components/atoms/Box';
import { HapticButton } from '@/components/atoms/HapticButton';
import { Text } from '@/components/atoms/Text';
import { useTheme } from '@/theme';
import { Tokens, ColorTokens } from '@/theme/tokens';

// ======================
// 🎯 TYPES
// ======================

export type ArticleCategory =
  | 'daily-woman'
  | 'mood-booster'
  | 'spread-happiness'
  | 'health-tips'
  | 'self-care'
  | 'pregnancy'
  | 'postpartum'
  | 'nutrition';

export interface ArticleCardProps {
  /** ID do artigo */
  id: string;
  /** Título do artigo */
  title: string;
  /** Subtítulo ou descrição curta */
  subtitle?: string;
  /** URL da imagem de capa */
  imageUrl?: string;
  /** Categoria do artigo */
  category: ArticleCategory;
  /** Tempo de leitura em minutos */
  readTime?: number;
  /** Se o artigo foi salvo/favorito */
  isSaved?: boolean;
  /** Callback ao clicar no card */
  onPress: () => void;
  /** Callback ao salvar/favoritar */
  onSave?: () => void;
  /** Variante do card */
  variant?: 'default' | 'compact' | 'featured';
}

// ======================
// 🎨 CATEGORY CONFIGS
// ======================

const CATEGORY_CONFIG: Record<
  ArticleCategory,
  {
    label: string;
    gradientColors: readonly [string, string];
    icon?: React.ComponentType<{ size: number; color: string }>;
  }
> = {
  'daily-woman': {
    label: 'Mulher do Dia',
    gradientColors: ColorTokens.category.dailyWoman,
  },
  'mood-booster': {
    label: 'Eleve o Humor',
    gradientColors: ColorTokens.category.moodBooster,
  },
  'spread-happiness': {
    label: 'Espalhe Felicidade',
    gradientColors: ColorTokens.category.spreadHappiness,
  },
  'health-tips': {
    label: 'Dicas de Saúde',
    gradientColors: ColorTokens.category.healthTips,
  },
  'self-care': {
    label: 'Autocuidado',
    gradientColors: ColorTokens.category.selfCare,
  },
  pregnancy: {
    label: 'Gravidez',
    gradientColors: ColorTokens.category.pregnancy,
  },
  postpartum: {
    label: 'Pós-parto',
    gradientColors: ColorTokens.category.postpartum,
  },
  nutrition: {
    label: 'Nutrição',
    gradientColors: ColorTokens.category.nutrition,
  },
};

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = (SCREEN_WIDTH - Tokens.spacing['4'] * 2 - Tokens.spacing['3']) / 2;

// ======================
// 🧩 COMPONENT
// ======================

const ArticleCardComponent: React.FC<ArticleCardProps> = ({
  id: _id,
  title,
  subtitle,
  imageUrl,
  category,
  readTime,
  isSaved = false,
  onPress,
  onSave,
  variant = 'default',
}) => {
  const { colors, isDark } = useTheme();
  const config = CATEGORY_CONFIG[category];

  const cardWidth = useMemo(() => {
    switch (variant) {
      case 'compact':
        return CARD_WIDTH * 0.8;
      case 'featured':
        return SCREEN_WIDTH - Tokens.spacing['4'] * 2;
      default:
        return CARD_WIDTH;
    }
  }, [variant]);

  const cardHeight = useMemo(() => {
    switch (variant) {
      case 'compact':
        return 140;
      case 'featured':
        return 200;
      default:
        return 160;
    }
  }, [variant]);

  return (
    <HapticButton
      variant="ghost"
      onPress={onPress}
      style={
        {
          ...styles.container,
          width: cardWidth,
          height: cardHeight,
          backgroundColor: isDark ? colors.background.elevated : colors.background.card,
          shadowColor: colors.text.primary,
        } as ViewStyle
      }
      accessibilityLabel={`${title}, ${config.label}`}
      accessibilityHint="Toque para ler o artigo"
    >
      {/* Background Image or Gradient */}
      {imageUrl ? (
        <Image source={{ uri: imageUrl }} style={styles.backgroundImage} contentFit="cover" />
      ) : (
        <LinearGradient
          colors={config.gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.backgroundGradient}
        />
      )}

      {/* Overlay */}
      <LinearGradient colors={['transparent', ColorTokens.overlay.dark]} style={styles.overlay} />

      {/* Save Button */}
      {onSave && (
        <HapticButton
          variant="ghost"
          size="sm"
          onPress={() => onSave()}
          style={styles.saveButton}
          accessibilityLabel={isSaved ? 'Remover dos salvos' : 'Salvar artigo'}
        >
          <Heart
            size={18}
            color={colors.text.inverse}
            fill={isSaved ? ColorTokens.accent.coral : 'transparent'}
          />
        </HapticButton>
      )}

      {/* Content */}
      <View style={styles.content}>
        {/* Category Badge */}
        <View style={[styles.categoryBadge, { backgroundColor: ColorTokens.overlay.light }]}>
          <Text size="xs" weight="medium" style={{ color: ColorTokens.neutral[0] }}>
            {config.label}
          </Text>
        </View>

        {/* Title */}
        <Text
          size={variant === 'featured' ? 'lg' : 'md'}
          weight="bold"
          numberOfLines={2}
          style={{ color: ColorTokens.neutral[0] }}
        >
          {title}
        </Text>

        {/* Subtitle (featured only) */}
        {variant === 'featured' && subtitle && (
          <Text
            size="sm"
            numberOfLines={2}
            style={{ color: ColorTokens.neutral[200], marginTop: Tokens.spacing['1'] }}
          >
            {subtitle}
          </Text>
        )}

        {/* Read Time */}
        {readTime && (
          <Box direction="row" align="center" mt="2" style={{ gap: Tokens.spacing['1'] }}>
            <Clock size={12} color={ColorTokens.neutral[200]} />
            <Text size="xs" style={{ color: ColorTokens.neutral[200] }}>
              {readTime} min
            </Text>
          </Box>
        )}
      </View>
    </HapticButton>
  );
};

// ======================
// 💄 STYLES
// ======================

const styles = StyleSheet.create({
  container: {
    borderRadius: Tokens.radius.xl,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  backgroundImage: {
    ...StyleSheet.absoluteFillObject,
  },
  backgroundGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  saveButton: {
    position: 'absolute',
    top: Tokens.spacing['2'],
    right: Tokens.spacing['2'],
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: ColorTokens.overlay.medium,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: Tokens.spacing['3'],
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: Tokens.spacing['2'],
    paddingVertical: Tokens.spacing['1'],
    borderRadius: Tokens.radius.md,
    marginBottom: Tokens.spacing['2'],
  },
});

// 🚀 MEMOIZATION: Evita re-renders desnecessários quando props não mudam
export const ArticleCard = memo(ArticleCardComponent);

export default ArticleCard;
