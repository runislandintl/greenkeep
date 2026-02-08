import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { EquipmentStatusBadge } from '@/components/common/StatusBadge';
import {
  Wrench,
  Scissors,
  Droplets,
  Truck,
  ShieldCheck,
  Hammer,
  Package,
  Tag,
  Clock,
  Calendar,
} from 'lucide-react';

const CATEGORY_ICONS = {
  mowing: Scissors,
  trimming: Scissors,
  irrigation: Droplets,
  transport: Truck,
  safety: ShieldCheck,
  tools: Hammer,
  other: Package,
};

export default function EquipmentCard({ equipment, onClick }) {
  const { t } = useTranslation();

  const CategoryIcon = CATEGORY_ICONS[equipment.category] || Wrench;

  return (
    <Card
      className="hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => onClick?.(equipment)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick?.(equipment);
        }
      }}
    >
      <CardContent className="p-4">
        {/* Header: Icon + Name + Status */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2 min-w-0">
            <div className="rounded-full bg-blue-100 dark:bg-blue-900 p-2 shrink-0">
              <CategoryIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-semibold truncate">{equipment.name}</h3>
              {(equipment.brand || equipment.model) && (
                <p className="text-xs text-muted-foreground truncate">
                  {[equipment.brand, equipment.model].filter(Boolean).join(' ')}
                </p>
              )}
            </div>
          </div>
          <EquipmentStatusBadge status={equipment.status} />
        </div>

        {/* Serial number */}
        {equipment.serialNumber && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
            <Tag className="h-3 w-3 shrink-0" aria-hidden="true" />
            <span className="truncate font-mono">{equipment.serialNumber}</span>
          </div>
        )}

        {/* Hours used */}
        {equipment.hoursUsed != null && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
            <Clock className="h-3 w-3 shrink-0" aria-hidden="true" />
            <span>
              {equipment.hoursUsed} {t('equipment.hoursUsed')}
            </span>
          </div>
        )}

        {/* Next service date */}
        {equipment.nextMaintenanceDate && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-2">
            <Calendar className="h-3 w-3 shrink-0" aria-hidden="true" />
            <span>
              {t('equipment.nextMaintenance')}:{' '}
              {new Date(equipment.nextMaintenanceDate).toLocaleDateString()}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
