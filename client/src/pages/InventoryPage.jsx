import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/config/api';
import FeatureGate from '@/components/common/FeatureGate';
import RoleGate from '@/components/common/RoleGate';
import EmptyState from '@/components/common/EmptyState';
import SearchInput from '@/components/common/SearchInput';
import { LoadingTable } from '@/components/common/LoadingState';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Package,
  Plus,
  ArrowDownUp,
  AlertTriangle,
  AlertCircle,
  Filter,
  ChevronDown,
  Loader2,
  X,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';

const INVENTORY_CATEGORIES = ['fertilizer', 'pesticide', 'seeds', 'tools', 'fuel', 'parts', 'other'];

// ---------- Stock level bar ----------
function StockLevel({ current, min, max, unit }) {
  const percentage = max ? Math.min((current / max) * 100, 100) : current > 0 ? 100 : 0;
  const isLow = min && current <= min;

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className={`font-medium ${isLow ? 'text-destructive' : ''}`}>
          {current} {unit}
        </span>
        {max && (
          <span className="text-muted-foreground">
            / {max} {unit}
          </span>
        )}
      </div>
      <div className="h-2 rounded-full bg-muted overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${
            isLow ? 'bg-destructive' : percentage > 50 ? 'bg-green-500' : 'bg-yellow-500'
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {isLow && (
        <div className="flex items-center gap-1 text-xs text-destructive">
          <AlertTriangle className="h-3 w-3" aria-hidden="true" />
          <span>
            {min && `Min: ${min} ${unit}`}
          </span>
        </div>
      )}
    </div>
  );
}

// ---------- Record movement dialog ----------
function MovementDialog({ open, onClose, items, onSubmit, isPending }) {
  const { t } = useTranslation();
  const [itemId, setItemId] = useState('');
  const [type, setType] = useState('in');
  const [quantity, setQuantity] = useState('');
  const [notes, setNotes] = useState('');

  if (!open) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!itemId || !quantity) return;
    onSubmit({
      inventoryItemId: itemId,
      type,
      quantity: Number(quantity),
      notes,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" role="dialog" aria-modal="true">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-card rounded-lg shadow-lg p-6 max-w-md w-full mx-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">{t('inventory.recordMovement')}</h2>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label={t('common.close')}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">{t('inventory.item')}</label>
            <select
              value={itemId}
              onChange={(e) => setItemId(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              required
            >
              <option value="">{t('inventory.selectItem')}</option>
              {(items || []).map((item) => (
                <option key={item.id} value={item.id}>{item.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">{t('inventory.movementType')}</label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={type === 'in' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setType('in')}
                className="flex-1"
              >
                <ArrowDown className="mr-1 h-3 w-3" aria-hidden="true" />
                {t('inventory.stockIn')}
              </Button>
              <Button
                type="button"
                variant={type === 'out' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setType('out')}
                className="flex-1"
              >
                <ArrowUp className="mr-1 h-3 w-3" aria-hidden="true" />
                {t('inventory.stockOut')}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">{t('inventory.quantity')}</label>
            <Input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="0"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">{t('inventory.notes')}</label>
            <Input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t('inventory.notesPlaceholder')}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" disabled={isPending || !itemId || !quantity}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />}
              {t('inventory.recordMovement')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function InventoryPage() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [showLowOnly, setShowLowOnly] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showMovementDialog, setShowMovementDialog] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ['inventory', { search, category: categoryFilter, lowStock: showLowOnly }],
    queryFn: () =>
      api
        .get('/inventory', {
          params: {
            ...(search && { search }),
            ...(categoryFilter && { category: categoryFilter }),
            ...(showLowOnly && { lowStock: true }),
          },
        })
        .then((r) => r.data),
  });

  const items = useMemo(() => data?.data || data || [], [data]);

  const movementMutation = useMutation({
    mutationFn: (movement) => api.post('/inventory/movements', movement),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      setShowMovementDialog(false);
    },
  });

  const activeFilterCount = [categoryFilter, showLowOnly].filter(Boolean).length;

  return (
    <FeatureGate
      feature="inventory"
      fallback={
        <EmptyState
          icon={Package}
          title={t('common.featureDisabled')}
          description={t('common.featureDisabledDesc')}
        />
      }
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{t('inventory.title')}</h1>
            <p className="text-muted-foreground">{t('inventory.subtitle')}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => setShowMovementDialog(true)}>
              <ArrowDownUp className="mr-2 h-4 w-4" aria-hidden="true" />
              {t('inventory.recordMovement')}
            </Button>
            <RoleGate minRole="admin">
              <Button onClick={() => {}}>
                <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
                {t('inventory.addItem')}
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
                placeholder={t('inventory.searchPlaceholder')}
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
                <label className="text-xs font-medium text-muted-foreground">{t('inventory.categoryLabel')}</label>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="flex h-9 rounded-md border border-input bg-background px-3 py-1 text-sm"
                >
                  <option value="">{t('common.all')}</option>
                  {INVENTORY_CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {t(`inventory.category.${c}`)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Low stock toggle */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">{t('inventory.stockLevel')}</label>
                <Button
                  variant={showLowOnly ? 'destructive' : 'outline'}
                  size="sm"
                  onClick={() => setShowLowOnly(!showLowOnly)}
                  className="flex items-center gap-1.5"
                >
                  <AlertTriangle className="h-3 w-3" aria-hidden="true" />
                  {t('inventory.lowStockOnly')}
                </Button>
              </div>

              {activeFilterCount > 0 && (
                <div className="flex items-end">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setCategoryFilter('');
                      setShowLowOnly(false);
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

        {/* Movement error */}
        {movementMutation.isError && (
          <div className="flex items-center gap-2 rounded-md bg-destructive/10 border border-destructive/20 p-3" role="alert">
            <AlertCircle className="h-4 w-4 text-destructive shrink-0" aria-hidden="true" />
            <p className="text-sm text-destructive">
              {movementMutation.error?.response?.data?.message || t('inventory.movementError')}
            </p>
          </div>
        )}

        {/* Content */}
        {isLoading ? (
          <LoadingTable rows={6} cols={5} />
        ) : items.length === 0 ? (
          <EmptyState
            icon={Package}
            title={showLowOnly ? t('inventory.noLowStock') : t('inventory.empty')}
            description={showLowOnly ? t('inventory.noLowStockDesc') : t('inventory.emptyDesc')}
            actionLabel={!showLowOnly ? t('inventory.addItem') : undefined}
            onAction={!showLowOnly ? () => {} : undefined}
          />
        ) : (
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left p-3 font-medium">{t('inventory.name')}</th>
                    <th className="text-left p-3 font-medium hidden sm:table-cell">{t('inventory.category')}</th>
                    <th className="text-left p-3 font-medium">{t('inventory.stock')}</th>
                    <th className="text-left p-3 font-medium hidden md:table-cell">{t('inventory.location')}</th>
                    <th className="text-left p-3 font-medium hidden lg:table-cell">{t('inventory.lastUpdated')}</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => {
                    const isLow = item.minStock && item.currentStock <= item.minStock;
                    return (
                      <tr
                        key={item.id}
                        className={`border-b last:border-0 hover:bg-muted/30 transition-colors ${
                          isLow ? 'bg-destructive/5' : ''
                        }`}
                      >
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            {isLow && (
                              <AlertTriangle className="h-4 w-4 text-destructive shrink-0" aria-hidden="true" />
                            )}
                            <div>
                              <p className="font-medium">{item.name}</p>
                              <p className="text-xs text-muted-foreground sm:hidden">
                                {t(`inventory.category.${item.category}`)}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="p-3 hidden sm:table-cell">
                          <Badge variant="outline">{t(`inventory.category.${item.category}`)}</Badge>
                        </td>
                        <td className="p-3 min-w-[150px]">
                          <StockLevel
                            current={item.currentStock}
                            min={item.minStock}
                            max={item.maxStock}
                            unit={item.unit}
                          />
                        </td>
                        <td className="p-3 hidden md:table-cell text-muted-foreground">
                          {item.location || '-'}
                        </td>
                        <td className="p-3 hidden lg:table-cell text-muted-foreground">
                          {item.updatedAt
                            ? new Date(item.updatedAt).toLocaleDateString()
                            : '-'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* Movement dialog */}
        <MovementDialog
          open={showMovementDialog}
          onClose={() => setShowMovementDialog(false)}
          items={items}
          onSubmit={(data) => movementMutation.mutate(data)}
          isPending={movementMutation.isPending}
        />
      </div>
    </FeatureGate>
  );
}
