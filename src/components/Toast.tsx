/**
 * Toast Component - Toast notification system
 * Sistema de notificações toast/snackbar
 */

import * as Haptics from 'expo-haptics';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react-native';
import React, { createContext, useContext, useState, useCallback } from 'react';
import { Text, View, Pressable, StyleSheet, Platform } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';

import { useThemeColors } from '@/theme';
import { Spacing, Radius, Typography, Shadows } from '@/theme/tokens';

export type ToastVariant = 'info' | 'success' | 'warning' | 'error';

export interface ToastOptions {
  message: string;
  variant?: ToastVariant;
  duration?: number;
  action?: {
    label: string;
    onPress: () => void;
  };
}

interface Toast extends ToastOptions {
  id: string;
}

interface ToastContextValue {
  show: (options: ToastOptions) => void;
  hide: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const hide = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const show = useCallback((options: ToastOptions) => {
    const id = Date.now().toString();
    const toast: Toast = {
      id,
      variant: 'info',
      duration: 3000,
      ...options,
    };

    setToasts((prev) => [...prev, toast]);

    if (toast.duration) {
      setTimeout(() => {
        hide(id);
      }, toast.duration);
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, [hide]);

  return (
    <ToastContext.Provider value={{ show, hide }}>
      {children}
      <View style={styles.container}>
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onDismiss={() => hide(toast.id)} />
        ))}
      </View>
    </ToastContext.Provider>
  );
};

const ToastItem: React.FC<{ toast: Toast; onDismiss: () => void }> = ({ toast, onDismiss }) => {
  const colors = useThemeColors();
  const translateY = useSharedValue(-100);
  const opacity = useSharedValue(0);

  React.useEffect(() => {
    translateY.value = withSpring(0);
    opacity.value = withTiming(1);
    // translateY e opacity são useSharedValue (estáveis), não precisam estar nas dependências
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const dismiss = () => {
    translateY.value = withTiming(-100, {}, () => {
      runOnJS(onDismiss)();
    });
    opacity.value = withTiming(0);
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
    // ✅ Otimização web: hint para browser otimizar transform e opacity (GPU-accelerated)
    ...(Platform.OS === 'web' ? { willChange: 'transform, opacity' as unknown as string } : {}),
  }));

  const iconColor = colors.raw.neutral[0];

  const variantConfig = {
    info: {
      bg: colors.status.info,
      icon: <Info size={20} color={iconColor} />,
    },
    success: {
      bg: colors.status.success,
      icon: <CheckCircle2 size={20} color={iconColor} />,
    },
    warning: {
      bg: colors.status.warning,
      icon: <AlertTriangle size={20} color={iconColor} />,
    },
    error: {
      bg: colors.status.error,
      icon: <AlertCircle size={20} color={iconColor} />,
    },
  };

  const config = variantConfig[toast.variant || 'info'];

  return (
    <Animated.View
      style={[
        animatedStyle,
        {
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: config.bg,
          borderRadius: Radius.lg,
          padding: Spacing['4'],
          marginBottom: Spacing['2'],
          minHeight: 56,
          ...Shadows.lg,
        },
      ]}
      accessible={true}
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
      accessibilityLabel={`${toast.variant === 'error' ? 'Erro' : toast.variant === 'warning' ? 'Aviso' : toast.variant === 'success' ? 'Sucesso' : 'Informação'}: ${toast.message}`}
    >
      <View style={{ marginRight: Spacing['3'] }} accessibilityElementsHidden={true}>
        {config.icon}
      </View>

      <Text
        style={{
          flex: 1,
          color: colors.raw.neutral[0],
          fontSize: Typography.sizes.sm,
          fontWeight: Typography.weights.medium,
        }}
        numberOfLines={2}
        accessibilityElementsHidden={true}
      >
        {toast.message}
      </Text>

      {toast.action && (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={toast.action.label}
          onPress={() => {
            toast.action?.onPress();
            dismiss();
          }}
          style={{ marginLeft: Spacing['2'], paddingHorizontal: Spacing['2'] }}
        >
          <Text
            style={{
              color: colors.raw.neutral[0],
              fontSize: Typography.sizes.sm,
              fontWeight: Typography.weights.bold,
            }}
          >
            {toast.action.label}
          </Text>
        </Pressable>
      )}

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Fechar notificação"
        onPress={dismiss}
        hitSlop={8}
        style={{ marginLeft: Spacing['2'] }}
      >
        <X size={18} color={colors.raw.neutral[0]} />
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60,
    left: 16,
    right: 16,
    zIndex: 9999,
  },
});

export default ToastProvider;
