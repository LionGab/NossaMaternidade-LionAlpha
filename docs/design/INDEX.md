# Design System - Guia de Navegacao

> Fonte unica da verdade para Design System do Nossa Maternidade

---

## Documentos Principais

| Documento | Descricao |
|-----------|-----------|
| [DESIGN_PRINCIPLES.md](./DESIGN_PRINCIPLES.md) | Filosofia e valores de design |
| [DESIGN_SYSTEM_REFERENCE.md](./DESIGN_SYSTEM_REFERENCE.md) | Guia completo (tokens, cores, tipografia) |
| [COMPONENT_PATTERNS.md](./COMPONENT_PATTERNS.md) | Padroes de componentes React Native |
| [DESIGN_DECISIONS.md](./DESIGN_DECISIONS.md) | Decisoes estabelecidas (registros ADR) |
| [DESIGN_QUICK_REFERENCE.md](./DESIGN_QUICK_REFERENCE.md) | Cheat sheet para uso rapido |
| [PLATFORM_GUIDELINES.md](./PLATFORM_GUIDELINES.md) | Diretrizes iOS/Android |

---

## Documentos de Apoio

| Documento | Descricao |
|-----------|-----------|
| [COMPONENT_LIBRARY.md](./COMPONENT_LIBRARY.md) | Biblioteca de componentes |
| [DESIGN_IMPROVEMENTS.md](./DESIGN_IMPROVEMENTS.md) | Melhorias planejadas |
| [DESIGN_VALIDATION.md](./DESIGN_VALIDATION.md) | Como validar conformidade |
| [THEME_DOCUMENTATION.md](./THEME_DOCUMENTATION.md) | Sistema de temas (light/dark) |
| [PRODUCTION_APP_BEST_PRACTICES.md](./PRODUCTION_APP_BEST_PRACTICES.md) | Boas praticas para producao |

---

## Implementacao

**Codigo fonte:**
- `src/theme/tokens.ts` - Design tokens
- `src/components/primitives/` - Componentes base (Box, Text, Button)
- `src/hooks/useTheme.ts` - Hook para cores tematicas

**Validacao:**
```bash
npm run validate:design  # Valida conformidade com Design System
```

---

## Regras de Ouro

1. **SEMPRE** usar `useThemeColors()` para cores
2. **SEMPRE** usar `Tokens.*` para spacing/radius
3. **NUNCA** usar cores hardcoded (`#FFFFFF`, `rgba(...)`)
4. **NUNCA** usar `<View>` ou `<Text>` direto (usar primitives)

---

_Ultima atualizacao: 5 de dezembro de 2025_
