import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useFeatureFlag } from '@/hooks/useFeatureFlag';
import { LayoutDashboard, MapPin, CalendarDays, Users, Package } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function MobileNav() {
  const { t } = useTranslation();
  const zonesEnabled = useFeatureFlag('zones');
  const tasksEnabled = useFeatureFlag('tasks');
  const teamEnabled = useFeatureFlag('team');
  const inventoryEnabled = useFeatureFlag('inventory');

  const navItems = [
    { to: '/', icon: LayoutDashboard, label: t('nav.dashboard'), show: true },
    { to: '/zones', icon: MapPin, label: t('nav.zones'), show: zonesEnabled },
    { to: '/tasks', icon: CalendarDays, label: t('nav.tasks'), show: tasksEnabled },
    { to: '/team', icon: Users, label: t('nav.team'), show: teamEnabled },
    { to: '/inventory', icon: Package, label: t('nav.inventory'), show: inventoryEnabled },
  ];

  const visibleItems = navItems.filter((item) => item.show).slice(0, 5);

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 border-t bg-card safe-area-bottom"
      role="navigation"
      aria-label={t('nav.mobile')}
    >
      <div className="flex items-center justify-around py-2">
        {visibleItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              cn(
                'flex flex-col items-center gap-1 px-3 py-1 text-xs font-medium transition-colors rounded-lg',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                isActive ? 'text-primary' : 'text-muted-foreground'
              )
            }
          >
            <item.icon className="h-5 w-5" aria-hidden="true" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
