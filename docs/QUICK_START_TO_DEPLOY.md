# 🚀 Guia Rápido: Do Setup ao Deploy

## Visão Geral

Este guia oferece um caminho claro desde a configuração inicial até o deploy nas lojas, usando o **Diagnóstico de Prontidão para Produção** como ferramenta central.

## 🎯 Workflow Completo

### Fase 1: Setup Inicial (30-60 minutos)

#### 1. Clone e Instale

```bash
git clone https://github.com/LionGab/NossaMaternidade.git
cd NossaMaternidade
npm install
```

#### 2. Configure Ambiente

```bash
# Copie o template
cp .env.example .env

# Edite .env com suas chaves
# - EXPO_PUBLIC_GEMINI_API_KEY
# - EXPO_PUBLIC_SUPABASE_URL
# - EXPO_PUBLIC_SUPABASE_ANON_KEY
```

📖 Veja [docs/setup-env.md](./docs/setup-env.md) para detalhes.

#### 3. Teste a Configuração

```bash
# Inicie o dev server
npm start

# Em outro terminal, valide
npm run type-check
npm run lint
npm test
```

### Fase 2: Desenvolvimento (contínuo)

#### Workflow Diário

1. **Início do dia:** Veja o que precisa ser feito
   ```bash
   npm run diagnose:production
   ```

2. **Durante desenvolvimento:** Valide frequentemente
   ```bash
   npm run type-check
   npm run lint
   npm test
   ```

3. **Antes de commit:** Valide tudo
   ```bash
   npm run validate
   ```

4. **Fim da semana:** Veja progresso
   ```bash
   npm run diagnose:production
   ```

### Fase 3: Preparação para Deploy (1-2 semanas)

#### Checklist Pré-Deploy

Use o diagnóstico para guiar seu trabalho:

```bash
npm run diagnose:production
```

O diagnóstico te dirá **exatamente** o que falta:

##### 🔴 CRÍTICO - Resolver PRIMEIRO
- [ ] TypeScript compila sem erros
- [ ] Testes passando
- [ ] Test coverage ≥40% (meta: 80%)
- [ ] Secrets não estão no código
- [ ] RLS policies configuradas
- [ ] Política de privacidade criada

##### 🟠 ALTO - Resolver ANTES DO BUILD
- [ ] ESLint sem errors
- [ ] WCAG AAA 100% (contraste, touch targets, labels)
- [ ] .env configurado
- [ ] Assets obrigatórios (icon, splash, adaptive-icon)
- [ ] Screenshots para lojas (mínimo 3-5)
- [ ] Termos de serviço criados

##### 🟡 MÉDIO - Resolver ANTES DA SUBMISSÃO
- [ ] Dark mode 100%
- [ ] console.log substituído por logger
- [ ] Design system legado migrado
- [ ] Services seguem padrão { data, error }
- [ ] Metadados completos (description, keywords)

##### 🔵 BAIXO - Melhorias Contínuas
- [ ] TypeScript warnings resolvidos
- [ ] ESLint warnings <50
- [ ] Performance otimizada
- [ ] Documentação atualizada

#### Acompanhando Progresso

Execute o diagnóstico regularmente:

| Quando | Score Esperado | Status |
|--------|----------------|--------|
| Início | 40-60 | 🔴 Longe |
| 1 semana | 60-75 | 🟡 Progresso |
| 2 semanas | 75-90 | ✅ Quase lá |
| 3 semanas | 90+ | 🎉 Pronto! |

### Fase 4: Build e Teste (1-2 dias)

#### 1. Diagnóstico Final

```bash
npm run diagnose:production
```

**Requisito:** Score ≥90 e 0 problemas críticos.

#### 2. Build de Preview

```bash
# Android
npm run build:preview

# Teste no device
# Valide TODAS as funcionalidades principais
```

#### 3. Correções Finais

Se encontrar bugs:

1. Corrija o problema
2. Execute diagnóstico novamente
3. Faça novo build de preview
4. Teste novamente

Repita até estar 100% funcional.

### Fase 5: Build de Produção (1 dia)

#### 1. Última Validação

```bash
# Diagnóstico completo
npm run diagnose:production

# Todos os testes
npm run type-check
npm run lint
npm test
npm run validate:design
```

**Tudo deve passar!**

#### 2. Build Produção

```bash
# iOS
npm run build:ios

# Android
npm run build:android

# Ou ambos
npm run build:production
```

#### 3. Teste Build de Produção

- [ ] Instale no device físico
- [ ] Teste TODAS as funcionalidades
- [ ] Teste fluxo completo (onboarding → uso → logout)
- [ ] Teste em diferentes tamanhos de tela
- [ ] Teste dark mode
- [ ] Teste acessibilidade (VoiceOver/TalkBack)
- [ ] Verifique performance

### Fase 6: Submissão para Lojas (1-2 dias)

#### Preparação Final

**iOS (App Store):**
- [ ] Screenshots em alta resolução
- [ ] Descrição do app
- [ ] Keywords
- [ ] Privacy policy URL
- [ ] Terms of service URL
- [ ] App icon 1024x1024
- [ ] Categorias escolhidas

**Android (Google Play):**
- [ ] Screenshots em alta resolução
- [ ] Feature graphic (1024x500)
- [ ] Descrição do app (curta e longa)
- [ ] Privacy policy URL
- [ ] Content rating questionário
- [ ] App icon e adaptive icon

📖 Veja [docs/DEPLOY_STORES.md](./docs/DEPLOY_STORES.md) para detalhes.

#### Submissão

```bash
# iOS
npm run submit:ios

# Android
npm run submit:android
```

#### Após Submissão

1. **Review Period:** 
   - iOS: 1-3 dias
   - Android: 1-7 dias

2. **Se Rejeitado:**
   - Leia cuidadosamente o motivo
   - Corrija o problema
   - Execute diagnóstico
   - Faça novo build
   - Resubmeta

3. **Se Aprovado:**
   - 🎉 **PARABÉNS!**
   - App publicado!
   - Monitore reviews e crashes

## 📊 Usando o Diagnóstico Efetivamente

### Interpretação do Score

```bash
npm run diagnose:production
```

**Score Geral de Prontidão: XX/100**

- **90-100**: 🎉 Pronto para deploy!
- **75-89**: ✅ Quase lá! Poucos ajustes.
- **50-74**: ⚠️ Trabalho necessário.
- **0-49**: 🔴 Muito trabalho pela frente.

### Scores por Categoria

Cada categoria te diz onde focar:

- **CODE < 80**: Foque em qualidade de código primeiro
- **CONFIG < 80**: Foque em configuração
- **SECURITY < 80**: **URGENTE** - Riscos de segurança
- **STORE < 80**: Foque em assets e metadados
- **PERFORMANCE < 80**: Otimize antes de publicar

### Roadmap Priorizado

O diagnóstico organiza TUDO que precisa ser feito:

1. **🔴 CRÍTICO** - Faça AGORA (hoje)
2. **🟠 ALTO** - Faça esta semana
3. **🟡 MÉDIO** - Faça nas próximas 2 semanas
4. **🔵 BAIXO** - Quando possível

**Dica:** Resolva 1-3 problemas por dia, começando pelos críticos.

### Próximos Passos Concretos

O diagnóstico mostra os **5 próximos passos**:

```
1. Test coverage muito baixo: 8.4% (meta: 80%)
   🛠️ Priorize testes para: 1) Services críticos...
   ⏱️  8-16 horas
   ⚡ Energia: alto
```

Use as estimativas para planejar seu dia/semana.

## 🎯 Dicas para Neurodivergentes (TDAH/Autismo)

### Quebrar Tarefas Grandes

Todas as estimativas são ≤30 minutos sempre que possível.

Se uma tarefa parece grande:
1. Execute o diagnóstico
2. Veja os passos específicos
3. Foque em 1 passo por vez
4. Celebre cada passo completado!

### Gerenciar Energia

Use os níveis de energia do diagnóstico:

- **Alta energia:** Faça tarefas de energia "alto"
- **Média energia:** Faça tarefas de energia "médio"
- **Baixa energia:** Faça tarefas de energia "baixo"

**Nunca** tente forçar tarefas de alta energia em dia de baixa energia.

### Acompanhar Progresso

Visível é motivador:

```bash
# Manhã: veja score
npm run diagnose:production

# Trabalhe 2-4 horas

# Tarde: veja score novo
npm run diagnose:production
```

Ver o score subir é **recompensa imediata**! 🎉

### Evitar Sobrecarga

Sinais de sobrecarga:
- Tentando resolver muitos problemas de uma vez
- Pulando entre tarefas
- Frustração crescente

**Solução:**
1. Pare
2. Respire
3. Execute diagnóstico
4. Escolha **1 problema crítico**
5. Resolva **só esse**
6. Comemore
7. Repita

## 🆘 Troubleshooting

### Diagnóstico Falha

```bash
# Se diagnóstico falhar
npm install -g ts-node
npm run diagnose:production

# Ou compile manualmente
npx tsc scripts/diagnose-production-readiness.ts --outDir scripts --module commonjs --esModuleInterop --skipLibCheck --target es2017 --lib es2017
node scripts/diagnose-production-readiness.js
```

### Build Falha

1. Execute diagnóstico: `npm run diagnose:production`
2. Corrija todos os problemas críticos
3. Execute validações: `npm run validate`
4. Limpe cache: `npx expo start -c`
5. Tente build novamente

### Testes Falhando

```bash
# Ver quais testes falharam
npm test

# Rodar teste específico
npx jest __tests__/path/to/test.test.ts

# Ver coverage
npm run test:coverage
```

## 📚 Recursos

- **[CONTEXTO.md](./CONTEXTO.md)** - Contexto completo, regras, estado
- **[README.md](./README.md)** - Setup detalhado, estrutura
- **[docs/PRODUCTION_READINESS_DIAGNOSTIC.md](./docs/PRODUCTION_READINESS_DIAGNOSTIC.md)** - Guia completo do diagnóstico
- **[docs/DEPLOY_STORES.md](./docs/DEPLOY_STORES.md)** - Deploy para lojas
- **[docs/CHECKLIST_PRE_LAUNCH.md](./docs/CHECKLIST_PRE_LAUNCH.md)** - Checklist final

## 🎉 Conclusão

Com o **Diagnóstico de Prontidão para Produção**, você tem:

✅ Visão clara do estado atual
✅ Roadmap priorizado
✅ Ações concretas
✅ Estimativas de tempo/energia
✅ Acompanhamento de progresso
✅ Caminho claro até o deploy

**Execute o diagnóstico agora:**

```bash
npm run diagnose:production
```

E comece sua jornada do estado atual até a publicação nas lojas! 🚀

---

**Boa sorte!** 🍀

Se tiver dúvidas, consulte a documentação ou abra uma issue no GitHub.
