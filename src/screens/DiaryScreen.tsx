import { useNavigation } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import { ArrowLeft, Sparkles, Layout, Calendar, BookHeart, Shield } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Animated,
} from 'react-native';

import { Tokens, Shadows, Spacing, Typography, Radius } from '@/theme/tokens';

import { Button } from '../components';
import { useThemeColors } from '../hooks/useTheme';
import { diaryService } from '../services/diaryService';
import { geminiService } from '../services/geminiService';
import { logger } from '../utils/logger';

export default function DiaryScreen() {
  const navigation = useNavigation();
  const colors = useThemeColors();
  const [entry, setEntry] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [response, setResponse] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [savedToRefuge, setSavedToRefuge] = useState(false);

  const handleSubmit = async () => {
    if (!entry.trim()) return;
    setIsAnalyzing(true);

    try {
      const aiResponse = await geminiService.analyzeDiaryEntry(entry);
      setResponse(
        aiResponse.text || 'Guardei seu desabafo com carinho, mesmo com minha conexão instável.'
      );
    } catch (error) {
      logger.error('Error analyzing diary', error);
      setResponse('Guardei seu desabafo com carinho, mesmo com minha conexão instável.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSaveToRefuge = async () => {
    if (!entry.trim() || savedToRefuge) return;

    setIsSaving(true);
    try {
      const { data, error } = await diaryService.saveToRefuge({
        content: entry,
        ai_response: response,
        is_favorite: true,
      });

      if (error) {
        logger.error('Failed to save to refuge', error, { screen: 'DiaryScreen' });
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        return;
      }

      logger.info('Entry saved to refuge', { screen: 'DiaryScreen', entryId: data?.id });
      setSavedToRefuge(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      logger.error('Unexpected error saving to refuge', error, { screen: 'DiaryScreen' });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsSaving(false);
    }
  };

  const ActionBtn = ({
    icon,
    title,
    subtitle,
    onPress,
  }: {
    icon: React.ReactNode;
    title: string;
    subtitle: string;
    onPress: () => void;
  }) => {
    const scaleAnim = React.useRef(new Animated.Value(1)).current;

    const handlePressIn = () => {
      Animated.spring(scaleAnim, {
        toValue: 0.97,
        useNativeDriver: true,
        damping: 15,
        stiffness: 300,
      }).start();
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
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
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      onPress();
    };

    return (
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <TouchableOpacity
          onPress={handlePress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          activeOpacity={1}
          style={{
            width: '100%',
            backgroundColor: colors.background.card,
            padding: Spacing['4'],
            borderRadius: Tokens.radius.xl,
            borderWidth: 1,
            borderColor: colors.border.light,
            flexDirection: 'row',
            alignItems: 'center',
            gap: Spacing['4'],
            marginBottom: Spacing['3'],
            minHeight: Tokens.touchTargets.min,
            ...Shadows.sm,
          }}
          accessibilityRole="button"
          accessibilityLabel={`${title}. ${subtitle}`}
          accessibilityHint="Toque para executar esta ação"
        >
          <View
            style={{
              width: Tokens.iconSizes.md,
              height: Tokens.iconSizes.md,
              borderRadius: Radius.full,
              backgroundColor: colors.background.elevated,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {icon}
          </View>
          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontSize: Typography.sizes.base,
                fontWeight: Typography.weights.bold,
                color: colors.text.primary,
                marginBottom: Spacing['0.5'],
              }}
            >
              {title}
            </Text>
            <Text
              style={{
                fontSize: Typography.sizes.xs,
                color: colors.text.secondary,
              }}
            >
              {subtitle}
            </Text>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView
      className="flex-1"
      style={{ backgroundColor: colors.background.canvas }}
      accessibilityLabel="Tela do Diário MãesValente"
      accessibilityHint="Escreva seus pensamentos e receba apoio da NathIA"
    >
      {/* Header */}
      <View
        className="px-4 py-4 flex-row items-center justify-between border-b"
        style={{
          backgroundColor: colors.background.card,
          borderBottomColor: colors.border.light,
        }}
      >
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{
            backgroundColor: colors.text.primary,
            padding: Spacing['2'],
            borderRadius: Radius.full,
            minWidth: Tokens.touchTargets.min,
            minHeight: Tokens.touchTargets.min,
            alignItems: 'center',
            justifyContent: 'center',
          }}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Voltar"
          accessibilityHint="Retorna para a tela anterior"
        >
          <ArrowLeft size={20} color={colors.text.inverse} />
        </TouchableOpacity>

        <View
          className="items-center"
          accessible={true}
          accessibilityRole="header"
          style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}
        >
          <Image
            source={require('../../assets/logo.png')}
            style={{
              width: Tokens.iconSizes.sm,
              height: Tokens.iconSizes.sm,
              borderRadius: Radius.lg,
            }}
            contentFit="cover"
            transition={200}
            accessibilityLabel="Logo Nossa Maternidade"
            accessibilityHint="Logotipo do aplicativo"
          />
          <View className="items-center">
            <Text
              className="text-[10px] font-bold uppercase tracking-widest"
              style={{ color: colors.primary.main }}
              accessibilityLabel="Nossa Maternidade"
              accessibilityHint="Nome do aplicativo"
            >
              Nossa Maternidade
            </Text>
            <View className="flex-row items-center gap-1">
              <Text
                className="text-sm font-bold"
                style={{ color: colors.text.primary }}
                accessibilityLabel="Diário MãesValente"
                accessibilityHint="Seção atual do aplicativo"
              >
                Diário{' '}
              </Text>
              <Sparkles size={10} color={colors.primary.main} />
              <Text className="text-sm font-bold" style={{ color: colors.text.primary }}>
                {' '}
                MãesValente
              </Text>
            </View>
          </View>
        </View>

        <View className="w-9" />
      </View>

      <ScrollView className="flex-1 p-6" showsVerticalScrollIndicator={false} accessible={false}>
        {!response ? (
          // Input State
          <View>
            <Text
              className="block font-bold text-lg mb-4"
              style={{ color: colors.text.primary }}
              accessibilityRole="header"
              accessibilityLabel="Como você está se sentindo?"
              accessibilityHint="Pergunta principal do diário"
            >
              Como você está se sentindo?
            </Text>
            <TextInput
              value={entry}
              onChangeText={setEntry}
              placeholder="Desabafa aqui, como se estivesse falando com uma amiga... Não vou julgar, só te escutar."
              placeholderTextColor={colors.text.tertiary}
              multiline
              numberOfLines={10}
              className="w-full p-4 rounded-2xl border text-base"
              style={{
                backgroundColor: colors.background.card,
                borderColor: colors.border.light,
                color: colors.text.primary,
                minHeight: 256,
                textAlignVertical: 'top',
              }}
              accessibilityLabel="Campo de texto do diário"
              accessibilityHint="Digite seus pensamentos e sentimentos aqui"
            />
            <View className="mt-2 flex-row justify-end">
              <View
                className="flex-row items-center gap-1"
                accessible={true}
                accessibilityLabel="Ambiente seguro e privado"
                accessibilityHint="Suas informações são protegidas"
              >
                <Shield size={12} color={colors.text.tertiary} />
                <Text className="text-xs" style={{ color: colors.text.tertiary }}>
                  Ambiente seguro e privado
                </Text>
              </View>
            </View>
          </View>
        ) : (
          // Response State
          <View>
            {/* Original Entry (Collapsed or Preview) */}
            <View
              className="bg-white dark:bg-nath-dark-card p-4 rounded-xl border mb-6 opacity-70"
              style={{ borderColor: colors.border.light }}
              accessible={true}
              accessibilityLabel={`Sua entrada no diário: ${entry}`}
              accessibilityHint="Texto que você escreveu anteriormente"
              accessibilityRole="text"
            >
              <Text
                className="text-sm italic"
                numberOfLines={3}
                style={{ color: colors.text.secondary }}
              >
                &quot;{entry}&quot;
              </Text>
            </View>

            {/* NathIA Response */}
            <View className="flex-row gap-4 mb-8">
              <View
                style={{
                  width: Tokens.iconSizes.sm,
                  height: Tokens.iconSizes.sm,
                  borderRadius: Radius.xl,
                  overflow: 'hidden',
                  borderWidth: 1.5,
                  borderColor: colors.border.light,
                  ...Shadows.sm,
                }}
                accessible={true}
                accessibilityLabel="Avatar da NathIA"
                accessibilityHint="Imagem da assistente virtual"
              >
                <Image
                  source={{ uri: 'https://i.imgur.com/oB9ewPG.jpg' }}
                  style={{ width: '100%', height: '100%' }}
                  contentFit="cover"
                  transition={200}
                  cachePolicy="memory-disk"
                />
              </View>
              <View
                className="flex-1 p-5 rounded-2xl rounded-tl-none relative"
                style={{
                  backgroundColor: colors.background.elevated,
                }}
                accessible={true}
                accessibilityLabel={`Resposta da NathIA: ${response}`}
                accessibilityHint="Mensagem de apoio da assistente"
                accessibilityRole="text"
              >
                <Sparkles
                  size={16}
                  color={colors.primary.main}
                  style={{ position: 'absolute', top: 16, right: 16 }}
                />
                <Text className="leading-relaxed" style={{ color: colors.text.primary }}>
                  {response}
                </Text>
              </View>
            </View>

            {/* Action Buttons */}
            <Text
              style={{
                fontSize: Typography.sizes.sm,
                fontWeight: Typography.weights.bold,
                textTransform: 'uppercase',
                letterSpacing: 1,
                color: colors.text.secondary,
                marginBottom: Spacing['4'],
              }}
              accessibilityRole="header"
              accessibilityLabel="Como posso te ajudar agora?"
              accessibilityHint="Opções de ações disponíveis"
            >
              Como posso te ajudar agora?
            </Text>
            <View>
              <ActionBtn
                icon={<Layout size={20} color={colors.text.primary} />}
                title="Organizar meu dia de amanhã"
                subtitle="Criar checklist leve"
                onPress={() => {
                  logger.info('Action: Organizar dia de amanhã', { screen: 'DiaryScreen' });
                  // TODO: Implementar navegação ou ação
                }}
              />
              <ActionBtn
                icon={<Calendar size={20} color={colors.text.primary} />}
                title="Criar rotina para a semana"
                subtitle="Planejamento suave"
                onPress={() => {
                  logger.info('Action: Criar rotina para semana', { screen: 'DiaryScreen' });
                  // TODO: Implementar navegação ou ação
                }}
              />
              <ActionBtn
                icon={
                  <BookHeart
                    size={20}
                    color={savedToRefuge ? colors.status.success : colors.text.primary}
                  />
                }
                title={
                  savedToRefuge
                    ? 'Guardado no Refúgio'
                    : isSaving
                      ? 'Salvando...'
                      : 'Guardar no meu Refúgio'
                }
                subtitle={savedToRefuge ? 'Memória salva com carinho' : 'Salvar como memória'}
                onPress={handleSaveToRefuge}
              />
            </View>
          </View>
        )}
      </ScrollView>

      {/* Footer Action */}
      {!response && (
        <View
          className="p-6 border-t"
          style={{
            backgroundColor: colors.background.card,
            borderTopColor: colors.border.light,
          }}
        >
          <Button
            title={isAnalyzing ? 'Analisando com carinho...' : 'Enviar para NathIA'}
            onPress={handleSubmit}
            disabled={!entry.trim() || isAnalyzing}
            loading={isAnalyzing}
            fullWidth
          />
        </View>
      )}
    </SafeAreaView>
  );
}
