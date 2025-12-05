/**
 * HighlightsList - Lista de destaques do dia
 * Design inspirado nos screenshots de referência
 *
 * "Destaques do dia"
 * - Conteúdo da Nath de hoje
 * - História que abraçou mais mães
 */

import * as Haptics from 'expo-haptics';
import { Play, Heart, BookOpen, Headphones } from 'lucide-react-native';
import React, { memo } from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';

import { Text } from '@/components/atoms/Text';
import { useTheme } from '@/theme';
import { Tokens, ColorTokens } from '@/theme/tokens';

// ======================
// TIPOS
// ======================

export type HighlightType = 'video' | 'audio' | 'story' | 'article';

export interface HighlightItem {
  id: string;
  title: string;
  subtitle?: string;
  type: HighlightType;
  /** Cor de destaque do ícone */
  accentColor?: string;
  /** Se é conteúdo novo */
  isNew?: boolean;
  /** Número de views/likes */
  engagement?: number;
}

export interface HighlightsListProps {
  /** Título da seção */
  title?: string;
  /** Lista de destaques */
  items: HighlightItem[];
  /** Callback ao pressionar item */
  onItemPress: (item: HighlightItem) => void;
  /** Callback ao pressionar "Ver todos" */
  onSeeAllPress?: () => void;
}

// ======================
// ÍCONES POR TIPO
// ======================

const TYPE_ICONS: Record<HighlightType, React.ComponentType<{ size: number; color: string }>> = {
  video: Play,
  audio: Headphones,
  story: Heart,
  article: BookOpen,
};

const TYPE_COLORS: Record<HighlightType, { light: string; dark: string }> = {
  video: { light: '#4ECDC4', dark: '#3BB3B5' },
  audio: { light: '#A78BFA', dark: '#C4B5FD' },
  story: { light: '#FF6B9D', dark: '#FF8FAF' },
  article: { light: '#60A5FA', dark: '#93C5FD' },
};

// ======================
// DADOS PADRÃO
// ======================

export const DEFAULT_HIGHLIGHTS: HighlightItem[] = [
  {
    id: 'highlight-1',
    title: 'Conteúdo da Nath de hoje',
    subtitle: 'Assista algo só nosso sobre maternidade.',
    type: 'video',
    isNew: true,
  },
  {
    id: 'highlight-2',
    title: 'História que abraçou mais mães',
    subtitle: 'Uma história de superação e amor.',
    type: 'story',
    engagement: 1234,
  },
];

// ======================
// COMPONENTE DO ITEM
// ======================

interface HighlightItemCardProps {
  item: HighlightItem;
  onPress: () => void;
  isDark: boolean;
  colors: ReturnType<typeof useTheme>['colors'];
}

const HighlightItemCard = memo(function HighlightItemCard({
  item,
  onPress,
  isDark,
  colors,
}: HighlightItemCardProps) {
  const IconComponent = TYPE_ICONS[item.type];
  const typeColor = TYPE_COLORS[item.type];
  const accentColor = item.accentColor || (isDark ? typeColor.dark : typeColor.light);

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={item.title}
      accessibilityHint={`Abre ${item.type === 'video' ? 'vídeo' : item.type === 'audio' ? 'áudio' : 'conteúdo'}: ${item.title}`}
      style={[
        styles.itemCard,
        {
          backgroundColor: isDark ? ColorTokens.neutral[800] : ColorTokens.neutral[0],
          borderColor: isDark ? ColorTokens.neutral[700] : ColorTokens.neutral[200],
        },
      ]}
    >
      {/* Ícone */}
      <View style={[styles.iconContainer, { backgroundColor: `${accentColor}20` }]}>
        <IconComponent size={20} color={accentColor} />
      </View>

      {/* Conteúdo */}
      <View style={styles.itemContent}>
        <Text size="sm" weight="semibold" numberOfLines={1} style={{ color: colors.text.primary }}>
          {item.title}
        </Text>

        {item.subtitle && (
          <Text size="xs" numberOfLines={1} style={{ color: colors.text.tertiary, marginTop: 2 }}>
            {item.subtitle}
          </Text>
        )}
      </View>

      {/* Badge de novo */}
      {item.isNew && (
        <View style={[styles.newBadge, { backgroundColor: accentColor }]}>
          <Text size="xs" weight="bold" style={styles.newBadgeText}>
            NOVO
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
});

// ======================
// COMPONENTE PRINCIPAL
// ======================

export const HighlightsList = memo(function HighlightsList({
  title = 'Destaques do dia',
  items,
  onItemPress,
  onSeeAllPress,
}: HighlightsListProps) {
  const { colors, isDark } = useTheme();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text size="md" weight="semibold" style={{ color: colors.text.primary }}>
          {title}
        </Text>

        {onSeeAllPress && (
          <TouchableOpacity
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onSeeAllPress();
            }}
            accessibilityRole="button"
            accessibilityLabel="Ver todos os destaques"
            style={styles.seeAllButton}
          >
            <Text size="sm" weight="medium" style={{ color: colors.primary.main }}>
              Ver todos
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Lista de itens */}
      <View style={styles.list}>
        {items.map((item) => (
          <HighlightItemCard
            key={item.id}
            item={item}
            onPress={() => onItemPress(item)}
            isDark={isDark}
            colors={colors}
          />
        ))}
      </View>
    </View>
  );
});

// ======================
// ESTILOS
// ======================

const styles = StyleSheet.create({
  container: {
    // Container principal
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Tokens.spacing['3'],
  },
  seeAllButton: {
    paddingVertical: Tokens.spacing['1'],
    paddingHorizontal: Tokens.spacing['2'],
  },
  list: {
    gap: Tokens.spacing['3'],
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Tokens.spacing['4'],
    borderRadius: Tokens.radius.xl,
    borderWidth: 1,
    gap: Tokens.spacing['3'],
    minHeight: Tokens.touchTargets.min + Tokens.spacing['4'],
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: Tokens.radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemContent: {
    flex: 1,
  },
  newBadge: {
    paddingHorizontal: Tokens.spacing['2'],
    paddingVertical: Tokens.spacing['1'],
    borderRadius: Tokens.radius.sm,
  },
  newBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    letterSpacing: 0.5,
  },
});

export default HighlightsList;
