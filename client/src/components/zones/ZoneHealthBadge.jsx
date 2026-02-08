import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';

const healthConfig = {
  excellent: {
    bg: 'bg-green-100 dark:bg-green-900',
    text: 'text-green-800 dark:text-green-100',
    bar: 'bg-green-500',
  },
  good: {
    bg: 'bg-lime-100 dark:bg-lime-900',
    text: 'text-lime-800 dark:text-lime-100',
    bar: 'bg-lime-500',
  },
  fair: {
    bg: 'bg-yellow-100 dark:bg-yellow-900',
    text: 'text-yellow-800 dark:text-yellow-100',
    bar: 'bg-yellow-500',
  },
  poor: {
    bg: 'bg-orange-100 dark:bg-orange-900',
    text: 'text-orange-800 dark:text-orange-100',
    bar: 'bg-orange-500',
  },
  critical: {
    bg: 'bg-red-100 dark:bg-red-900',
    text: 'text-red-800 dark:text-red-100',
    bar: 'bg-red-500',
  },
};

const fallbackConfig = {
  bg: 'bg-gray-100 dark:bg-gray-800',
  text: 'text-gray-800 dark:text-gray-100',
  bar: 'bg-gray-400',
};

/**
 * Renders a small colored badge based on zone health value.
 * Also exports the health bar color for use in other components.
 */
export function getHealthBarColor(health) {
  return (healthConfig[health] || fallbackConfig).bar;
}

export default function ZoneHealthBadge({ health, className }) {
  const { t } = useTranslation();
  const config = healthConfig[health] || fallbackConfig;

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold',
        config.bg,
        config.text,
        className
      )}
    >
      {t(`zone.health.${health}`, health)}
    </span>
  );
}
