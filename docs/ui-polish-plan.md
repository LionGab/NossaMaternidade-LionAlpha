# UI & Acessibilidade – Plano de Polimento (Dez 2025)

## Comandos Executados

- `npm run validate:design` → **0 violações** (339 arquivos analisados).
- `npx eslint src/screens/ChatScreen.tsx src/components/nathia/NathIAChatInput.tsx` → confirma que as únicas pendências atuais são _accessibility hints_ ausentes (mesma categoria que apareceu no lint full).

## Principais Pontos de Atenção

| Área                     | Arquivos impactados                                                                                             | Ajustes Necessários                                                                                                                                                               |
| ------------------------ | --------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Onboarding Steps**     | `src/components/onboarding/steps/*.tsx`                                                                         | Adicionar `accessibilityHint` para todos os botões com `accessibilityLabel`; substituir cores hardcoded (linhas apontadas pelo lint) por tokens de `@/theme/tokens`.              |
| **Organisms Home/Feed**  | `src/components/organisms/MaternalCard.tsx`, `CategoryCard.tsx`, `HorizontalCardList.tsx`, `FeedScreen.tsx`     | Várias ocorrências de `has accessibilityLabel prop but no accessibilityHint`. Sugerido criar helper `withHint(label, hint)` ou extender primitives para aceitar hint obrigatório. |
| **Primitives**           | `src/components/primitives/OptimizedFlatList.tsx`, `Button.tsx`, `ProgressIndicator.tsx`, `SafeAreaWrapper.tsx` | Resolver `no-unused-vars` (OptimizedFlatList) e adicionar hints. Esses componentes são herdados em múltiplas telas, então corrigir aqui elimina dezenas de warnings.              |
| **Premium Components**   | `src/components/premium/PremiumCard.tsx`, `PremiumInput.tsx`                                                    | Hooks com dependências faltantes (`react-hooks/exhaustive-deps`) + cores rgba. Usar `useMemo`/`useEffect` completos e tokens.                                                     |
| **Screens**              | `src/screens/ChatScreen.tsx`, `ChatScreenRefactored.tsx`, `CommunityScreen.tsx`, `ContentDetailScreen.tsx`      | Incluir hints em botões (`TouchableOpacity`) e evitar `accessible={true}` com filhos clicáveis (corrigir `react-native-a11y/no-nested-touchables`).                               |
| **Design Tokens Legacy** | `src/data/audioWellness.ts`, `src/design-system/gradients.ts`, `src/constants/Theme.ts`                         | Substituir hex/rgba pelos tokens atuais. Apesar da validação global estar verde, esses arquivos seguem com warnings e devem ser migrados para `ColorTokens`.                      |

## Ações Recomendadas por Tela

1. **HomeScreenV2 / FeedScreen**
   - Revisar cards e quick actions para incluir `accessibilityHint` descritivo e garantir touch target ≥ 44pt.
   - Aplicar `className` NativeWind nos blocos restantes (alguns estão com `style` + hex).
2. **CommunityScreen**
   - Garantir contraste AAA nos botões de reação e tabs; usar `useThemeColors()` para estados dark/light.
   - Verificar `FlatList` com `keyExtractor` estável e fallback offline.
3. **HabitsScreen**
   - Confirmar `ProgressIndicator` usa hints (após corrigir primitive).
   - Validar labels em inputs/sliders (NetInfo + AsyncStorage integration).
4. **OnboardingFlow**
   - Rodar `@accessibility audit.screen src/screens/Onboarding/OnboardingFlow.tsx` após adicionar hints e remover cores legadas.
5. **ChatScreen**
   - Componente `NathIAChatInput` já substituído; falta apenas acrescentar hint nos botões “voltar”, “chips dinâmicos” e CTA “Ver histórico”. Planejar revisão final com leitor de tela.

## Próximos Passos

1. Criar tickets por domínio (Primitives, Organisms, Screens) para aplicar correções em lote.
2. Priorizar `OptimizedFlatList` e `Button` para reduzir dezenas de warnings globais.
3. Reexecutar `npm run lint` após cada lote e anexar resultado ao PR.
4. Validar contraste/dark mode via MCPs (`@design-tokens`, `@accessibility audit.screen`) antes de solicitar QA.
5. Atualizar documentação em `docs/accessibility.md` com os padrões “Label + Hint obrigatório” e exemplos de tokens.
