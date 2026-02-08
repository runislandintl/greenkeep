import { useTranslation } from 'react-i18next';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Package, AlertTriangle } from 'lucide-react';
import EmptyState from '@/components/common/EmptyState';

function StockBar({ current, min, max, unit }) {
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
          <span>Min: {min} {unit}</span>
        </div>
      )}
    </div>
  );
}

export default function InventoryList({ items = [], onItemClick, onAddItem }) {
  const { t } = useTranslation();

  if (items.length === 0) {
    return (
      <EmptyState
        icon={Package}
        title={t('inventory.empty')}
        description={t('inventory.emptyDesc')}
        actionLabel={onAddItem ? t('inventory.addItem') : undefined}
        onAction={onAddItem}
      />
    );
  }

  return (
    <Card>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="text-left p-3 font-medium">{t('inventory.name')}</th>
              <th className="text-left p-3 font-medium hidden sm:table-cell">
                {t('inventory.category')}
              </th>
              <th className="text-left p-3 font-medium">{t('inventory.stock')}</th>
              <th className="text-left p-3 font-medium hidden md:table-cell">
                {t('inventory.location')}
              </th>
              <th className="text-left p-3 font-medium hidden lg:table-cell">
                {t('inventory.lastUpdated')}
              </th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => {
              const isLow = item.minStock && item.currentStock <= item.minStock;
              return (
                <tr
                  key={item.id}
                  className={`border-b last:border-0 hover:bg-muted/30 transition-colors cursor-pointer ${
                    isLow ? 'bg-destructive/5' : ''
                  }`}
                  onClick={() => onItemClick?.(item)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onItemClick?.(item);
                    }
                  }}
                >
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      {isLow && (
                        <AlertTriangle
                          className="h-4 w-4 text-destructive shrink-0"
                          aria-hidden="true"
                        />
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
                    <Badge variant="outline">
                      {t(`inventory.category.${item.category}`)}
                    </Badge>
                  </td>
                  <td className="p-3 min-w-[150px]">
                    <StockBar
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
  );
}
