/**
 * File Review Screen
 * Tela para revisar e aprovar mudanças em arquivos
 */

import * as Haptics from 'expo-haptics';
import { CheckCircle2, FileText, ChevronRight, Check, X, Settings } from 'lucide-react-native';
import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Box } from '../components/primitives/Box';
import { HapticButton } from '../components/primitives/HapticButton';
import { useFileReview } from '../contexts/FileReviewContext';
import { useTheme } from '../theme/ThemeContext';
import { Tokens } from '../theme/tokens';
import { logger } from '../utils/logger';

export default function FileReviewScreen() {
  const { colors } = useTheme();
  const {
    currentSession,
    currentFile,
    permissions,
    approveFile: _approveFile,
    rejectFile,
    approveAll,
    keepFile,
    reviewNextFile,
    setAllowAll,
    completeSession,
    getStats,
  } = useFileReview();

  const stats = getStats();

  const handleApproveAll = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      await approveAll();
      logger.info('[FileReviewScreen] All files approved');
    } catch (error) {
      logger.error('[FileReviewScreen] Failed to approve all', error);
    }
  };

  const handleKeepFile = async () => {
    if (!currentFile) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      await keepFile(currentFile.id);
      await reviewNextFile();
      logger.info('[FileReviewScreen] File kept', { fileId: currentFile.id });
    } catch (error) {
      logger.error('[FileReviewScreen] Failed to keep file', error);
    }
  };

  const handleRejectFile = async () => {
    if (!currentFile) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      await rejectFile(currentFile.id);
      await reviewNextFile();
      logger.info('[FileReviewScreen] File rejected', { fileId: currentFile.id });
    } catch (error) {
      logger.error('[FileReviewScreen] Failed to reject file', error);
    }
  };

  const handleToggleAllowAll = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      await setAllowAll(!permissions.allowAll);
      logger.info('[FileReviewScreen] Allow all toggled', { enabled: !permissions.allowAll });
    } catch (error) {
      logger.error('[FileReviewScreen] Failed to toggle allow all', error);
    }
  };

  const handleComplete = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    try {
      await completeSession();
      logger.info('[FileReviewScreen] Session completed');
    } catch (error) {
      logger.error('[FileReviewScreen] Failed to complete session', error);
    }
  };

  if (!currentSession) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background.canvas }}>
        <Box p="6" align="center" justify="center" style={{ flex: 1 }}>
          <Text style={{ fontSize: 18, color: colors.text.secondary }}>
            Nenhuma sessão de revisão ativa
          </Text>
        </Box>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background.canvas }}>
      {/* Header */}
      <View
        style={{
          paddingHorizontal: Tokens.spacing['4'],
          paddingVertical: Tokens.spacing['3'],
          borderBottomWidth: 1,
          borderBottomColor: colors.border.light,
          backgroundColor: colors.background.card,
        }}
      >
        <View
          style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
        >
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 20, fontWeight: '700', color: colors.text.primary }}>
              {currentSession.title}
            </Text>
            {currentSession.description && (
              <Text style={{ fontSize: 14, color: colors.text.secondary, marginTop: 4 }}>
                {currentSession.description}
              </Text>
            )}
          </View>
          <TouchableOpacity
            onPress={handleToggleAllowAll}
            style={{
              padding: Tokens.spacing['2'],
              borderRadius: Tokens.radius.md,
              backgroundColor: permissions.allowAll
                ? colors.status.success + '20'
                : colors.background.elevated,
            }}
            accessibilityRole="button"
            accessibilityLabel={permissions.allowAll ? 'Desativar Allow All' : 'Ativar Allow All'}
          >
            <Settings
              size={20}
              color={permissions.allowAll ? colors.status.success : colors.text.secondary}
            />
          </TouchableOpacity>
        </View>

        {/* Progress Bar */}
        <View style={{ marginTop: Tokens.spacing['3'] }}>
          <View
            style={{
              height: 8,
              backgroundColor: colors.background.elevated,
              borderRadius: Tokens.radius.sm,
              overflow: 'hidden',
            }}
          >
            <View
              style={{
                height: '100%',
                width: `${stats.progress}%`,
                backgroundColor: colors.status.success,
              }}
            />
          </View>
          <Text style={{ fontSize: 12, color: colors.text.tertiary, marginTop: 4 }}>
            {stats.approved}/{stats.total} aprovados • {stats.pending} pendentes
          </Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: Tokens.spacing['4'] }}
        showsVerticalScrollIndicator={false}
      >
        {/* Allow All Toggle Card */}
        {permissions.allowAll && (
          <Box
            style={{
              backgroundColor: colors.status.success + '15',
              borderWidth: 1,
              borderColor: colors.status.success + '40',
              borderRadius: Tokens.radius.lg,
              padding: Tokens.spacing['4'],
              marginBottom: Tokens.spacing['4'],
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: Tokens.spacing['2'],
              }}
            >
              <CheckCircle2 size={20} color={colors.status.success} />
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: '600',
                  color: colors.text.primary,
                  marginLeft: Tokens.spacing['2'],
                }}
              >
                Allow All Ativado
              </Text>
            </View>
            <Text style={{ fontSize: 12, color: colors.text.secondary }}>
              Todas as mudanças serão aprovadas automaticamente
            </Text>
          </Box>
        )}

        {/* Current File Review */}
        {currentFile ? (
          <Box
            style={{
              backgroundColor: colors.background.card,
              borderRadius: Tokens.radius.lg,
              padding: Tokens.spacing['4'],
              borderWidth: 1,
              borderColor: colors.border.light,
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: Tokens.spacing['3'],
              }}
            >
              <FileText size={20} color={colors.primary.main} />
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: '600',
                  color: colors.text.primary,
                  marginLeft: Tokens.spacing['2'],
                  flex: 1,
                }}
                numberOfLines={1}
              >
                {currentFile.filePath}
              </Text>
            </View>

            {currentFile.change.description && (
              <Text
                style={{
                  fontSize: 14,
                  color: colors.text.secondary,
                  marginBottom: Tokens.spacing['3'],
                }}
              >
                {currentFile.change.description}
              </Text>
            )}

            {/* File Diff Preview */}
            {currentFile.change.diff && (
              <View
                style={{
                  backgroundColor: colors.background.elevated,
                  borderRadius: Tokens.radius.md,
                  padding: Tokens.spacing['3'],
                  marginBottom: Tokens.spacing['3'],
                }}
              >
                <Text
                  style={{
                    fontSize: 12,
                    fontFamily: 'monospace',
                    color: colors.text.secondary,
                  }}
                  numberOfLines={10}
                >
                  {currentFile.change.diff}
                </Text>
              </View>
            )}

            {/* Actions */}
            <View style={{ flexDirection: 'row', gap: Tokens.spacing['2'] }}>
              <HapticButton
                variant="primary"
                size="md"
                onPress={handleKeepFile}
                style={{ flex: 1 }}
                accessibilityLabel="Manter arquivo e avançar"
              >
                <View
                  style={{ flexDirection: 'row', alignItems: 'center', gap: Tokens.spacing['1'] }}
                >
                  <Check size={16} color={colors.text.inverse} />
                  <Text style={{ color: colors.text.inverse, fontWeight: '600' }}>Keep File</Text>
                </View>
              </HapticButton>

              <HapticButton
                variant="ghost"
                size="md"
                onPress={handleRejectFile}
                style={{ flex: 1 }}
                accessibilityLabel="Rejeitar arquivo"
              >
                <View
                  style={{ flexDirection: 'row', alignItems: 'center', gap: Tokens.spacing['1'] }}
                >
                  <X size={16} color={colors.status.error} />
                  <Text style={{ color: colors.status.error, fontWeight: '600' }}>Rejeitar</Text>
                </View>
              </HapticButton>
            </View>
          </Box>
        ) : (
          <Box
            style={{
              backgroundColor: colors.background.card,
              borderRadius: Tokens.radius.lg,
              padding: Tokens.spacing['6'],
              alignItems: 'center',
            }}
          >
            <CheckCircle2 size={48} color={colors.status.success} />
            <Text
              style={{
                fontSize: 18,
                fontWeight: '600',
                color: colors.text.primary,
                marginTop: Tokens.spacing['3'],
              }}
            >
              Todas as revisões concluídas!
            </Text>
            <Text
              style={{ fontSize: 14, color: colors.text.secondary, marginTop: Tokens.spacing['2'] }}
            >
              {stats.approved} arquivos aprovados
            </Text>
          </Box>
        )}

        {/* Keep All Button */}
        {stats.pending > 0 && (
          <HapticButton
            variant="primary"
            size="lg"
            onPress={handleApproveAll}
            style={{ marginTop: Tokens.spacing['4'] }}
            accessibilityLabel={`Aprovar todos os ${stats.pending} arquivos pendentes`}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: Tokens.spacing['2'] }}>
              <CheckCircle2 size={20} color={colors.text.inverse} />
              <Text style={{ color: colors.text.inverse, fontWeight: '600', fontSize: 16 }}>
                Keep All ({stats.pending})
              </Text>
            </View>
          </HapticButton>
        )}

        {/* Review Next File Button */}
        {currentFile && stats.pending > 1 && (
          <HapticButton
            variant="ghost"
            size="md"
            onPress={reviewNextFile}
            style={{ marginTop: Tokens.spacing['2'] }}
            accessibilityLabel="Revisar próximo arquivo"
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: Tokens.spacing['2'] }}>
              <ChevronRight size={16} color={colors.primary.main} />
              <Text style={{ color: colors.primary.main, fontWeight: '600' }}>
                Review Next File
              </Text>
            </View>
          </HapticButton>
        )}

        {/* Complete Session Button */}
        {stats.pending === 0 && (
          <HapticButton
            variant="primary"
            size="lg"
            onPress={handleComplete}
            style={{ marginTop: Tokens.spacing['4'] }}
            accessibilityLabel="Finalizar sessão de revisão"
          >
            <Text style={{ color: colors.text.inverse, fontWeight: '600', fontSize: 16 }}>
              Finalizar Revisão
            </Text>
          </HapticButton>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
