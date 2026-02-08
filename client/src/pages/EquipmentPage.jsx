import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import api from '@/config/api';
import FeatureGate from '@/components/common/FeatureGate';
import RoleGate from '@/components/common/RoleGate';
import EmptyState from '@/components/common/EmptyState';
import SearchInput from '@/components/common/SearchInput';
import { LoadingCards } from '@/components/common/LoadingState';
import { EquipmentStatusBadge } from '@/components/common/StatusBadge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Wrench,
  Plus,
  Filter,
  ChevronDown,
  AlertCircle,
  Calendar,
  User,
  Tag,
  MapPin,
} from 'lucide-react';

const EQUIPMENT_STATUSES = ['available', 'in_use', 'maintenance', 'broken', 'retired'];
const EQUIPMENT_CATEGORIES = ['mowing', 'trimming', 'irrigation', 'transport', 'safety', 'tools', 'other'];

function EquipmentCard({ equipment }) {
  const { t } = useTranslation();

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2 min-w-0">
            <div className="rounded-full bg-blue-100 dark:bg-blue-900 p-2 shrink-0">
              <Wrench className="h-4 w-4 text-blue-600 dark:text-blue-400" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-semibold truncate">{equipment.name}</h3>
              {equipment.category && (
                <p className="text-xs text-muted-foreground">{t(`equipment.category.${equipment.category}`)}</p>
              )}
            </div>
          </div>
          <EquipmentStatusBadge status={equipment.status} />
        </div>

        {equipment.serialNumber && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
            <Tag className="h-3 w-3 shrink-0" aria-hidden="true" />
            <span className="truncate">{equipment.serialNumber}</span>
          </div>
        )}

        {equipment.assignedTo && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
            <User className="h-3 w-3 shrink-0" aria-hidden="true" />
            <span className="truncate">
              {equipment.assignedTo.firstName || equipment.assignedToName || t('equipment.assigned')}
            </span>
          </div>
        )}

        {equipment.location && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
            <MapPin className="h-3 w-3 shrink-0" aria-hidden="true" />
            <span className="truncate">{equipment.location}</span>
          </div>
        )}

        {equipment.nextMaintenanceDate && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-2">
            <Calendar className="h-3 w-3 shrink-0" aria-hidden="true" />
            <span>
              {t('equipment.nextMaintenance')}:{' '}
              {new Date(equipment.nextMaintenanceDate).toLocaleDateString()}
            </span>
          </div>
        )}

        {equipment.description && (
          <p className="text-xs text-muted-foreground line-clamp-2 mt-2">{equipment.description}</p>
        )}
      </CardContent>
    </Card>
  );
}

export default function EquipmentPage() {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ['equipment', { search, category: categoryFilter, status: statusFilter }],
    queryFn: () =>
      api
        .get('/equipment', {
          params: {
            ...(search && { search }),
            ...(categoryFilter && { category: categoryFilter }),
            ...(statusFilter && { status: statusFilter }),
          },
        })
        .then((r) => r.data),
  });

  const equipment = useMemo(() => data?.data || data || [], [data]);
  const activeFilterCount = [categoryFilter, statusFilter].filter(Boolean).length;

  return (
    <FeatureGate
      feature="equipment"
      fallback={
        <EmptyState
          icon={Wrench}
          title={t('common.featureDisabled')}
          description={t('common.featureDisabledDesc')}
        />
      }
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{t('equipment.title')}</h1>
            <p className="text-muted-foreground">{t('equipment.subtitle')}</p>
          </div>
          <RoleGate minRole="admin">
            <Button onClick={() => {}}>
              <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
              {t('equipment.create')}
            </Button>
          </RoleGate>
        </div>

        {/* Search and filters */}
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <SearchInput
                value={search}
                onChange={setSearch}
                placeholder={t('equipment.searchPlaceholder')}
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="sm:w-auto"
            >
              <Filter className="mr-2 h-4 w-4" aria-hidden="true" />
              {t('common.filters')}
              {activeFilterCount > 0 && (
                <Badge variant="secondary" className="ml-2 h-5 px-1.5">
                  {activeFilterCount}
                </Badge>
              )}
              <ChevronDown className={`ml-2 h-4 w-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </Button>
          </div>

          {showFilters && (
            <div className="flex flex-wrap gap-3 p-4 rounded-lg border bg-muted/30">
              {/* Category filter */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">{t('equipment.categoryLabel')}</label>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="flex h-9 rounded-md border border-input bg-background px-3 py-1 text-sm"
                >
                  <option value="">{t('common.all')}</option>
                  {EQUIPMENT_CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {t(`equipment.category.${c}`)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status filter */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">{t('equipment.statusLabel')}</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="flex h-9 rounded-md border border-input bg-background px-3 py-1 text-sm"
                >
                  <option value="">{t('common.all')}</option>
                  {EQUIPMENT_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {t(`equipment.status.${s}`)}
                    </option>
                  ))}
                </select>
              </div>

              {activeFilterCount > 0 && (
                <div className="flex items-end">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setCategoryFilter('');
                      setStatusFilter('');
                    }}
                  >
                    {t('common.clearFilters')}
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Error state */}
        {error && (
          <div className="flex items-center gap-2 rounded-md bg-destructive/10 border border-destructive/20 p-4" role="alert">
            <AlertCircle className="h-5 w-5 text-destructive shrink-0" aria-hidden="true" />
            <p className="text-sm text-destructive">{t('common.errorLoading')}</p>
          </div>
        )}

        {/* Content */}
        {isLoading ? (
          <LoadingCards count={6} />
        ) : equipment.length === 0 ? (
          <EmptyState
            icon={Wrench}
            title={t('equipment.empty')}
            description={t('equipment.emptyDesc')}
            actionLabel={t('equipment.create')}
            onAction={() => {}}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {equipment.map((item) => (
              <EquipmentCard key={item.id} equipment={item} />
            ))}
          </div>
        )}
      </div>
    </FeatureGate>
  );
}
