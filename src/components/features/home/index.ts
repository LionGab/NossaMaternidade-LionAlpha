/**
 * Home Components - Barrel Export
 * Componentes da HomeScreen redesenhados
 */

// Core Components
export { WelcomeHeader, type WelcomeHeaderProps } from './WelcomeHeader';
export { EnergyCard, type EnergyCardProps } from './EnergyCard';
export { NextGoalBadge, type NextGoalBadgeProps } from './NextGoalBadge';
export {
  QuickActionsRow,
  type QuickActionsRowProps,
  type QuickActionType,
} from './QuickActionsRow';
export { MoodSelector, type MoodSelectorProps } from './MoodSelector';
export { AIAssistantCard, type AIAssistantCardProps } from './AIAssistantCard';
export { DailyTipCard, type DailyTipCardProps } from './DailyTipCard';
export { SleepPromptCard, type SleepPromptCardProps } from './SleepPromptCard';

// Premium Components (Screenshot-inspired)
export { ExclusiveContentCard, type ExclusiveContentCardProps } from './ExclusiveContentCard';
export {
  RecentContentGrid,
  type RecentContentGridProps,
  type ContentItem,
  type ContentCategory,
} from './RecentContentGrid';
export {
  CommunityPreviewCard,
  type CommunityPreviewCardProps,
  type CommunityPost,
} from './CommunityPreviewCard';

// ⭐ NEW: Premium Design Components (v2.0)
export { NathIACard, type NathIACardProps } from './NathIACard';
export {
  MoodChips,
  type MoodChipsProps,
  type MoodType,
  type MoodOption,
  DEFAULT_MOODS,
  EXTENDED_MOODS,
  MOOD_COLORS,
} from './MoodChips';
export {
  HighlightsList,
  type HighlightsListProps,
  type HighlightItem,
  type HighlightType,
  DEFAULT_HIGHLIGHTS,
} from './HighlightsList';

// ⭐ NEW: Empathetic Components (v3.0 - Redesign Empático)
export { EmpatheticWelcome, type EmpatheticWelcomeProps } from './EmpatheticWelcome';
export { EmpatheticNathIACard, type EmpatheticNathIACardProps } from './EmpatheticNathIACard';
export {
  EmpatheticMoodChips,
  type EmpatheticMoodChipsProps,
  type EmpatheticMoodType,
} from './EmpatheticMoodChips';
export {
  EmpatheticHighlights,
  type EmpatheticHighlightsProps,
  type EmpatheticHighlightItem,
  DEFAULT_EMPATHETIC_HIGHLIGHTS,
} from './EmpatheticHighlights';

// ⭐ NEW: Empathetic Components V2 (v4.0 - Redesign Completo)
// Melhorias: Animações, 3 variantes (minimal/warm/functional), WCAG AAA
export { EmpatheticWelcomeV2, type EmpatheticWelcomeV2Props } from './EmpatheticWelcomeV2';
export { EmpatheticNathIACardV2, type EmpatheticNathIACardV2Props } from './EmpatheticNathIACardV2';
export {
  EmpatheticMoodChipsV2,
  type EmpatheticMoodChipsV2Props,
  type EmpatheticMoodTypeV2,
  type EmpatheticMoodOptionV2,
} from './EmpatheticMoodChipsV2';
export { EmpatheticHighlightsV2, type EmpatheticHighlightsV2Props } from './EmpatheticHighlightsV2';
