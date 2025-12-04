# 📁 Estrutura do Projeto

Estrutura organizada do projeto Nossa Maternidade Mobile.

## 📂 Estrutura de Diretórios

```
NossaMaternidadeMelhor-clone/
├── 📱 App Core
│   ├── App.tsx                 # Entry point do app
│   ├── index.ts                # Expo entry point
│   ├── app.json                # Configuração estática do Expo
│   ├── app.config.js           # Configuração dinâmica (processa .env)
│   └── eas.json                # Configuração EAS Build
│
├── ⚙️ Configuração
│   ├── babel.config.js         # Babel config
│   ├── metro.config.js         # Metro bundler config
│   ├── tailwind.config.js      # NativeWind/Tailwind config
│   ├── tsconfig.json           # TypeScript config
│   ├── jest.config.js          # Jest test config
│   └── package.json            # Dependências e scripts
│
├── 📚 Documentação
│   └── docs/                   # Toda documentação técnica
│       ├── README.md           # Índice da documentação
│       ├── setup-*.md          # Guias de setup
│       ├── deployment.md       # Guia de deploy
│       └── ...
│
├── 🎨 Assets
│   └── assets/                 # Imagens, ícones, splash
│       ├── icon.png
│       ├── splash.png
│       └── adaptive-icon.png
│
├── 💻 Código Fonte
│   └── src/
│       ├── components/        # Componentes reutilizáveis
│       │   ├── premium/       # Componentes premium
│       │   └── primitives/    # Componentes primitivos
│       ├── screens/           # Telas do app
│       │   └── Onboarding/   # Fluxo de onboarding
│       ├── navigation/        # Configuração de navegação
│       ├── services/          # Serviços (API, Supabase, etc)
│       ├── context/           # React Contexts
│       ├── hooks/             # Custom hooks
│       ├── utils/             # Utilitários
│       ├── types/             # TypeScript types
│       ├── constants/         # Constantes
│       ├── theme/             # Tema e tokens
│       ├── data/              # Dados mockados
│       └── assets/            # Assets internos
│
├── 🗄️ Database
│   └── supabase/
│       ├── schema.sql         # Schema do banco
│       ├── seed.sql           # Dados iniciais
│       └── README.md          # Docs do schema
│
├── 🧪 Testes
│   └── __tests__/             # Testes unitários
│
└── 🔧 Scripts
    └── scripts/
        ├── test-supabase-connection.ts
        └── README.md
```

## 📝 Arquivos Importantes

### Configuração

- **app.json** - Configuração estática do Expo (iOS, Android, web)
- **app.config.js** - Configuração dinâmica que processa variáveis do `.env`
- **eas.json** - Configuração de builds e submissão para lojas
- **package.json** - Dependências e scripts npm

### Entry Points

- **App.tsx** - Componente raiz do React Native
- **index.ts** - Entry point do Expo

### Documentação

- **README.md** - Documentação principal do projeto
- **docs/** - Documentação técnica detalhada

## 🎯 Convenções

### Nomenclatura

- **Componentes**: PascalCase (`Button.tsx`)
- **Hooks**: camelCase com prefixo `use` (`useHaptics.ts`)
- **Services**: camelCase (`geminiService.ts`)
- **Types**: PascalCase (`chat.ts`)
- **Constants**: PascalCase (`Colors.ts`)

### Estrutura de Pastas

- **components/** - Componentes reutilizáveis
- **screens/** - Telas completas
- **services/** - Lógica de negócio e APIs
- **utils/** - Funções utilitárias
- **types/** - Definições TypeScript
- **hooks/** - Custom React hooks
- **context/** - React Contexts

## 🔒 Segurança

- `.env` está no `.gitignore` (não commitado)
- Variáveis sensíveis usam `expo-secure-store`
- Service role keys nunca expostas no cliente

## 📦 Build e Deploy

- **Desenvolvimento**: Expo Go (`npm start`)
- **Build**: EAS Build (`npm run build:ios|android`)
- **Deploy**: EAS Submit (`npm run submit:ios|android`)

## 🧹 Limpeza Realizada

Arquivos removidos na organização:

- ✅ Documentação de migração antiga
- ✅ Scripts de deploy cloud (não necessário para mobile)
- ✅ Arquivos temporários e de erro
- ✅ Configurações Docker/Cloud (não usadas)
- ✅ Pasta temp_import

Documentação consolidada em `docs/`:

- ✅ Guias de setup movidos para `docs/`
- ✅ Referências atualizadas no README principal
