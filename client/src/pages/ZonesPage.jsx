import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import api from '@/config/api';
import { useAuth } from '@/hooks/useAuth';
import FeatureGate from '@/components/common/FeatureGate';
import RoleGate from '@/components/common/RoleGate';
import SearchInput from '@/components/common/SearchInput';
import EmptyState from '@/components/common/EmptyState';
import { LoadingCards } from '@/components/common/LoadingState';
import { HealthBadge } from '@/components/common/StatusBadge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  MapPin,
  List,
  Map,
  Plus,
  Filter,
  TreePine,
  Flower2,
  Droplets,
  Footprints,
  AlertCircle,
  ChevronDown,
} from 'lucide-react';

const ZONE_TYPES = ['green', 'garden', 'sports', 'playground', 'water', 'forest', 'other'];
const HEALTH_OPTIONS = ['excellent', 'good', 'fair', 'poor', 'critical'];

const zoneTypeIcons = {
  green: TreePine,
  garden: Flower2,
  sports: Footprints,
  playground: Footprints,
  water: Droplets,
  forest: TreePine,
  other: MapPin,
};

function ZoneCard({ zone }) {
  const { t } = useTranslation();
  const Icon = zoneTypeIcons[zone.type] || MapPin;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2 min-w-0">
            <div className="rounded-full bg-green-100 dark:bg-green-900 p-2 shrink-0">
              <Icon className="h-4 w-4 text-green-600 dark:text-green-400" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-semibold truncate">{zone.name}</h3>
              <p className="text-xs text-muted-foreground">{t(`zone.type.${zone.type}`)}</p>
            </div>
          </div>
          <HealthBadge health={zone.health} />
        </div>

        {zone.area && (
          <p className="text-xs text-muted-foreground mb-2">
            {zone.area} m&sup2;
          </p>
        )}

        {zone.description && (
          <p className="text-xs text-muted-foreground line-clamp-2">{zone.description}</p>
        )}

        <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
          <span>
            {zone.taskCount ?? 0} {t('zone.activeTasks')}
          </span>
          {zone.lastInspection && (
            <span>{t('zone.lastInspection')}: {new Date(zone.lastInspection).toLocaleDateString()}</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function MapPlaceholder() {
  const { t } = useTranslation();
  return (
    <div className="rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/50 flex flex-col items-center justify-center min-h-[400px]">
      <Map className="h-12 w-12 text-muted-foreground/50 mb-3" aria-hidden="true" />
      <p className="text-sm text-muted-foreground font-medium">{t('zone.mapPlaceholder')}</p>
      <p className="text-xs text-muted-foreground mt-1">{t('zone.mapComingSoon')}</p>
    </div>
  );
}

export default function ZonesPage() {
  const { t } = useTranslation();
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'map'
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [healthFilter, setHealthFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ['zones', { search, type: typeFilter, health: healthFilter }],
    queryFn: () =>
      api
        .get('/zones', {
          params: {
            ...(search && { search }),
            ...(typeFilter && { type: typeFilter }),
            ...(healthFilter && { health: healthFilter }),
          },
        })
        .then((r) => r.data),
  });

  const zones = useMemo(() => data?.data || data || [], [data]);

  return (
    <FeatureGate
      feature="zones"
      fallback={
        <EmptyState
          icon={MapPin}
          title={t('common.featureDisabled')}
          description={t('common.featureDisabledDesc')}
        />
      }
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{t('zone.title')}</h1>
            <p className="text-muted-foreground">{t('zone.subtitle')}</p>
          </div>
          <div className="flex items-center gap-2">
            {/* View toggle */}
            <div className="flex items-center rounded-md border bg-background">
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                aria-label={t('zone.listView')}
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'map' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('map')}
                aria-label={t('zone.mapView')}
              >
                <Map className="h-4 w-4" />
              </Button>
            </div>

            <RoleGate minRole="admin">
              <Button onClick={() => {}}>
                <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
                {t('zone.create')}
              </Button>
            </RoleGate>
          </div>
        </div>

        {/* Search and filters */}
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <SearchInput
                value={search}
                onChange={setSearch}
                placeholder={t('zone.searchPlaceholder')}
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="sm:w-auto"
            >
              <Filter className="mr-2 h-4 w-4" aria-hidden="true" />
              {t('common.filters')}
              <ChevronDown className={`ml-2 h-4 w-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </Button>
          </div>

          {showFilters && (
            <div className="flex flex-wrap gap-3 p-4 rounded-lg border bg-muted/30">
              {/* Type filter */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">{t('zone.type.label')}</label>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="flex h-9 rounded-md border border-input bg-background px-3 py-1 text-sm"
                >
                  <option value="">{t('common.all')}</option>
                  {ZONE_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {t(`zone.type.${type}`)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Health filter */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">{t('zone.health.label')}</label>
                <select
                  value={healthFilter}
                  onChange={(e) => setHealthFilter(e.target.value)}
                  className="flex h-9 rounded-md border border-input bg-background px-3 py-1 text-sm"
                >
                  <option value="">{t('common.all')}</option>
                  {HEALTH_OPTIONS.map((h) => (
                    <option key={h} value={h}>
                      {t(`zone.health.${h}`)}
                    </option>
                  ))}
                </select>
              </div>

              {(typeFilter || healthFilter) && (
                <div className="flex items-end">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setTypeFilter('');
                      setHealthFilter('');
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
        {viewMode === 'map' ? (
          <MapPlaceholder />
        ) : isLoading ? (
          <LoadingCards count={6} />
        ) : zones.length === 0 ? (
          <EmptyState
            icon={MapPin}
            title={t('zone.empty')}
            description={t('zone.emptyDesc')}
            actionLabel={t('zone.create')}
            onAction={() => {}}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {zones.map((zone) => (
              <ZoneCard key={zone.id} zone={zone} />
            ))}
          </div>
        )}
      </div>
    </FeatureGate>
  );
}
