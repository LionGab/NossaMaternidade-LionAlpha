/**
 * EmpatheticHighlights - Destaques reorganizados com microcopy mais humano
 */

import * as Haptics from 'expo-haptics';
import { Play, Heart, BookOpen, Headphones, Sparkles } from 'lucide-react-native';
import React, { memo } from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';

import { Text } from '@/components/primitives/Text';
import { useTheme } from '@/theme';
import { Tokens, ColorTokens, TextStyles } from '@/theme/tokens';

export type HighlightType = 'video' | 'audio' | 'story' | 'article';

export interface EmpatheticHighlightItem {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  type: HighlightType;
  accentColor?: string;
  isNew?: boolean;
  engagement?: number;
  /** Microcopy empático */
  empatheticCopy?: string;
}

export interface EmpatheticHighlightsProps {
  /** Lista de destaques */
  items: EmpatheticHighlightItem[];
  /** Callback ao pressionar item */
  onItemPress: (item: EmpatheticHighlightItem) => void;
}

const TYPE_ICONS: Record<HighlightType, React.ComponentType<{ size: number; color: string }>> = {
  video: Play,
  audio: Headphones,
  story: Heart,
  article: BookOpen,
};

// Badges de tipo para melhor escaneabilidade
const TYPE_BADGES: Record<HighlightType, string> = {
  video: 'Vídeo',
  audio: 'Áudio',
  story: 'História real',
  article: 'Leitura rápida',
};

const TYPE_COLORS: Record<HighlightType, { light: string; dark: string }> = {
  video: { light: ColorTokens.contentType.video.light, dark: ColorTokens.contentType.video.dark },
  audio: { light: ColorTokens.contentType.audio.light, dark: ColorTokens.contentType.audio.dark },
  story: { light: ColorTokens.contentType.story.light, dark: ColorTokens.contentType.story.dark },
  article: {
    light: ColorTokens.contentType.article.light,
    dark: ColorTokens.contentType.article.dark,
  },
};

// Destaques padrão com microcopy empático
export const DEFAULT_EMPATHETIC_HIGHLIGHTS: EmpatheticHighlightItem[] = [
  {
    id: 'highlight-1',
    title: 'Conteúdo especial de hoje',
    subtitle: 'Algo que preparamos pensando em você',
    description: 'Um momento só nosso para refletir e se cuidar.',
    type: 'video',
    isNew: true,
    empatheticCopy: 'Feito com carinho para este momento',
  },
  {
    id: 'highlight-2',
    title: 'História que tocou muitas mães',
    subtitle: 'Uma jornada de amor e superação',
    description: 'Compartilhamos porque acreditamos que pode te inspirar.',
    type: 'story',
    engagement: 1234,
    empatheticCopy: 'Mais de mil mães se identificaram',
  },
];

interface HighlightCardProps {
  item: EmpatheticHighlightItem;
  onPress: () => void;
  isDark: boolean;
  colors: ReturnType<typeof useTheme>['colors'];
}

const HighlightCard = memo(function HighlightCard({
  item,
  onPress,
  isDark,
  colors,
}: HighlightCardProps) {
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
      accessibilityHint="Toque para ver mais detalhes"
      style={[
        styles.card,
        {
          backgroundColor: isDark ? ColorTokens.neutral[800] : ColorTokens.neutral[0],
          borderColor: isDark ? ColorTokens.neutral[700] : ColorTokens.neutral[200],
        },
      ]}
    >
      {/* Ícone com cor de destaque - Melhorado para mais visibilidade */}
      <View
        style={[
          styles.iconContainer,
          { backgroundColor: `${accentColor}25` }, // ✅ Aumentado de 20 para 25 (mais visível)
        ]}
      >
        <IconComponent size={22} color={accentColor} />{' '}
        {/* ✅ Mobile: 22px (melhor visibilidade em telas pequenas) */}
      </View>

      {/* Conteúdo */}
      <View style={styles.content}>
        <View style={styles.headerRow}>
          {/* Badge de tipo fixa */}
          <View
            style={[
              styles.typeBadge,
              { backgroundColor: `${accentColor}15` }, // ✅ Fundo suave com cor do tipo
            ]}
          >
            <Text
              size="xs"
              weight="bold"
              style={{
                color: accentColor,
                fontSize: 10,
              }}
            >
              {TYPE_BADGES[item.type]}
            </Text>
          </View>
          <Text
            numberOfLines={1}
            style={{
              ...TextStyles.titleMedium, // ✅ Usar TextStyles.titleMedium para melhor contraste
              color: isDark
                ? ColorTokens.neutral[50] // ✅ WCAG AAA: neutral[50] (#FAFAFA) máximo contraste
                : ColorTokens.neutral[900], // ✅ WCAG AAA: neutral[900] (#171717) máximo contraste
              flex: 1,
            }}
          >
            {item.title}
          </Text>
          {item.isNew && (
            <View style={[styles.newBadge, { backgroundColor: accentColor }]}>
              <Sparkles size={10} color={ColorTokens.neutral[0]} /> {/* ✅ Corrigido: usar token */}
              <Text size="xs" weight="bold" style={{ color: ColorTokens.neutral[0] }}>
                NOVO
              </Text>
            </View>
          )}
        </View>

        {item.subtitle && (
          <Text
            size="xs"
            numberOfLines={1}
            style={{
              color: isDark
                ? ColorTokens.neutral[200] // ✅ WCAG AAA: neutral[200] (#E5E5E5) melhor contraste
                : ColorTokens.neutral[700], // ✅ WCAG AAA: neutral[700] (#404040) contraste 7:1+
              marginTop: Tokens.spacing['0.5'], // ✅ Design Tokens: 2px
              fontSize: 12, // ✅ WCAG: tamanho consistente
            }}
          >
            {item.subtitle}
          </Text>
        )}

        {item.empatheticCopy && (
          <Text
            size="xs"
            style={{
              color: `${colors.text.tertiary}B3`, // ✅ Reduzir opacidade para 70% (B3 em hex)
              marginTop: Tokens.spacing['1'],
              fontStyle: 'italic',
            }}
          >
            {item.empatheticCopy}
          </Text>
        )}

        {item.engagement && (
          <View style={styles.engagementRow}>
            <Heart size={12} color={colors.text.tertiary} fill={colors.text.tertiary} />
            <Text size="xs" style={{ color: colors.text.tertiary, marginLeft: 4 }}>
              {item.engagement.toLocaleString()} mães
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
});

export const EmpatheticHighlights = memo(function EmpatheticHighlights({
  items,
  onItemPress,
}: EmpatheticHighlightsProps) {
  const { colors, isDark } = useTheme();

  return (
    <View style={styles.container}>
      {/* Header empático */}
      <View style={styles.header}>
        <Text
          size="lg" // ✅ Hierarquia: aumentado de 'md' para 'lg' (18px)
          weight="bold" // ✅ Hierarquia: aumentado de 'semibold' para 'bold'
          color="primary"
          style={styles.title}
        >
          Destaques de hoje
        </Text>
        <Text size="xs" color="tertiary" style={styles.subtitle}>
          Selecionados especialmente para você
        </Text>
      </View>

      {/* Lista de destaques */}
      <View style={styles.list}>
        {items.map((item) => (
          <HighlightCard
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

const styles = StyleSheet.create({
  container: {
    // Container principal
  },
  header: {
    marginBottom: Tokens.spacing['3'],
  },
  title: {
    marginBottom: Tokens.spacing['1'], // ✅ Hierarquia: aumentado de '0.5' para '1' (melhor respiração)
    lineHeight: 24, // ✅ Hierarquia: line-height adequado para lg (18px)
  },
  subtitle: {
    lineHeight: 16,
  },
  list: {
    gap: Tokens.spacing['3'],
  },
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: Tokens.spacing['4'], // ✅ Mobile: reduzido de '5' (20px) para '4' (16px)
    borderRadius: Tokens.radius.xl,
    borderWidth: 0.5, // ✅ Design: bordas mais suaves
    gap: Tokens.spacing['2.5'], // ✅ Mobile: reduzido de '3' (12px) para '2.5' (10px)
    minHeight: Tokens.touchTargets.min, // ✅ Mobile: usar apenas touchTargets.min (44pt)
  },
  iconContainer: {
    width: 44, // ✅ Mobile: aumentado para 44pt (touch target mínimo iOS)
    height: 44,
    borderRadius: Tokens.radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0, // ✅ Mobile: não encolhe
  },
  content: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Tokens.spacing['2'],
    flexWrap: 'wrap', // ✅ Permite quebra de linha se necessário
  },
  typeBadge: {
    paddingHorizontal: Tokens.spacing['2'],
    paddingVertical: Tokens.spacing['0.5'],
    borderRadius: Tokens.radius.sm,
    marginRight: Tokens.spacing['1.5'], // ✅ Espaçamento após badge
  },
  newBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Tokens.spacing['1'], // ✅ Design Tokens: 4px
    paddingHorizontal: Tokens.spacing['2'],
    paddingVertical: Tokens.spacing['0.5'], // ✅ Design Tokens: 2px
    borderRadius: Tokens.radius.sm,
  },
  newBadgeText: {
    color: ColorTokens.neutral[0], // ✅ Corrigido: usar token em vez de hex
    fontSize: 9,
    letterSpacing: 0.5,
  },
  engagementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Tokens.spacing['1'],
  },
});
