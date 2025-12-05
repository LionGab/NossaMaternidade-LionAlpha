// Core Components
export { Button, type ButtonProps } from './Button';
export { Input, type InputProps } from './Input';
export { Card, type CardProps, type CardVariant } from './Card';
export { Modal, type ModalProps } from './Modal';
export { Loading, type LoadingProps } from './Loading';
export { ProgressIndicator, type ProgressIndicatorProps } from './ProgressIndicator';
export { OnboardingCard, type OnboardingCardProps } from './OnboardingCard';
export { Avatar, type AvatarProps } from './Avatar';
export { Logo, type LogoProps } from './Logo';
export { CommentItem } from './CommentItem';
export { CommentsSection } from './CommentsSection';
export { ContentCard } from './ContentCard';
export { AudioPlayer } from './AudioPlayer';
export { ErrorBoundary } from './ErrorBoundary';

// Form Components
export { Checkbox, type CheckboxProps } from './Checkbox';
export { Radio, RadioGroup, type RadioProps, type RadioGroupProps } from './Radio';
export { Switch, type SwitchProps } from './Switch';

// Feedback Components
export { Badge, type BadgeProps, type BadgeVariant, type BadgeSize } from './Badge';
export { Chip, type ChipProps, type ChipVariant, type ChipSize } from './Chip';
export { Alert, type AlertProps, type AlertVariant } from './Alert';
export { ToastProvider, useToast, type ToastOptions, type ToastVariant } from './Toast';
export {
  Skeleton,
  SkeletonText,
  SkeletonCard,
  type SkeletonProps,
  type SkeletonVariant,
} from './Skeleton';

// State Components
export { EmptyState, type EmptyStateProps } from './EmptyState';
export { ErrorState, type ErrorStateProps, type ErrorType } from './ErrorState';

// GeminiApp-Inspired Components (New Design System)
export { HeroHeader, type HeroHeaderProps } from './HeroHeader';
export { GlassCard, type GlassCardProps, type GlassVariant } from './GlassCard';
// ⚠️ MoodSelector foi movido para @/components/features/home/MoodSelector
// Use: import { MoodSelector } from '@/components/features/home';
export { AIModePicker, type AIModePickerProps, type AIMode, AI_MODE_OPTIONS } from './AIModePicker';
export {
  FloatingTabBar,
  type FloatingTabBarProps,
  type TabName,
  TAB_CONFIG,
} from './FloatingTabBar';
export { BabyTrackerCard, type BabyTrackerCardProps } from './BabyTrackerCard';

// Atomic Components (formerly primitives)
export { H1, H2, H3 } from './atoms/Heading';
export { Text, Body, Caption } from './atoms/Text';
export { Box } from './atoms/Box';
export { Stack } from './atoms/Stack';
export { Row } from './atoms/Row';
export { Container } from './atoms/Container';
