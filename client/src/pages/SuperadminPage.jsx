import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/config/api';
import { useAuth } from '@/hooks/useAuth';
import EmptyState from '@/components/common/EmptyState';
import SearchInput from '@/components/common/SearchInput';
import { LoadingTable } from '@/components/common/LoadingState';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  ShieldCheck,
  Plus,
  Building2,
  AlertCircle,
  Loader2,
  X,
  Check,
  ToggleLeft,
  ToggleRight,
  Users,
  Calendar,
} from 'lucide-react';

const FEATURE_FLAGS = ['zones', 'tasks', 'team', 'equipment', 'inventory', 'weather', 'iot', 'calendar'];

// ---------- Create tenant dialog ----------
function CreateTenantDialog({ open, onClose, onSubmit, isPending, error }) {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [plan, setPlan] = useState('starter');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminFirstName, setAdminFirstName] = useState('');
  const [adminLastName, setAdminLastName] = useState('');

  if (!open) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !slug.trim() || !adminEmail.trim()) return;
    onSubmit({
      name,
      slug,
      plan,
      adminEmail,
      adminFirstName,
      adminLastName,
    });
  };

  // Auto-generate slug from name
  const handleNameChange = (value) => {
    setName(value);
    if (!slug || slug === name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')) {
      setSlug(value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" role="dialog" aria-modal="true">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-card rounded-lg shadow-lg p-6 max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">{t('superadmin.createTenant')}</h2>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label={t('common.close')}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {error && (
          <div className="flex items-center gap-2 rounded-md bg-destructive/10 border border-destructive/20 p-3 mb-4" role="alert">
            <AlertCircle className="h-4 w-4 text-destructive shrink-0" aria-hidden="true" />
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <fieldset className="space-y-4">
            <legend className="text-sm font-semibold mb-2">{t('superadmin.tenantDetails')}</legend>

            <div className="space-y-2">
              <label className="text-sm font-medium">{t('superadmin.tenantName')}</label>
              <Input
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder={t('superadmin.tenantNamePlaceholder')}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">{t('superadmin.tenantSlug')}</label>
              <Input
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="my-company"
                className="font-mono"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">{t('superadmin.plan')}</label>
              <select
                value={plan}
                onChange={(e) => setPlan(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="starter">{t('superadmin.plan.starter')}</option>
                <option value="professional">{t('superadmin.plan.professional')}</option>
                <option value="enterprise">{t('superadmin.plan.enterprise')}</option>
              </select>
            </div>
          </fieldset>

          <fieldset className="space-y-4">
            <legend className="text-sm font-semibold mb-2">{t('superadmin.adminAccount')}</legend>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="text-sm font-medium">{t('superadmin.firstName')}</label>
                <Input
                  value={adminFirstName}
                  onChange={(e) => setAdminFirstName(e.target.value)}
                  placeholder={t('superadmin.firstNamePlaceholder')}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">{t('superadmin.lastName')}</label>
                <Input
                  value={adminLastName}
                  onChange={(e) => setAdminLastName(e.target.value)}
                  placeholder={t('superadmin.lastNamePlaceholder')}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">{t('superadmin.adminEmail')}</label>
              <Input
                type="email"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                placeholder={t('superadmin.adminEmailPlaceholder')}
                required
              />
            </div>
          </fieldset>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" disabled={isPending || !name.trim() || !slug.trim() || !adminEmail.trim()}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />}
              {t('superadmin.createTenant')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ---------- Feature flags editor ----------
function FeatureFlagToggle({ tenantId, flag, enabled, onToggle, isPending }) {
  const { t } = useTranslation();

  return (
    <button
      onClick={() => onToggle(tenantId, flag, !enabled)}
      disabled={isPending}
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
        enabled
          ? 'bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900 dark:text-green-100'
          : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400'
      }`}
      aria-label={`${flag}: ${enabled ? t('settings.enabled') : t('settings.disabled')}`}
    >
      {enabled ? (
        <ToggleRight className="h-3 w-3" aria-hidden="true" />
      ) : (
        <ToggleLeft className="h-3 w-3" aria-hidden="true" />
      )}
      {t(`settings.flag.${flag}`, flag)}
    </button>
  );
}

export default function SuperadminPage() {
  const { t } = useTranslation();
  const { user, isSuperadmin } = useAuth();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  // Redirect if not superadmin
  if (!isSuperadmin) {
    return (
      <EmptyState
        icon={ShieldCheck}
        title={t('superadmin.accessDenied')}
        description={t('superadmin.accessDeniedDesc')}
      />
    );
  }

  const { data, isLoading, error } = useQuery({
    queryKey: ['superadmin', 'tenants', { search }],
    queryFn: () =>
      api
        .get('/superadmin/tenants', { params: { ...(search && { search }) } })
        .then((r) => r.data),
  });

  const tenants = useMemo(() => data?.data || data || [], [data]);

  // Create tenant mutation
  const createMutation = useMutation({
    mutationFn: (tenantData) => api.post('/superadmin/tenants', tenantData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['superadmin', 'tenants'] });
      setShowCreateDialog(false);
    },
  });

  // Toggle feature flag mutation
  const flagMutation = useMutation({
    mutationFn: ({ tenantId, flag, enabled }) =>
      api.put(`/superadmin/tenants/${tenantId}/features`, { [flag]: enabled }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['superadmin', 'tenants'] });
    },
  });

  const handleToggleFlag = (tenantId, flag, enabled) => {
    flagMutation.mutate({ tenantId, flag, enabled });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck className="h-6 w-6 text-primary" aria-hidden="true" />
            <h1 className="text-2xl font-bold tracking-tight">{t('superadmin.title')}</h1>
          </div>
          <p className="text-muted-foreground">{t('superadmin.subtitle')}</p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
          {t('superadmin.createTenant')}
        </Button>
      </div>

      {/* Search */}
      <div className="max-w-md">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder={t('superadmin.searchPlaceholder')}
        />
      </div>

      {/* Error state */}
      {error && (
        <div className="flex items-center gap-2 rounded-md bg-destructive/10 border border-destructive/20 p-4" role="alert">
          <AlertCircle className="h-5 w-5 text-destructive shrink-0" aria-hidden="true" />
          <p className="text-sm text-destructive">{t('common.errorLoading')}</p>
        </div>
      )}

      {/* Flag toggle error */}
      {flagMutation.isError && (
        <div className="flex items-center gap-2 rounded-md bg-destructive/10 border border-destructive/20 p-3" role="alert">
          <AlertCircle className="h-4 w-4 text-destructive shrink-0" aria-hidden="true" />
          <p className="text-sm text-destructive">{t('superadmin.flagError')}</p>
        </div>
      )}

      {/* Content */}
      {isLoading ? (
        <LoadingTable rows={5} cols={4} />
      ) : tenants.length === 0 ? (
        <EmptyState
          icon={Building2}
          title={t('superadmin.noTenants')}
          description={t('superadmin.noTenantsDesc')}
          actionLabel={t('superadmin.createTenant')}
          onAction={() => setShowCreateDialog(true)}
        />
      ) : (
        <div className="space-y-4">
          {tenants.map((tenant) => (
            <Card key={tenant.id}>
              <CardContent className="p-4">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                  {/* Tenant info */}
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="rounded-full bg-primary/10 p-2 shrink-0">
                      <Building2 className="h-5 w-5 text-primary" aria-hidden="true" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-sm font-semibold">{tenant.name}</h3>
                        <Badge
                          variant={
                            tenant.status === 'active'
                              ? 'success'
                              : tenant.status === 'suspended'
                              ? 'destructive'
                              : 'secondary'
                          }
                        >
                          {t(`superadmin.status.${tenant.status}`)}
                        </Badge>
                        {tenant.plan && (
                          <Badge variant="outline">{tenant.plan}</Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground font-mono mt-0.5">{tenant.slug}</p>

                      <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-muted-foreground">
                        {tenant.userCount !== undefined && (
                          <div className="flex items-center gap-1">
                            <Users className="h-3 w-3" aria-hidden="true" />
                            <span>{tenant.userCount} {t('superadmin.users')}</span>
                          </div>
                        )}
                        {tenant.createdAt && (
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" aria-hidden="true" />
                            <span>{new Date(tenant.createdAt).toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Feature flags */}
                  <div className="flex flex-wrap gap-1.5 shrink-0">
                    {FEATURE_FLAGS.map((flag) => (
                      <FeatureFlagToggle
                        key={flag}
                        tenantId={tenant.id}
                        flag={flag}
                        enabled={tenant.featureFlags?.[flag] ?? false}
                        onToggle={handleToggleFlag}
                        isPending={flagMutation.isPending}
                      />
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create tenant dialog */}
      <CreateTenantDialog
        open={showCreateDialog}
        onClose={() => {
          setShowCreateDialog(false);
          createMutation.reset();
        }}
        onSubmit={(data) => createMutation.mutate(data)}
        isPending={createMutation.isPending}
        error={createMutation.error?.response?.data?.message || (createMutation.isError ? t('superadmin.createError') : null)}
      />
    </div>
  );
}
