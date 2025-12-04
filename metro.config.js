const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');
const path = require('path');

const config = getDefaultConfig(__dirname);

config.resolver.sourceExts.push('mjs');

// Resolver problema com react-native-web/dist/index
// Algumas dependências (como expo-router) tentam importar react-native-web/dist/index
// mas o caminho correto é apenas react-native-web
const defaultResolver = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  // Corrigir importação de react-native-web/dist/index
  if (moduleName === 'react-native-web/dist/index' || moduleName === 'react-native-web/dist') {
    return {
      type: 'sourceFile',
      filePath: require.resolve('react-native-web'),
    };
  }

  // Usar resolver padrão para outros casos
  if (defaultResolver) {
    return defaultResolver(context, moduleName, platform);
  }

  // Fallback para resolver padrão do Metro
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = withNativeWind(config, { input: './global.css' });
