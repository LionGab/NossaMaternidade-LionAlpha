/**
 * Comentários Impactantes - Mundo Nath
 *
 * Comentários reais e impactantes de mães da comunidade
 */

import { Comment } from '../types/comments';

// Comentário fixado da Nathália
export const NATH_PINNED_COMMENT: Comment = {
  id: 'nath-pinned-001',
  author: 'Nathália Valente',
  authorAvatar: 'nath-avatar',
  content:
    'Você não está sozinha. Milhares de mães estão sentindo exatamente o que você sente agora. Respire fundo, estamos juntas nessa jornada. ❤️',
  timestamp: 'Agora',
  likes: 1247,
  isLiked: false,
  isPinned: true,
  isFromNath: true,
};

// Comentário "Anjo do Dia"
export const ANGEL_OF_THE_DAY: Comment = {
  id: 'angel-001',
  author: 'Maria S.',
  authorAvatar: undefined,
  content: 'Essa mãe hoje tá aqui pra abraçar quem precisa.',
  timestamp: 'Hoje',
  likes: 89,
  isLiked: false,
  isPinned: false,
  isFromNath: false,
  isAngelOfTheDay: true,
};

// Comentários impactantes - Versões muito mais fortes e emocionais
export const IMPACTFUL_COMMENTS: Comment[] = [
  {
    id: 'comment-001',
    author: 'Juliana Mendes',
    authorAvatar: undefined,
    content:
      'Meninas, hoje eu tomei meu primeiro banho sem chorar desde que o bebê nasceu.\n\nNas últimas 3 semanas, era sempre igual: eu entrava no chuveiro, ouvia o choro lá fora e começava a chorar junto. Coração acelerado, culpa, medo de estar falhando em tudo.\n\nHoje ele também chorou. Meu peito apertou igual. Mas eu respirei fundo, terminei o banho, me enxuguei com calma e só depois fui pegá-lo no colo.\n\nParece pouco, mas eu senti que recuperei 5 minutos de mim mesma.\n\nAlguém mais aí colecionando essas "vitórias invisíveis" que ninguém vê, mas que salvam o dia? 🙌',
    timestamp: '2h atrás',
    likes: 284,
    isLiked: false,
    isPinned: false,
    isFromNath: false,
  },
  {
    id: 'comment-002',
    author: 'Carla Silva',
    authorAvatar: undefined,
    content:
      'Hoje me arrumei inteira: lavei o cabelo, passei rímel, troquei o pijama pela primeira vez em dias. Fui pro espelho esperando me reconhecer… e tudo que eu consegui ver foi: "mãe".\n\nEu amo meu bebê com tudo que tenho, mas é como se eu tivesse desaparecido dentro desse papel.\n\nA Carla que gostava de ler, de sair pra tomar um café, de se arrumar sem ter pressa… eu não sei onde ela foi parar.\n\nAlguém mais sente que perdeu a própria identidade depois do parto?\n\nQueria um espaço pra falar disso sem ouvir "mas aproveita, passa rápido" ou "agradece, pelo menos seu filho é saudável".\n\nSó queria conversar com mulheres que entendessem esse vazio sem me julgarem. 💔',
    timestamp: '4h atrás',
    likes: 342,
    isLiked: false,
    isPinned: false,
    isFromNath: false,
  },
  {
    id: 'comment-003',
    author: 'Fernanda Paiva',
    authorAvatar: undefined,
    content:
      'Eu já estava no meu limite com as cólicas do Léo.\n\nTrês noites seguidas virando zumbi: ele encolhendo as perninhas, chorando sem parar, e eu com vontade de chorar junto de cansaço e impotência.\n\nHoje, com aval da pediatra, tentei o famoso chá de camomila. Fiz exatamente como ela orientou.\n\nResultado: ele dormiu 3 horas seguidas. Três horas em silêncio, respiração calma, rostinho relaxado. Eu fiquei olhando pra ele e, pela primeira vez em dias, senti o corpo desacelerar.\n\nNão é milagre, cada bebê é um. Mas aqui em casa foi uma trégua no meio da guerra.\n\nCompartilho porque sei que tem mãe lendo isso agora, exausta, procurando uma luzinha no fim do túnel.\n\nE vocês, o que ajudou (com orientação do pediatra, claro) por aí? ✨',
    timestamp: '5h atrás',
    likes: 156,
    isLiked: false,
    isPinned: false,
    isFromNath: false,
  },
  {
    id: 'comment-004',
    author: 'Beatriz Costa',
    authorAvatar: undefined,
    content:
      'Amanhã eu volto a trabalhar.\n\nHoje arrumei a bolsinha do meu bebê pra deixar na casa da minha mãe e chorei dobrando cada troquinho de roupa.\n\nEu sei que estou indo trabalhar pra dar o melhor pra ele. Eu sei, racionalmente, que é necessário.\n\nMas o coração… o coração tá em frangalhos.\n\nTenho medo de perder momentos, de ele se acostumar mais com outro colo do que com o meu, de julgarem minhas escolhas, de me chamarem de "mãe ausente".\n\nComo vocês lidaram com essa primeira separação?\n\nO que ajudou a diminuir a culpa e o nó na garganta?\n\nTô aceitando conselhos, histórias sinceras e abraços virtuais bem apertados. 💌',
    timestamp: '8h atrás',
    likes: 193,
    isLiked: false,
    isPinned: false,
    isFromNath: false,
  },
  {
    id: 'comment-005',
    author: 'Ana Paula',
    authorAvatar: undefined,
    content:
      'Hoje chorei no banho porque senti falta de mim mesma. Mas depois lembrei que estou criando uma vida inteira. Isso me deu força. Somos guerreiras, mães! 💪',
    timestamp: '12h atrás',
    likes: 201,
    isLiked: false,
    isPinned: false,
    isFromNath: false,
  },
  {
    id: 'comment-006',
    author: 'Patrícia Lima',
    authorAvatar: undefined,
    content:
      'A maternidade real não é o que eu vi no Instagram. É madrugadas sem dormir, cabelo bagunçado, pijama o dia todo. Mas também é o sorriso mais lindo do mundo. Vale cada segundo.',
    timestamp: '1 dia atrás',
    likes: 178,
    isLiked: false,
    isPinned: false,
    isFromNath: false,
  },
  {
    id: 'comment-007',
    author: 'Larissa Santos',
    authorAvatar: undefined,
    content:
      'Depressão pós-parto é real e não é frescura. Se você está se sentindo assim, procure ajuda. Eu procurei e mudou tudo. Você merece estar bem. ❤️',
    timestamp: '1 dia atrás',
    likes: 312,
    isLiked: false,
    isPinned: false,
    isFromNath: false,
  },
  {
    id: 'comment-008',
    author: 'Mariana Oliveira',
    authorAvatar: undefined,
    content:
      'Amamentar não é fácil. Não é natural pra todo mundo. E está tudo bem se você não conseguir ou escolher não fazer. Você é uma mãe incrível de qualquer forma.',
    timestamp: '2 dias atrás',
    likes: 245,
    isLiked: false,
    isPinned: false,
    isFromNath: false,
  },
  {
    id: 'comment-009',
    author: 'Camila Ferreira',
    authorAvatar: undefined,
    content:
      'A culpa materna é a pior parte. Culpa por não estar presente, culpa por estar presente demais. Mas hoje entendi: estou fazendo o meu melhor. E isso já é suficiente.',
    timestamp: '2 dias atrás',
    likes: 189,
    isLiked: false,
    isPinned: false,
    isFromNath: false,
  },
  {
    id: 'comment-005',
    author: 'Ana Paula',
    authorAvatar: undefined,
    content:
      'Ontem eu gritei com meu filho de 3 anos.\n\nEle derrubou suco no sofá depois de eu pedir mil vezes pra tomar na mesa. Eu estava sem dormir, com dor de cabeça, casa virada.\n\nQuando percebi, eu já tinha levantado a voz mais do que queria. Ele me olhou com o olho cheio de lágrima e disse: "mamãe brava?".\n\nDepois que ele dormiu, eu fui pro banheiro e chorei em silêncio, me sentindo o pior ser humano do mundo.\n\nNinguém prepara a gente pra essa mistura de amor gigante com exaustão e culpa.\n\nMais alguém já se sentiu um monstro por perder a paciência… e no fundo só estar esgotada? 😔',
    timestamp: '12h atrás',
    likes: 401,
    isLiked: false,
    isPinned: false,
    isFromNath: false,
  },
  {
    id: 'comment-006',
    author: 'Patrícia Lima',
    authorAvatar: undefined,
    content:
      'Depois que nosso filho nasceu, eu sinto que meu casamento entrou em modo sobrevivência.\n\nAntes, a gente tinha tempo pra conversar, rir, planejar.\n\nAgora é quem dorme primeiro, quem troca fralda, quem está mais cansado, quem "faz menos".\n\nSinto falta de olhar pro meu marido e ver o parceiro, não só o pai.\n\nMas quando finalmente temos um tempo livre, eu só quero… dormir.\n\nAlguém mais sente que o relacionamento mudou depois do bebê e não sabe por onde recomeçar? 💔',
    timestamp: '1 dia atrás',
    likes: 378,
    isLiked: false,
    isPinned: false,
    isFromNath: false,
  },
  {
    id: 'comment-007',
    author: 'Larissa Santos',
    authorAvatar: undefined,
    content:
      'Depressão pós-parto é real e não é frescura. Se você está se sentindo assim, procure ajuda. Eu procurei e mudou tudo. Você merece estar bem. ❤️',
    timestamp: '1 dia atrás',
    likes: 512,
    isLiked: false,
    isPinned: false,
    isFromNath: false,
  },
  {
    id: 'comment-008',
    author: 'Mariana Oliveira',
    authorAvatar: undefined,
    content:
      'Amamentar não é fácil. Não é natural pra todo mundo. E está tudo bem se você não conseguir ou escolher não fazer. Você é uma mãe incrível de qualquer forma.',
    timestamp: '2 dias atrás',
    likes: 445,
    isLiked: false,
    isPinned: false,
    isFromNath: false,
  },
  {
    id: 'comment-009',
    author: 'Camila Ferreira',
    authorAvatar: undefined,
    content:
      'A culpa materna é a pior parte. Culpa por não estar presente, culpa por estar presente demais. Mas hoje entendi: estou fazendo o meu melhor. E isso já é suficiente.',
    timestamp: '2 dias atrás',
    likes: 389,
    isLiked: false,
    isPinned: false,
    isFromNath: false,
  },
  {
    id: 'comment-010',
    author: 'Renata Alves',
    authorAvatar: undefined,
    content:
      'São 3h17 da manhã.\n\nEstou no sofá, com meu bebê dormindo finalmente no meu peito, e a casa inteira em silêncio.\n\nEu amo esse pequeno com tudo que eu tenho. Mas ser mãe solo é pesado de um jeito que ninguém me explicou.\n\nNão tem "revezar turno", não tem "vai você tomar um banho que eu fico aqui".\n\nTem só eu, ele, e essa mistura de medo, cansaço e coragem que eu nem sabia que existia.\n\nSe você é mãe solo também, me conta: como você cuida de você no meio desse furacão? 🌧️',
    timestamp: '3 dias atrás',
    likes: 467,
    isLiked: false,
    isPinned: false,
    isFromNath: false,
  },
];

// Combinar todos os comentários (fixado primeiro, depois os outros)
export const getAllComments = (): Comment[] => {
  return [
    NATH_PINNED_COMMENT,
    ANGEL_OF_THE_DAY,
    ...IMPACTFUL_COMMENTS.slice(0, 2), // Mostrar apenas 2-3 visíveis inicialmente
  ];
};

// Total de comentários (incluindo os não visíveis)
export const TOTAL_COMMENTS = IMPACTFUL_COMMENTS.length + 2; // + Nath + Anjo
