import React from 'react';
import {
  Modal as RNModal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useThemeColors } from '@/theme';
import { Tokens, ColorTokens } from '@/theme/tokens';

export interface ModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  showCloseButton?: boolean;
  fullScreen?: boolean;
  className?: string;
}

export const Modal: React.FC<ModalProps> = ({
  visible,
  onClose,
  title,
  children,
  showCloseButton = true,
  fullScreen = false,
  className = '',
}) => {
  const colors = useThemeColors();

  return (
    <RNModal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Fechar modal"
        accessibilityHint="Fecha a janela modal atual e retorna à tela anterior"
        style={styles.backdrop}
        onPress={onClose}
      >
        <SafeAreaView edges={['top']} className="flex-1 justify-end">
          <Pressable accessibilityRole="button" onPress={(e) => e.stopPropagation()}>
            <View
              className={`${fullScreen ? 'h-full' : 'rounded-t-3xl'} ${className}`}
              style={{ backgroundColor: colors.background.card }}
            >
              {/* Header */}
              {(title || showCloseButton) && (
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingHorizontal: Tokens.spacing['4'],
                    paddingVertical: Tokens.spacing['4'],
                    borderBottomWidth: 1,
                    borderBottomColor: colors.border.light,
                  }}
                >
                  {title && (
                    <Text
                      style={{
                        fontSize: Tokens.typography.sizes.xl,
                        fontWeight: Tokens.typography.weights.semibold,
                        color: colors.text.primary,
                        flex: 1,
                      }}
                    >
                      {title}
                    </Text>
                  )}
                  {showCloseButton && (
                    <TouchableOpacity
                      accessibilityRole="button"
                      accessibilityLabel="Fechar"
                      accessibilityHint="Fecha a janela modal atual"
                      onPress={onClose}
                      style={{
                        minWidth: Tokens.touchTargets.min,
                        minHeight: Tokens.touchTargets.min,
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginRight: -Tokens.spacing['2'],
                      }}
                    >
                      <Text
                        style={{
                          fontSize: Tokens.typography.sizes['2xl'],
                          color: colors.text.tertiary,
                        }}
                      >
                        ×
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}

              {/* Content */}
              <View className={fullScreen ? 'flex-1' : ''}>{children}</View>
            </View>
          </Pressable>
        </SafeAreaView>
      </Pressable>
    </RNModal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: ColorTokens.overlay.backdrop,
  },
});

export default Modal;
