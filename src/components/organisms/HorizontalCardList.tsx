/**
 * HorizontalCardList - Carrossel horizontal estilo Airbnb
 * Lista horizontal de cards com peek do próximo item
 *
 * @example
 * <HorizontalCardList
 *   title="Vistos recentemente"
 *   data={listings}
 *   renderItem={(item) => <ListingCard {...item} />}
 *   onSeeAll={() => navigation.navigate('AllListings')}
 * />
 */

import { ChevronRight } from 'lucide-react-native';
import React from 'react';
import { FlatList, ViewStyle, ListRenderItem } from 'react-native';

import { Box } from '@/components/primitives/Box';
import { HapticButton } from '@/components/primitives/HapticButton';
import { Text } from '@/components/primitives/Text';
import { useResponsiveDimensions } from '@/hooks/useResponsiveDimensions';
import { useTheme } from '@/theme';
import { Tokens } from '@/theme/tokens';

export interface HorizontalCardListProps<T> {
  /** Título da seção */
  title: string;
  /** Dados da lista */
  data: T[];
  /** Função de renderização do item */
  renderItem: (item: T, index: number) => React.ReactElement;
  /** Callback "Ver tudo" */
  onSeeAll?: () => void;
  /** Estilo customizado */
  style?: ViewStyle;
  /** Mostrar botão "Ver tudo" */
  showSeeAll?: boolean;
  /** Peek do próximo item (em pixels) */
  peekSize?: number;
}

export function HorizontalCardList<T extends { id: string }>({
  title,
  data,
  renderItem,
  onSeeAll,
  style,
  showSeeAll = true,
  peekSize = 16,
}: HorizontalCardListProps<T>) {
  const { colors } = useTheme();
  const { horizontalPadding } = useResponsiveDimensions();

  const renderListItem: ListRenderItem<T> = ({ item, index }) => {
    return (
      <Box
        style={{
          marginLeft: index === 0 ? horizontalPadding : Tokens.spacing['3'],
          marginRight: index === data.length - 1 ? horizontalPadding : 0,
        }}
      >
        {renderItem(item, index)}
      </Box>
    );
  };

  return (
    <Box style={style}>
      {/* Header */}
      <Box
        direction="row"
        align="center"
        justify="space-between"
        style={{
          paddingHorizontal: horizontalPadding,
          marginBottom: Tokens.spacing['3'],
        }}
      >
        <Text size="xl" weight="bold" color="primary">
          {title}
        </Text>
        {showSeeAll && onSeeAll && (
          <HapticButton
            variant="ghost"
            onPress={onSeeAll}
            accessibilityLabel={`Ver todos os ${title.toLowerCase()}`}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: Tokens.spacing['1'],
            }}
          >
            <Text size="sm" weight="semibold" color="primary">
              Ver tudo
            </Text>
            <ChevronRight size={16} color={colors.primary.main} />
          </HapticButton>
        )}
      </Box>

      {/* Lista horizontal */}
      <FlatList
        data={data}
        renderItem={renderListItem}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingRight: horizontalPadding,
        }}
        snapToInterval={undefined} // Deixa scroll livre
        decelerationRate="fast"
        // Peek do próximo item
        contentInset={{ right: peekSize }}
        contentInsetAdjustmentBehavior="never"
      />
    </Box>
  );
}

export default HorizontalCardList;
