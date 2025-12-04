// =============================================================================
// POLYFILLS - DEVE SER A PRIMEIRA LINHA!
// Importar ANTES de qualquer outro código para garantir que TextEncoder/TextDecoder
// e getRandomValues estejam disponíveis quando o Supabase inicializar
// =============================================================================
import './src/polyfills';

import { registerRootComponent } from 'expo';

import App from './App';

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
