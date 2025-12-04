/**
 * Audio Wellness Data - Áudios de acolhimento com a voz da Nathália
 * Conteúdo premium para bem-estar maternal
 */

// ======================
// TIPOS
// ======================

export type AudioCategory =
  | 'acolhimento' // Apoio emocional
  | 'autoajuda' // Crescimento pessoal
  | 'meditacao' // Meditações guiadas
  | 'afirmacoes' // Afirmações positivas
  | 'sono' // Para dormir
  | 'energia' // Para começar o dia
  | 'ritual'; // Rituais de autocuidado

export type VoiceStyle =
  | 'NATHALIA_MAIN' // Acolhedora padrão
  | 'NATHALIA_CALM' // Calma para meditação
  | 'NATHALIA_ENERGETIC' // Motivacional
  | 'NATHALIA_EMPATHETIC'; // Apoio emocional

export interface AudioWellnessItem {
  id: string;
  title: string;
  description: string;
  /** Texto que será convertido em áudio via ElevenLabs */
  script: string;
  /** Duração estimada em minutos */
  duration: number;
  category: AudioCategory;
  voiceStyle: VoiceStyle;
  /** URL da foto da Nathália para este áudio */
  imageUrl: string;
  /** Cor de destaque do card */
  accentColor: string;
  /** Se é conteúdo premium/exclusivo */
  isPremium?: boolean;
  /** Se está disponível offline (pré-cacheado) */
  isOffline?: boolean;
  /** Quantidade de reproduções */
  plays?: number;
  /** Tags para busca */
  tags: string[];
}

// ======================
// FOTOS DA NATHÁLIA VALENTE
// ======================

export const NATHALIA_IMAGES = {
  // Fotos acolhedoras/maternais
  warm1: 'https://i.imgur.com/tNIrNIs.jpg',
  warm2: 'https://i.imgur.com/QxWLQV4.jpg',
  warm3: 'https://i.imgur.com/8YkR6Mv.jpg',

  // Fotos meditativas/calmas
  calm1: 'https://i.imgur.com/JHx5Rn3.jpg',
  calm2: 'https://i.imgur.com/vKL8YpN.jpg',

  // Fotos energéticas/motivacionais
  energy1: 'https://i.imgur.com/RfT3WxZ.jpg',
  energy2: 'https://i.imgur.com/wKsM9Np.jpg',

  // Fotos noturnas/sono
  night1: 'https://i.imgur.com/hYqL2Mv.jpg',
  night2: 'https://i.imgur.com/pQxN7Ks.jpg',

  // Placeholder elegante caso imagens não carreguem
  placeholder: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400',
} as const;

// ======================
// CORES DOS CARDS
// ======================

export const AUDIO_COLORS = {
  acolhimento: '#E8B4BC', // Rosa suave
  autoajuda: '#B4D4E8', // Azul suave
  meditacao: '#C4B4E8', // Lilás
  afirmacoes: '#E8D4B4', // Dourado suave
  sono: '#9BA8B4', // Azul acinzentado
  energia: '#B4E8D4', // Verde menta
  ritual: '#E8C4B4', // Pêssego
} as const;

// ======================
// CATÁLOGO DE ÁUDIOS
// ======================

export const AUDIO_WELLNESS_CATALOG: AudioWellnessItem[] = [
  // ========== ACOLHIMENTO ==========
  {
    id: 'audio-acolhimento-1',
    title: 'Você Não Está Sozinha',
    description: 'Um abraço em forma de áudio para os dias difíceis',
    script: `Oi, mãe. Eu sei que nem sempre é fácil.
Às vezes a gente se sente sozinha, mesmo cercada de gente.
Às vezes a gente chora no banho pra ninguém ver.
E tá tudo bem. Você não precisa ser forte o tempo todo.
Você pode chorar. Pode sentir raiva. Pode se sentir perdida.
Porque a maternidade é isso também: é real, é imperfeito, é humano.
Mas eu preciso que você saiba de uma coisa muito importante:
Você não está sozinha. Eu tô aqui. Milhares de mães estão aqui.
Passando pelas mesmas dúvidas, os mesmos medos, as mesmas noites mal dormidas.
Então respira fundo comigo. Inspire... e solta.
Você está fazendo um trabalho incrível. Mesmo quando não parece.
Eu tenho muito orgulho de você.`,
    duration: 2,
    category: 'acolhimento',
    voiceStyle: 'NATHALIA_EMPATHETIC',
    imageUrl: NATHALIA_IMAGES.warm1,
    accentColor: AUDIO_COLORS.acolhimento,
    isPremium: false,
    plays: 12847,
    tags: ['apoio', 'solidão', 'acolhimento', 'dias difíceis'],
  },
  {
    id: 'audio-acolhimento-2',
    title: 'Quando a Culpa Aperta',
    description: 'Para os momentos em que você se cobra demais',
    script: `Mãe, eu preciso falar uma coisa com você.
Essa culpa que você carrega... ela não é sua amiga.
Eu sei que você se cobra. Acha que deveria ser mais paciente.
Que deveria brincar mais. Trabalhar menos. Ou trabalhar mais.
Que a casa deveria estar mais limpa. Que você deveria cozinhar melhor.
Mas escuta: não existe mãe perfeita.
Não existe manual que funcione pra todo mundo.
O que existe é você, fazendo o melhor que pode, com o que tem, no momento que está.
E isso é mais que suficiente.
Seu filho não precisa de uma mãe perfeita. Precisa de você.
De você presente, mesmo cansada. De você tentando, mesmo errando.
Então deixa essa culpa ir embora. Ela não te serve mais.
Você é uma boa mãe. E eu vou repetir até você acreditar.`,
    duration: 2,
    category: 'acolhimento',
    voiceStyle: 'NATHALIA_EMPATHETIC',
    imageUrl: NATHALIA_IMAGES.warm2,
    accentColor: AUDIO_COLORS.acolhimento,
    isPremium: false,
    plays: 9523,
    tags: ['culpa', 'autocobrança', 'perdão', 'aceitação'],
  },
  {
    id: 'audio-acolhimento-3',
    title: 'Exaustão Materna',
    description: 'Validação para quando você está no limite',
    script: `Eu sei que você está exausta.
Não é frescura. Não é mimimi. É real.
Cuidar de outro ser humano 24 horas por dia é o trabalho mais intenso que existe.
E ninguém te preparou pra isso de verdade.
Seu corpo está cansado. Sua mente está cansada. Sua alma está cansada.
E mesmo assim você continua. Porque é isso que mães fazem.
Mas eu quero te lembrar: você também precisa de cuidado.
Você também precisa de pausas. De ajuda. De um colo.
Não é egoísmo pedir um tempo. É sobrevivência.
Então se hoje você só conseguiu manter todo mundo vivo e alimentado,
Já foi um dia de sucesso.
Descansa, mãe. Você merece.`,
    duration: 2,
    category: 'acolhimento',
    voiceStyle: 'NATHALIA_EMPATHETIC',
    imageUrl: NATHALIA_IMAGES.warm3,
    accentColor: AUDIO_COLORS.acolhimento,
    isPremium: true,
    plays: 15234,
    tags: ['cansaço', 'exaustão', 'burnout', 'validação'],
  },

  // ========== AUTOAJUDA ==========
  {
    id: 'audio-autoajuda-1',
    title: 'Reconstruindo Sua Identidade',
    description: 'Você é muito mais que "só mãe"',
    script: `Quando você se tornou mãe, uma parte de você mudou pra sempre.
Mas isso não significa que você deixou de existir.
Você ainda é aquela mulher com sonhos, desejos, vontades próprias.
Você ainda tem o direito de querer coisas só pra você.
De ter hobbies. De sair com amigas. De cuidar do seu corpo.
De investir na sua carreira. De simplesmente ficar em silêncio.
Ser mãe é uma parte linda da sua identidade.
Mas não é tudo que você é.
Então hoje eu te convido a lembrar: quem era você antes?
O que te fazia feliz? O que você gostava de fazer?
Resgate um pouquinho disso. Nem que seja 10 minutos por dia.
Porque quando você cuida de você, você cuida melhor de todo mundo.`,
    duration: 2,
    category: 'autoajuda',
    voiceStyle: 'NATHALIA_MAIN',
    imageUrl: NATHALIA_IMAGES.energy1,
    accentColor: AUDIO_COLORS.autoajuda,
    isPremium: false,
    plays: 8934,
    tags: ['identidade', 'autoconhecimento', 'propósito'],
  },
  {
    id: 'audio-autoajuda-2',
    title: 'Estabelecendo Limites Saudáveis',
    description: 'Aprenda a dizer não sem culpa',
    script: `Mãe, você pode dizer não.
Não pra visita que quer vir na hora errada.
Não pra conselho que você não pediu.
Não pra tarefa que não é sua responsabilidade.
Dizer não não te faz uma pessoa ruim. Te faz uma pessoa com limites.
E limites são saudáveis. São necessários.
Quando você diz não pro que não serve, você diz sim pro que importa.
Sim pra sua saúde mental. Sim pro seu descanso. Sim pra sua família.
Então pratique comigo: Não. Não, obrigada. Não posso agora.
Não precisa explicar. Não precisa se justificar.
Um não completo é só: não.
Você tem esse direito. Use-o.`,
    duration: 2,
    category: 'autoajuda',
    voiceStyle: 'NATHALIA_MAIN',
    imageUrl: NATHALIA_IMAGES.energy2,
    accentColor: AUDIO_COLORS.autoajuda,
    isPremium: true,
    plays: 6721,
    tags: ['limites', 'assertividade', 'autoestima'],
  },

  // ========== MEDITAÇÃO ==========
  {
    id: 'audio-meditacao-1',
    title: 'Meditação da Manhã',
    description: '5 minutos para começar o dia com calma',
    script: `Bom dia, mãe. Antes de começar a correria, vamos respirar juntas.
Encontre uma posição confortável. Pode ser sentada ou deitada.
Feche os olhos se quiser. Ou apenas relaxe o olhar.
Vamos começar com três respirações profundas.
Inspire pelo nariz... enchendo a barriga de ar... e solta pela boca.
Mais uma vez. Inspira... segura... e solta.
E a última. Inspira profundo... e deixa sair todo o ar.
Agora observe seu corpo. Sinta os pontos de contato com a superfície.
Os pés. As pernas. Os glúteos. As costas.
Deixe seu corpo ficar pesado. Relaxado.
Imagine uma luz dourada entrando pelo topo da sua cabeça.
Essa luz é calma. É paz. É energia boa.
Ela vai descendo... pelo rosto... pelo pescoço... pelos ombros...
Relaxando cada músculo por onde passa.
Desce pelos braços... pelas mãos... pelo peito...
Aquece seu coração. Traz tranquilidade.
Continua descendo pela barriga... pelas pernas... até os pés.
Agora seu corpo inteiro está banhado nessa luz dourada.
Você está calma. Você está presente. Você está pronta.
Quando quiser, pode abrir os olhos devagar.
Leve essa paz com você pro resto do dia.`,
    duration: 5,
    category: 'meditacao',
    voiceStyle: 'NATHALIA_CALM',
    imageUrl: NATHALIA_IMAGES.calm1,
    accentColor: AUDIO_COLORS.meditacao,
    isPremium: false,
    plays: 23456,
    tags: ['manhã', 'calma', 'respiração', 'presença'],
  },
  {
    id: 'audio-meditacao-2',
    title: 'Pausa no Caos',
    description: 'Reset rápido de 3 minutos para momentos intensos',
    script: `Pause. Só por um momento.
Eu sei que está tudo intenso agora. Mas você pode pausar.
Respira comigo. Inspira... e solta.
Você não precisa resolver tudo agora. Só precisa respirar.
Coloca a mão no peito. Sente seu coração batendo.
Você está viva. Você está aqui. Isso é o que importa agora.
Inspira de novo... segura... e solta devagar.
O que quer que esteja acontecendo, vai passar.
Tudo passa. O bom e o difícil. Tudo é temporário.
Então só por agora, deixa o peso de lado.
Relaxa os ombros. Desaperta o maxilar. Solta as mãos.
Mais uma respiração profunda... e solta.
Pronto. Você fez uma pausa. Você cuidou de você.
Agora você pode voltar. Mais calma. Mais centrada.
Você consegue.`,
    duration: 3,
    category: 'meditacao',
    voiceStyle: 'NATHALIA_CALM',
    imageUrl: NATHALIA_IMAGES.calm2,
    accentColor: AUDIO_COLORS.meditacao,
    isPremium: false,
    plays: 31892,
    tags: ['pausa', 'reset', 'ansiedade', 'estresse'],
  },

  // ========== AFIRMAÇÕES ==========
  {
    id: 'audio-afirmacoes-1',
    title: 'Afirmações para Mães',
    description: 'Reprograme sua mente com palavras de poder',
    script: `Repita comigo, em voz alta ou mentalmente:
Eu sou uma boa mãe.
Eu faço o meu melhor todos os dias.
Eu mereço descanso e cuidado.
Meu amor pelo meu filho é suficiente.
Eu não preciso ser perfeita para ser incrível.
Minhas falhas não me definem.
Eu estou aprendendo e crescendo todos os dias.
Eu tenho o direito de pedir ajuda.
Eu sou mais forte do que imagino.
Meu corpo fez algo extraordinário.
Eu mereço amor e gentileza, especialmente de mim mesma.
Hoje vai ser um bom dia, porque eu escolho que seja.
Eu sou suficiente, exatamente como sou.
Lembre-se dessas palavras. Elas são verdade.
Você é incrível, mãe.`,
    duration: 2,
    category: 'afirmacoes',
    voiceStyle: 'NATHALIA_MAIN',
    imageUrl: NATHALIA_IMAGES.warm1,
    accentColor: AUDIO_COLORS.afirmacoes,
    isPremium: false,
    plays: 18234,
    tags: ['afirmações', 'positividade', 'autoestima', 'poder'],
  },

  // ========== SONO ==========
  {
    id: 'audio-sono-1',
    title: 'Boa Noite, Mãe',
    description: 'Relaxamento guiado para dormir melhor',
    script: `Boa noite, mãe. O dia acabou. É hora de descansar.
Deite-se confortavelmente. Ajuste o travesseiro. Puxe o cobertor.
Feche os olhos. Você merece esse descanso.
Vamos soltar a tensão do dia. Começando pelo rosto.
Relaxa a testa. As sobrancelhas. Os olhos.
Relaxa as bochechas. O maxilar. A língua no céu da boca.
Deixa os ombros caírem. Eles carregaram peso demais hoje.
Relaxa os braços. As mãos. Os dedos.
Solta o peito. A barriga. Deixa a respiração fluir naturalmente.
Relaxa as pernas. Os pés. Cada dedinho.
Seu corpo inteiro está pesado, afundando no colchão.
Você não precisa pensar em nada agora.
Amanhã é outro dia. Outros desafios. Outras alegrias.
Mas agora, só existe esse momento. Só existe descanso.
Durma bem, mãe. Você fez um ótimo trabalho hoje.
Durma sabendo que você é amada.
Boa noite.`,
    duration: 5,
    category: 'sono',
    voiceStyle: 'NATHALIA_CALM',
    imageUrl: NATHALIA_IMAGES.night1,
    accentColor: AUDIO_COLORS.sono,
    isPremium: true,
    plays: 27654,
    tags: ['sono', 'relaxamento', 'noite', 'descanso'],
  },

  // ========== ENERGIA ==========
  {
    id: 'audio-energia-1',
    title: 'Energia para o Dia',
    description: 'Motivação para enfrentar a rotina com força',
    script: `Bom dia, guerreira! Levanta essa cabeça!
Eu sei que você está cansada. Eu sei que a noite foi curta.
Mas olha só: você acordou. Você está aqui. Isso já é uma vitória.
Hoje vai ser um bom dia. Sabe por quê? Porque você decidiu que vai ser.
Não importa o que aconteça, você tem força pra enfrentar.
Você já passou por tanta coisa. Já superou tantos desafios.
E vai superar esse dia também.
Então respira fundo, toma aquele café, e vamos lá!
Cada tarefa de cada vez. Um passo de cada vez.
Você não precisa dar conta de tudo. Só do que é possível hoje.
E no final do dia, você vai se orgulhar de si mesma.
Porque você tentou. Porque você se esforçou. Porque você é incrível.
Vai lá, mãe! O dia é seu!`,
    duration: 2,
    category: 'energia',
    voiceStyle: 'NATHALIA_ENERGETIC',
    imageUrl: NATHALIA_IMAGES.energy1,
    accentColor: AUDIO_COLORS.energia,
    isPremium: false,
    plays: 14532,
    tags: ['manhã', 'motivação', 'energia', 'força'],
  },

  // ========== RITUAL ==========
  {
    id: 'audio-ritual-1',
    title: 'Ritual dos 3 Minutos',
    description: 'Reconexão consigo mesma no meio do caos',
    script: `Vamos fazer uma pausa de 3 minutos? Só você e eu.
Primeiro, encontre um cantinho. Pode ser o banheiro, o quarto, onde der.
Agora, três respirações profundas comigo.
Inspira... segura... solta.
Inspira... segura... solta.
Inspira... segura... solta.
Agora coloca as duas mãos no coração.
Sente ele batendo. Você está viva. Você é real.
Diga pra si mesma, em voz alta ou mentalmente:
Eu sou uma boa mãe. Eu estou fazendo o meu melhor.
Eu mereço esse momento de paz.
Agora pense em uma coisa boa que aconteceu hoje. Pode ser pequena.
Um sorriso do seu filho. Um café quentinho. Um momento de silêncio.
Agradeça por isso. Esse momento existiu por você.
Mais uma respiração profunda... e solta.
Pronto. Você tirou 3 minutos pra você.
Isso não é egoísmo. É autocuidado.
Volte quantas vezes precisar. Eu estarei aqui.`,
    duration: 3,
    category: 'ritual',
    voiceStyle: 'NATHALIA_MAIN',
    imageUrl: NATHALIA_IMAGES.warm2,
    accentColor: AUDIO_COLORS.ritual,
    isPremium: false,
    plays: 42156,
    tags: ['ritual', 'pausa', 'autocuidado', 'gratidão'],
  },
];

// ======================
// HELPERS
// ======================

/** Filtra áudios por categoria */
export function getAudiosByCategory(category: AudioCategory): AudioWellnessItem[] {
  return AUDIO_WELLNESS_CATALOG.filter((audio) => audio.category === category);
}

/** Busca áudios por termo */
export function searchAudios(term: string): AudioWellnessItem[] {
  const lowerTerm = term.toLowerCase();
  return AUDIO_WELLNESS_CATALOG.filter(
    (audio) =>
      audio.title.toLowerCase().includes(lowerTerm) ||
      audio.description.toLowerCase().includes(lowerTerm) ||
      audio.tags.some((tag) => tag.toLowerCase().includes(lowerTerm))
  );
}

/** Retorna os áudios mais populares */
export function getPopularAudios(limit = 5): AudioWellnessItem[] {
  return [...AUDIO_WELLNESS_CATALOG]
    .sort((a, b) => (b.plays || 0) - (a.plays || 0))
    .slice(0, limit);
}

/** Retorna áudios gratuitos */
export function getFreeAudios(): AudioWellnessItem[] {
  return AUDIO_WELLNESS_CATALOG.filter((audio) => !audio.isPremium);
}

/** Retorna categorias únicas com contagem */
export function getCategories(): { category: AudioCategory; count: number; color: string }[] {
  const categories: AudioCategory[] = [
    'acolhimento',
    'autoajuda',
    'meditacao',
    'afirmacoes',
    'sono',
    'energia',
    'ritual',
  ];

  return categories.map((category) => ({
    category,
    count: AUDIO_WELLNESS_CATALOG.filter((a) => a.category === category).length,
    color: AUDIO_COLORS[category],
  }));
}

export default AUDIO_WELLNESS_CATALOG;
