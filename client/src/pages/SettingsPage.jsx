import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/useAuth';
import { useTenant } from '@/hooks/useTenant';
import RoleGate from '@/components/common/RoleGate';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Languages,
  Moon,
  Sun,
  Building2,
  Flag,
  User,
  Shield,
  Check,
} from 'lucide-react';
import { useState, useEffect } from 'react';

export default function SettingsPage() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const { tenant, featureFlags } = useTenant();

  // Theme state
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('greenkeep_theme') || 'light';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('greenkeep_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const toggleLanguage = (lang) => {
    i18n.changeLanguage(lang);
  };

  const currentLang = i18n.language;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t('settings.title')}</h1>
        <p className="text-muted-foreground">{t('settings.subtitle')}</p>
      </div>

      {/* Profile info */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <User className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
            <div>
              <CardTitle className="text-lg">{t('settings.profile')}</CardTitle>
              <CardDescription>{t('settings.profileDesc')}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-muted-foreground mb-1">{t('settings.name')}</p>
              <p className="text-sm font-medium">
                {user?.firstName} {user?.lastName}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">{t('settings.email')}</p>
              <p className="text-sm font-medium">{user?.email}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">{t('settings.role')}</p>
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                <Badge variant="outline">{t(`team.role.${user?.role}`)}</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Language toggle */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Languages className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
            <div>
              <CardTitle className="text-lg">{t('settings.language')}</CardTitle>
              <CardDescription>{t('settings.languageDesc')}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <Button
              variant={currentLang === 'fr' ? 'default' : 'outline'}
              onClick={() => toggleLanguage('fr')}
              className="flex items-center gap-2"
            >
              {currentLang === 'fr' && <Check className="h-4 w-4" aria-hidden="true" />}
              {t('settings.french')}
            </Button>
            <Button
              variant={currentLang === 'en' ? 'default' : 'outline'}
              onClick={() => toggleLanguage('en')}
              className="flex items-center gap-2"
            >
              {currentLang === 'en' && <Check className="h-4 w-4" aria-hidden="true" />}
              {t('settings.english')}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Theme toggle */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            {theme === 'dark' ? (
              <Moon className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
            ) : (
              <Sun className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
            )}
            <div>
              <CardTitle className="text-lg">{t('settings.theme')}</CardTitle>
              <CardDescription>{t('settings.themeDesc')}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <Button
              variant={theme === 'light' ? 'default' : 'outline'}
              onClick={() => setTheme('light')}
              className="flex items-center gap-2"
            >
              <Sun className="h-4 w-4" aria-hidden="true" />
              {t('settings.lightMode')}
            </Button>
            <Button
              variant={theme === 'dark' ? 'default' : 'outline'}
              onClick={() => setTheme('dark')}
              className="flex items-center gap-2"
            >
              <Moon className="h-4 w-4" aria-hidden="true" />
              {t('settings.darkMode')}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tenant info */}
      {tenant && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Building2 className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
              <div>
                <CardTitle className="text-lg">{t('settings.tenantInfo')}</CardTitle>
                <CardDescription>{t('settings.tenantInfoDesc')}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground mb-1">{t('settings.tenantName')}</p>
                <p className="text-sm font-medium">{tenant.name}</p>
              </div>
              {tenant.slug && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">{t('settings.tenantSlug')}</p>
                  <p className="text-sm font-medium font-mono">{tenant.slug}</p>
                </div>
              )}
              {tenant.plan && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">{t('settings.plan')}</p>
                  <Badge variant="secondary">{tenant.plan}</Badge>
                </div>
              )}
              {tenant.createdAt && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">{t('settings.createdAt')}</p>
                  <p className="text-sm font-medium">{new Date(tenant.createdAt).toLocaleDateString()}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Feature flags (read-only for admin) */}
      <RoleGate minRole="admin">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Flag className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
              <div>
                <CardTitle className="text-lg">{t('settings.featureFlags')}</CardTitle>
                <CardDescription>{t('settings.featureFlagsDesc')}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {Object.entries(featureFlags || {}).map(([flag, enabled]) => (
                <div
                  key={flag}
                  className="flex items-center justify-between p-3 rounded-md bg-muted/50"
                >
                  <span className="text-sm font-medium">{t(`settings.flag.${flag}`, flag)}</span>
                  <Badge variant={enabled ? 'success' : 'secondary'}>
                    {enabled ? t('settings.enabled') : t('settings.disabled')}
                  </Badge>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-3">{t('settings.featureFlagsReadOnly')}</p>
          </CardContent>
        </Card>
      </RoleGate>
    </div>
  );
}
