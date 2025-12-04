# 🎤 Como Adicionar Áudios da Nath (Eleven Labs)

Este guia explica como adicionar os áudios da Nath gerados no Eleven Labs ao app.

## 📋 Pré-requisitos

- Áudios gerados no Eleven Labs
- URLs dos áudios hospedados (ou arquivos locais)

## 🚀 Passo a Passo

### 1. Hospedar os Áudios

Você precisa hospedar os áudios em um serviço de storage/CDN. Opções:

- **Cloudinary** (recomendado - fácil e gratuito)
- **AWS S3**
- **Firebase Storage**
- **Supabase Storage**
- **Qualquer CDN**

**Exemplo com Cloudinary:**

1. Acesse [cloudinary.com](https://cloudinary.com)
2. Crie uma conta gratuita
3. Faça upload dos áudios
4. Copie a URL pública de cada áudio

### 2. Atualizar `src/data/content.ts`

Abra o arquivo `src/data/content.ts` e encontre o array `AUDIOS_REAIS`.

**Exemplo de como adicionar um novo áudio:**

```typescript
{
  id: 'audio-004', // ID único
  title: 'Título do Áudio',
  type: 'Áudio',
  isExclusive: true, // true se for exclusivo
  date: 'Hoje', // ou 'Ontem', '3 dias atrás', etc
  description: 'Descrição do áudio. O que a Nath fala nele.',
  imageUrl: 'https://seu-cdn.com/imagens/thumbnail-audio.jpg', // Thumbnail/imagem
  duration: '5:20', // Duração no formato MM:SS
  views: 0, // Número inicial de visualizações
  likes: 0, // Número inicial de curtidas
  category: 'Bem-estar', // Categoria
  tags: ['meditação', 'autocuidado'], // Tags relevantes
  audioUrl: 'https://seu-cdn.com/audios/nath-audio-001.mp3', // ⬅️ URL DO ÁUDIO DO ELEVEN LABS
},
```

### 3. Formato dos Áudios

O app suporta os seguintes formatos:

- ✅ MP3
- ✅ M4A
- ✅ WAV

**Recomendação:** Use MP3 com qualidade de 128kbps ou superior para balancear qualidade e tamanho.

### 4. Estrutura Completa de Exemplo

```typescript
export const AUDIOS_REAIS: ContentItem[] = [
  {
    id: 'audio-001',
    title: 'Meditação: 5 minutos para você se reconectar',
    type: 'Áudio',
    isExclusive: true,
    date: 'Hoje',
    description: 'Uma meditação guiada para você encontrar paz no meio da correria.',
    imageUrl: 'https://res.cloudinary.com/seu-cloud/image/upload/v123/meditacao.jpg',
    duration: '5:20',
    views: 12500,
    likes: 890,
    category: 'Bem-estar',
    tags: ['meditação', 'autocuidado', 'relaxamento'],
    audioUrl: 'https://res.cloudinary.com/seu-cloud/video/upload/v123/nath-meditacao.mp3', // ⬅️ SUBSTITUIR
  },
  {
    id: 'audio-002',
    title: 'Desabafo: A realidade do pós-parto',
    type: 'Áudio',
    isExclusive: true,
    date: 'Ontem',
    description: 'Um áudio sincero sobre os primeiros dias após o parto.',
    imageUrl: 'https://res.cloudinary.com/seu-cloud/image/upload/v123/posparto.jpg',
    duration: '12:45',
    views: 8900,
    likes: 567,
    category: 'Maternidade Real',
    tags: ['pós-parto', 'realidade', 'desabafo'],
    audioUrl: 'https://res.cloudinary.com/seu-cloud/video/upload/v123/nath-posparto.mp3', // ⬅️ SUBSTITUIR
  },
  // Adicione mais áudios aqui...
];
```

### 5. Adicionar Thumbnails/Imagens

Para cada áudio, você precisa de uma imagem de capa:

**Opções:**

- Use imagens do Unsplash/Pexels
- Crie thumbnails personalizados
- Use a mesma imagem para múltiplos áudios (se fizer sentido)

**Exemplo de URL de imagem:**

```typescript
imageUrl: 'https://images.unsplash.com/photo-1234567890?w=400&h=400&fit=crop';
```

### 6. Testar no App

Após adicionar os áudios:

1. Execute o app: `npm start`
2. Navegue até "Mundo Nath"
3. Filtre por "Áudio" ou procure pelos novos áudios
4. Toque em um áudio para abrir
5. Teste o player de áudio

### 7. Organização Recomendada

**Estrutura de URLs sugerida:**

```
https://seu-cdn.com/
├── audios/
│   ├── nath-meditacao-5min.mp3
│   ├── nath-posparto-realidade.mp3
│   ├── nath-culpa-materna.mp3
│   └── ...
└── images/
    ├── thumbnails/
    │   ├── meditacao.jpg
    │   ├── posparto.jpg
    │   └── ...
```

## ✅ Checklist

- [ ] Áudios hospedados em CDN/storage
- [ ] URLs copiadas e testadas (abrir no navegador)
- [ ] Thumbnails/imagens adicionadas
- [ ] Metadados preenchidos (título, descrição, duração)
- [ ] Categorias e tags definidas
- [ ] Testado no app
- [ ] Player de áudio funcionando corretamente

## 🎨 Dicas

1. **Nomes descritivos:** Use nomes claros nos arquivos (ex: `nath-meditacao-5min.mp3`)
2. **Duração precisa:** Meça a duração real do áudio para o campo `duration`
3. **Descrições atrativas:** Escreva descrições que despertem interesse
4. **Tags relevantes:** Use tags que ajudem na busca
5. **Imagens consistentes:** Mantenha um estilo visual consistente nas thumbnails

## 🐛 Problemas Comuns

**Áudio não toca:**

- Verifique se a URL está acessível (abra no navegador)
- Confirme que o formato é suportado (MP3, M4A, WAV)
- Verifique se há CORS habilitado no servidor

**Áudio corta:**

- Verifique a qualidade do arquivo
- Confirme que o upload foi completo

**Imagem não carrega:**

- Verifique a URL da imagem
- Confirme que a imagem existe e está acessível

## 📞 Suporte

Se tiver problemas, verifique:

1. Console do app (erros de rede)
2. URL do áudio (teste no navegador)
3. Formato do arquivo
4. Permissões do storage/CDN
