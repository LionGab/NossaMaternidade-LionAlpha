# 📦 Inventário de Repositórios - Nossa Maternidade

**Status:** Repositório Oficial = `NossaMaternidadeMelhor`

Este documento mantém um inventário dos repositórios relacionados ao projeto, categorizados por status e utilidade.

---

## 🎯 Repositório Oficial

### `NossaMaternidadeMelhor`

**Status:** ✅ **OFICIAL - ÚNICO REPOSITÓRIO PARA LOJAS**

**Local:** `C:\Users\User\Documents\NossaMaternidade\NossaMaternidadeMelhor\`

**Descrição:**  
Repositório principal e único que gera builds para App Store e Google Play Store.

**Regra de Ouro:**

> Se não está neste repositório, não existe para as lojas.

**Workflow:**

- Branch `main`: Produção (sempre estável)
- Branch `dev`: Integração (trabalho diário)
- Feature branches: `feature/*`, `fix/*`, `hotfix/*`

**Última atualização:** 2025-01-27

---

## 🧪 Repositório de Laboratório

### `NossaMaternidade-LN`

**Status:** 🧪 **LAB - EXPERIMENTOS**

**Local:** `lab-monorepo/` (se clonado)

**Descrição:**  
Repositório para experimentos, testes de arquitetura, MCPs, agentes IA e protótipos.

**Regras:**

- ❌ NUNCA fazer deploy direto daqui
- ✅ Copiar manualmente código validado para o oficial
- ✅ Usar para testar ideias arriscadas
- ✅ Explorar novas tecnologias

**Quando usar:**

- Testar agentes IA complexos
- Experimentar MCPs (Model Context Protocol)
- Prototipar features que ainda não estão prontas
- Avaliar novas arquiteturas

**Fluxo de aproveitamento:**

1. Desenvolve e testa no LAB
2. Se funcionar, copia manualmente para `NossaMaternidadeMelhor`
3. Adapta para estrutura do oficial
4. Testa no oficial
5. Faz PR normal

**Última verificação:** Não clonado ainda

---

## 📦 Repositórios Legados

### `MaeTechConecta`

**Status:** 📦 **LEGADO - REFERÊNCIA PONTUAL**

**Descrição:**  
Repositório antigo, usado apenas para consulta pontual de código, schemas ou lógica específica.

**Quando consultar:**

- Precisa de uma edge function específica
- Quer ver um schema SQL mais completo
- Precisa de um trecho de lógica ou layout
- Quer consultar documentação antiga

**Como usar:**

1. Clone temporariamente: `git clone https://github.com/LionGab/MaeTechConecta.git temp-audit/`
2. Pesque o que precisa
3. Copie manualmente para o oficial
4. Delete a pasta temporária: `rm -rf temp-audit/`

**Última consulta:** Nunca

---

## 🔍 Outros Repositórios

### Repositórios Web/Backend Antigos

**Status:** 📦 **LEGADO - INVENTÁRIO**

Lista de repositórios que podem ter código útil, mas não são parte do workflow principal:

- `nossa-maternidade-oficial` (web version)
- Outros repos relacionados (se houver)

**Estratégia:**

- Não clonar permanentemente
- Consultar pontualmente quando necessário
- Copiar manualmente o que for útil
- Manter este inventário atualizado

---

## ✅ O Que Já Foi Aproveitado

### De `NossaMaternidade-LN` (se aplicável)

- [ ] Nada ainda aproveitado

### De `MaeTechConecta` (se aplicável)

- [ ] Nada ainda aproveitado

### De outros repositórios

- [ ] Nada ainda aproveitado

---

## 🗄️ Repositórios Arquivados/Ignorados

### Repositórios que não serão mais usados

- [ ] Nenhum arquivado ainda

**Nota:** Quando um repositório for oficialmente arquivado, marque aqui com data e motivo.

---

## 📝 Notas Importantes

### Regras de Ouro

1. **Sempre trabalhe em `NossaMaternidadeMelhor`** para código que vai pra loja
2. **Use `NossaMaternidade-LN`** apenas para experimentos
3. **Consulte legados pontualmente**, não clone permanentemente
4. **Copie manualmente** código do lab/legado pro oficial (nunca merge/cherry-pick entre repos)
5. **Mantenha este inventário atualizado** quando consultar outros repos

### Workflow de Aproveitamento

```
LAB/LEGADO → [Avaliar] → [Copiar Manualmente] → OFICIAL → [Testar] → [PR] → [Deploy]
```

**NUNCA:**

- ❌ Merge entre repositórios diferentes
- ❌ Cherry-pick cruzando repositórios
- ❌ Sync automático entre repos
- ❌ Tratar código do lab como "pronto"

---

## 🔄 Atualizações

**2025-01-27:**

- Criado inventário inicial
- Definido `NossaMaternidadeMelhor` como oficial
- Documentado workflow de aproveitamento

---

**Última atualização:** 2025-01-27  
**Mantido por:** Equipe de desenvolvimento
