import { useTranslation } from 'react-i18next';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowDownUp } from 'lucide-react';
import EmptyState from '@/components/common/EmptyState';

const TYPE_VARIANTS = {
  in: 'success',
  out: 'destructive',
  adjustment: 'warning',
  adjust: 'warning',
};

const TYPE_LABELS = {
  in: 'inventory.stockIn',
  out: 'inventory.stockOut',
  adjustment: 'inventory.adjustment',
  adjust: 'inventory.adjustment',
};

function formatDate(dateStr) {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatTime(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function MovementLog({ movements = [] }) {
  const { t } = useTranslation();

  if (movements.length === 0) {
    return (
      <EmptyState
        icon={ArrowDownUp}
        title={t('inventory.noMovements')}
        description={t('inventory.noMovementsDesc')}
      />
    );
  }

  return (
    <Card>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="text-left p-3 font-medium">{t('inventory.date')}</th>
              <th className="text-left p-3 font-medium">{t('inventory.movementType')}</th>
              <th className="text-left p-3 font-medium">{t('inventory.quantity')}</th>
              <th className="text-left p-3 font-medium hidden md:table-cell">
                {t('inventory.reason')}
              </th>
              <th className="text-left p-3 font-medium hidden lg:table-cell">
                {t('inventory.performedBy')}
              </th>
            </tr>
          </thead>
          <tbody>
            {movements.map((movement) => {
              const variant = TYPE_VARIANTS[movement.type] || 'secondary';
              const labelKey = TYPE_LABELS[movement.type] || 'inventory.movement';

              return (
                <tr
                  key={movement.id}
                  className="border-b last:border-0 hover:bg-muted/30 transition-colors"
                >
                  <td className="p-3 whitespace-nowrap">
                    <div>
                      <p className="font-medium">{formatDate(movement.date || movement.createdAt)}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatTime(movement.date || movement.createdAt)}
                      </p>
                    </div>
                  </td>
                  <td className="p-3">
                    <Badge variant={variant}>{t(labelKey)}</Badge>
                  </td>
                  <td className="p-3 font-mono">
                    <span
                      className={
                        movement.type === 'in'
                          ? 'text-green-600 dark:text-green-400'
                          : movement.type === 'out'
                            ? 'text-red-600 dark:text-red-400'
                            : 'text-yellow-600 dark:text-yellow-400'
                      }
                    >
                      {movement.type === 'in' ? '+' : movement.type === 'out' ? '-' : ''}
                      {movement.quantity}
                    </span>
                  </td>
                  <td className="p-3 hidden md:table-cell text-muted-foreground truncate max-w-[250px]">
                    {movement.reason || movement.notes || '-'}
                  </td>
                  <td className="p-3 hidden lg:table-cell text-muted-foreground">
                    {movement.performedBy?.firstName
                      ? `${movement.performedBy.firstName} ${movement.performedBy.lastName || ''}`
                      : movement.performedByName || '-'}
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
