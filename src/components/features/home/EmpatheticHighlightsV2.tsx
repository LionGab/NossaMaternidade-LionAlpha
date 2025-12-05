/**
 * EmpatheticHighlightsV2 - Design exato do web (lista vertical com 2 cards)
 * Card 1: Vídeo "Conteúdo especial de hoje" com badge NOVO verde
 * Card 2: História real "História que tocou muitas mães" com ❤️ 1.234 mães
 */

import * as Haptics from 'expo-haptics';
import { Play, Heart } from 'lucide-react-native';
import React, { memo } from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';

import { Badge } from '@/components/Badge';
import { Box } from '@/components/atoms/Box';
import { Text } from '@/components/atoms/Text';
import { useTheme } from '@/theme';
import { Tokens } from '@/theme/tokens';

export interface EmpatheticHighlightsV2Props {
  /** Callback ao pressionar card de vídeo */
  onVideoPress?: () => void;
  /** Callback ao pressionar card de história */
  onStoryPress?: () => void;
}

export const EmpatheticHighlightsV2 = memo(function EmpatheticHighlightsV2({
  onVideoPress,
  onStoryPress,
}: EmpatheticHighlightsV2Props) {
  const { colors } = useTheme();

  const handleVideoPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onVideoPress?.();
  };

  const handleStoryPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onStoryPress?.();
  };

  return (
    <View style={styles.container}>
      {/* Header - igual ao web */}
      <View style={styles.header}>
        <Text size="lg" weight="semibold" style={styles.title}>
          Destaques de hoje
        </Text>
        <Text size="sm" color="tertiary" style={styles.subtitle}>
          Selecionados especialmente para você
        </Text>
      </View>

      {/* Cards - lista vertical igual ao web */}
      <View style={styles.cardList}>
        {/* Card 1: Vídeo com badge NOVO verde */}
        <TouchableOpacity
          onPress={handleVideoPress}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Conteúdo especial de hoje. Novo vídeo"
          accessibilityHint="Toque para abrir o conteúdo em destaque"
        >
          <Box
            bg="card"
            p="4"
            rounded="3xl"
            shadow="card"
            style={{
              borderWidth: 1,
              borderColor: colors.border.light,
            }}
          >
            <Box direction="row" gap="3">
              {/* Ícone Play */}
              <Box
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: Tokens.radius.xl,
                  backgroundColor: `${colors.primary.main}33`,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Play size={24} color={colors.primary.main} />
              </Box>

              {/* Conteúdo */}
              <Box flex={1}>
                {/* Badge NOVO + Tipo Vídeo */}
                <Box
                  direction="row"
                  align="center"
                  gap="2"
                  style={{ marginBottom: Tokens.spacing['0.5'] }}
                >
                  <Badge variant="success" size="sm">
                    NOVO
                  </Badge>
                  <Text size="xs" color="tertiary">
                    Vídeo
                  </Text>
                </Box>

                {/* Título */}
                <Text size="md" weight="semibold" style={{ marginBottom: Tokens.spacing['0.5'] }}>
                  Conteúdo especial de hoje
                </Text>

                {/* Descrição */}
                <Text size="sm" color="tertiary" style={{ marginBottom: Tokens.spacing['2'] }}>
                  Algo que preparamos pensando em você.
                </Text>

                {/* Microcopy empático */}
                <Text size="xs" color="tertiary" italic>
                  Feito com carinho para este momento
                </Text>
              </Box>
            </Box>
          </Box>
        </TouchableOpacity>

        {/* Card 2: História real com engagement */}
        <TouchableOpacity
          onPress={handleStoryPress}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="História que tocou muitas mães. 1.234 mães se identificaram"
          accessibilityHint="Toque para ler a história completa"
        >
          <Box
            bg="card"
            p="4"
            rounded="3xl"
            shadow="card"
            style={{
              borderWidth: 1,
              borderColor: colors.border.light,
            }}
          >
            <Box direction="row" gap="3">
              {/* Ícone Heart */}
              <Box
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: Tokens.radius.xl,
                  backgroundColor: `${colors.secondary.main}33`,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Heart size={24} color={colors.secondary.main} />
              </Box>

              {/* Conteúdo */}
              <Box flex={1}>
                {/* Badge História real */}
                <Box
                  direction="row"
                  align="center"
                  gap="2"
                  style={{ marginBottom: Tokens.spacing['0.5'] }}
                >
                  <Text size="xs" color="secondary" weight="medium">
                    História real
                  </Text>
                </Box>

                {/* Título */}
                <Text size="md" weight="semibold" style={{ marginBottom: Tokens.spacing['0.5'] }}>
                  História que tocou muitas mães
                </Text>

                {/* Descrição */}
                <Text size="sm" color="tertiary" style={{ marginBottom: Tokens.spacing['2'] }}>
                  Uma jornada de amor e superação
                </Text>

                {/* Microcopy empático */}
                <Text
                  size="xs"
                  color="tertiary"
                  italic
                  style={{ marginBottom: Tokens.spacing['2'] }}
                >
                  Mais de mil mães se identificaram
                </Text>

                {/* Engagement count - igual ao web */}
                <Box direction="row" align="center" gap="1">
                  <Heart size={12} color={colors.text.tertiary} />
                  <Text size="xs" color="tertiary">
                    1.234 mães
                  </Text>
                </Box>
              </Box>
            </Box>
          </Box>
        </TouchableOpacity>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    // Container principal
  },
  header: {
    marginBottom: Tokens.spacing['4'],
  },
  title: {
    marginBottom: Tokens.spacing['1'],
  },
  subtitle: {
    lineHeight: 20,
  },
  cardList: {
    gap: Tokens.spacing['3'],
  },
});

export default EmpatheticHighlightsV2;
