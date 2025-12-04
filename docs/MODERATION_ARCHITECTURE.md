# Arquitetura de Moderação Escalável

> **Nossa Maternidade - Community Moderation System**
> Versão: 1.0.0 | Dezembro 2025

---

## Visão Geral

Sistema de moderação em **4 camadas** projetado para escalar de 1k a 1M+ usuárias sem sobrecarregar moderadoras humanas.

```
┌─────────────────────────────────────────────────────────────────┐
│                    FLUXO DE MODERAÇÃO                           │
├─────────────────────────────────────────────────────────────────┤
│  Post criado                                                    │
│       ↓                                                         │
│  [CAMADA 1] Auto-filtro (regex, keywords) ──→ 85-90% aprovado   │
│       ↓ (10-15% passa)                                          │
│  [CAMADA 2] IA Pre-moderação (Claude/GPT) ──→ 8-12% aprovado    │
│       ↓ (2-5% passa)                                            │
│  [CAMADA 3] Super Mamas (humanos PAGOS) ──→ 1-3% aprovado       │
│       ↓ (appeals)                                               │
│  [CAMADA 4] Founder review ──→ Edge cases                       │
└─────────────────────────────────────────────────────────────────┘
```

---

## Camada 1: Auto-Filtro (90% dos posts)

### Responsabilidade
- Detectar conteúdo **obviamente** inapropriado
- Custo: ~$0 (processamento local)

### O que detecta
| Categoria | Exemplos | Ação |
|-----------|----------|------|
| Spam | Links suspeitos, repetição | **Bloquear** |
| Hate speech direcionado | "você é uma idiota" | **Bloquear** |
| NSFW explícito | Conteúdo sexual | **Bloquear** |
| Violência | Ameaças, agressão | **Bloquear** + Alerta |
| Auto-dano | Ideação suicida | **Bloquear** + Crise |

### Código
```typescript
// src/services/communityModerationService.ts
const flags = {
  spam: this.detectSpam(content),
  hateSpeech: this.detectHateSpeech(content),
  medicalDanger: this.detectDangerousMedicalAdvice(content),
  nsfw: this.detectNSFW(content),
  violence: this.detectViolence(content),
  selfHarm: this.detectSelfHarm(content),
};

if (Object.values(flags).some(f => f)) {
  return { action: 'block', reason: 'auto-filter' };
}
```

### Métricas Target
- **False positive rate**: < 2%
- **Latência**: < 50ms
- **Coverage**: 85-90% dos posts

---

## Camada 2: IA Pre-Moderação (8-12% dos posts)

### Responsabilidade
- Analisar posts que passaram pelo auto-filtro
- Aprovar automaticamente conteúdo claramente seguro
- Custo: ~$0.01-0.05 por post (Claude Haiku / GPT-4o-mini)

### Safety Score
```typescript
// Score 0-1 (1 = mais seguro)
const safetyScore = await this.calculateSafetyScore(post);

if (safetyScore > 0.75) {
  return { action: 'approve', reason: 'safe-content' };
}

if (safetyScore < 0.4) {
  return { action: 'block', reason: 'unsafe-content' };
}

// 0.4-0.75 → fila humana
return { action: 'queue', reason: 'needs-review' };
```

### Penalidades no Score
| Fator | Penalidade |
|-------|------------|
| Keyword médica (medicamento, remédio) | -0.05 |
| Texto muito curto (< 20 chars) | -0.20 |
| Excesso de emojis (> 10) | -0.10 |
| Links externos | -0.15 |

### Métricas Target
- **Approval rate**: > 90% (dos que chegam aqui)
- **False negative rate**: < 1% (conteúdo perigoso aprovado)
- **Latência**: < 2s

---

## Camada 3: Super Mamas Moderators (2-5% dos posts)

### Responsabilidade
- Revisar edge cases que IA não consegue decidir
- **IMPORTANTE**: São PAGAS, não voluntárias

### Estrutura de Compensação (Brasil)

| Tier | Expectativa | Compensação |
|------|-------------|-------------|
| **Moderadora Base** | 2-4h/semana | R$ 300/mês + App grátis |
| **Moderadora Sênior** | 6-8h/semana | R$ 600/mês + App grátis |
| **Lead Moderadora** | 10-12h/semana | R$ 1.000/mês + Revenue share |

### Critérios de Seleção
1. **Mãe ativa** na comunidade (> 3 meses)
2. **Trust score** > 8.0 (baseado em reports, engajamento)
3. **Treinamento obrigatório** (2h inicial + 1h/mês)
4. **Background check** básico

### Workflow
```
Post entra na fila
       ↓
[Super Mama 1] Analisa (< 5 min)
       ↓
   ✅ Aprovar  →  Post publicado
   ❌ Rejeitar →  Notificar autor + razão
   🤔 Escalar  →  Lead Moderadora
```

### Métricas Target
- **Queue latency**: < 30 min (média)
- **Consensus rate**: > 85% (concordância entre moderadoras)
- **Burnout rate**: < 10%/mês (rotatividade)

### Dashboard de Moderação (TODO)
```
┌─────────────────────────────────────────────────────────────┐
│  MODERAÇÃO - Painel Super Mama                              │
├─────────────────────────────────────────────────────────────┤
│  Posts na fila: 12          Avg wait: 18 min                │
│  Seus aprovados hoje: 45    Seus rejeitados: 3              │
│  ──────────────────────────────────────────────────────────│
│  [POST ATUAL]                                               │
│  "Meninas, meu bebê não dorme há 3 dias e eu tô no limite"  │
│                                                             │
│  Safety Score: 0.62 (moderado)                              │
│  Flags: overwhelm, sleep_issues                             │
│  Histórico do autor: 15 posts, 0 reports                    │
│                                                             │
│  [✅ Aprovar]  [❌ Rejeitar]  [⚠️ Escalar]                   │
└─────────────────────────────────────────────────────────────┘
```

---

## Camada 4: Founder Review (Appeals)

### Responsabilidade
- Revisar appeals de posts rejeitados
- Definir políticas para casos novos
- **Tempo esperado**: 30 min/semana

### Processo de Appeal
1. Usuária contesta rejeição
2. Lead Moderadora revisa
3. Se discordar, escalona para Founder
4. Founder decide + documenta para futuro

---

## Métricas de Saúde do Sistema

### Dashboard Principal
```
┌──────────────────────────────────────────────────────────────┐
│  SAÚDE DA MODERAÇÃO - Última Semana                          │
├──────────────────────────────────────────────────────────────┤
│  Total posts: 5,234                                          │
│  ├─ Auto-aprovados: 4,710 (90%)                              │
│  ├─ IA aprovados: 418 (8%)                                   │
│  ├─ Humano aprovados: 89 (1.7%)                              │
│  └─ Bloqueados: 17 (0.3%)                                    │
│                                                              │
│  Queue latency (avg): 22 min ✅                              │
│  Queue latency (p95): 45 min ⚠️                              │
│  False positive reports: 3 ✅                                │
│  Moderadora burnout: 0% ✅                                   │
└──────────────────────────────────────────────────────────────┘
```

### Alertas Automáticos
| Métrica | Threshold | Ação |
|---------|-----------|------|
| Queue > 50 posts | Warning | Notificar Lead |
| Queue latency > 1h | Critical | Escalar para Founder |
| False positive rate > 5% | Warning | Revisar regras auto-filtro |
| Moderadora inativa > 3 dias | Info | Check-in pessoal |

---

## Custos Estimados por Escala

### 1k MAU (Lançamento)
- Super Mamas: 1 pessoa (R$ 300/mês)
- IA: ~$10/mês
- **Total: ~R$ 350/mês**

### 10k MAU (Crescimento)
- Super Mamas: 2 pessoas (R$ 600/mês)
- IA: ~$50/mês
- **Total: ~R$ 900/mês**

### 100k MAU (Escala)
- Super Mamas: 5 pessoas (R$ 2.500/mês)
- IA: ~$200/mês
- Lead Moderadora: 1 pessoa (R$ 1.000/mês)
- **Total: ~R$ 4.500/mês**

### 1M MAU (Maturidade)
- Super Mamas: 15 pessoas (R$ 6.000/mês)
- IA: ~$500/mês
- Leads: 3 pessoas (R$ 3.000/mês)
- Trust & Safety Manager: 1 pessoa (R$ 8.000/mês)
- **Total: ~R$ 18.000/mês**

---

## Tabelas Supabase Necessárias

```sql
-- Posts da comunidade com metadata de moderação
ALTER TABLE community_posts ADD COLUMN IF NOT EXISTS
  moderation_score DECIMAL(3,2),
  moderation_flags TEXT[],
  queued_at TIMESTAMPTZ,
  moderated_by UUID REFERENCES profiles(id),
  moderated_at TIMESTAMPTZ;

-- Fila de moderação
CREATE TABLE IF NOT EXISTS moderation_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES community_posts(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending', -- pending, assigned, completed
  assigned_to UUID REFERENCES profiles(id),
  assigned_at TIMESTAMPTZ,
  decision TEXT, -- approve, reject, escalate
  decision_reason TEXT,
  decided_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Moderadoras
CREATE TABLE IF NOT EXISTS moderators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) UNIQUE,
  tier TEXT DEFAULT 'base', -- base, senior, lead
  active BOOLEAN DEFAULT true,
  compensation_brl DECIMAL(10,2),
  started_at TIMESTAMPTZ DEFAULT NOW(),
  stats JSONB DEFAULT '{}'::jsonb
);

-- Métricas de moderação
CREATE TABLE IF NOT EXISTS moderation_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE DEFAULT CURRENT_DATE,
  total_posts INTEGER DEFAULT 0,
  auto_approved INTEGER DEFAULT 0,
  ai_approved INTEGER DEFAULT 0,
  human_approved INTEGER DEFAULT 0,
  blocked INTEGER DEFAULT 0,
  avg_queue_latency_ms INTEGER,
  p95_queue_latency_ms INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE moderation_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE moderators ENABLE ROW LEVEL SECURITY;
ALTER TABLE moderation_metrics ENABLE ROW LEVEL SECURITY;

-- Policies (moderadoras podem ver fila)
CREATE POLICY "Moderators can view queue"
  ON moderation_queue FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM moderators
      WHERE user_id = auth.uid() AND active = true
    )
  );
```

---

## Próximos Passos

### MVP (Semana 1)
- [x] Camada 1: Auto-filtro implementado
- [x] Camada 2: IA pre-moderação implementada
- [x] Queue latency tracking
- [ ] Dashboard básico de fila

### V1 (Mês 1)
- [ ] Recrutar 1 Super Mama beta
- [ ] Criar tela de moderação no app
- [ ] Implementar sistema de compensação
- [ ] Métricas dashboard

### V2 (Mês 3)
- [ ] Escalar para 3 Super Mamas
- [ ] Sistema de appeals
- [ ] Treinamento estruturado
- [ ] Gamificação (badges)

---

*Última atualização: Dezembro 2025*
*Autor: Claude + Lion*
