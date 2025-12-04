/**
 * RecentContentGrid - Grid de conteúdos recentes (2 colunas)
 * Design inspirado no screenshot - "Recentes" com thumbnails
 */

import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native';
import type { CompositeNavigationProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Star, Play, Lock } from 'lucide-react-native';
import React, { useRef } from 'react';
import { View, TouchableOpacity, Animated, Platform } from 'react-native';

import { Box } from '@/components/primitives/Box';
import { Text } from '@/components/primitives/Text';
import { useResponsiveDimensions } from '@/hooks/useResponsiveDimensions';
import type { MainTabParamList, RootStackParamList } from '@/navigation/types';
import { Tokens, ColorTokens } from '@/theme/tokens';

type NavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'Home'>,
  NativeStackNavigationProp<RootStackParamList>
>;

export type ContentCategory = 'ESTILO' | 'VLOG' | 'DICA' | 'RECEITA' | 'ROTINA' | 'TREINO';

export interface ContentItem {
  id: string;
  title: string;
  imageUrl: string;
  category: ContentCategory;
  isLocked?: boolean;
  isNew?: boolean;
  duration?: number;
}

export interface RecentContentGridProps {
  /** Título da seção */
  sectionTitle?: string;
  /** Lista de conteúdos */
  items: ContentItem[];
  /** Callback ao pressionar item */
  onItemPress?: (item: ContentItem) => void;
  /** Mostrar apenas 2 primeiros */
  limitToTwo?: boolean;
}

// Cores por categoria
const categoryColors: Record<ContentCategory, string> = {
  ESTILO: ColorTokens.primary[500],
  VLOG: ColorTokens.info[500],
  DICA: ColorTokens.success[500],
  RECEITA: ColorTokens.warning[500],
  ROTINA: ColorTokens.secondary[500],
  TREINO: ColorTokens.error[500],
};

function ContentCard({ item, onPress }: { item: ContentItem; onPress: () => void }) {
  const { cardWidth, cardHeight } = useResponsiveDimensions();
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
      damping: 15,
      stiffness: 300,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      damping: 15,
      stiffness: 300,
    }).start();
  };

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
        accessibilityRole="button"
        accessibilityLabel={`${item.category}: ${item.title}${item.isLocked ? '. Conteúdo bloqueado' : ''}`}
        accessibilityHint={item.isLocked ? 'Desbloqueie para acessar' : 'Toque para assistir'}
        style={{
          width: cardWidth,
          height: cardHeight,
          borderRadius: Tokens.radius.xl,
          overflow: 'hidden',
          ...Tokens.shadows.md,
        }}
      >
        {/* Imagem de fundo */}
        <Image
          source={{ uri: item.imageUrl }}
          style={{
            width: '100%',
            height: '100%',
            position: 'absolute',
          }}
          contentFit="cover"
          transition={300}
          cachePolicy="memory-disk"
        />

        {/* Overlay gradiente */}
        <LinearGradient
          colors={['transparent', ColorTokens.overlay.heavy, ColorTokens.overlay.dark]}
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '70%',
          }}
        />

        {/* Badge de categoria */}
        <View
          style={{
            position: 'absolute',
            top: Tokens.spacing['2'],
            left: Tokens.spacing['2'],
            backgroundColor: categoryColors[item.category],
            paddingVertical: 4,
            paddingHorizontal: 8,
            borderRadius: Tokens.radius.sm,
          }}
        >
          <Text
            size="xs"
            weight="bold"
            style={{
              color: ColorTokens.neutral[0],
              fontSize: 9,
              letterSpacing: 0.5,
            }}
          >
            {item.category}
          </Text>
        </View>

        {/* Badge NEW */}
        {item.isNew && (
          <View
            style={{
              position: 'absolute',
              top: Tokens.spacing['2'],
              right: Tokens.spacing['2'],
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: ColorTokens.warning[500],
              paddingVertical: 2,
              paddingHorizontal: 6,
              borderRadius: Tokens.radius.sm,
              gap: 2,
            }}
          >
            <Star size={8} color={ColorTokens.neutral[0]} fill={ColorTokens.neutral[0]} />
            <Text
              size="xs"
              weight="bold"
              style={{
                color: ColorTokens.neutral[0],
                fontSize: 8,
              }}
            >
              NEW
            </Text>
          </View>
        )}

        {/* Locked overlay */}
        {item.isLocked && (
          <View
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: ColorTokens.overlay.backdrop,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <View
              style={{
                width: 44,
                height: 44,
                borderRadius: Tokens.radius.full,
                backgroundColor: `${ColorTokens.neutral[0]}30`,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Lock size={20} color={ColorTokens.neutral[0]} />
            </View>
          </View>
        )}

        {/* Play button (se não bloqueado) */}
        {!item.isLocked && item.duration && (
          <View
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              marginTop: -22,
              marginLeft: -22,
              width: 44,
              height: 44,
              borderRadius: Tokens.radius.full,
              backgroundColor: `${ColorTokens.neutral[0]}40`,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Play size={20} color={ColorTokens.neutral[0]} fill={ColorTokens.neutral[0]} />
          </View>
        )}

        {/* Título na parte inferior */}
        <View
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            padding: Tokens.spacing['3'],
          }}
        >
          <Text
            size="sm"
            weight="bold"
            style={Platform.select({
              web: {
                color: ColorTokens.neutral[0],
                textShadow: `0 1px 2px ${ColorTokens.overlay.backdrop}`,
              },
              default: {
                color: ColorTokens.neutral[0],
                textShadowColor: ColorTokens.overlay.backdrop,
                textShadowOffset: { width: 0, height: 1 },
                textShadowRadius: 2,
              },
            })}
            numberOfLines={2}
          >
            {item.title}
          </Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

export function RecentContentGrid({
  sectionTitle = 'Recentes',
  items,
  onItemPress,
  limitToTwo = true,
}: RecentContentGridProps) {
  const navigation = useNavigation<NavigationProp>();
  const { cardGap } = useResponsiveDimensions();

  const displayItems = limitToTwo ? items.slice(0, 2) : items;

  const handleItemPress = (item: ContentItem) => {
    if (onItemPress) {
      onItemPress(item);
    } else {
      // Default: navegar para conteúdo
      navigation.navigate('Chat');
    }
  };

  return (
    <Box>
      {/* Header da seção */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          marginBottom: Tokens.spacing['3'],
          gap: Tokens.spacing['2'],
        }}
      >
        <Star size={16} color={ColorTokens.warning[500]} fill={ColorTokens.warning[500]} />
        <Text size="md" weight="bold" color="primary">
          {sectionTitle}
        </Text>
      </View>

      {/* Grid de cards */}
      <View
        style={{
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: cardGap,
        }}
        accessibilityRole="list"
        accessibilityLabel={`${sectionTitle} - ${displayItems.length} itens`}
        accessibilityHint="Navegue pelos conteúdos recentes disponíveis"
      >
        {displayItems.map((item) => (
          <ContentCard key={item.id} item={item} onPress={() => handleItemPress(item)} />
        ))}
      </View>
    </Box>
  );
}

export default RecentContentGrid;
