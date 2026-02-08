import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/useAuth';
import { useTenant } from '@/hooks/useTenant';
import { useSync } from '@/hooks/useSync';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Globe, LogOut, RefreshCw, Leaf } from 'lucide-react';

export default function Header() {
  const { t, i18n } = useTranslation();
  const { user, logout } = useAuth();
  const { tenant } = useTenant();
  const { isSyncing, pendingCount, sync } = useSync();

  const toggleLang = () => {
    const newLang = i18n.language === 'fr' ? 'en' : 'fr';
    i18n.changeLanguage(newLang);
  };

  return (
    <header className="sticky top-0 z-40 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="flex h-14 items-center justify-between px-4 md:px-6">
        {/* Left: tenant name (mobile: + logo) */}
        <div className="flex items-center gap-2">
          <Leaf className="h-6 w-6 text-primary md:hidden" />
          <h1 className="text-sm font-semibold truncate max-w-[200px]">
            {tenant?.name || 'GreenKeep'}
          </h1>
        </div>

        {/* Right: actions */}
        <div className="flex items-center gap-2">
          {/* Sync button */}
          {pendingCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={sync}
              disabled={isSyncing}
              aria-label={t('common.sync')}
            >
              <RefreshCw className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
              <Badge variant="secondary" className="ml-1">{pendingCount}</Badge>
            </Button>
          )}

          {/* Language toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleLang}
            aria-label={t('common.switchLanguage')}
          >
            <Globe className="h-4 w-4 mr-1" />
            <span className="text-xs uppercase">{i18n.language}</span>
          </Button>

          {/* User info + logout */}
          {user && (
            <div className="flex items-center gap-2">
              <span className="hidden sm:inline text-sm text-muted-foreground">
                {user.firstName}
              </span>
              <Badge variant="outline" className="hidden sm:inline text-xs">
                {user.role}
              </Badge>
              <Button
                variant="ghost"
                size="icon"
                onClick={logout}
                aria-label={t('auth.logout')}
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
