/**
 * TabNavigator - Navegação Principal com 5 Tabs
 *
 * 🏠 Home - Dashboard principal
 * 👥 MãesValentes - Comunidade de mães
 * 💬 Chat - MãesValente IA (NathIA)
 * 📚 MundoNath - Conteúdo e Feed
 * ❤️ Meus Cuidados - Bem-estar e hábitos
 */

import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React, { Suspense } from 'react';
import { View, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { MainTabParamList } from './types';
// 🚀 LAZY LOADING: Screens principais carregadas sob demanda
const HomeScreen = React.lazy(() => import('../screens/HomeScreenWebConverted'));
const CommunityScreen = React.lazy(() => import('../screens/CommunityScreen'));
const ChatScreen = React.lazy(() => import('../screens/ChatScreen'));
const MundoNathScreen = React.lazy(() => import('../screens/MundoNathScreen'));
const HabitsScreen = React.lazy(() => import('../screens/HabitsScreen'));

// Theme
import { HapticPatterns, triggerHaptic } from '../theme/haptics';
import { useTheme } from '../theme/ThemeContext';
import { Tokens, ColorTokens } from '../theme/tokens';
import { getShadowFromToken } from '../utils/shadowHelper';

// Icons - Design Web
import { Home, Users, MessageCircle, Sparkles, Heart } from 'lucide-react-native';

// Haptics

const Tab = createBottomTabNavigator<MainTabParamList>();

// Loading fallback component
const TabLoadingFallback = () => {
  const { colors } = useTheme();
  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.background.canvas,
      }}
    >
      <ActivityIndicator size="large" color={colors.primary.main} />
    </View>
  );
};

// Helper para criar wrapper com Suspense para lazy-loaded screens
function createLazyScreen<P extends Record<string, unknown>>(
  Component: React.LazyExoticComponent<React.ComponentType<P>>
) {
  return function LazyScreenWrapper(props: P) {
    return (
      <Suspense fallback={<TabLoadingFallback />}>
        <Component {...props} />
      </Suspense>
    );
  };
}

// Criar wrappers para cada screen lazy-loaded
const HomeScreenWrapper = createLazyScreen(HomeScreen);
const CommunityScreenWrapper = createLazyScreen(CommunityScreen);
const ChatScreenWrapper = createLazyScreen(ChatScreen);
const MundoNathScreenWrapper = createLazyScreen(MundoNathScreen);
const HabitsScreenWrapper = createLazyScreen(HabitsScreen);

export const TabNavigator = () => {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();

  // Haptic feedback ao trocar de tab
  const handleTabPress = () => {
    triggerHaptic(HapticPatterns.tabChange);
  };

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true, // ✅ Garantir labels visíveis
        tabBarActiveTintColor: colors.primary.main,
        tabBarInactiveTintColor: isDark ? colors.text.tertiary : ColorTokens.neutral[500],
        tabBarStyle: {
          height: 70 + insets.bottom, // Aumentado para acomodar labels
          paddingBottom: insets.bottom + 8,
          paddingTop: 8,
          paddingHorizontal: Tokens.spacing['2'],
          backgroundColor: colors.background.card,
          borderTopWidth: 1,
          borderTopColor: colors.border.light,
          elevation: 20,
          ...getShadowFromToken('xl', Tokens.colors.neutral[900]),
          position: 'absolute',
        },
        tabBarLabelStyle: {
          fontSize: Tokens.typography.sizes.xs,
          fontWeight: '600', // Mais legível
          marginTop: 2,
        },
        tabBarIconStyle: {
          marginTop: 2,
        },
        tabBarItemStyle: {
          paddingVertical: Tokens.spacing['1'],
          paddingHorizontal: Tokens.spacing['2'],
          borderRadius: Tokens.radius.xl,
        },
        tabBarButton: (props) => {
          const { children, style, accessibilityState, onPress, testID } = props;
          const isSelected = accessibilityState?.selected;
          return (
            <TouchableOpacity
              testID={testID ?? undefined}
              accessibilityRole="button"
              accessibilityState={accessibilityState ?? undefined}
              onPress={onPress}
              activeOpacity={0.7}
              style={[
                style,
                {
                  flex: 1,
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'column',
                  paddingVertical: Tokens.spacing['2'],
                  paddingHorizontal: Tokens.spacing['3'],
                  borderRadius: Tokens.radius.xl,
                  ...(isSelected && {
                    backgroundColor: `${colors.primary.main}1A`, // primary/10
                  }),
                },
              ]}
            >
              {children}
            </TouchableOpacity>
          );
        },
        tabBarHideOnKeyboard: true,
      }}
    >
      {/* 🏠 Tab 1: Home */}
      <Tab.Screen
        name="Home"
        component={HomeScreenWrapper}
        options={{
          tabBarLabel: 'Início',
          tabBarAccessibilityLabel: 'Tela inicial, dashboard principal',
          tabBarIcon: ({ color, focused }) => (
            <Home
              size={20}
              color={color}
              strokeWidth={focused ? 2.5 : 2}
              accessibilityLabel="Ícone de início"
              accessibilityHint="Navega para a tela inicial do aplicativo"
            />
          ),
        }}
        listeners={{
          tabPress: handleTabPress,
        }}
      />

      {/* 👥 Tab 2: Comunidade */}
      <Tab.Screen
        name="MaesValentes"
        component={CommunityScreenWrapper}
        options={{
          tabBarLabel: 'Mães Valente',
          tabBarAccessibilityLabel: 'Comunidade Mães Valentes',
          tabBarIcon: ({ color, focused }) => (
            <Users
              size={20}
              color={color}
              strokeWidth={focused ? 2.5 : 2}
              accessibilityLabel="Ícone de comunidade de mães"
              accessibilityHint="Navega para a comunidade Mães Valentes"
            />
          ),
        }}
        listeners={{
          tabPress: handleTabPress,
        }}
      />

      {/* 💬 Tab 3: NathIA */}
      <Tab.Screen
        name="Chat"
        component={ChatScreenWrapper}
        options={{
          tabBarLabel: 'NathIA',
          tabBarAccessibilityLabel: 'Chat com NathIA, assistente de IA',
          tabBarIcon: ({ color, focused }) => (
            <MessageCircle
              size={20}
              color={color}
              strokeWidth={focused ? 2.5 : 2}
              accessibilityLabel="Ícone de assistente de IA"
              accessibilityHint="Navega para o chat com NathIA, assistente de IA"
            />
          ),
        }}
        listeners={{
          tabPress: handleTabPress,
        }}
      />

      {/* 📚 Tab 4: Mundo da Nath */}
      <Tab.Screen
        name="MundoNath"
        component={MundoNathScreenWrapper}
        options={{
          tabBarLabel: 'Mundo da Nath',
          tabBarAccessibilityLabel: 'Mundo da Nath, conteúdo e feed',
          tabBarIcon: ({ color, focused }) => (
            <Sparkles
              size={20}
              color={color}
              strokeWidth={focused ? 2.5 : 2}
              accessibilityLabel="Ícone de conteúdo e feed"
              accessibilityHint="Navega para o Mundo da Nath, conteúdo e feed"
            />
          ),
        }}
        listeners={{
          tabPress: handleTabPress,
        }}
      />

      {/* ❤️ Tab 5: Meus Cuidados */}
      <Tab.Screen
        name="Habitos"
        component={HabitsScreenWrapper}
        options={{
          tabBarLabel: 'Meus Cuidados',
          tabBarAccessibilityLabel: 'Meus Cuidados e bem-estar',
          tabBarIcon: ({ color, focused }) => (
            <Heart
              size={20}
              color={color}
              strokeWidth={focused ? 2.5 : 2}
              fill={focused ? color : 'transparent'}
              accessibilityLabel="Ícone de meus cuidados"
              accessibilityHint="Navega para a tela de meus cuidados e bem-estar"
            />
          ),
        }}
        listeners={{
          tabPress: handleTabPress,
        }}
      />
    </Tab.Navigator>
  );
};

export default TabNavigator;
