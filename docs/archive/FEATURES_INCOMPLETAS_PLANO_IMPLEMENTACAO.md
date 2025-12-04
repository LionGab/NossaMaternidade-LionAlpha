# 📋 Plano de Implementação - Features Incompletas

**Projeto:** Nossa Maternidade  
**Data:** Janeiro 2025  
**Status:** Pendente  
**Prioridade:** Alta

---

## 📑 Índice

1. [Push Notifications](#1-push-notifications)
2. [Premium/Monetização](#2-premiummonetização)
3. [Deep Linking](#3-deep-linking)
4. [Offline Support](#4-offline-support)
5. [Roadmap de Execução](#5-roadmap-de-execução)

---

## 1. Push Notifications

### 1.1 Status Atual

- ❌ `expo-notifications` não instalado
- ✅ Configuração básica no `app.config.js` (icon, color)
- ✅ EAS Build configurado (`promptToConfigurePushNotifications: false`)
- ❌ Backend não implementado
- ❌ Permissões não solicitadas

### 1.2 Escopo da Implementação

**Objetivo:** Sistema completo de notificações push para engajamento e lembretes.

**Casos de Uso:**

1. **Habit Reminders** - Lembretes diários de hábitos (configurável por usuário)
2. **Chat Responses** - Notificação quando NathIA responde no chat
3. **Community** - Comentários em posts, respostas, menções
4. **Content** - Novo conteúdo relevante disponível
5. **Weekly Tips** - Dicas semanais personalizadas

### 1.3 Passo a Passo

#### **Fase 1: Setup Expo Notifications**

```bash
# Instalar dependências
npx expo install expo-notifications expo-device expo-constants

# iOS: Instalar adicional
npx expo install expo-notifications-ios
```

#### **Fase 2: Configurar Permissões**

**Arquivo:** `src/services/notifications/permissionService.ts`

```typescript
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { logger } from '@/utils/logger';

export interface PermissionStatus {
  granted: boolean;
  canAskAgain: boolean;
  status: Notifications.PermissionStatus;
}

/**
 * Solicita permissão de notificações push
 */
export async function requestNotificationPermission(): Promise<PermissionStatus> {
  try {
    if (!Device.isDevice) {
      logger.warn('Notifications only work on physical devices');
      return {
        granted: false,
        canAskAgain: false,
        status: Notifications.PermissionStatus.DENIED,
      };
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      logger.warn('Notification permission denied', { finalStatus });
      return {
        granted: false,
        canAskAgain: finalStatus === Notifications.PermissionStatus.UNDETERMINED,
        status: finalStatus,
      };
    }

    // iOS: Configurar handler para notificações em foreground
    if (Platform.OS === 'ios') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#0D5FFF',
      });
    }

    logger.info('Notification permission granted');
    return {
      granted: true,
      canAskAgain: false,
      status: finalStatus,
    };
  } catch (error) {
    logger.error('Failed to request notification permission', error);
    throw error;
  }
}

/**
 * Verifica status atual de permissões
 */
export async function checkNotificationPermission(): Promise<PermissionStatus> {
  const { status, canAskAgain } = await Notifications.getPermissionsAsync();
  return {
    granted: status === Notifications.PermissionStatus.GRANTED,
    canAskAgain,
    status,
  };
}
```

#### **Fase 3: Obter e Registrar Token**

**Arquivo:** `src/services/notifications/tokenService.ts`

```typescript
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { supabase } from '@/utils/supabase';
import { logger } from '@/utils/logger';
import AsyncStorage from '@react-native-async-storage/async-storage';

const EXPO_PUSH_TOKEN_KEY = '@nossa_maternidade:expo_push_token';
const USER_ID_KEY = '@nossa_maternidade:user_id';

/**
 * Obtém o token Expo Push e registra no Supabase
 */
export async function registerPushToken(userId: string): Promise<string | null> {
  try {
    if (!Device.isDevice) {
      logger.warn('Push notifications only work on physical devices');
      return null;
    }

    // Verificar permissão
    const { status } = await Notifications.getPermissionsAsync();
    if (status !== 'granted') {
      logger.warn('Notification permission not granted');
      return null;
    }

    // Obter token do Expo
    const projectId = Constants.expoConfig?.extra?.eas?.projectId;
    if (!projectId) {
      logger.error('EAS project ID not found');
      return null;
    }

    const tokenData = await Notifications.getExpoPushTokenAsync({
      projectId,
    });

    const pushToken = tokenData.data;
    logger.info('Expo push token obtained', { token: pushToken.substring(0, 20) + '...' });

    // Salvar token localmente
    await AsyncStorage.setItem(EXPO_PUSH_TOKEN_KEY, pushToken);
    await AsyncStorage.setItem(USER_ID_KEY, userId);

    // Registrar no Supabase (tabela: push_tokens)
    const { error } = await supabase.from('push_tokens').upsert(
      {
        user_id: userId,
        expo_push_token: pushToken,
        platform: Platform.OS,
        device_id: await Device.modelName(),
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: 'user_id',
      }
    );

    if (error) {
      logger.error('Failed to save push token to Supabase', error);
      throw error;
    }

    logger.info('Push token registered successfully');
    return pushToken;
  } catch (error) {
    logger.error('Failed to register push token', error);
    return null;
  }
}

/**
 * Remove token quando usuário faz logout
 */
export async function unregisterPushToken(userId: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(EXPO_PUSH_TOKEN_KEY);
    await AsyncStorage.removeItem(USER_ID_KEY);

    const { error } = await supabase.from('push_tokens').delete().eq('user_id', userId);

    if (error) {
      logger.error('Failed to remove push token from Supabase', error);
    }
  } catch (error) {
    logger.error('Failed to unregister push token', error);
  }
}
```

#### **Fase 4: Configurar Handlers de Notificação**

**Arquivo:** `src/services/notifications/notificationHandlers.ts`

```typescript
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { logger } from '@/utils/logger';

/**
 * Configura como notificações são exibidas quando app está em foreground
 */
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

/**
 * Handler quando notificação é recebida
 */
export function setupNotificationHandlers(
  onNotificationReceived: (notification: Notifications.Notification) => void
): () => void {
  // Listener para notificações recebidas em foreground
  const receivedListener = Notifications.addNotificationReceivedListener((notification) => {
    logger.info('Notification received (foreground)', {
      title: notification.request.content.title,
    });
    onNotificationReceived(notification);
  });

  // Listener para quando usuário toca na notificação
  const responseListener = Notifications.addNotificationResponseReceivedListener((response) => {
    logger.info('Notification tapped', {
      title: response.notification.request.content.title,
      data: response.notification.request.content.data,
    });

    // Aqui você pode navegar para tela específica baseado no data
    const { screen, params } = response.notification.request.content.data || {};
    if (screen) {
      // Navegar usando navigation (passar navigation via callback)
      onNotificationReceived(response.notification);
    }
  });

  // Retornar função de cleanup
  return () => {
    Notifications.removeNotificationSubscription(receivedListener);
    Notifications.removeNotificationSubscription(responseListener);
  };
}
```

#### **Fase 5: Criar Schema no Supabase**

**Arquivo:** `supabase/migrations/004_push_notifications.sql`

```sql
-- Tabela para armazenar tokens de push
CREATE TABLE IF NOT EXISTS push_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  expo_push_token TEXT NOT NULL UNIQUE,
  platform TEXT NOT NULL CHECK (platform IN ('ios', 'android')),
  device_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, platform)
);

-- Índices para performance
CREATE INDEX idx_push_tokens_user_id ON push_tokens(user_id);
CREATE INDEX idx_push_tokens_expo_token ON push_tokens(expo_push_token);

-- RLS Policies
ALTER TABLE push_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own push tokens"
  ON push_tokens FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own push tokens"
  ON push_tokens FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own push tokens"
  ON push_tokens FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own push tokens"
  ON push_tokens FOR DELETE
  USING (auth.uid() = user_id);

-- Tabela para configurações de notificação do usuário
CREATE TABLE IF NOT EXISTS notification_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  habit_reminders_enabled BOOLEAN NOT NULL DEFAULT true,
  habit_reminder_time TIME NOT NULL DEFAULT '09:00:00',
  chat_notifications_enabled BOOLEAN NOT NULL DEFAULT true,
  community_notifications_enabled BOOLEAN NOT NULL DEFAULT true,
  content_notifications_enabled BOOLEAN NOT NULL DEFAULT true,
  weekly_tips_enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índice
CREATE INDEX idx_notification_settings_user_id ON notification_settings(user_id);

-- RLS Policies
ALTER TABLE notification_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own notification settings"
  ON notification_settings FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

#### **Fase 6: Edge Function para Enviar Notificações**

**Arquivo:** `supabase/functions/send-push-notification/index.ts`

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';

serve(async (req) => {
  try {
    const { userId, title, body, data, sound = 'default' } = await req.json();

    // Obter token do usuário
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data: tokens, error } = await supabase
      .from('push_tokens')
      .select('expo_push_token')
      .eq('user_id', userId)
      .single();

    if (error || !tokens) {
      return new Response(JSON.stringify({ error: 'Push token not found' }), { status: 404 });
    }

    // Enviar notificação via Expo Push API
    const response = await fetch(EXPO_PUSH_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: tokens.expo_push_token,
        title,
        body,
        data,
        sound,
        badge: 1,
      }),
    });

    const result = await response.json();

    return new Response(JSON.stringify({ success: true, result }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
});
```

#### **Fase 7: Integrar no App (App.tsx ou AuthProvider)**

```typescript
import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { requestNotificationPermission } from '@/services/notifications/permissionService';
import { registerPushToken, unregisterPushToken } from '@/services/notifications/tokenService';
import { setupNotificationHandlers } from '@/services/notifications/notificationHandlers';

export function useNotificationSetup() {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    // Solicitar permissão e registrar token
    requestNotificationPermission().then((permission) => {
      if (permission.granted) {
        registerPushToken(user.id);
      }
    });

    // Setup handlers
    const cleanup = setupNotificationHandlers((notification) => {
      // Navegar baseado no data da notificação
      console.log('Notification received:', notification);
    });

    return () => {
      cleanup();
      if (user) {
        unregisterPushToken(user.id);
      }
    };
  }, [user]);
}
```

### 1.4 Checklist

- [ ] Instalar `expo-notifications`
- [ ] Criar `permissionService.ts`
- [ ] Criar `tokenService.ts`
- [ ] Criar `notificationHandlers.ts`
- [ ] Criar migration SQL para `push_tokens` e `notification_settings`
- [ ] Criar Edge Function `send-push-notification`
- [ ] Integrar no App.tsx
- [ ] Criar tela de configurações de notificação em Settings
- [ ] Testar em dispositivo físico iOS
- [ ] Testar em dispositivo físico Android

### 1.5 Estimativa

**Tempo:** 2-3 dias  
**Prioridade:** Alta  
**Dependências:** Supabase configurado, usuário autenticado

---

## 2. Premium/Monetização

### 2.1 Status Atual

- ❌ Nenhuma implementação
- ✅ EAS Build configurado (pronto para IAP)
- ❌ RevenueCat não instalado
- ❌ Paywall não implementado
- ❌ Feature gating não implementado

### 2.2 Escopo da Implementação

**Objetivo:** Sistema completo de assinatura premium com In-App Purchases.

**Modelo de Negócio:**

- **Free:** Funcionalidades básicas limitadas
- **Premium (R$ 9,90/mês ou R$ 99,90/ano):**
  - Chat ilimitado com NathIA
  - Conteúdo exclusivo
  - Análises personalizadas avançadas
  - Sem anúncios
  - Suporte prioritário

### 2.3 Passo a Passo

#### **Fase 1: Instalar RevenueCat (Recomendado)**

RevenueCat facilita gerenciamento de IAP em múltiplas plataformas.

```bash
npm install react-native-purchases
npx pod-install  # iOS
```

**Alternativa (Implementação Nativa):**

- iOS: `expo-in-app-purchases`
- Android: `react-native-iap`

#### **Fase 2: Criar Schema no Supabase**

**Arquivo:** `supabase/migrations/005_premium_subscriptions.sql`

```sql
-- Tabela de assinaturas
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  platform TEXT NOT NULL CHECK (platform IN ('ios', 'android')),
  product_id TEXT NOT NULL, -- 'premium_monthly' ou 'premium_yearly'
  revenuecat_customer_id TEXT,
  purchase_token TEXT, -- Receipt/token da store
  status TEXT NOT NULL CHECK (status IN ('active', 'cancelled', 'expired', 'trial')),
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);

-- RLS Policies
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own subscription"
  ON subscriptions FOR SELECT
  USING (auth.uid() = user_id);

-- Service role pode gerenciar todas (via Edge Function)
```

#### **Fase 3: Criar Service de Premium**

**Arquivo:** `src/services/premium/premiumService.ts`

```typescript
import Purchases, { PurchasesPackage, CustomerInfo } from 'react-native-purchases';
import { Platform } from 'react-native';
import { supabase } from '@/utils/supabase';
import { logger } from '@/utils/logger';

const REVENUECAT_API_KEY_IOS = process.env.EXPO_PUBLIC_REVENUECAT_API_KEY_IOS;
const REVENUECAT_API_KEY_ANDROID = process.env.EXPO_PUBLIC_REVENUECAT_API_KEY_ANDROID;

/**
 * Inicializa RevenueCat SDK
 */
export async function initializeRevenueCat(userId: string): Promise<void> {
  try {
    const apiKey = Platform.OS === 'ios' ? REVENUECAT_API_KEY_IOS : REVENUECAT_API_KEY_ANDROID;

    if (!apiKey) {
      logger.error('RevenueCat API key not configured');
      return;
    }

    await Purchases.configure({ apiKey });
    await Purchases.logIn(userId);

    logger.info('RevenueCat initialized', { userId });
  } catch (error) {
    logger.error('Failed to initialize RevenueCat', error);
  }
}

/**
 * Verifica se usuário tem assinatura premium ativa
 */
export async function isPremiumActive(): Promise<boolean> {
  try {
    const customerInfo: CustomerInfo = await Purchases.getCustomerInfo();
    return customerInfo.entitlements.active['premium'] !== undefined;
  } catch (error) {
    logger.error('Failed to check premium status', error);
    return false;
  }
}

/**
 * Obtém pacotes de assinatura disponíveis
 */
export async function getAvailablePackages(): Promise<PurchasesPackage[]> {
  try {
    const offerings = await Purchases.getOfferings();
    const currentOffering = offerings.current;

    if (!currentOffering) {
      logger.warn('No current offering available');
      return [];
    }

    return currentOffering.availablePackages;
  } catch (error) {
    logger.error('Failed to get available packages', error);
    return [];
  }
}

/**
 * Compra um pacote de assinatura
 */
export async function purchasePackage(
  purchasePackage: PurchasesPackage
): Promise<{ success: boolean; customerInfo?: CustomerInfo; error?: string }> {
  try {
    const { customerInfo } = await Purchases.purchasePackage(purchasePackage);

    // Sincronizar com Supabase
    await syncSubscriptionToSupabase(customerInfo);

    return { success: true, customerInfo };
  } catch (error: unknown) {
    logger.error('Purchase failed', error);

    // RevenueCat errors
    if (error && typeof error === 'object' && 'userCancelled' in error) {
      return { success: false, error: 'Purchase cancelled by user' };
    }

    return { success: false, error: 'Purchase failed' };
  }
}

/**
 * Restaura compras anteriores
 */
export async function restorePurchases(): Promise<{ success: boolean; isPremium: boolean }> {
  try {
    const customerInfo = await Purchases.restorePurchases();
    await syncSubscriptionToSupabase(customerInfo);

    const isPremium = customerInfo.entitlements.active['premium'] !== undefined;
    return { success: true, isPremium };
  } catch (error) {
    logger.error('Failed to restore purchases', error);
    return { success: false, isPremium: false };
  }
}

/**
 * Sincroniza status de assinatura com Supabase
 */
async function syncSubscriptionToSupabase(customerInfo: CustomerInfo): Promise<void> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const premium = customerInfo.entitlements.active['premium'];
    const isActive = premium !== undefined;

    const { error } = await supabase.from('subscriptions').upsert(
      {
        user_id: user.id,
        platform: Platform.OS,
        product_id: premium?.productIdentifier || null,
        revenuecat_customer_id: customerInfo.originalAppUserId,
        status: isActive ? 'active' : 'expired',
        expires_at: premium?.expirationDate || null,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: 'user_id',
      }
    );

    if (error) {
      logger.error('Failed to sync subscription to Supabase', error);
    }
  } catch (error) {
    logger.error('Failed to sync subscription', error);
  }
}
```

#### **Fase 4: Criar Hook de Premium**

**Arquivo:** `src/hooks/usePremium.ts`

```typescript
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import * as premiumService from '@/services/premium/premiumService';
import { logger } from '@/utils/logger';

export function usePremium() {
  const { user } = useAuth();
  const [isPremium, setIsPremium] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setIsPremium(false);
      setLoading(false);
      return;
    }

    // Inicializar RevenueCat
    premiumService.initializeRevenueCat(user.id).then(() => {
      // Verificar status premium
      premiumService.isPremiumActive().then((active) => {
        setIsPremium(active);
        setLoading(false);
      });
    });
  }, [user]);

  const checkPremium = async () => {
    if (!user) return false;
    const active = await premiumService.isPremiumActive();
    setIsPremium(active);
    return active;
  };

  return {
    isPremium,
    loading,
    checkPremium,
  };
}
```

#### **Fase 5: Criar Componente Paywall**

**Arquivo:** `src/components/premium/PaywallScreen.tsx`

```typescript
import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { PurchasesPackage } from 'react-native-purchases';
import { Box } from '@/components/primitives/Box';
import { Text } from '@/components/primitives/Text';
import { Button } from '@/components/primitives/Button';
import { usePremium } from '@/hooks/usePremium';
import * as premiumService from '@/services/premium/premiumService';
import { logger } from '@/utils/logger';
import { useThemeColors } from '@/theme';

export function PaywallScreen() {
  const colors = useThemeColors();
  const { checkPremium } = usePremium();
  const [packages, setPackages] = useState<PurchasesPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);

  useEffect(() => {
    loadPackages();
  }, []);

  const loadPackages = async () => {
    try {
      const availablePackages = await premiumService.getAvailablePackages();
      setPackages(availablePackages);
    } catch (error) {
      logger.error('Failed to load packages', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (pkg: PurchasesPackage) => {
    try {
      setPurchasing(true);
      const result = await premiumService.purchasePackage(pkg);

      if (result.success) {
        await checkPremium();
        // Navegar de volta ou mostrar sucesso
      } else {
        // Mostrar erro
        logger.error('Purchase failed', result.error);
      }
    } catch (error) {
      logger.error('Purchase error', error);
    } finally {
      setPurchasing(false);
    }
  };

  if (loading) {
    return (
      <Box flex={1} center>
        <ActivityIndicator size="large" color={colors.primary} />
      </Box>
    );
  }

  return (
    <Box flex={1} padding="4">
      <Text variant="heading" size="xl" center>
        Upgrade para Premium
      </Text>

      <Text variant="body" center marginTop="2">
        Desbloqueie recursos exclusivos
      </Text>

      {/* Lista de pacotes */}
      {packages.map((pkg) => (
        <Box
          key={pkg.identifier}
          padding="4"
          marginTop="3"
          borderRadius="lg"
          backgroundColor="background.card"
        >
          <Text variant="heading">{pkg.storeProduct.title}</Text>
          <Text variant="body" marginTop="1">
            {pkg.storeProduct.description}
          </Text>
          <Text variant="heading" size="lg" marginTop="2">
            {pkg.storeProduct.localizedPrice}
          </Text>

          <Button
            onPress={() => handlePurchase(pkg)}
            loading={purchasing}
            marginTop="3"
          >
            Assinar
          </Button>
        </Box>
      ))}

      <Button
        variant="outline"
        onPress={() => premiumService.restorePurchases()}
        marginTop="4"
      >
        Restaurar Compras
      </Button>
    </Box>
  );
}
```

#### **Fase 6: Feature Gating**

**Arquivo:** `src/components/premium/PremiumGate.tsx`

```typescript
import React from 'react';
import { Box } from '@/components/primitives/Box';
import { Text } from '@/components/primitives/Text';
import { Button } from '@/components/primitives/Button';
import { usePremium } from '@/hooks/usePremium';
import { useNavigation } from '@react-navigation/native';

interface PremiumGateProps {
  children: React.ReactNode;
  feature: string;
  message?: string;
}

export function PremiumGate({ children, feature, message }: PremiumGateProps) {
  const { isPremium, loading } = usePremium();
  const navigation = useNavigation();

  if (loading) {
    return null; // Ou skeleton
  }

  if (!isPremium) {
    return (
      <Box padding="4" center>
        <Text variant="heading" size="lg" center>
          🔒 Recurso Premium
        </Text>
        <Text variant="body" center marginTop="2">
          {message || `Este recurso está disponível apenas para assinantes Premium.`}
        </Text>
        <Button
          onPress={() => navigation.navigate('Paywall' as never)}
          marginTop="4"
        >
          Ver Planos Premium
        </Button>
      </Box>
    );
  }

  return <>{children}</>;
}
```

### 2.4 Checklist

- [ ] Criar conta RevenueCat
- [ ] Configurar produtos no App Store Connect (iOS)
- [ ] Configurar produtos no Google Play Console (Android)
- [ ] Instalar `react-native-purchases`
- [ ] Criar migration SQL para `subscriptions`
- [ ] Criar `premiumService.ts`
- [ ] Criar hook `usePremium`
- [ ] Criar `PaywallScreen`
- [ ] Criar `PremiumGate` component
- [ ] Integrar feature gating no Chat (limite de mensagens free)
- [ ] Integrar feature gating em conteúdo exclusivo
- [ ] Testar compra em sandbox iOS
- [ ] Testar compra em sandbox Android

### 2.5 Estimativa

**Tempo:** 5-7 dias  
**Prioridade:** Crítica (Revenue)  
**Dependências:** Contas Apple Developer + Google Play, RevenueCat account

---

## 3. Deep Linking

### 3.1 Status Atual

- ✅ `expo-linking` instalado
- ✅ Configuração básica no `app.config.js` (scheme, intentFilters)
- ❌ Handlers não implementados no código
- ❌ Navegação não configurada
- ❌ Compartilhamento não implementado

### 3.2 Escopo da Implementação

**Objetivo:** Links profundos funcionais para compartilhamento e navegação.

**Casos de Uso:**

1. **Compartilhar Conteúdo:** `nossamaternidade://content/123`
2. **Abrir Chat:** `nossamaternidade://chat`
3. **Reset de Senha:** `nossamaternidade://reset-password?token=xxx`
4. **Universal Links:** `https://nossamaternidade.com.br/content/123`

### 3.3 Passo a Passo

#### **Fase 1: Criar Service de Deep Linking**

**Arquivo:** `src/services/linking/linkingService.ts`

```typescript
import * as Linking from 'expo-linking';
import { logger } from '@/utils/logger';

export type DeepLinkRoute =
  | { screen: 'ContentDetail'; params: { contentId: string } }
  | { screen: 'Chat'; params?: {} }
  | { screen: 'Home'; params?: {} }
  | { screen: 'ResetPassword'; params: { token: string } }
  | { screen: 'CommunityPost'; params: { postId: string } };

/**
 * Parse um URL de deep link em rota navegável
 */
export function parseDeepLink(url: string): DeepLinkRoute | null {
  try {
    const { hostname, path, queryParams } = Linking.parse(url);

    logger.info('Parsing deep link', { url, hostname, path });

    // URL Scheme: nossamaternidade://
    if (hostname === null || hostname === '') {
      // URL scheme local
      if (path === 'content' && queryParams?.id) {
        return {
          screen: 'ContentDetail',
          params: { contentId: queryParams.id as string },
        };
      }

      if (path === 'chat') {
        return { screen: 'Chat' };
      }

      if (path === 'reset-password' && queryParams?.token) {
        return {
          screen: 'ResetPassword',
          params: { token: queryParams.token as string },
        };
      }
    }

    // Universal Link: https://nossamaternidade.com.br/...
    if (hostname === 'nossamaternidade.com.br' || hostname === 'www.nossamaternidade.com.br') {
      if (path?.startsWith('/content/')) {
        const contentId = path.split('/content/')[1];
        return {
          screen: 'ContentDetail',
          params: { contentId },
        };
      }

      if (path === '/chat') {
        return { screen: 'Chat' };
      }

      if (path?.startsWith('/post/')) {
        const postId = path.split('/post/')[1];
        return {
          screen: 'CommunityPost',
          params: { postId },
        };
      }
    }

    logger.warn('Unknown deep link format', { url });
    return null;
  } catch (error) {
    logger.error('Failed to parse deep link', error, { url });
    return null;
  }
}

/**
 * Gera URL de deep link para compartilhamento
 */
export function generateDeepLink(route: DeepLinkRoute): string {
  const scheme = 'nossamaternidade://';
  const domain = 'https://nossamaternidade.com.br';

  switch (route.screen) {
    case 'ContentDetail':
      return `${domain}/content/${route.params.contentId}`;

    case 'Chat':
      return `${domain}/chat`;

    case 'ResetPassword':
      return `${scheme}reset-password?token=${route.params.token}`;

    case 'CommunityPost':
      return `${domain}/post/${route.params.postId}`;

    default:
      return domain;
  }
}
```

#### **Fase 2: Criar Hook de Deep Linking**

**Arquivo:** `src/hooks/useDeepLinking.ts`

```typescript
import { useEffect, useRef } from 'react';
import * as Linking from 'expo-linking';
import { useNavigation } from '@react-navigation/native';
import { parseDeepLink } from '@/services/linking/linkingService';
import { logger } from '@/utils/logger';

export function useDeepLinking() {
  const navigation = useNavigation();
  const initialUrlProcessed = useRef(false);

  useEffect(() => {
    // Lidar com deep link quando app é aberto via link
    Linking.getInitialURL().then((url) => {
      if (url && !initialUrlProcessed.current) {
        initialUrlProcessed.current = true;
        handleDeepLink(url);
      }
    });

    // Listener para quando app já está aberto
    const subscription = Linking.addEventListener('url', (event) => {
      handleDeepLink(event.url);
    });

    return () => {
      subscription.remove();
    };
  }, []);

  const handleDeepLink = (url: string) => {
    logger.info('Deep link received', { url });

    const route = parseDeepLink(url);
    if (!route) {
      logger.warn('Could not parse deep link', { url });
      return;
    }

    // Navegar para rota
    try {
      // @ts-ignore - navigation type issues
      navigation.navigate(route.screen, route.params);
      logger.info('Navigated via deep link', { route });
    } catch (error) {
      logger.error('Failed to navigate via deep link', error, { route });
    }
  };
}
```

#### **Fase 3: Implementar Compartilhamento**

**Arquivo:** `src/services/sharing/shareService.ts`

```typescript
import { Share, Platform } from 'react-native';
import { generateDeepLink, DeepLinkRoute } from '@/services/linking/linkingService';
import { logger } from '@/utils/logger';

/**
 * Compartilha conteúdo via Share API nativa
 */
export async function shareContent(
  route: DeepLinkRoute,
  title: string,
  message?: string
): Promise<void> {
  try {
    const url = generateDeepLink(route);
    const shareMessage = message || `Confira isso: ${title}`;

    const result = await Share.share({
      message: Platform.OS === 'ios' ? `${shareMessage}\n\n${url}` : shareMessage,
      url: Platform.OS === 'ios' ? undefined : url,
      title,
    });

    if (result.action === Share.sharedAction) {
      logger.info('Content shared successfully', { route, title });
    } else if (result.action === Share.dismissedAction) {
      logger.info('Share dismissed');
    }
  } catch (error) {
    logger.error('Failed to share content', error);
  }
}

/**
 * Compartilha conteúdo específico
 */
export async function shareContentItem(contentId: string, title: string): Promise<void> {
  await shareContent(
    { screen: 'ContentDetail', params: { contentId } },
    title,
    `Confira este conteúdo sobre maternidade: ${title}`
  );
}
```

#### **Fase 4: Integrar no App.tsx**

```typescript
import { useDeepLinking } from '@/hooks/useDeepLinking';

export default function App() {
  // ... outros hooks

  // Setup deep linking
  useDeepLinking();

  // ... resto do componente
}
```

#### **Fase 5: Integrar Compartilhamento no ContentDetailScreen**

```typescript
import { shareContentItem } from '@/services/sharing/shareService';

// No componente
const handleShare = async () => {
  if (content) {
    await shareContentItem(content.id, content.title);
  }
};
```

### 3.4 Checklist

- [ ] Criar `linkingService.ts`
- [ ] Criar hook `useDeepLinking`
- [ ] Integrar hook no App.tsx
- [ ] Criar `shareService.ts`
- [ ] Integrar compartilhamento no ContentDetailScreen
- [ ] Testar deep link no iOS (nossamaternidade://content/123)
- [ ] Testar deep link no Android
- [ ] Configurar assetlinks.json no servidor web
- [ ] Testar universal links (https://nossamaternidade.com.br/content/123)

### 3.5 Estimativa

**Tempo:** 1-2 dias  
**Prioridade:** Média  
**Dependências:** Servidor web para assetlinks.json

---

## 4. Offline Support

### 4.1 Status Atual

- ✅ `AsyncStorage` instalado
- ✅ `NetInfo` instalado
- ❌ Queue de operações não implementada
- ❌ Sync strategy não implementada
- ❌ Offline UI não implementada

### 4.2 Escopo da Implementação

**Objetivo:** App funcional offline com sincronização automática quando online.

**Funcionalidades Offline:**

1. **Ler conteúdo** já carregado
2. **Escrever mensagens** no chat (enviar quando online)
3. **Completar hábitos** (sincronizar depois)
4. **Visualizar histórico** do chat
5. **Criar posts** na comunidade (publicar quando online)

### 4.3 Passo a Passo

#### **Fase 1: Criar Service de Network Status**

**Arquivo:** `src/services/offline/networkService.ts`

```typescript
import NetInfo from '@react-native-community/netinfo';
import { useState, useEffect } from 'react';
import { logger } from '@/utils/logger';

export interface NetworkState {
  isConnected: boolean;
  isInternetReachable: boolean | null;
  type: string;
}

/**
 * Hook para monitorar status da rede
 */
export function useNetworkStatus() {
  const [networkState, setNetworkState] = useState<NetworkState>({
    isConnected: false,
    isInternetReachable: null,
    type: 'unknown',
  });

  useEffect(() => {
    // Verificar status inicial
    NetInfo.fetch().then((state) => {
      setNetworkState({
        isConnected: state.isConnected ?? false,
        isInternetReachable: state.isInternetReachable ?? null,
        type: state.type,
      });
    });

    // Listener para mudanças
    const unsubscribe = NetInfo.addEventListener((state) => {
      const newState = {
        isConnected: state.isConnected ?? false,
        isInternetReachable: state.isInternetReachable ?? null,
        type: state.type,
      };

      setNetworkState(newState);
      logger.info('Network status changed', newState);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return networkState;
}
```

#### **Fase 2: Criar Queue de Operações**

**Arquivo:** `src/services/offline/operationQueue.ts`

```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';
import { logger } from '@/utils/logger';

const QUEUE_KEY = '@nossa_maternidade:operation_queue';

export type OperationType =
  | 'send_message'
  | 'complete_habit'
  | 'create_post'
  | 'like_content'
  | 'update_profile';

export interface QueuedOperation {
  id: string;
  type: OperationType;
  payload: unknown;
  timestamp: number;
  retries: number;
}

/**
 * Adiciona operação à queue
 */
export async function queueOperation(type: OperationType, payload: unknown): Promise<string> {
  try {
    const queue = await getQueue();
    const operation: QueuedOperation = {
      id: `${Date.now()}-${Math.random()}`,
      type,
      payload,
      timestamp: Date.now(),
      retries: 0,
    };

    queue.push(operation);
    await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(queue));

    logger.info('Operation queued', { type, id: operation.id });
    return operation.id;
  } catch (error) {
    logger.error('Failed to queue operation', error);
    throw error;
  }
}

/**
 * Obtém queue de operações
 */
export async function getQueue(): Promise<QueuedOperation[]> {
  try {
    const data = await AsyncStorage.getItem(QUEUE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    logger.error('Failed to get queue', error);
    return [];
  }
}

/**
 * Remove operação da queue
 */
export async function removeOperation(id: string): Promise<void> {
  try {
    const queue = await getQueue();
    const filtered = queue.filter((op) => op.id !== id);
    await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(filtered));
    logger.info('Operation removed from queue', { id });
  } catch (error) {
    logger.error('Failed to remove operation', error);
  }
}

/**
 * Limpa queue
 */
export async function clearQueue(): Promise<void> {
  try {
    await AsyncStorage.removeItem(QUEUE_KEY);
    logger.info('Queue cleared');
  } catch (error) {
    logger.error('Failed to clear queue', error);
  }
}
```

#### **Fase 3: Criar Sync Service**

**Arquivo:** `src/services/offline/syncService.ts`

```typescript
import { getQueue, removeOperation, QueuedOperation } from './operationQueue';
import { logger } from '@/utils/logger';
import { chatService } from '@/services/supabase/chatService';
import { habitService } from '@/services/supabase/habitService';

/**
 * Sincroniza operações pendentes quando online
 */
export async function syncPendingOperations(): Promise<void> {
  try {
    const queue = await getQueue();

    if (queue.length === 0) {
      logger.info('No pending operations to sync');
      return;
    }

    logger.info(`Syncing ${queue.length} pending operations`);

    for (const operation of queue) {
      try {
        await processOperation(operation);
        await removeOperation(operation.id);
      } catch (error) {
        logger.error('Failed to process operation', error, { operation });

        // Incrementar retries
        operation.retries += 1;

        // Se excedeu max retries, remover da queue
        if (operation.retries >= 3) {
          logger.warn('Operation exceeded max retries, removing', { operation });
          await removeOperation(operation.id);
        }
      }
    }
  } catch (error) {
    logger.error('Failed to sync pending operations', error);
  }
}

/**
 * Processa uma operação individual
 */
async function processOperation(operation: QueuedOperation): Promise<void> {
  switch (operation.type) {
    case 'send_message':
      // @ts-ignore
      await chatService.sendMessage(operation.payload.conversationId, operation.payload.content);
      break;

    case 'complete_habit':
      // @ts-ignore
      await habitService.completeHabit(operation.payload.habitId, operation.payload.date);
      break;

    case 'create_post':
      // @ts-ignore
      await communityService.createPost(operation.payload);
      break;

    default:
      logger.warn('Unknown operation type', { type: operation.type });
  }
}
```

#### **Fase 4: Criar Hook de Offline**

**Arquivo:** `src/hooks/useOffline.ts`

```typescript
import { useEffect } from 'react';
import { useNetworkStatus } from '@/services/offline/networkService';
import { syncPendingOperations } from '@/services/offline/syncService';
import { logger } from '@/utils/logger';

/**
 * Hook para gerenciar estado offline e sync
 */
export function useOffline() {
  const { isConnected } = useNetworkStatus();

  useEffect(() => {
    if (isConnected) {
      // Quando ficar online, sincronizar operações pendentes
      syncPendingOperations().catch((error) => {
        logger.error('Failed to sync on reconnect', error);
      });
    }
  }, [isConnected]);

  return {
    isOffline: !isConnected,
  };
}
```

#### **Fase 5: Criar Componente Offline Banner**

**Arquivo:** `src/components/offline/OfflineBanner.tsx`

```typescript
import React from 'react';
import { Box } from '@/components/primitives/Box';
import { Text } from '@/components/primitives/Text';
import { useNetworkStatus } from '@/services/offline/networkService';
import { useThemeColors } from '@/theme';

export function OfflineBanner() {
  const { isConnected } = useNetworkStatus();
  const colors = useThemeColors();

  if (isConnected) {
    return null;
  }

  return (
    <Box
      padding="3"
      backgroundColor="warning.background"
      borderBottomWidth={1}
      borderBottomColor="warning.border"
    >
      <Text variant="body" size="sm" color="warning.text" center>
        📡 Sem conexão. Algumas funcionalidades podem estar limitadas.
      </Text>
    </Box>
  );
}
```

#### **Fase 6: Integrar Offline em Services**

**Exemplo:** `src/services/supabase/chatService.ts`

```typescript
import { queueOperation } from '@/services/offline/operationQueue';
import { useNetworkStatus } from '@/services/offline/networkService';

export async function sendMessage(conversationId: string, content: string) {
  const { isConnected } = useNetworkStatus();

  if (!isConnected) {
    // Queue para enviar quando online
    await queueOperation('send_message', { conversationId, content });
    return { success: true, queued: true };
  }

  // Enviar normalmente
  // ... código existente
}
```

### 4.4 Checklist

- [ ] Criar `networkService.ts`
- [ ] Criar `operationQueue.ts`
- [ ] Criar `syncService.ts`
- [ ] Criar hook `useOffline`
- [ ] Criar `OfflineBanner` component
- [ ] Integrar queue em `chatService`
- [ ] Integrar queue em `habitService`
- [ ] Integrar queue em `communityService`
- [ ] Adicionar OfflineBanner no App.tsx
- [ ] Testar offline (modo avião)
- [ ] Testar sync quando volta online

### 4.5 Estimativa

**Tempo:** 3-4 dias  
**Prioridade:** Média  
**Dependências:** Services de chat, hábitos, comunidade

---

## 5. Roadmap de Execução

### Ordem Recomendada

1. **Semana 1: Deep Linking + Compartilhamento** (1-2 dias)
   - Mais simples, impacto imediato no compartilhamento

2. **Semana 2: Push Notifications** (2-3 dias)
   - Alta prioridade para engajamento
   - Precisa de setup no Supabase

3. **Semana 3: Offline Support** (3-4 dias)
   - Melhora UX significativamente
   - Depende de services existentes

4. **Semana 4-5: Premium/Monetização** (5-7 dias)
   - Mais complexo, mas crítico para revenue
   - Requer contas Apple/Google configuradas

### Timeline Total

**Estimativa:** 3-4 semanas (11-16 dias úteis)

### Priorização por Impacto

1. **Premium** - Revenue crítico
2. **Push Notifications** - Engajamento
3. **Offline Support** - UX
4. **Deep Linking** - Nice to have

---

## 📝 Notas Finais

- Todas as implementações devem seguir os padrões do projeto:
  - TypeScript strict mode
  - Design tokens (não hardcoded colors)
  - Logger (não console.log)
  - RLS policies no Supabase
  - Testes unitários

- Documentação adicional:
  - Cada feature deve ter testes
  - README específico se necessário
  - Changelog atualizado

---

**Criado em:** Janeiro 2025  
**Última atualização:** Janeiro 2025
