import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import RoleGate from '@/components/common/RoleGate';
import ZoneHealthBadge from '@/components/zones/ZoneHealthBadge';
import {
  MapPin,
  TreePine,
  Flower2,
  Droplets,
  Footprints,
  Pencil,
  Trash2,
  Ruler,
  CalendarDays,
  Leaf,
  FileText,
  Activity,
} from 'lucide-react';

const zoneTypeIcons = {
  green: TreePine,
  garden: Flower2,
  sports: Footprints,
  playground: Footprints,
  water: Droplets,
  forest: TreePine,
  other: MapPin,
};

export default function ZoneDetail({ zone, onEdit, onDelete }) {
  const { t } = useTranslation();

  if (!zone) return null;

  const Icon = zoneTypeIcons[zone.type] || MapPin;

  return (
    <div className="space-y-6">
      {/* Main info card */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="rounded-full bg-green-100 dark:bg-green-900 p-3 shrink-0">
                <Icon className="h-6 w-6 text-green-600 dark:text-green-400" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <CardTitle className="text-xl truncate">{zone.name}</CardTitle>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {t(`zone.type.${zone.type}`, zone.type)}
                  {zone.holeNumber != null && (
                    <span className="ml-2">
                      &middot; {t('zone.hole', 'Hole')} {zone.holeNumber}
                    </span>
                  )}
                </p>
              </div>
            </div>

            <RoleGate minRole="admin">
              <div className="flex items-center gap-2 shrink-0">
                <Button variant="outline" size="sm" onClick={() => onEdit?.(zone)}>
                  <Pencil className="mr-1.5 h-4 w-4" aria-hidden="true" />
                  {t('common.edit', 'Edit')}
                </Button>
                <Button variant="destructive" size="sm" onClick={() => onDelete?.(zone)}>
                  <Trash2 className="mr-1.5 h-4 w-4" aria-hidden="true" />
                  {t('common.delete', 'Delete')}
                </Button>
              </div>
            </RoleGate>
          </div>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Health */}
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {t('zone.fields.health', 'Health')}
              </p>
              <ZoneHealthBadge health={zone.health} />
            </div>

            {/* Area */}
            {zone.area != null && (
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                  <Ruler className="h-3 w-3" aria-hidden="true" />
                  {t('zone.fields.area', 'Area')}
                </p>
                <p className="text-sm font-medium">{zone.area} m&sup2;</p>
              </div>
            )}

            {/* Grass Type */}
            {zone.grassType && (
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                  <Leaf className="h-3 w-3" aria-hidden="true" />
                  {t('zone.fields.grassType', 'Grass Type')}
                </p>
                <p className="text-sm font-medium">
                  {t(`zone.grassType.${zone.grassType}`, zone.grassType)}
                </p>
              </div>
            )}

            {/* Last Maintenance */}
            {zone.lastMaintenance && (
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                  <CalendarDays className="h-3 w-3" aria-hidden="true" />
                  {t('zone.fields.lastMaintenance', 'Last Maintenance')}
                </p>
                <p className="text-sm font-medium">
                  {new Date(zone.lastMaintenance).toLocaleDateString()}
                </p>
              </div>
            )}
          </div>

          {/* Notes */}
          {zone.notes && (
            <div className="mt-6 space-y-1">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                <FileText className="h-3 w-3" aria-hidden="true" />
                {t('zone.fields.notes', 'Notes')}
              </p>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{zone.notes}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sensor data placeholder */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Activity className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
            {t('zone.sensorData', 'Sensor Data')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/50 flex flex-col items-center justify-center py-12">
            <Activity className="h-10 w-10 text-muted-foreground/40 mb-3" aria-hidden="true" />
            <p className="text-sm text-muted-foreground font-medium">
              {t('zone.sensorPlaceholder', 'Sensor data will appear here')}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {t('zone.sensorComingSoon', 'IoT integration coming soon')}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
