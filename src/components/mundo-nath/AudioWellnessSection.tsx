/**
 * AudioWellnessSection - Seção de áudios de bem-estar com a Nathália
 * Carrossel horizontal de categorias + destaque principal
 */

import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { Headphones, Heart, Moon, Sun, Sparkles, Wind, ChevronRight } from 'lucide-react-native';
import React, { useState, useCallback } from 'react';
import { View, TouchableOpacity, StyleSheet, FlatList } from 'react-native';

import { Box } from '@/components/primitives/Box';
import { Text } from '@/components/primitives/Text';
import {
  AUDIO_WELLNESS_CATALOG,
  AUDIO_COLORS,
  getPopularAudios,
  getAudiosByCategory,
  type AudioCategory,
  type AudioWellnessItem,
} from '@/data/audioWellness';
import { useAudioPlayer, formatTime } from '@/hooks/useAudioPlayer';
import { useTheme } from '@/theme';
import { Tokens, ColorTokens } from '@/theme/tokens';
import { logger } from '@/utils/logger';

import { AudioWellnessCard } from './AudioWellnessCard';

// ======================
// TIPOS
// ======================

interface CategoryTab {
  id: AudioCategory | 'all' | 'popular';
  label: string;
  icon: React.ReactNode;
  color: string;
}

export interface AudioWellnessSectionProps {
  /** Callback quando um áudio começa a tocar */
  onAudioPlay?: (audio: AudioWellnessItem) => void;
  /** Callback para ver todos os áudios */
  onSeeAll?: () => void;
  /** Mostrar player mini fixo quando tocando */
  showMiniPlayer?: boolean;
}

// ======================
// CATEGORIAS
// ======================

const CATEGORY_TABS: CategoryTab[] = [
  {
    id: 'popular',
    label: 'Populares',
    icon: <Sparkles size={16} />,
    color: ColorTokens.primary[500],
  },
  {
    id: 'acolhimento',
    label: 'Acolhimento',
    icon: <Heart size={16} />,
    color: AUDIO_COLORS.acolhimento,
  },
  {
    id: 'meditacao',
    label: 'Meditação',
    icon: <Wind size={16} />,
    color: AUDIO_COLORS.meditacao,
  },
  {
    id: 'sono',
    label: 'Para Dormir',
    icon: <Moon size={16} />,
    color: AUDIO_COLORS.sono,
  },
  {
    id: 'energia',
    label: 'Energia',
    icon: <Sun size={16} />,
    color: AUDIO_COLORS.energia,
  },
  {
    id: 'afirmacoes',
    label: 'Afirmações',
    icon: <Sparkles size={16} />,
    color: AUDIO_COLORS.afirmacoes,
  },
];

// ======================
// COMPONENTE PRINCIPAL
// ======================

export function AudioWellnessSection({
  onAudioPlay,
  onSeeAll,
  showMiniPlayer = true,
}: AudioWellnessSectionProps) {
  const { colors, isDark } = useTheme();
  const [selectedCategory, setSelectedCategory] = useState<CategoryTab['id']>('popular');

  // Hook de áudio
  const {
    currentAudio,
    isPlaying,
    isLoading,
    progress,
    position,
    duration,
    play,
    pause,
    toggle,
    forward,
    rewind,
  } = useAudioPlayer();

  // Filtra áudios pela categoria selecionada
  const getFilteredAudios = useCallback((): AudioWellnessItem[] => {
    if (selectedCategory === 'popular') {
      return getPopularAudios(6);
    }
    if (selectedCategory === 'all') {
      return AUDIO_WELLNESS_CATALOG;
    }
    return getAudiosByCategory(selectedCategory as AudioCategory);
  }, [selectedCategory]);

  const filteredAudios = getFilteredAudios();
  const featuredAudio = filteredAudios[0];
  const otherAudios = filteredAudios.slice(1, 5);

  // Handlers
  const handleCategoryPress = (category: CategoryTab['id']) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedCategory(category);
  };

  const handlePlay = async (audio: AudioWellnessItem) => {
    logger.info('Playing audio', { audioId: audio.id, title: audio.title });
    onAudioPlay?.(audio);
    await play(audio);
  };

  const handlePause = async () => {
    await pause();
  };

  const handleSeeAll = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSeeAll?.();
  };

  // Renderiza item da categoria
  const renderCategoryTab = ({ item }: { item: CategoryTab }) => {
    const isSelected = selectedCategory === item.id;

    return (
      <TouchableOpacity
        onPress={() => handleCategoryPress(item.id)}
        activeOpacity={0.7}
        accessibilityRole="tab"
        accessibilityState={{ selected: isSelected }}
        accessibilityLabel={`Categoria ${item.label}`}
        style={[
          styles.categoryTab,
          {
            backgroundColor: isSelected
              ? item.color
              : isDark
                ? ColorTokens.neutral[800]
                : ColorTokens.neutral[100],
            borderColor: isSelected ? item.color : 'transparent',
          },
        ]}
      >
        <View style={{ opacity: isSelected ? 1 : 0.7 }}>
          {React.cloneElement(item.icon as React.ReactElement<{ color: string }>, {
            color: isSelected ? ColorTokens.neutral[0] : item.color,
          })}
        </View>
        <Text
          size="sm"
          weight={isSelected ? 'semibold' : 'medium'}
          style={{
            color: isSelected ? ColorTokens.neutral[0] : colors.text.secondary,
            marginLeft: Tokens.spacing['2'],
          }}
        >
          {item.label}
        </Text>
      </TouchableOpacity>
    );
  };

  // Renderiza card de áudio na lista
  const renderAudioCard = ({ item }: { item: AudioWellnessItem }) => {
    const isCurrentlyPlaying = currentAudio?.id === item.id && isPlaying;
    const isCurrentlyLoading = currentAudio?.id === item.id && isLoading;
    const currentProgress = currentAudio?.id === item.id ? progress : 0;

    return (
      <View style={{ marginBottom: Tokens.spacing['3'] }}>
        <AudioWellnessCard
          audio={item}
          variant="compact"
          isPlaying={isCurrentlyPlaying}
          isLoading={isCurrentlyLoading}
          progress={currentProgress}
          onPlay={handlePlay}
          onPause={handlePause}
        />
      </View>
    );
  };

  return (
    <Box style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View
            style={[styles.iconContainer, { backgroundColor: `${ColorTokens.primary[500]}20` }]}
          >
            <Headphones size={20} color={ColorTokens.primary[500]} />
          </View>
          <View>
            <Text size="lg" weight="bold" style={{ color: colors.text.primary }}>
              Áudios de Acolhimento
            </Text>
            <Text size="xs" style={{ color: colors.text.secondary }}>
              Com a voz da Nathália
            </Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={handleSeeAll}
          style={styles.seeAllButton}
          accessibilityRole="button"
          accessibilityLabel="Ver todos os áudios"
        >
          <Text size="sm" weight="medium" style={{ color: colors.primary.main }}>
            Ver todos
          </Text>
          <ChevronRight size={16} color={colors.primary.main} />
        </TouchableOpacity>
      </View>

      {/* Category Tabs */}
      <View style={styles.categoriesContainer}>
        <FlatList
          data={CATEGORY_TABS}
          renderItem={renderCategoryTab}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesList}
        />
      </View>

      {/* Featured Audio Card */}
      {featuredAudio && (
        <View style={styles.featuredContainer}>
          <AudioWellnessCard
            audio={featuredAudio}
            variant="full"
            isPlaying={currentAudio?.id === featuredAudio.id && isPlaying}
            isLoading={currentAudio?.id === featuredAudio.id && isLoading}
            progress={currentAudio?.id === featuredAudio.id ? progress : 0}
            onPlay={handlePlay}
            onPause={handlePause}
          />
        </View>
      )}

      {/* Other Audios List */}
      {otherAudios.length > 0 && (
        <View style={styles.listContainer}>
          <Text
            size="md"
            weight="semibold"
            style={{ color: colors.text.primary, marginBottom: Tokens.spacing['3'] }}
          >
            Mais {CATEGORY_TABS.find((c) => c.id === selectedCategory)?.label || 'Áudios'}
          </Text>

          {otherAudios.map((audio) => (
            <View key={audio.id}>{renderAudioCard({ item: audio })}</View>
          ))}
        </View>
      )}

      {/* Mini Player (fixed at bottom when playing) */}
      {showMiniPlayer && currentAudio && (
        <View
          style={[
            styles.miniPlayer,
            {
              backgroundColor: isDark ? ColorTokens.neutral[900] : ColorTokens.neutral[0],
              borderTopColor: isDark ? ColorTokens.neutral[800] : ColorTokens.neutral[200],
            },
          ]}
        >
          <LinearGradient
            colors={[currentAudio.accentColor, `${currentAudio.accentColor}80`]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.miniPlayerAccent}
          />

          <TouchableOpacity
            onPress={toggle}
            activeOpacity={0.8}
            style={styles.miniPlayerContent}
            accessibilityRole="button"
            accessibilityLabel={`${currentAudio.title}. ${isPlaying ? 'Tocando' : 'Pausado'}. ${formatTime(position)} de ${formatTime(duration)}`}
            accessibilityHint={isPlaying ? 'Toque para pausar' : 'Toque para continuar'}
          >
            <View style={styles.miniPlayerInfo}>
              <Text
                size="sm"
                weight="semibold"
                numberOfLines={1}
                style={{ color: colors.text.primary }}
              >
                {currentAudio.title}
              </Text>
              <Text size="xs" style={{ color: colors.text.tertiary }}>
                {formatTime(position)} / {formatTime(duration)}
              </Text>
            </View>

            <View style={styles.miniPlayerControls}>
              <TouchableOpacity
                onPress={rewind}
                style={styles.miniControlButton}
                accessibilityLabel="Voltar 10 segundos"
              >
                <Text size="xs" style={{ color: colors.text.secondary }}>
                  -10s
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={toggle}
                style={[styles.miniPlayButton, { backgroundColor: currentAudio.accentColor }]}
                accessibilityLabel={isPlaying ? 'Pausar' : 'Reproduzir'}
              >
                {isPlaying ? (
                  <View style={styles.pauseIcon}>
                    <View style={[styles.pauseBar, { backgroundColor: ColorTokens.neutral[0] }]} />
                    <View style={[styles.pauseBar, { backgroundColor: ColorTokens.neutral[0] }]} />
                  </View>
                ) : (
                  <View style={styles.playIcon} />
                )}
              </TouchableOpacity>

              <TouchableOpacity
                onPress={forward}
                style={styles.miniControlButton}
                accessibilityLabel="Avançar 10 segundos"
              >
                <Text size="xs" style={{ color: colors.text.secondary }}>
                  +10s
                </Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>

          {/* Progress Bar */}
          <View style={styles.miniProgressBar}>
            <View
              style={[
                styles.miniProgressFill,
                {
                  backgroundColor: currentAudio.accentColor,
                  width: `${progress * 100}%`,
                },
              ]}
            />
          </View>
        </View>
      )}
    </Box>
  );
}

// ======================
// STYLES
// ======================

const styles = StyleSheet.create({
  container: {
    marginTop: Tokens.spacing['2'],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Tokens.spacing['4'],
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Tokens.spacing['3'],
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: Tokens.radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingVertical: Tokens.spacing['2'],
    paddingHorizontal: Tokens.spacing['3'],
  },
  categoriesContainer: {
    marginBottom: Tokens.spacing['4'],
    marginHorizontal: -Tokens.spacing['5'],
  },
  categoriesList: {
    paddingHorizontal: Tokens.spacing['5'],
    gap: Tokens.spacing['2'],
  },
  categoryTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Tokens.spacing['4'],
    paddingVertical: Tokens.spacing['2.5'],
    borderRadius: Tokens.radius.full,
    borderWidth: 1,
  },
  featuredContainer: {
    marginBottom: Tokens.spacing['5'],
  },
  listContainer: {
    marginTop: Tokens.spacing['2'],
  },

  // Mini Player
  miniPlayer: {
    marginTop: Tokens.spacing['4'],
    borderRadius: Tokens.radius.xl,
    overflow: 'hidden',
    borderTopWidth: 1,
    ...Tokens.shadows.lg,
  },
  miniPlayerAccent: {
    height: 3,
  },
  miniPlayerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Tokens.spacing['3'],
  },
  miniPlayerInfo: {
    flex: 1,
    marginRight: Tokens.spacing['3'],
  },
  miniPlayerControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Tokens.spacing['2'],
  },
  miniControlButton: {
    padding: Tokens.spacing['2'],
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  miniPlayButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pauseIcon: {
    flexDirection: 'row',
    gap: 4,
  },
  pauseBar: {
    width: 4,
    height: 14,
    borderRadius: 2,
  },
  playIcon: {
    width: 0,
    height: 0,
    borderLeftWidth: 10,
    borderTopWidth: 7,
    borderBottomWidth: 7,
    borderLeftColor: ColorTokens.neutral[0],
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    marginLeft: 3,
  },
  miniProgressBar: {
    height: 2,
    backgroundColor: ColorTokens.neutral[200],
  },
  miniProgressFill: {
    height: '100%',
  },
});

export default AudioWellnessSection;
