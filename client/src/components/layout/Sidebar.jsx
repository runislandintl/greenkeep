import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/useAuth';
import { useFeatureFlag } from '@/hooks/useFeatureFlag';
import {
  LayoutDashboard,
  MapPin,
  CalendarDays,
  Users,
  Wrench,
  Package,
  Settings,
  Shield,
  Leaf,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Sidebar() {
  const { t } = useTranslation();
  const { isSuperadmin } = useAuth();
  const zonesEnabled = useFeatureFlag('zones');
  const tasksEnabled = useFeatureFlag('tasks');
  const teamEnabled = useFeatureFlag('team');
  const equipmentEnabled = useFeatureFlag('equipment');
  const inventoryEnabled = useFeatureFlag('inventory');

  const navItems = [
    { to: '/', icon: LayoutDashboard, label: t('nav.dashboard'), show: true },
    { to: '/zones', icon: MapPin, label: t('nav.zones'), show: zonesEnabled },
    { to: '/tasks', icon: CalendarDays, label: t('nav.tasks'), show: tasksEnabled },
    { to: '/team', icon: Users, label: t('nav.team'), show: teamEnabled },
    { to: '/equipment', icon: Wrench, label: t('nav.equipment'), show: equipmentEnabled },
    { to: '/inventory', icon: Package, label: t('nav.inventory'), show: inventoryEnabled },
    { to: '/settings', icon: Settings, label: t('nav.settings'), show: true },
    { to: '/admin/tenants', icon: Shield, label: t('nav.admin'), show: isSuperadmin },
  ];

  return (
    <aside className="fixed inset-y-0 left-0 z-50 w-64 border-r bg-card">
      {/* Logo */}
      <div className="flex items-center gap-2 px-6 py-5 border-b">
        <Leaf className="h-8 w-8 text-primary" />
        <span className="text-xl font-bold text-primary">GreenKeep</span>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-1 p-4" role="navigation" aria-label={t('nav.main')}>
        {navItems
          .filter((item) => item.show)
          .map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  'hover:bg-accent hover:text-accent-foreground',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground'
                )
              }
            >
              <item.icon className="h-5 w-5" aria-hidden="true" />
              {item.label}
            </NavLink>
          ))}
      </nav>
    </aside>
  );
}
