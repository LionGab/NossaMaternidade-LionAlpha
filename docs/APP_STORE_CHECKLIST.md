# 📱 Checklist de Deploy - App Store & Google Play

**Nossa Maternidade** - Checklist completo para submissão nas lojas

---

## 🍎 Apple App Store

### Informações do App
- [ ] Nome: "Nossa Maternidade" (max 30 caracteres)
- [ ] Subtítulo: "Apoio e comunidade para mães" (max 30 caracteres)
- [ ] Categoria primária: Health & Fitness
- [ ] Categoria secundária: Lifestyle
- [ ] Classificação etária: 12+ (Referência médica)

### Assets Obrigatórios
- [ ] Ícone 1024x1024 (PNG, sem alpha)
- [ ] Screenshots iPhone 6.7" (1290x2796)
- [ ] Screenshots iPhone 6.5" (1284x2778)
- [ ] Screenshots iPhone 5.5" (1242x2208)
- [ ] Screenshots iPad 12.9" (2048x2732)
- [ ] Vídeo de preview (15-30 segundos)

### Descrição
```
Nossa Maternidade - Seu espaço seguro na jornada da maternidade

🤱 Apoio emocional com NathIA, sua assistente de IA amigável
👩‍👩‍👧 Comunidade de mães que se apoiam (Mães Valentes)
📚 Conteúdo personalizado para sua fase (Mundo Nath)
🧘 Rituais de reconexão e autocuidado
🆘 SOS Mãe - Apoio emergencial 24/7
✅ Tracking de hábitos e bem-estar

Funcionalidades:
• Chat inteligente com IA empática
• Comunidade moderada e segura
• Rituais guiados de 3 minutos
• Check-in emocional diário
• Validação de culpa materna
• Conteúdo educativo personalizado

Sua jornada materna não precisa ser solitária. 💜
```

### Palavras-chave
```
maternidade,mãe,bebê,apoio,comunidade,autocuidado,bem-estar,sono,ansiedade,depressão pós-parto,amamentação,desenvolvimento,gestante,puerpério
```

### Política de Privacidade
- [ ] URL da política de privacidade
- [ ] LGPD compliance
- [ ] Data collection disclosure

### Requisitos Técnicos
- [ ] iOS 14.0+ minimum
- [ ] Universal (iPhone + iPad)
- [ ] Testado em dispositivos reais
- [ ] Performance otimizada (< 3s startup)
- [ ] Crash-free rate > 99%
- [ ] Push notifications configuradas

---

## 🤖 Google Play Store

### Informações do App
- [ ] Nome: "Nossa Maternidade"
- [ ] Descrição curta (max 80 caracteres)
- [ ] Categoria: Health & Fitness
- [ ] Classificação etária: Teen (Referência médica)

### Assets Obrigatórios
- [ ] Ícone 512x512 (PNG)
- [ ] Feature graphic 1024x500
- [ ] Screenshots (min 2, max 8)
- [ ] Vídeo do YouTube (opcional)

### Descrição Completa
```
Nossa Maternidade - Seu espaço seguro na jornada da maternidade

Desenvolvido especialmente para mães brasileiras, o Nossa Maternidade oferece:

🤱 NATHIA - Sua Companheira de IA
Converse a qualquer hora com nossa assistente inteligente, treinada para entender os desafios da maternidade com empatia e acolhimento.

👩‍👩‍👧 MÃES VALENTES - Comunidade
Conecte-se com milhares de mães que entendem o que você está vivendo. Compartilhe, desabafe, apoie e seja apoiada.

📚 MUNDO NATH - Conteúdo Personalizado
Artigos, vídeos e dicas selecionados especialmente para sua fase da maternidade.

🧘 RITUAIS DE RECONEXÃO
Momentos guiados de 3 minutos para você se reconectar consigo mesma, mesmo no caos do dia a dia.

🆘 SOS MÃE
Apoio emergencial quando você mais precisa. Não está sozinha.

✅ MEUS CUIDADOS
Acompanhe seus hábitos de autocuidado e celebre cada pequena vitória.

🎯 DESCULPA HOJE
Valide sua culpa materna e descubra que você não está sozinha nesse sentimento.

---

⚠️ IMPORTANTE: Este aplicativo oferece apoio emocional e não substitui acompanhamento profissional de saúde mental.

💜 Sua jornada materna não precisa ser solitária.
```

### Compliance
- [ ] LGPD compliance declarado
- [ ] Declaração de privacidade de dados
- [ ] Target audience and content
- [ ] Health claim disclaimers
- [ ] Data safety form preenchido

### Requisitos Técnicos
- [ ] Android 8.0+ (API 26)
- [ ] Testado em múltiplos dispositivos
- [ ] APK size < 100MB
- [ ] AAB (Android App Bundle) gerado
- [ ] ProGuard/R8 habilitado
- [ ] 64-bit support

---

## 🔐 Segurança & Compliance

### LGPD
- [ ] Termos de uso atualizados
- [ ] Política de privacidade atualizada
- [ ] Consentimento explícito na primeira abertura
- [ ] Opção de exclusão de dados
- [ ] Criptografia de dados sensíveis

### Supabase
- [ ] RLS policies em todas as tabelas
- [ ] Não expõe service_role_key
- [ ] Rate limiting configurado
- [ ] Backup automatizado

### IA
- [ ] Disclaimers médicos implementados
- [ ] Crisis detection ativo
- [ ] Moderação de conteúdo
- [ ] Logs de auditoria

---

## 📊 Analytics & Monitoring

### Pré-lançamento
- [ ] Sentry configurado
- [ ] Firebase Analytics
- [ ] Expo Updates configurado
- [ ] TestFlight/Internal Testing

### Pós-lançamento
- [ ] Monitoramento de crashes
- [ ] Métricas de engajamento
- [ ] Feedback loop de usuários
- [ ] A/B testing preparado

---

## ✅ Checklist Final

### Antes de Submeter
- [ ] Todos os erros TypeScript corrigidos
- [ ] Lint sem warnings críticos
- [ ] Testes passando (coverage > 60%)
- [ ] Deep links funcionando
- [ ] Push notifications testadas
- [ ] Performance validada
- [ ] Acessibilidade verificada (WCAG AAA)
- [ ] Dark mode testado
- [ ] Offline mode testado

### Build Commands
```bash
# iOS
eas build --platform ios --profile production

# Android
eas build --platform android --profile production
eas submit --platform android

# OTA Update
eas update --branch production
```

---

## 📅 Timeline Estimado

| Fase | Duração | Status |
|------|---------|--------|
| Build Final | 1 dia | ⏳ |
| Testes Beta | 3-5 dias | ⏳ |
| Submissão iOS | 1-2 dias | ⏳ |
| Review iOS | 1-7 dias | ⏳ |
| Submissão Android | 1 dia | ⏳ |
| Review Android | 2-7 dias | ⏳ |
| **Lançamento** | 2-3 semanas | ⏳ |

---

**Última atualização:** Dezembro 2025

