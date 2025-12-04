/**
 * CommunityScreen - Tela de Comunidade MãesValentes
 * Design melhorado seguindo princípios estabelecidos em docs/design/
 *
 * Melhorias aplicadas:
 * - Uso de componentes primitivos (Box, Text)
 * - TextStyles semânticos
 * - Hierarquia visual melhorada
 * - Espaçamento consistente via tokens
 * - Acessibilidade WCAG AAA
 */

import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Plus, Users, MoreVertical, Heart, MessageCircle, Grid } from 'lucide-react-native';
import React, { useState, useRef } from 'react';
import { TouchableOpacity, ScrollView, StyleSheet, Alert, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Avatar } from '@/components/Avatar';
import { Badge } from '@/components/Badge';
import { Box } from '@/components/primitives/Box';
import { Text } from '@/components/primitives/Text';
import { ThemeToggle } from '@/components/ThemeToggle';
import type { RootStackParamList } from '@/navigation/types';
import { useTheme } from '@/theme';
import { triggerPlatformHaptic } from '@/theme/platform';
import {
  ColorTokens,
  Tokens,
  Shadows,
  Spacing,
  Typography,
  TextStyles,
  Radius,
} from '@/theme/tokens';
import { logger } from '@/utils/logger';

type FilterType = 'Todos' | 'Dicas' | 'Desabafos' | 'Dúvidas' | 'Humor';

interface Post {
  id: string;
  author: string;
  authorInitials: string;
  avatarUrl?: string; // ✅ Foto do autor
  timeAgo: string;
  title: string;
  content: string;
  imageUrl?: string;
  likes: number;
  replies: number;
}

type CommunityNavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function CommunityScreen() {
  const { colors, isDark } = useTheme();
  // Reservado para navegação futura
  useNavigation<CommunityNavigationProp>();
  const scrollViewRef = useRef<ScrollView>(null);
  const [selectedFilter, setSelectedFilter] = useState<FilterType>('Todos');
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());

  const filters: FilterType[] = ['Todos', 'Dicas', 'Desabafos', 'Dúvidas', 'Humor'];

  const mockPosts: Post[] = [
    {
      id: '1',
      author: 'Camila R.',
      authorInitials: 'CR',
      avatarUrl:
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=faces',
      timeAgo: '2h atrás',
      title: 'QUANDO PERCEBI QUE NÃO PRECISAVA SER FORTE PRA EXISTIR AQUI',
      content: `Eu passei meses achando que estava falhando. Todo mundo vinha conhecer meu bebê, abraçava, tirava foto, dizia "ele é perfeito". E eu? Eu ficava ali no canto, tentando parecer grata, sorrindo com aquele sorriso que não chega no olho. À noite, quando a casa ficava silenciosa, era quando a verdade vinha: eu estava cansada de tentar ser a mãe perfeita que todo mundo esperava. Uma madrugada, enquanto eu balançava ele no colo, sentindo o braço formigar e a lágrima quase caindo, eu entrei no app só pra "passar a hora". Mas não era só conteúdo. Tinha mulheres falando coisas que eu nunca tive coragem de dizer: "Hoje eu chorei escondida no banheiro." "Me sinto culpada por não estar feliz o tempo todo." "Eu amo meu bebê, mas sinto falta de quem eu era." Eu li aquilo e senti um alívio que não sei explicar. Pela primeira vez, eu não precisava ser forte para existir. Eu só precisava ser real. Desde esse dia, eu fiquei aqui. Porque aqui eu posso ser mãe — e posso ser humana.`,
      imageUrl: 'https://i.imgur.com/vHSQuiN.jpg',
      likes: 342,
      replies: 67,
    },
    {
      id: '2',
      author: 'Juliana S.',
      authorInitials: 'JS',
      avatarUrl:
        'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&crop=faces',
      timeAgo: '5h atrás',
      title: 'O DIA EM QUE PERCEBI QUE EU TAMBÉM PRECISAVA SER CUIDADA',
      content: `Depois do parto, todo mundo perguntava do bebê: "Tá mamando bem?" "Tá dormindo?" "Tá engordando?" E eu? Quem perguntava de mim? Ninguém percebeu quando eu parei de comer direito. Ninguém percebeu quando eu chorei no banho pra não assustar ninguém. Ninguém percebeu quando eu decorei frases pra não parecer fraca. Até que um dia, mexendo no celular enquanto amamentava, entrei no NossaMaternidade. Eu não queria nada profundo, só distrair. Mas a primeira coisa que vi foi um vídeo com a frase: "Mãe que cuida também precisa ser cuidada." Eu pausei. Ninguém tinha falado isso pra mim. Eu cliquei no vídeo, depois em outro, depois em um áudio… e percebi que existia um lugar onde alguém finalmente olhava pra mim — não só pro meu filho. Aqui eu fui lembrada de que eu também importo. Que minha saúde importa. Que meu cansaço importa. Que meu emocional importa. E foi por isso que eu fiquei. Porque aqui, eu não sou só "mãe do…" Eu sou eu, com nome, história e sentimentos.`,
      imageUrl: 'https://i.imgur.com/BbezDkm.jpg',
      likes: 289,
      replies: 54,
    },
    {
      id: '3',
      author: 'Ana Paula M.',
      authorInitials: 'AM',
      avatarUrl:
        'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&h=200&fit=crop&crop=faces',
      timeAgo: '1d atrás',
      title: 'A CULPA ME CONSUMIA — ATÉ EU APRENDER A DIVIDIR O PESO',
      content: `Eu me sentia culpada por tudo. Se eu dava mamadeira, culpa. Se eu dava peito, culpa. Se o bebê chorava, culpa. Se eu sentia saudade da minha vida antiga, culpa. Se eu ficava feliz por alguns minutos sozinha, culpa. A maternidade virou uma coleção de "será que estou errando?". Um dia, meio sem paciência, entrei no app e fui ouvindo um áudio curto: "A culpa não nasce em você. Ela nasce do que ensinaram que você deveria ser." Aquilo me desmontou. Eu nunca tinha parado pra pensar que a culpa não era minha — era do peso que o mundo coloca nos nossos ombros. Eu comecei a participar da comunidade. Comecei a dividir coisas que eu nunca tinha dito pra ninguém. E percebi que quase todas as mães sentiam o mesmo. Eu não estava errando. Eu estava tentando. E isso já é ser suficiente. O app virou o único lugar onde eu não precisava carregar a culpa sozinha. Aqui eu aprendi a respirar de novo.`,
      imageUrl: 'https://i.imgur.com/fUss8jg.jpg',
      likes: 456,
      replies: 89,
    },
    {
      id: '4',
      author: 'Fernanda L.',
      authorInitials: 'FL',
      avatarUrl:
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop&crop=faces',
      timeAgo: '2d atrás',
      title: 'EU ACHAVA QUE ESTAVA SOZINHA… ATÉ DESCOBRIR QUE MEU CANSAÇO TEM NOME',
      content: `Eu achava que era só comigo: o corpo doendo, a mente travada, o humor oscilando, o choro fácil, a irritação com pequenas coisas. Achei que eu estava ficando fraca, sensível demais. Até que um dia assisti uma aula do app sobre "exaustão materna". Era como se alguém tivesse narrado a minha vida. "Isso não é fraqueza. Isso é sobrecarga invisível." Invisível. Essa palavra bateu fundo. Porque é isso: a sobrecarga existe, mas ninguém vê. O app me deu nome para o que eu sentia. E quando a gente dá nome, a gente entende. E quando entende, já não dói sozinha. Eu fiquei porque aqui eu me sinto vista. E mãe que é vista… respira melhor.`,
      imageUrl: 'https://i.imgur.com/pDZCc5i.jpg',
      likes: 523,
      replies: 112,
    },
    {
      id: '5',
      author: 'Mariana C.',
      authorInitials: 'MC',
      avatarUrl:
        'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=200&h=200&fit=crop&crop=faces',
      timeAgo: '3d atrás',
      title: 'QUANDO SER MÃE ME ASSUSTOU, FOI AQUI QUE ENCONTREI CORAGEM',
      content: `Eu lembro do dia em que a maternidade me assustou pela primeira vez. O bebê chorava sem parar. Eu estava sozinha. O relógio marcava 02:47 da manhã. E eu sentia meu corpo totalmente entregue ao cansaço. Eu balancei ele, caminhei, cantei, tentei de tudo. Nada funcionava. Eu comecei a tremer. Não de frio. De medo de não dar conta. Peguei o celular só pra iluminar o quarto, e o app abriu numa página que eu tinha deixado salva: "A maternidade não exige perfeição. Ela exige presença — e você está aqui." Eu desabei. Mas foi um choro de soltar o ar preso há semanas. Eu me senti acompanhada. Me senti menos incompetente. Menos sozinha. O bebê não parou de chorar na hora. Mas eu parei de me culpar. E isso mudou tudo. Fiquei no app porque ele virou meu apoio quando ninguém estava acordado.`,
      imageUrl: 'https://i.imgur.com/VWA5NRQ.jpg',
      likes: 678,
      replies: 145,
    },
    {
      id: '6',
      author: 'Patrícia A.',
      authorInitials: 'PA',
      avatarUrl:
        'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&h=200&fit=crop&crop=faces',
      timeAgo: '4d atrás',
      title: 'ENCONTREI MINHA TRIBO AQUI',
      content: `Sempre me senti diferente das outras mães. Enquanto elas postavam fotos perfeitas no Instagram, eu estava no banheiro chorando de exaustão. Enquanto elas falavam sobre "momento mágico", eu me sentia sobrecarregada. Até encontrar este espaço. Aqui eu descobri que não estava sozinha. Que outras mães também sentem o mesmo. Que é normal não estar feliz o tempo todo. Que é normal ter dúvidas. Que é normal precisar de ajuda. Aqui eu encontrei minha tribo. Mães reais, com histórias reais, compartilhando suas verdades. E isso mudou tudo para mim.`,
      imageUrl: 'https://i.imgur.com/JOKvbZx.jpg',
      likes: 412,
      replies: 98,
    },
  ];

  const handleFilterPress = (filter: FilterType) => {
    triggerPlatformHaptic('selection');
    setSelectedFilter(filter);
  };

  const handleCreatePost = () => {
    triggerPlatformHaptic('buttonPress');
    logger.info('[CommunityScreen] Criar Post pressionado');
    // Por enquanto mostra alerta, depois implementar tela de criar post
    Alert.alert(
      'Criar Post',
      'Funcionalidade em desenvolvimento. Em breve você poderá criar posts na comunidade!',
      [{ text: 'OK' }]
    );
  };

  const handleViewFeed = () => {
    triggerPlatformHaptic('buttonPress');
    logger.info('[CommunityScreen] Ver Feed pressionado');
    // Scroll para o topo da lista de posts
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
  };

  const handleGroups = () => {
    triggerPlatformHaptic('buttonPress');
    logger.info('[CommunityScreen] Grupos pressionado');
    // Por enquanto mostra alerta, depois implementar tela de grupos
    Alert.alert(
      'Grupos',
      'Funcionalidade em desenvolvimento. Em breve você poderá ver e participar de grupos!',
      [{ text: 'OK' }]
    );
  };

  const handleLikePost = (postId: string) => {
    triggerPlatformHaptic('buttonPress');
    setLikedPosts((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(postId)) {
        newSet.delete(postId);
        logger.info('[CommunityScreen] Post descurtido', { postId });
      } else {
        newSet.add(postId);
        logger.info('[CommunityScreen] Post curtido', { postId });
      }
      return newSet;
    });
  };

  const handleCommentPost = (postId: string) => {
    triggerPlatformHaptic('buttonPress');
    logger.info('[CommunityScreen] Comentários pressionado', { postId });
    Alert.alert(
      'Comentários',
      'Funcionalidade de comentários em desenvolvimento. Em breve você poderá comentar nos posts!',
      [{ text: 'OK' }]
    );
  };

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.background.canvas }}
      edges={['top']}
      accessible={false}
    >
      <ScrollView
        ref={scrollViewRef}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: Spacing['20'] }}
      >
        {/* Header Section - Novo Design (PADRONIZADO: py-4 sm:py-6) */}
        <Box
          bg="card"
          px="4"
          pt="4"
          pb="6"
          style={{
            borderBottomWidth: 1,
            borderBottomColor: colors.border.light,
          }}
        >
          {/* Avatar + Info */}
          <Box direction="row" align="center" gap="3" mb="4">
            <Avatar
              size={64}
              source={{ uri: 'https://i.imgur.com/OLdeyD6.jpg' }}
              fallback="MV"
              borderWidth={2}
              borderColor={colors.secondary.main}
              useGradientFallback={true}
            />
            <Box flex={1}>
              <View
                style={{
                  backgroundColor: `${ColorTokens.primary[500]}33`, // 20% opacity
                  paddingHorizontal: Spacing['2.5'],
                  paddingVertical: Spacing['1'],
                  borderRadius: Radius.full,
                  marginBottom: Spacing['2'],
                  alignSelf: 'flex-start',
                }}
              >
                <Text size="xs" weight="semibold" style={{ color: colors.primary.main }}>
                  ✨ MÃESVALENTES
                </Text>
              </View>
              <Text size="2xl" weight="bold" style={{ marginBottom: Spacing['0.5'] }}>
                Comunidade
              </Text>
              <Text size="sm" color="tertiary">
                Mãe ajuda mãe 💜
              </Text>
            </Box>
            <ThemeToggle variant="outline" />
          </Box>

          {/* Botões de Ação */}
          <Box direction="row" gap="2">
            {/* Botão Criar Post - Primary */}
            <TouchableOpacity
              onPress={handleCreatePost}
              activeOpacity={0.8}
              style={{
                flex: 1,
                backgroundColor: colors.primary.main,
                minHeight: Tokens.touchTargets.min,
                paddingVertical: Spacing['3'],
                paddingHorizontal: Spacing['4'],
                borderRadius: Radius.xl,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: Spacing['2'],
              }}
              accessibilityRole="button"
              accessibilityLabel="Criar Post"
              accessibilityHint="Toque para criar um novo post na comunidade"
            >
              <Plus size={16} color={ColorTokens.neutral[0]} />
              <Text size="sm" weight="semibold" style={{ color: ColorTokens.neutral[0] }}>
                Criar Post
              </Text>
            </TouchableOpacity>

            {/* Botão Ver Feed - Outline Secondary */}
            <TouchableOpacity
              onPress={handleViewFeed}
              activeOpacity={0.8}
              style={{
                backgroundColor: 'transparent',
                borderWidth: 1,
                borderColor: colors.secondary.main,
                minHeight: Tokens.touchTargets.min,
                paddingVertical: Spacing['3'],
                paddingHorizontal: Spacing['4'],
                borderRadius: Radius.xl,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: Spacing['2'],
              }}
              accessibilityRole="button"
              accessibilityLabel="Ver Feed"
              accessibilityHint="Toque para ver o feed completo da comunidade"
            >
              <Grid size={16} color={colors.secondary.main} />
              <Text size="sm" weight="semibold" style={{ color: colors.secondary.main }}>
                Ver Feed
              </Text>
            </TouchableOpacity>

            {/* Botão Grupos - Outline Warning */}
            <TouchableOpacity
              onPress={handleGroups}
              activeOpacity={0.8}
              style={{
                backgroundColor: 'transparent',
                borderWidth: 1,
                borderColor: ColorTokens.warning[500],
                minHeight: Tokens.touchTargets.min,
                paddingVertical: Spacing['3'],
                paddingHorizontal: Spacing['4'],
                borderRadius: Radius.xl,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: Spacing['2'],
              }}
              accessibilityRole="button"
              accessibilityLabel="Grupos"
              accessibilityHint="Toque para ver os grupos da comunidade"
            >
              <Users size={16} color={ColorTokens.warning[500]} />
              <Text size="sm" weight="semibold" style={{ color: ColorTokens.warning[500] }}>
                Grupos
              </Text>
            </TouchableOpacity>
          </Box>
        </Box>

        {/* Mundo Nath Featured Card */}
        <Box px="4" pt="6">
          <TouchableOpacity
            activeOpacity={0.9}
            accessibilityRole="button"
            accessibilityLabel="Mundo Nath - Conteúdos exclusivos"
            accessibilityHint="Toque para ver conteúdos exclusivos do Mundo Nath"
          >
            <View
              style={{
                borderRadius: Radius['3xl'],
                overflow: 'hidden',
                ...Shadows.card,
              }}
            >
              <LinearGradient
                colors={
                  isDark
                    ? ColorTokens.nathIA.gradient.dark
                    : [ColorTokens.primary[400], ColorTokens.secondary[400]]
                }
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{ padding: Spacing['4'], opacity: isDark ? 1 : 0.9 }}
              >
                <Box direction="row" align="center" gap="3">
                  <Avatar
                    size={56}
                    source={{ uri: 'https://i.imgur.com/1CWZt2p.jpg' }}
                    fallback="MN"
                    borderWidth={2}
                    borderColor={ColorTokens.overlay.light}
                    style={{
                      backgroundColor: ColorTokens.overlay.light,
                    }}
                  />
                  <Box flex={1}>
                    <Badge
                      containerStyle={{
                        backgroundColor: isDark
                          ? ColorTokens.overlay.light
                          : `${ColorTokens.primary[500]}1A`,
                        marginBottom: Spacing['1'],
                        alignSelf: 'flex-start',
                      }}
                    >
                      <Text
                        size="xs"
                        weight="medium"
                        style={{
                          color: isDark ? ColorTokens.neutral[0] : ColorTokens.primary[600],
                        }}
                      >
                        Destaque
                      </Text>
                    </Badge>
                    <Text
                      size="md"
                      weight="bold"
                      style={{
                        color: isDark ? ColorTokens.neutral[0] : ColorTokens.neutral[900],
                        marginBottom: Spacing['0.5'],
                      }}
                    >
                      Mundo Nath
                    </Text>
                    <Text
                      size="sm"
                      style={{
                        color: isDark ? `${ColorTokens.neutral[0]}CC` : ColorTokens.neutral[700],
                      }}
                    >
                      Conteúdos exclusivos para você
                    </Text>
                  </Box>
                </Box>
              </LinearGradient>
            </View>
          </TouchableOpacity>
        </Box>

        {/* Categories */}
        <Box px="4" pt="4" pb="2">
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: Spacing['2'] }}
          >
            {filters.map((category) => (
              <TouchableOpacity
                key={category}
                onPress={() => handleFilterPress(category)}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel={`Filtrar por ${category}`}
                accessibilityState={{ selected: selectedFilter === category }}
                style={{
                  paddingHorizontal: Spacing['4'],
                  paddingVertical: Spacing['2'],
                  borderRadius: Radius.full,
                  backgroundColor:
                    selectedFilter === category
                      ? colors.primary.main
                      : isDark
                        ? ColorTokens.neutral[800]
                        : ColorTokens.neutral[100],
                  borderWidth: selectedFilter === category ? 0 : 1,
                  borderColor: colors.border.medium,
                }}
              >
                <Text
                  size="sm"
                  weight={selectedFilter === category ? 'semibold' : 'medium'}
                  style={{
                    color:
                      selectedFilter === category ? ColorTokens.neutral[0] : colors.text.primary,
                  }}
                >
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </Box>

        {/* Lista de Posts - Melhorada com cards mais polidos */}
        <Box pt="4" px="4">
          {mockPosts.map((post) => (
            <Box
              key={post.id}
              bg="card"
              mb="4"
              p="5"
              rounded="2xl"
              borderWidth={1}
              borderColor="light"
              shadow="card"
              accessible={false}
            >
              {/* Header do Post - Espaçamento perfeito */}
              <Box
                direction="row"
                align="center"
                mb="4"
                style={{
                  paddingBottom: Spacing['3'],
                }}
              >
                {/* Avatar do Autor com foto realista */}
                <Box
                  width={44}
                  height={44}
                  rounded="full"
                  align="center"
                  justify="center"
                  mr="3"
                  style={{
                    backgroundColor: colors.primary.light,
                    borderWidth: 2,
                    borderColor: colors.primary.main,
                    overflow: 'hidden',
                  }}
                >
                  {post.avatarUrl ? (
                    <Image
                      source={{ uri: post.avatarUrl }}
                      style={{
                        width: 44,
                        height: 44,
                      }}
                      contentFit="cover"
                      transition={200}
                      accessible={true}
                      accessibilityLabel={`Foto de perfil de ${post.author}`}
                      accessibilityIgnoresInvertColors={false}
                    />
                  ) : (
                    <Text style={TextStyles.bodyMedium} color="primary" weight="bold">
                      {post.authorInitials}
                    </Text>
                  )}
                </Box>

                {/* Nome e Tempo - Espaçamento adequado */}
                <Box flex={1}>
                  <Text
                    style={StyleSheet.flatten([
                      TextStyles.titleSmall,
                      {
                        marginBottom: Spacing['1'],
                      },
                    ])}
                    color="primary"
                  >
                    {post.author}
                  </Text>
                  <Text style={TextStyles.caption} color="tertiary">
                    {post.timeAgo}
                  </Text>
                </Box>

                {/* Menu - Alinhado corretamente */}
                <TouchableOpacity
                  onPress={() => {
                    triggerPlatformHaptic('buttonPress');
                  }}
                  style={{
                    minWidth: Tokens.touchTargets.min,
                    minHeight: Tokens.touchTargets.min,
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginLeft: Spacing['2'],
                  }}
                  accessibilityRole="button"
                  accessibilityLabel="Opções do post"
                  accessibilityHint="Toque para ver opções do post"
                >
                  <MoreVertical size={20} color={colors.text.tertiary} />
                </TouchableOpacity>
              </Box>

              {/* Título do Post - Espaçamento perfeito */}
              <Text
                style={StyleSheet.flatten([
                  TextStyles.titleLarge,
                  {
                    marginBottom: Spacing['4'],
                    textTransform: 'uppercase',
                    letterSpacing: 0.5,
                    lineHeight: Typography.lineHeights.lg,
                  },
                ])}
                color="primary"
              >
                {post.title}
              </Text>

              {/* Conteúdo do Post - Compacto */}
              <Text
                style={StyleSheet.flatten([
                  TextStyles.bodyLarge,
                  {
                    marginBottom: post.imageUrl ? Spacing['3'] : Spacing['4'],
                    lineHeight: 20, // ✅ 20px - compacto (1.25x para fonte 16px)
                    letterSpacing: 0.1,
                  },
                ])}
                color="primary"
              >
                {post.content}
              </Text>

              {/* Imagem do Post - Melhorada */}
              {post.imageUrl && (
                <Box
                  mb="4"
                  rounded="lg"
                  style={{
                    overflow: 'hidden',
                    backgroundColor: colors.border.light,
                  }}
                >
                  <Image
                    source={{ uri: post.imageUrl }}
                    style={{
                      width: '100%',
                      aspectRatio: 16 / 9,
                      backgroundColor: colors.border.light,
                    }}
                    contentFit="cover"
                    transition={200}
                    accessibilityLabel={`Imagem do post: ${post.title}`}
                    accessibilityHint="Imagem compartilhada no post"
                    accessibilityIgnoresInvertColors={false}
                  />
                </Box>
              )}

              {/* Ações do Post - Espaçamento perfeito */}
              <Box
                direction="row"
                gap="6"
                pt="4"
                style={{
                  borderTopWidth: 1,
                  borderTopColor: colors.border.light,
                  marginTop: Spacing['2'],
                }}
              >
                <TouchableOpacity
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: Spacing['2'],
                    minHeight: Tokens.touchTargets.min,
                    paddingHorizontal: Spacing['2'],
                  }}
                  onPress={() => handleLikePost(post.id)}
                  accessibilityRole="button"
                  accessibilityLabel={`${post.likes} curtidas. ${likedPosts.has(post.id) ? 'Você curtiu este post' : 'Toque para curtir'}`}
                  accessibilityHint="Toque para curtir este post"
                  accessibilityState={{ selected: likedPosts.has(post.id) }}
                >
                  <Heart
                    size={20}
                    color={likedPosts.has(post.id) ? colors.status.error : colors.text.tertiary}
                    fill={likedPosts.has(post.id) ? colors.status.error : 'transparent'}
                  />
                  <Text
                    style={{
                      ...TextStyles.labelMedium,
                      color: likedPosts.has(post.id) ? colors.status.error : colors.text.tertiary,
                    }}
                  >
                    {post.likes}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: Spacing['2'],
                    minHeight: Tokens.touchTargets.min,
                    paddingHorizontal: Spacing['2'],
                  }}
                  onPress={() => handleCommentPost(post.id)}
                  accessibilityRole="button"
                  accessibilityLabel={`${post.replies} respostas`}
                  accessibilityHint="Toque para ver ou adicionar respostas"
                >
                  <MessageCircle size={20} color={colors.text.tertiary} />
                  <Text style={TextStyles.labelMedium} color="tertiary">
                    {post.replies}
                  </Text>
                </TouchableOpacity>
              </Box>
            </Box>
          ))}
        </Box>
      </ScrollView>
    </SafeAreaView>
  );
}
