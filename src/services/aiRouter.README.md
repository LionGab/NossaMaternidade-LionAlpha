# 🚀 AI Router Robusto - Gemini 2.5 Flash Focus

Sistema de roteamento inteligente focado em **custo-benefício**, priorizando Gemini 2.5 Flash com fallback automático.

## 📊 Estratégia de Custo-Benefício

### Distribuição de Uso (Estimada)

```
┌─────────────────────────────────────┐
│ Gemini 2.5 Flash: 90%+ dos casos   │
│ - Chat geral                        │
│ - Perguntas sobre maternidade       │
│ - Suporte emocional leve/moderado   │
│ - Busca de conteúdo                 │
│ - Análise de hábitos                │
│ Custo: ~$0.0001/1k tokens          │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ GPT-4o: ~10% dos casos             │
│ - Crise emocional detectada         │
│ - Padrão emocional negativo         │
│ - Solicitação de ajuda profissional │
│ Custo: ~$0.005/1k tokens           │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ Claude Opus: <1% (fallback apenas)  │
│ - Apenas quando Flash e GPT falham  │
│ Custo: ~$0.015/1k tokens            │
└─────────────────────────────────────┘
```

## 🎯 Como Funciona

### 1. Detecção de Crise (Sync, Rápido)

```typescript
// Antes de rotear, detecta crise instantaneamente
const crisisCheck = CrisisDetectionService.detectCrisisSync(message);

if (crisisCheck.isCrisis) {
  // Usa GPT-4o para segurança (não é fallback, é escolha consciente)
  return 'gpt-4o';
}
```

### 2. Roteamento Padrão

```typescript
// 90%+ dos casos: Gemini Flash
return 'gemini-1.5-flash';
```

### 3. Fallback Automático

```typescript
// Se Flash falhar, tenta GPT-4o
// Se GPT-4o falhar, tenta Claude Opus
const fallbackChain = ['gemini-1.5-flash', 'gpt-4o', 'claude-opus'];
```

### 4. Circuit Breaker

```typescript
// Após 5 falhas consecutivas, pausa tentativas por 5 minutos
// Evita custos desnecessários em caso de problemas persistentes
if (failures >= 5) {
  circuitBreaker.isOpen = true;
  // Aguarda 5min antes de tentar novamente
}
```

## 💰 Estimativa de Custos Mensais

### Cenário: 10.000 mensagens/mês

| Modelo       | % Uso | Mensagens | Tokens Médios | Custo Mensal   |
| ------------ | ----- | --------- | ------------- | -------------- |
| Gemini Flash | 90%   | 9.000     | 500 tokens    | **~$0.45**     |
| GPT-4o       | 9%    | 900       | 500 tokens    | **~$2.25**     |
| Claude Opus  | 1%    | 100       | 500 tokens    | **~$0.75**     |
| **TOTAL**    | 100%  | 10.000    | -             | **~$3.45/mês** |

### Cenário: 100.000 mensagens/mês

| Modelo       | % Uso | Mensagens | Tokens Médios | Custo Mensal    |
| ------------ | ----- | --------- | ------------- | --------------- |
| Gemini Flash | 90%   | 90.000    | 500 tokens    | **~$4.50**      |
| GPT-4o       | 9%    | 9.000     | 500 tokens    | **~$22.50**     |
| Claude Opus  | 1%    | 1.000     | 500 tokens    | **~$7.50**      |
| **TOTAL**    | 100%  | 100.000   | -             | **~$34.50/mês** |

**Conclusão:** Custo extremamente baixo mesmo em escala!

## 🔧 Features Implementadas

### ✅ Circuit Breaker

- Pausa automática após 5 falhas
- Reset automático após 5 minutos
- Evita custos desnecessários

### ✅ Retry Inteligente

- Apenas em falhas temporárias
- Timeout de 30s por tentativa
- Máximo 2 retries por modelo

### ✅ Fallback Automático

- Flash → GPT-4o → Claude Opus
- Transparente para o usuário
- Logging completo

### ✅ Tracking de Custos

- Rastreia custo por modelo
- Estatísticas disponíveis via `getStats()`
- Resetável para análise mensal

### ✅ Detecção de Crise Integrada

- Sync e rápido (não bloqueia)
- Escolha consciente de GPT-4o em crise
- Não é fallback, é segurança primeiro

## 📈 Monitoramento

### Obter Estatísticas

```typescript
import { aiRouter } from '@/services/aiRouter';

const stats = aiRouter.getStats();

console.log('Custos por modelo:', stats.costs);
console.log('Circuit breakers:', stats.circuitBreakers);
```

### Resetar Estatísticas (Mensal)

```typescript
aiRouter.resetStats();
```

## 🎨 Exemplo de Uso

```typescript
import { aiRouter } from '@/services/aiRouter';
import { aiClient } from '@/services/aiClient';

const response = await aiRouter.route(
  userMessage,
  {
    user_id: userId,
    name: userName,
    phase: userPhase,
  },
  async (model, msg, ctx) => {
    return await aiClient.call(model, msg, ctx, history, tools);
  }
);

if (response.success) {
  console.log('Resposta:', response.message);
  console.log('Modelo usado:', response.model_used);
  console.log('Custo estimado:', response.tokens_used);
}
```

## 🚨 Casos Especiais

### Crise Detectada

- **Modelo:** GPT-4o (não Flash)
- **Razão:** Segurança primeiro, moderação melhor
- **Custo:** Aceitável para casos críticos

### Flash Indisponível

- **Fallback:** GPT-4o → Claude Opus
- **Transparente:** Usuário não percebe
- **Logging:** Registrado para análise

### Circuit Breaker Aberto

- **Ação:** Pula modelo, tenta próximo
- **Reset:** Automático após 5min
- **Logging:** Aviso registrado

## ✅ Vantagens

1. **Custo Baixo:** 90%+ usa Flash (mais barato)
2. **Confiável:** Fallback automático garante resposta
3. **Seguro:** GPT-4o em crise (não economiza em segurança)
4. **Inteligente:** Circuit breaker evita custos desnecessários
5. **Monitorável:** Estatísticas completas de uso e custo

## 📝 Próximos Passos

1. ✅ Router implementado
2. ✅ Circuit breaker funcionando
3. ✅ Tracking de custos
4. ⏳ Dashboard de monitoramento (Fase 2)
5. ⏳ Alertas de custo (Fase 2)
