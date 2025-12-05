/**
 * AudioWellnessCard - Card de áudio de bem-estar com foto da Nathália
 * Design premium com player integrado
 */

import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Play, Pause, Clock, Headphones, Sparkles, Lock } from 'lucide-react-native';
import React, { memo } from 'react';
import { View, TouchableOpacity, StyleSheet, ActivityIndicator, Dimensions } from 'react-native';

import { Text } from '@/components/atoms/Text';
import type { AudioWellnessItem, AudioCategory } from '@/data/audioWellness';
import { useTheme } from '@/theme';
import { Tokens, ColorTokens } from '@/theme/tokens';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - Tokens.spacing['5'] * 2;

// ======================
// TIPOS
// ======================

export interface AudioWellnessCardProps {
  audio: AudioWellnessItem;
  /** Se está atualmente tocando */
  isPlaying?: boolean;
  /** Se está carregando */
  isLoading?: boolean;
  /** Progresso da reprodução (0-1) */
  progress?: number;
  /** Callback ao pressionar play */
  onPlay: (audio: AudioWellnessItem) => void;
  /** Callback ao pressionar pause */
  onPause?: () => void;
  /** Variante do card */
  variant?: 'full' | 'compact' | 'mini';
  /** Se o conteúdo está bloqueado (premium) */
  isLocked?: boolean;
}

// ======================
// MAPEAMENTO DE CATEGORIAS
// ======================

const CATEGORY_LABELS: Record<AudioCategory, string> = {
  acolhimento: 'Acolhimento',
  autoajuda: 'Autoajuda',
  meditacao: 'Meditação',
  afirmacoes: 'Afirmações',
  sono: 'Para Dormir',
  energia: 'Energia',
  ritual: 'Ritual',
};

const CATEGORY_ICONS: Record<AudioCategory, React.ReactNode> = {
  acolhimento: <Headphones size={12} color={ColorTokens.neutral[0]} />,
  autoajuda: <Sparkles size={12} color={ColorTokens.neutral[0]} />,
  meditacao: <Headphones size={12} color={ColorTokens.neutral[0]} />,
  afirmacoes: <Sparkles size={12} color={ColorTokens.neutral[0]} />,
  sono: <Headphones size={12} color={ColorTokens.neutral[0]} />,
  energia: <Sparkles size={12} color={ColorTokens.neutral[0]} />,
  ritual: <Headphones size={12} color={ColorTokens.neutral[0]} />,
};

// ======================
// COMPONENTE PRINCIPAL
// ======================

export const AudioWellnessCard = memo(function AudioWellnessCard({
  audio,
  isPlaying = false,
  isLoading = false,
  progress = 0,
  onPlay,
  onPause,
  variant = 'full',
  isLocked = false,
}: AudioWellnessCardProps) {
  const { colors, isDark } = useTheme();

  const handlePress = () => {
    if (isLocked) return;

    if (isPlaying && onPause) {
      onPause();
    } else {
      onPlay(audio);
    }
  };

  // Formata plays para exibição (ex: 12.8K)
  const formatPlays = (plays?: number): string => {
    if (!plays) return '';
    if (plays >= 1000000) return `${(plays / 1000000).toFixed(1)}M`;
    if (plays >= 1000) return `${(plays / 1000).toFixed(1)}K`;
    return plays.toString();
  };

  if (variant === 'mini') {
    return (
      <TouchableOpacity
        onPress={handlePress}
        activeOpacity={0.85}
        disabled={isLocked}
        accessibilityRole="button"
        accessibilityLabel={`${audio.title}. ${audio.duration} minutos. ${isPlaying ? 'Tocando' : 'Pausado'}`}
        accessibilityHint={isLocked ? 'Conteúdo premium bloqueado' : 'Toque para reproduzir'}
        style={[
          styles.miniCard,
          {
            backgroundColor: isDark ? ColorTokens.neutral[800] : ColorTokens.neutral[0],
          },
        ]}
      >
        {/* Thumbnail */}
        <View style={styles.miniThumbnail}>
          <Image
            source={{ uri: audio.imageUrl }}
            style={styles.miniImage}
            contentFit="cover"
            transition={200}
          />
          <View style={[styles.miniPlayButton, { backgroundColor: audio.accentColor }]}>
            {isLoading ? (
              <ActivityIndicator size="small" color={ColorTokens.neutral[0]} />
            ) : isPlaying ? (
              <Pause size={14} color={ColorTokens.neutral[0]} fill={ColorTokens.neutral[0]} />
            ) : (
              <Play size={14} color={ColorTokens.neutral[0]} fill={ColorTokens.neutral[0]} />
            )}
          </View>
        </View>

        {/* Info */}
        <View style={styles.miniInfo}>
          <Text
            size="sm"
            weight="semibold"
            numberOfLines={1}
            style={{ color: colors.text.primary }}
          >
            {audio.title}
          </Text>
          <Text size="xs" style={{ color: colors.text.tertiary }}>
            {audio.duration} min
          </Text>
        </View>
      </TouchableOpacity>
    );
  }

  if (variant === 'compact') {
    return (
      <TouchableOpacity
        onPress={handlePress}
        activeOpacity={0.85}
        disabled={isLocked}
        accessibilityRole="button"
        accessibilityLabel={`${audio.title}. ${audio.description}. ${audio.duration} minutos`}
        accessibilityHint={isLocked ? 'Conteúdo premium bloqueado' : 'Toque para reproduzir'}
        style={[
          styles.compactCard,
          {
            backgroundColor: isDark ? ColorTokens.neutral[800] : ColorTokens.neutral[0],
            borderColor: isDark ? ColorTokens.neutral[700] : ColorTokens.neutral[200],
          },
        ]}
      >
        {/* Imagem */}
        <View style={styles.compactImageContainer}>
          <Image
            source={{ uri: audio.imageUrl }}
            style={styles.compactImage}
            contentFit="cover"
            transition={200}
          />
          <LinearGradient
            colors={['transparent', `${audio.accentColor}90`]}
            style={styles.compactGradient}
          />

          {/* Play Button */}
          <View style={[styles.compactPlayButton, { backgroundColor: audio.accentColor }]}>
            {isLoading ? (
              <ActivityIndicator size="small" color={ColorTokens.neutral[0]} />
            ) : isPlaying ? (
              <Pause size={18} color={ColorTokens.neutral[0]} fill={ColorTokens.neutral[0]} />
            ) : (
              <Play size={18} color={ColorTokens.neutral[0]} fill={ColorTokens.neutral[0]} />
            )}
          </View>

          {/* Premium Badge */}
          {audio.isPremium && (
            <View style={styles.premiumBadge}>
              <Lock size={10} color={ColorTokens.warning[400]} />
            </View>
          )}
        </View>

        {/* Conteúdo */}
        <View style={styles.compactContent}>
          <View style={styles.compactHeader}>
            <View style={[styles.categoryBadge, { backgroundColor: `${audio.accentColor}30` }]}>
              {CATEGORY_ICONS[audio.category]}
              <Text
                size="xs"
                weight="medium"
                style={{
                  color: audio.accentColor,
                  marginLeft: 4,
                  fontSize: 10,
                }}
              >
                {CATEGORY_LABELS[audio.category]}
              </Text>
            </View>
            <View style={styles.durationBadge}>
              <Clock size={10} color={colors.text.tertiary} />
              <Text size="xs" style={{ color: colors.text.tertiary, marginLeft: 2 }}>
                {audio.duration} min
              </Text>
            </View>
          </View>

          <Text
            size="md"
            weight="semibold"
            numberOfLines={2}
            style={{ color: colors.text.primary, marginTop: Tokens.spacing['2'] }}
          >
            {audio.title}
          </Text>

          <Text
            size="xs"
            numberOfLines={1}
            style={{ color: colors.text.secondary, marginTop: Tokens.spacing['1'] }}
          >
            {audio.description}
          </Text>

          {/* Progress Bar */}
          {isPlaying && progress > 0 && (
            <View style={styles.progressContainer}>
              <View style={[styles.progressBar, { backgroundColor: `${audio.accentColor}30` }]}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      backgroundColor: audio.accentColor,
                      width: `${progress * 100}%`,
                    },
                  ]}
                />
              </View>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  }

  // Variant: full (default)
  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.9}
      disabled={isLocked}
      accessibilityRole="button"
      accessibilityLabel={`${audio.title}. ${audio.description}. ${audio.duration} minutos. ${formatPlays(audio.plays)} reproduções`}
      accessibilityHint={isLocked ? 'Conteúdo premium bloqueado' : 'Toque para reproduzir'}
      style={styles.fullCard}
    >
      {/* Background Image */}
      <Image
        source={{ uri: audio.imageUrl }}
        style={styles.fullImage}
        contentFit="cover"
        transition={300}
      />

      {/* Gradient Overlay */}
      <LinearGradient
        colors={['transparent', `${audio.accentColor}40`, `${ColorTokens.neutral[900]}95`]}
        locations={[0, 0.4, 1]}
        style={styles.fullGradient}
      />

      {/* Locked Overlay */}
      {isLocked && (
        <View style={styles.lockedOverlay}>
          <Lock size={32} color={ColorTokens.neutral[0]} />
          <Text
            size="sm"
            weight="medium"
            style={{ color: ColorTokens.neutral[0], marginTop: Tokens.spacing['2'] }}
          >
            Conteúdo Premium
          </Text>
        </View>
      )}

      {/* Category Badge (top left) */}
      <View style={styles.topBadges}>
        <View style={[styles.fullCategoryBadge, { backgroundColor: audio.accentColor }]}>
          {CATEGORY_ICONS[audio.category]}
          <Text
            size="xs"
            weight="bold"
            style={{
              color: ColorTokens.neutral[0],
              marginLeft: 4,
              textTransform: 'uppercase',
              letterSpacing: 0.5,
            }}
          >
            {CATEGORY_LABELS[audio.category]}
          </Text>
        </View>

        {audio.isPremium && (
          <View style={styles.premiumBadgeFull}>
            <Sparkles size={12} color={ColorTokens.warning[400]} />
          </View>
        )}
      </View>

      {/* Content (bottom) */}
      <View style={styles.fullContent}>
        {/* Play Button */}
        <View style={styles.playButtonContainer}>
          <TouchableOpacity
            onPress={handlePress}
            activeOpacity={0.8}
            disabled={isLocked}
            style={[
              styles.fullPlayButton,
              {
                backgroundColor: isPlaying ? ColorTokens.neutral[0] : audio.accentColor,
              },
            ]}
            accessibilityRole="button"
            accessibilityLabel={isPlaying ? 'Pausar' : 'Reproduzir'}
          >
            {isLoading ? (
              <ActivityIndicator
                size="small"
                color={isPlaying ? audio.accentColor : ColorTokens.neutral[0]}
              />
            ) : isPlaying ? (
              <Pause size={24} color={audio.accentColor} fill={audio.accentColor} />
            ) : (
              <Play size={24} color={ColorTokens.neutral[0]} fill={ColorTokens.neutral[0]} />
            )}
          </TouchableOpacity>

          {/* Duration */}
          <View style={styles.durationBadgeFull}>
            <Clock size={12} color={ColorTokens.neutral[300]} />
            <Text size="sm" style={{ color: ColorTokens.neutral[300], marginLeft: 4 }}>
              {audio.duration} min
            </Text>
          </View>
        </View>

        {/* Title & Description */}
        <Text
          size="xl"
          weight="bold"
          numberOfLines={2}
          style={{
            color: ColorTokens.neutral[0],
            marginTop: Tokens.spacing['3'],
          }}
        >
          {audio.title}
        </Text>

        <Text
          size="sm"
          numberOfLines={2}
          style={{
            color: ColorTokens.neutral[300],
            marginTop: Tokens.spacing['2'],
            lineHeight: 20,
          }}
        >
          {audio.description}
        </Text>

        {/* Stats & Progress */}
        <View style={styles.statsRow}>
          {audio.plays && (
            <View style={styles.statItem}>
              <Headphones size={14} color={ColorTokens.neutral[400]} />
              <Text size="xs" style={{ color: ColorTokens.neutral[400], marginLeft: 4 }}>
                {formatPlays(audio.plays)} reproduções
              </Text>
            </View>
          )}
        </View>

        {/* Progress Bar */}
        {progress > 0 && (
          <View style={styles.fullProgressContainer}>
            <View style={styles.fullProgressBar}>
              <View
                style={[
                  styles.fullProgressFill,
                  {
                    backgroundColor: audio.accentColor,
                    width: `${progress * 100}%`,
                  },
                ]}
              />
            </View>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
});

// ======================
// STYLES
// ======================

const styles = StyleSheet.create({
  // Full variant
  fullCard: {
    width: CARD_WIDTH,
    height: 320,
    borderRadius: Tokens.radius['2xl'],
    overflow: 'hidden',
    position: 'relative',
    ...Tokens.shadows.lg,
  },
  fullImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  fullGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  lockedOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: ColorTokens.overlay.heavy,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  topBadges: {
    position: 'absolute',
    top: Tokens.spacing['4'],
    left: Tokens.spacing['4'],
    right: Tokens.spacing['4'],
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  fullCategoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Tokens.spacing['3'],
    paddingVertical: Tokens.spacing['1.5'],
    borderRadius: Tokens.radius.full,
  },
  premiumBadgeFull: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: ColorTokens.overlay.backdrop,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: Tokens.spacing['5'],
  },
  playButtonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Tokens.spacing['3'],
  },
  fullPlayButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    ...Tokens.shadows.md,
  },
  durationBadgeFull: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Tokens.spacing['3'],
    gap: Tokens.spacing['4'],
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fullProgressContainer: {
    marginTop: Tokens.spacing['3'],
  },
  fullProgressBar: {
    height: 4,
    backgroundColor: ColorTokens.neutral[700],
    borderRadius: 2,
    overflow: 'hidden',
  },
  fullProgressFill: {
    height: '100%',
    borderRadius: 2,
  },

  // Compact variant
  compactCard: {
    flexDirection: 'row',
    borderRadius: Tokens.radius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    ...Tokens.shadows.sm,
  },
  compactImageContainer: {
    width: 100,
    height: 100,
    position: 'relative',
  },
  compactImage: {
    width: '100%',
    height: '100%',
  },
  compactGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  compactPlayButton: {
    position: 'absolute',
    bottom: Tokens.spacing['2'],
    right: Tokens.spacing['2'],
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    ...Tokens.shadows.sm,
  },
  premiumBadge: {
    position: 'absolute',
    top: Tokens.spacing['2'],
    right: Tokens.spacing['2'],
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: ColorTokens.overlay.backdrop,
    alignItems: 'center',
    justifyContent: 'center',
  },
  compactContent: {
    flex: 1,
    padding: Tokens.spacing['3'],
    justifyContent: 'center',
  },
  compactHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Tokens.spacing['2'],
    paddingVertical: 2,
    borderRadius: Tokens.radius.sm,
  },
  durationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressContainer: {
    marginTop: Tokens.spacing['2'],
  },
  progressBar: {
    height: 3,
    borderRadius: 1.5,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 1.5,
  },

  // Mini variant
  miniCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Tokens.spacing['2'],
    borderRadius: Tokens.radius.lg,
    gap: Tokens.spacing['3'],
    ...Tokens.shadows.sm,
  },
  miniThumbnail: {
    width: 48,
    height: 48,
    borderRadius: Tokens.radius.md,
    overflow: 'hidden',
    position: 'relative',
  },
  miniImage: {
    width: '100%',
    height: '100%',
  },
  miniPlayButton: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  miniInfo: {
    flex: 1,
  },
});

export default AudioWellnessCard;
