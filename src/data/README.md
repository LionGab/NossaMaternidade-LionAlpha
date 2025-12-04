# Conteúdos do Mundo Nath

Este diretório contém toda a estrutura de dados para os conteúdos do app.

## 📁 Estrutura

- `content.ts` - Dados de todos os conteúdos (áudios, vídeos, textos, etc.)

## 🎵 Como Adicionar Áudios Reais

### 1. Hospedar os áudios

Os áudios devem ser hospedados em um serviço de CDN ou storage (ex: AWS S3, Cloudinary, etc.)

### 2. Atualizar `content.ts`

```typescript
export const AUDIOS_REAIS: ContentItem[] = [
  {
    id: 'audio-001',
    title: 'Título do Áudio',
    type: 'Áudio',
    isExclusive: true,
    date: 'Hoje',
    description: 'Descrição do áudio',
    imageUrl: 'URL_DA_IMAGEM_THUMBNAIL',
    duration: '5:20',
    views: 0,
    likes: 0,
    category: 'Bem-estar',
    tags: ['meditação', 'autocuidado'],
    // ⬇️ SUBSTITUIR PELA URL REAL DO ÁUDIO
    audioUrl: 'https://seu-cdn.com/audios/meditacao-5min.mp3',
  },
  // Adicionar mais áudios...
];
```

## 🎬 Como Adicionar Vídeos do Instagram/TikTok

### 1. Extrair vídeos das redes sociais

- Use ferramentas como `yt-dlp` ou APIs oficiais
- Salve os vídeos em formato MP4
- Hospede em CDN ou storage

### 2. Atualizar `content.ts`

```typescript
export const VIDEOS_INSTAGRAM: ContentItem[] = [
  {
    id: 'video-001',
    title: 'Título do Vídeo',
    type: 'Vídeo', // ou 'Reels' ou 'Bastidor'
    isExclusive: true,
    date: 'Há 2 horas',
    description: 'Descrição do vídeo',
    imageUrl: 'URL_DA_THUMBNAIL',
    duration: '12:34',
    views: 0,
    likes: 0,
    category: 'Maternidade Real',
    tags: ['cólicas', 'realidade'],
    // ⬇️ SUBSTITUIR PELAS URLs REAIS
    videoUrl: 'https://seu-cdn.com/videos/video-001.mp4',
    thumbnailUrl: 'https://seu-cdn.com/thumbnails/video-001.jpg',
  },
  // Adicionar mais vídeos...
];
```

## 📝 Como Adicionar Textos

```typescript
export const TEXTOS_REAIS: ContentItem[] = [
  {
    id: 'texto-001',
    title: 'Título do Texto',
    type: 'Texto',
    isExclusive: true,
    date: 'Ontem',
    description: 'Descrição curta',
    imageUrl: 'URL_DA_IMAGEM',
    views: 0,
    likes: 0,
    category: 'Autoestima',
    tags: ['corpo', 'aceitação'],
    // ⬇️ CONTEÚDO COMPLETO DO TEXTO
    content: `
      Seu texto completo aqui...
      Pode ter múltiplas linhas.
    `,
  },
];
```

## 🎞️ Como Atualizar a Série Original

```typescript
export const SERIE_ORIGINAL = {
  title: 'Bastidores com o Thales',
  subtitle: 'Série Original',
  description: 'Descrição da série',
  episodes: [
    {
      id: 'ep-001',
      number: 1,
      title: 'Título do Episódio',
      duration: '10 min',
      watched: false, // true se já foi assistido
      locked: false, // true se ainda está bloqueado
      // ⬇️ SUBSTITUIR PELAS URLs REAIS
      videoUrl: 'https://seu-cdn.com/videos/ep1.mp4',
      thumbnailUrl: 'https://seu-cdn.com/thumbnails/ep1.jpg',
      description: 'Descrição do episódio',
    },
    // Adicionar mais episódios...
  ],
};
```

## 🔧 Ferramentas Úteis para Extrair Conteúdos

### Instagram

```bash
# Instalar yt-dlp
pip install yt-dlp

# Baixar vídeo do Instagram
yt-dlp "URL_DO_POST_INSTAGRAM"
```

### TikTok

```bash
# Baixar vídeo do TikTok
yt-dlp "URL_DO_TIKTOK"
```

### Áudios

- Use ferramentas de gravação de áudio
- Converta para MP3 com qualidade 128kbps ou superior
- Comprima se necessário para reduzir tamanho

## 📊 Estrutura de URLs Recomendada

```
https://cdn.nossamaternidade.com/
├── audios/
│   ├── meditacao-5min.mp3
│   ├── posparto-realidade.mp3
│   └── ...
├── videos/
│   ├── video-001.mp4
│   ├── video-002.mp4
│   └── ...
├── thumbnails/
│   ├── video-001.jpg
│   ├── video-002.jpg
│   └── ...
└── images/
    ├── texto-001.jpg
    └── ...
```

## ✅ Checklist para Adicionar Conteúdo Real

- [ ] Áudios hospedados e URLs atualizadas
- [ ] Vídeos extraídos e hospedados
- [ ] Thumbnails geradas e hospedadas
- [ ] Metadados atualizados (views, likes, etc.)
- [ ] Tags e categorias corretas
- [ ] Duração dos vídeos/áudios correta
- [ ] Datas de publicação atualizadas
- [ ] Conteúdo testado no app

## 🚀 Próximos Passos

1. Criar conta em serviço de CDN (Cloudinary, AWS S3, etc.)
2. Fazer upload dos arquivos
3. Atualizar URLs em `content.ts`
4. Testar no app
5. Atualizar metadados conforme necessário
