# 🎨 Guia de Refatoração de Design - Nossa Maternidade

## 📋 Visão Geral

Este guia documenta o sistema robusto de refatoração de design implementado para garantir consistência visual, profissionalismo e manutenibilidade do código.

---

## 🎯 Objetivos

1. **Eliminar cores hardcoded** - Usar apenas tokens do design system
2. **Padronizar espaçamentos** - Usar Spacing tokens consistentemente
3. **Melhorar hierarquia visual** - Layout profissional e funcional
4. **Garantir acessibilidade** - WCAG AAA compliance
5. **Suporte a Dark Mode** - Tema adaptável automaticamente

---

## 🛠️ Ferramentas Disponíveis

### 1. Script de Refatoração Automatizada

```bash
# Validar todo o projeto
npm run design:validate

# Analisar arquivo específico
npm run design:refactor -- --file=src/screens/HomeScreen.tsx

# Analisar todo o projeto e gerar relatório
npm run design:refactor -- --all
```

### 2. MCPs de Design

O projeto possui MCPs (Model Context Protocol) configurados para validação:

- **design-tokens**: Valida uso correto de tokens
- **code-quality**: Analisa qualidade de código e design
- **accessibility**: Valida acessibilidade WCAG AAA

---

## 📐 Regras de Design

### ✅ CORRETO - Use Tokens

```tsx
// ✅ CORRETO: Usar tokens do design system
<Box bg="card" p="4" rounded="2xl" borderColor="light">
  <Text color="primary" size="md">
    Texto usando tokens
  </Text>
</Box>;

// ✅ CORRETO: Cores do tema
const colors = useThemeColors();
<View style={{ backgroundColor: colors.background.card }} />;
```

### ❌ INCORRETO - Cores Hardcoded

```tsx
// ❌ INCORRETO: Cores hardcoded
<View style={{ backgroundColor: '#FFFFFF' }} />
<Text style={{ color: '#004E9A' }} />

// ❌ INCORRETO: Spacing hardcoded
<View style={{ padding: 16, margin: 8 }} />

// ❌ INCORRETO: Typography hardcoded
<Text style={{ fontSize: 16, fontWeight: 'bold' }} />
```

---

## 🎨 Mapeamento de Cores

### Cores Principais

| Uso       | Token                   | Light Mode             | Dark Mode                  |
| --------- | ----------------------- | ---------------------- | -------------------------- |
| Primary   | `colors.primary.main`   | `#004E9A` (Ocean Blue) | `#60A5FA` (Light Ocean)    |
| Secondary | `colors.secondary.main` | `#D93025` (Coral)      | `#F87171` (Light Coral)    |
| Success   | `colors.status.success` | `#236B62` (Mint)       | `#4ADE80` (Light Mint)     |
| Warning   | `colors.status.warning` | `#F59E0B` (Sunshine)   | `#FCD34D` (Light Sunshine) |
| Error     | `colors.status.error`   | `#D93025` (Coral)      | `#F87171` (Light Coral)    |

### Backgrounds

| Uso      | Token                        | Light Mode        | Dark Mode              |
| -------- | ---------------------------- | ----------------- | ---------------------- |
| Canvas   | `colors.background.canvas`   | `#F1F5F9` (Cloud) | `#020617` (Blue-black) |
| Card     | `colors.background.card`     | `#FFFFFF` (Snow)  | `#1E293B` (Slate)      |
| Elevated | `colors.background.elevated` | `#FFFFFF` (Snow)  | `#334155` (Mid-slate)  |

### Text

| Uso       | Token                   | Light Mode           | Dark Mode              |
| --------- | ----------------------- | -------------------- | ---------------------- |
| Primary   | `colors.text.primary`   | `#0F172A` (Charcoal) | `#F8FAFC` (Off-white)  |
| Secondary | `colors.text.secondary` | `#334155` (Slate)    | `#CBD5E1` (Light grey) |
| Tertiary  | `colors.text.tertiary`  | `#6B7280` (Silver)   | `#94A3B8` (Mid grey)   |

---

## 📏 Espaçamento

### Grid de 4px

Todos os espaçamentos seguem um grid de 4px:

```tsx
// ✅ CORRETO: Usar Spacing tokens
<Box p="4" m="2" gap="3">
  <Text>Conteúdo</Text>
</Box>

// Mapeamento:
Spacing['1'] = 4px
Spacing['2'] = 8px
Spacing['3'] = 12px
Spacing['4'] = 16px
Spacing['6'] = 24px
Spacing['8'] = 32px
```

### Padding/Margin Padrão

- **Cards**: `p="4"` (16px)
- **Seções**: `px="4" py="3"` (16px horizontal, 12px vertical)
- **Espaçamento entre seções**: `py="2"` ou `py="3"`

---

## 🔤 Tipografia

### Tamanhos Padrão

```tsx
// ✅ CORRETO: Usar Typography tokens
<Text size="md">Texto padrão</Text>
<Heading level="h2">Título</Heading>

// Tamanhos disponíveis:
Typography.sizes.xs = 12px
Typography.sizes.sm = 14px
Typography.sizes.md = 16px (base)
Typography.sizes.lg = 18px
Typography.sizes.xl = 20px
Typography.sizes['2xl'] = 24px
```

### Pesos

- **Regular**: `weight="regular"` (400) - Texto corpo
- **Medium**: `weight="medium"` (500) - Destaques
- **Semibold**: `weight="semibold"` (600) - Títulos secundários
- **Bold**: `weight="bold"` (700) - Títulos principais

---

## 🎭 Componentes Refatorados

### MaternalCard

**Antes:**

```tsx
// ❌ Cores hardcoded
const gradient = ['#004E9A', '#002244'];
borderColor: 'rgba(255, 255, 255, 0.06)';
```

**Depois:**

```tsx
// ✅ Usando tokens
const gradient = [colors.primary.main, colors.primary.dark];
borderColor: colors.border.light;
```

### HomeScreen

**Melhorias aplicadas:**

1. ✅ Hero banner reduzido (200px → 180px)
2. ✅ Hero CTA otimizado (lg → md)
3. ✅ Check-in emocional movido para cima (mais destaque)
4. ✅ Espaçamentos consistentes (py="2" ou py="3")
5. ✅ Cards de conteúdo com largura otimizada (280px → 240px)
6. ✅ Dica do dia usando Box props (bg, rounded, p)

---

## 🔍 Checklist de Refatoração

Antes de commitar, verifique:

- [ ] **Cores**: Nenhuma cor hardcoded (`#`, `rgb`, `rgba`, named colors)
- [ ] **Spacing**: Todos os espaçamentos usam `Spacing` tokens
- [ ] **Typography**: Todos os tamanhos usam `Typography` tokens
- [ ] **Borders**: Usar `colors.border.*` em vez de cores hardcoded
- [ ] **Shadows**: Usar `Shadows.*` tokens
- [ ] **Radius**: Usar `Radius.*` tokens
- [ ] **Dark Mode**: Testar em dark mode (cores devem adaptar automaticamente)
- [ ] **Acessibilidade**: Labels e contrastes WCAG AAA

---

## 🚀 Processo de Refatoração

### Passo 1: Identificar Violações

```bash
npm run design:validate
```

Isso gera um relatório com todas as violações encontradas.

### Passo 2: Refatorar Arquivo por Arquivo

1. Abrir arquivo com violações
2. Substituir cores hardcoded por tokens
3. Substituir spacing hardcoded por tokens
4. Substituir typography hardcoded por tokens
5. Testar visualmente
6. Validar novamente

### Passo 3: Validar Resultado

```bash
npm run design:validate
```

Deve retornar 0 violações.

---

## 📝 Exemplos de Refatoração

### Exemplo 1: Card Simples

**Antes:**

```tsx
<View
  style={{
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  }}
>
  <Text style={{ color: '#004E9A', fontSize: 16 }}>Título</Text>
</View>
```

**Depois:**

```tsx
<Box bg="card" p="4" rounded="2xl" borderWidth={1} borderColor="light">
  <Text color="primary" size="md">
    Título
  </Text>
</Box>
```

### Exemplo 2: Gradiente

**Antes:**

```tsx
<LinearGradient colors={['#004E9A', '#002244']}>
```

**Depois:**

```tsx
const colors = useThemeColors();
<LinearGradient colors={[colors.primary.main, colors.primary.dark]}>
```

### Exemplo 3: Spacing

**Antes:**

```tsx
<View style={{ paddingHorizontal: 16, paddingVertical: 12, gap: 8 }}>
```

**Depois:**

```tsx
<Box px="4" py="3" gap="2">
```

---

## 🎯 Próximos Passos

1. ✅ Script de refatoração criado
2. ✅ MaternalCard refatorado
3. ✅ HomeScreen refatorado
4. ⏳ Refatorar todas as outras telas
5. ⏳ Criar pre-commit hook para validação automática
6. ⏳ Documentar padrões específicos por componente

---

## 📚 Referências

- [Design System Tokens](./DESIGN_SYSTEM_FINAL.md)
- [Design MCP Architecture](./DESIGN_MCP_ARCHITECTURE.md)
- [Theme Documentation](../../THEME_DOCUMENTATION.md)

---

**Última atualização:** 2025-01-27  
**Versão:** 1.0.0
