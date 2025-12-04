/**
 * NathIALayoutExample - Exemplo de uso do layout responsivo
 *
 * Demonstra como usar o NathIALayout em diferentes cenários:
 * - Tela de chat
 * - Dashboard de conteúdo
 * - Grid de cards
 */

import { MessageCircle, Sparkles, Heart, Play } from 'lucide-react-native';
import React from 'react';

import { Badge } from '@/components/Badge';
import { Box } from '@/components/primitives/Box';
import { Button } from '@/components/primitives/Button';
import { Text } from '@/components/primitives/Text';
import { useTheme } from '@/theme';
import { Tokens, ColorTokens } from '@/theme/tokens';

import { NathIALayout, NathIACard, NathIAGrid } from './NathIALayout';

/**
 * Exemplo 1: Layout simples com header e conteúdo
 */
export function NathIALayoutSimpleExample() {
  const { colors } = useTheme();

  const header = (
    <Box
      direction="row"
      align="center"
      justify="space-between"
      p="4"
      bg="card"
      rounded="xl"
      style={{
        borderWidth: 1,
        borderColor: colors.border.light,
      }}
    >
      <Box direction="row" align="center" gap="3">
        <Box
          style={{
            width: 48,
            height: 48,
            borderRadius: Tokens.radius.full,
            backgroundColor: `${colors.primary.main}33`,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <MessageCircle size={24} color={colors.primary.main} />
        </Box>
        <Box>
          <Text size="lg" weight="bold">
            NathIA
          </Text>
          <Badge variant="success" size="sm">
            Disponível
          </Badge>
        </Box>
      </Box>
    </Box>
  );

  return (
    <NathIALayout header={header}>
      <NathIACard>
        <Text size="md" style={{ marginBottom: Tokens.spacing['4'] }}>
          Olá! Como posso te ajudar hoje?
        </Text>
        <Button title="Iniciar conversa" variant="primary" fullWidth onPress={() => {}} />
      </NathIACard>
    </NathIALayout>
  );
}

/**
 * Exemplo 2: Grid de cards responsivo
 */
export function NathIALayoutGridExample() {
  const { colors } = useTheme();

  const cards = [
    {
      id: '1',
      title: 'Dicas de Sono',
      subtitle: 'Como ajudar seu bebê a dormir melhor',
      icon: Play,
      color: colors.primary.main,
    },
    {
      id: '2',
      title: 'Alimentação',
      subtitle: 'Guia completo de nutrição',
      icon: Heart,
      color: colors.secondary.main,
    },
    {
      id: '3',
      title: 'Bem-estar',
      subtitle: 'Cuidados com você mesma',
      icon: Sparkles,
      color: ColorTokens.warning[500],
    },
  ];

  return (
    <NathIALayout>
      <Text size="xl" weight="bold" style={{ marginBottom: Tokens.spacing['4'] }}>
        Conteúdo Recomendado
      </Text>

      <NathIAGrid mobileColumns={1} tabletColumns={3} gap="4">
        {cards.map((card) => (
          <NathIACard key={card.id} columns={4} onPress={() => {}}>
            <Box
              style={{
                width: 48,
                height: 48,
                borderRadius: Tokens.radius.xl,
                backgroundColor: `${card.color}33`,
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: Tokens.spacing['3'],
              }}
            >
              <card.icon size={24} color={card.color} />
            </Box>
            <Text size="md" weight="semibold" style={{ marginBottom: Tokens.spacing['2'] }}>
              {card.title}
            </Text>
            <Text size="sm" color="tertiary">
              {card.subtitle}
            </Text>
          </NathIACard>
        ))}
      </NathIAGrid>
    </NathIALayout>
  );
}

/**
 * Exemplo 3: Layout com múltiplas seções
 */
export function NathIALayoutSectionsExample() {
  const { colors } = useTheme();

  const header = (
    <Box
      p="4"
      bg="card"
      rounded="xl"
      style={{
        borderWidth: 1,
        borderColor: colors.border.light,
      }}
    >
      <Text size="2xl" weight="bold" style={{ marginBottom: Tokens.spacing['2'] }}>
        Bem-vinda à NathIA
      </Text>
      <Text size="sm" color="tertiary">
        Sua assistente virtual para apoio materno
      </Text>
    </Box>
  );

  return (
    <NathIALayout header={header} gap="6">
      {/* Seção 1: Chat rápido */}
      <NathIACard columns={12}>
        <Text size="lg" weight="semibold" style={{ marginBottom: Tokens.spacing['4'] }}>
          Chat Rápido
        </Text>
        <Box style={{ gap: Tokens.spacing['3'] }}>
          <Button
            title="Como está se sentindo hoje?"
            variant="outline"
            fullWidth
            onPress={() => {}}
          />
          <Button title="Preciso de ajuda com..." variant="outline" fullWidth onPress={() => {}} />
        </Box>
      </NathIACard>

      {/* Seção 2: Conteúdo em grid */}
      <Box style={{ width: '100%' }}>
        <Text size="lg" weight="semibold" style={{ marginBottom: Tokens.spacing['4'] }}>
          Para Você
        </Text>
        <NathIAGrid mobileColumns={1} tabletColumns={2} gap="4">
          <NathIACard columns={6}>
            <Text size="md" weight="semibold">
              Artigo em Destaque
            </Text>
            <Text size="sm" color="tertiary">
              Leia mais sobre maternidade
            </Text>
          </NathIACard>
          <NathIACard columns={6}>
            <Text size="md" weight="semibold">
              Vídeo Recomendado
            </Text>
            <Text size="sm" color="tertiary">
              Assista agora
            </Text>
          </NathIACard>
        </NathIAGrid>
      </Box>
    </NathIALayout>
  );
}

export default NathIALayoutSimpleExample;
