/**
 * SearchScreen - Tela de busca funcional
 * Implementa busca de conteúdo, posts, e navegação
 */

import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Search, X, ArrowLeft } from 'lucide-react-native';
import React, { useState, useCallback, useMemo, useRef } from 'react';
import { FlatList, Keyboard, TextInput, Platform } from 'react-native';

import { ListingCard, type ListingCardProps } from '@/components/organisms/ListingCard';
import { Box } from '@/components/primitives/Box';
import { HapticButton } from '@/components/primitives/HapticButton';
import { IconButton } from '@/components/primitives/IconButton';
import { SkeletonCard } from '@/components/primitives/Skeleton';
import { Text } from '@/components/primitives/Text';
import { ScreenLayout } from '@/components/templates/ScreenLayout';
import type { RootStackParamList } from '@/navigation/types';
import { feedService, type ContentItem } from '@/services/feedService';
import { useTheme } from '@/theme';
import { Tokens } from '@/theme/tokens';
import { logger } from '@/utils/logger';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function SearchScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { colors } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<ListingCardProps[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Converter ContentItem para ListingCardProps
  const mapContentToListing = (content: ContentItem): ListingCardProps => ({
    id: content.id,
    title: content.title,
    subtitle: content.description || content.category,
    image: content.thumbnail_url || 'https://via.placeholder.com/300x200',
    isFavorite: content.user_interaction?.is_liked || false,
  });

  // Buscar conteúdo
  const performSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      setResults([]);
      setHasSearched(false);
      return;
    }

    setLoading(true);
    setHasSearched(true);
    Keyboard.dismiss();

    try {
      logger.info('[SearchScreen] Performing search', { query });

      // Busca real usando feedService
      const content = await feedService.getContent(
        {
          search: query.trim(),
        },
        0,
        20
      );

      // Mapear resultados para formato do ListingCard
      const mappedResults = content.map(mapContentToListing);
      setResults(mappedResults);

      logger.info('[SearchScreen] Search completed', {
        query,
        resultsCount: mappedResults.length,
      });
    } catch (error) {
      logger.error('[SearchScreen] Search error', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounce timer ref
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Handler para mudança de texto
  const handleSearchChange = useCallback(
    (text: string) => {
      setSearchQuery(text);
      // Debounce: buscar após 500ms sem digitar
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      debounceTimerRef.current = setTimeout(() => {
        performSearch(text);
      }, 500);
    },
    [performSearch]
  );

  // Handler para limpar busca
  const handleClear = useCallback(() => {
    setSearchQuery('');
    setResults([]);
    setHasSearched(false);
  }, []);

  // Handler para favoritar
  const handleFavoritePress = useCallback((listingId: string) => {
    logger.info('[SearchScreen] Favorite toggled', { listingId });
    // TODO: Integrar com backend
  }, []);

  // Handler para pressionar resultado
  const handleResultPress = useCallback(
    (listingId: string) => {
      logger.info('[SearchScreen] Result pressed', { listingId });
      navigation.navigate('ContentDetail', { contentId: listingId });
    },
    [navigation]
  );

  // Sugestões populares (quando não há busca)
  const popularSearches = useMemo(
    () => [
      'Exercícios pós-parto',
      'Meditação para mães',
      'Alimentação saudável',
      'Cuidados com o bebê',
      'Bem-estar emocional',
    ],
    []
  );

  return (
    <ScreenLayout>
      <Box px="4" pt="2" pb="4">
        {/* Header com barra de busca */}
        <Box direction="row" align="center" gap="3" mb="4">
          <IconButton
            icon={<ArrowLeft size={24} color={colors.text.primary} />}
            onPress={() => navigation.goBack()}
            accessibilityLabel="Voltar"
            variant="ghost"
          />

          <Box flex={1} direction="row" align="center" bg="card" rounded="full" px="4" py="3">
            <Search size={20} color={colors.text.secondary} />
            <TextInput
              accessibilityLabel="Text input field"
              value={searchQuery}
              onChangeText={handleSearchChange}
              placeholder="Buscar conteúdo..."
              placeholderTextColor={colors.text.tertiary}
              style={{
                flex: 1,
                marginLeft: Tokens.spacing['3'],
                fontSize: Tokens.typography.sizes.md,
                color: colors.text.primary,
                ...(Platform.OS === 'web' ? { outline: 'none' } : {}),
              }}
              autoFocus
              returnKeyType="search"
              onSubmitEditing={() => performSearch(searchQuery)}
            />
            {searchQuery.length > 0 && (
              <HapticButton
                variant="ghost"
                size="sm"
                onPress={handleClear}
                accessibilityLabel="Limpar busca"
              >
                <X size={18} color={colors.text.secondary} />
              </HapticButton>
            )}
          </Box>
        </Box>

        {/* Resultados ou sugestões */}
        {loading ? (
          <Box gap="3">
            {[1, 2, 3].map((i) => (
              <SkeletonCard key={i} height={120} animated />
            ))}
          </Box>
        ) : hasSearched ? (
          results.length > 0 ? (
            <FlatList
              data={results}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <ListingCard
                  {...item}
                  onPress={() => handleResultPress(item.id)}
                  onFavoritePress={() => handleFavoritePress(item.id)}
                />
              )}
              ItemSeparatorComponent={() => <Box style={{ height: Tokens.spacing['3'] }} />}
              ListEmptyComponent={
                <Box align="center" py="12">
                  <Text
                    size="lg"
                    weight="semibold"
                    color="secondary"
                    style={{ marginBottom: Tokens.spacing['2'] }}
                  >
                    Nenhum resultado encontrado
                  </Text>
                  <Text size="sm" color="tertiary" style={{ textAlign: 'center' }}>
                    Tente buscar com outras palavras-chave
                  </Text>
                </Box>
              }
            />
          ) : (
            <Box align="center" py="12">
              <Text
                size="lg"
                weight="semibold"
                color="secondary"
                style={{ marginBottom: Tokens.spacing['2'] }}
              >
                Nenhum resultado encontrado
              </Text>
              <Text size="sm" color="tertiary" style={{ textAlign: 'center' }}>
                Tente buscar com outras palavras-chave
              </Text>
            </Box>
          )
        ) : (
          <Box>
            <Text
              size="md"
              weight="semibold"
              color="primary"
              style={{ marginBottom: Tokens.spacing['4'] }}
            >
              Buscas populares
            </Text>
            <Box gap="2">
              {popularSearches.map((search, index) => (
                <HapticButton
                  key={index}
                  variant="outline"
                  onPress={() => {
                    setSearchQuery(search);
                    performSearch(search);
                  }}
                  style={{ justifyContent: 'flex-start' }}
                >
                  <Text size="sm" color="primary">
                    {search}
                  </Text>
                </HapticButton>
              ))}
            </Box>
          </Box>
        )}
      </Box>
    </ScreenLayout>
  );
}
