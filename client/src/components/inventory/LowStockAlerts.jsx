import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle } from 'lucide-react';

export default function LowStockAlerts({ items = [] }) {
  const { t } = useTranslation();

  const lowStockItems = items.filter(
    (item) => item.minStock && item.currentStock <= item.minStock
  );

  return (
    <Card className={lowStockItems.length > 0 ? 'border-destructive/50' : ''}>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          {lowStockItems.length > 0 ? (
            <AlertTriangle className="h-5 w-5 text-destructive" aria-hidden="true" />
          ) : (
            <CheckCircle className="h-5 w-5 text-green-600" aria-hidden="true" />
          )}
          <CardTitle className="text-lg">
            {t('inventory.lowStockAlerts')}
          </CardTitle>
          {lowStockItems.length > 0 && (
            <Badge variant="destructive" className="ml-auto">
              {lowStockItems.length}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {lowStockItems.length === 0 ? (
          <div className="flex flex-col items-center py-6 text-center">
            <CheckCircle className="h-8 w-8 text-green-500 mb-2" aria-hidden="true" />
            <p className="text-sm text-muted-foreground">{t('inventory.noLowStock')}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {t('inventory.noLowStockDesc')}
            </p>
          </div>
        ) : (
          <ul className="space-y-2" role="list">
            {lowStockItems.map((item) => {
              const deficit = item.minStock - item.currentStock;
              const percentOfMin =
                item.minStock > 0
                  ? Math.round((item.currentStock / item.minStock) * 100)
                  : 0;

              return (
                <li
                  key={item.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-destructive/5 border border-destructive/10"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-destructive shrink-0" aria-hidden="true" />
                      <p className="text-sm font-medium truncate">{item.name}</p>
                    </div>
                    {item.category && (
                      <p className="text-xs text-muted-foreground mt-0.5 ml-6">
                        {t(`inventory.category.${item.category}`)}
                      </p>
                    )}
                  </div>

                  <div className="text-right shrink-0 ml-4">
                    <div className="flex items-baseline gap-1">
                      <span className="text-sm font-bold text-destructive">
                        {item.currentStock}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        / {item.minStock} {item.unit}
                      </span>
                    </div>

                    {/* Mini progress bar */}
                    <div className="w-20 h-1.5 rounded-full bg-muted mt-1 ml-auto overflow-hidden">
                      <div
                        className="h-full rounded-full bg-destructive transition-all"
                        style={{ width: `${Math.min(percentOfMin, 100)}%` }}
                      />
                    </div>

                    <p className="text-[10px] text-destructive mt-0.5">
                      {t('inventory.deficit')}: {deficit} {item.unit}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
