/**
 * Assets de Imagens - Nossa Maternidade
 *
 * Imagens principais do app
 */

// 1. Nathália Valente - Avatar (camisa vermelha, sorrindo)
// Mulher com cabelo castanho longo, camisa vermelha sem mangas, choker preto com pérolas,
// brincos dourados, tatuagem de rosa no braço, sorrindo
// Usada em: MãesValentes (Chat), Avatar no canto superior direito
export const nathAvatar = {
  uri: 'https://i.imgur.com/GDYdiuy.jpg',
  // Para usar imagem local:
  // 1. Salve a imagem como 'nath-avatar-red-shirt.png' na pasta src/assets/images/
  // 2. Substitua a linha acima por: require('./nath-avatar-red-shirt.png')
};

// 2. Mundo Nath - Mãe com bebê e decorações (balões, flores, etc)
// Usada em: Home/MundoNath
export const mundoNath = {
  uri: 'https://i.imgur.com/1CWZt2p.jpg',
  // Para usar imagem local: require('./mundo-nath.png')
};

// 3. Refúgio Nath - Mãe com bebê e cachorro
// Usada em: RefúgioNath
export const refugioNath = {
  uri: 'https://i.imgur.com/RRIaE7t.jpg',
  // Para usar imagem local: require('./refugio-nath.png')
};

// 4. Logo Principal - Mãe segurando bebê dormindo (intimidade)
// Usada em: SplashScreen, Logo principal
export const logoPrincipal = require('../../../assets/logo.png');

export default {
  nathAvatar,
  mundoNath,
  refugioNath,
  logoPrincipal,
};
