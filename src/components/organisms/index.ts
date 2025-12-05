/**
 * Organisms Index
 *
 * Exporta todos os componentes organism do design system.
 * Inspirado no Lofee - Health Woman UI Kit.
 *
 * @see https://www.figma.com/design/fqH3Ro3Ll8sL2s3EJuW22H/Lofee---Woman-Health-UI-Mobile-Design-Kit
 */

// Period & Cycle
export { PeriodCard, type PeriodCardProps } from './PeriodCard';

// Mood Tracking
// ⚠️ MoodSelector foi movido para @/components/features/home/MoodSelector
// Use: import { MoodSelector } from '@/components/features/home';

// Calendar
export {
  CalendarStrip,
  type CalendarStripProps,
  type CalendarDay,
  type DayType,
} from './CalendarStrip';

// Content & Articles
export { ArticleCard, type ArticleCardProps, type ArticleCategory } from './ArticleCard';

// Notifications
export {
  NotificationItem,
  type NotificationItemProps,
  type NotificationType,
} from './NotificationItem';

// Existing exports (if any)
export * from './MaternalCard';

// =====================
// 🏠 Airbnb Redesign Components
// =====================

// Category Tabs
export { CategoryTabs } from './CategoryTabs';
export type { CategoryTabsProps, CategoryTab } from './CategoryTabs';

// Listing Card
export { ListingCard } from './ListingCard';
export type { ListingCardProps } from './ListingCard';

// Horizontal Card List
export { HorizontalCardList } from './HorizontalCardList';
export type { HorizontalCardListProps } from './HorizontalCardList';

// Image Grid
export { ImageGrid } from './ImageGrid';
export type { ImageGridProps } from './ImageGrid';

// Category Card (Airbnb style horizontal categories)
export { CategoryCard } from './CategoryCard';
export type { CategoryCardProps } from './CategoryCard';
