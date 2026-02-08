import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import ZoneHealthBadge, { getHealthBarColor } from '@/components/zones/ZoneHealthBadge';
import {
  MapPin,
  TreePine,
  Flower2,
  Droplets,
  Footprints,
  Ruler,
  CalendarDays,
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

export default function ZoneCard({ zone, onClick }) {
  const { t } = useTranslation();
  const Icon = zoneTypeIcons[zone.type] || MapPin;
  const barColor = getHealthBarColor(zone.health);

  return (
    <Card
      className="hover:shadow-md transition-shadow cursor-pointer overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      onClick={() => onClick?.(zone)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick?.(zone);
        }
      }}
      aria-label={`${zone.name} - ${t(`zone.health.${zone.health}`, zone.health)}`}
    >
      {/* Health color indicator bar */}
      <div className={`h-1.5 w-full ${barColor}`} aria-hidden="true" />

      <CardContent className="p-4">
        {/* Header: icon, name, type + health badge */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2 min-w-0">
            <div className="rounded-full bg-green-100 dark:bg-green-900 p-2 shrink-0">
              <Icon className="h-4 w-4 text-green-600 dark:text-green-400" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-semibold truncate">{zone.name}</h3>
              <p className="text-xs text-muted-foreground">
                {t(`zone.type.${zone.type}`, zone.type)}
              </p>
            </div>
          </div>
          <ZoneHealthBadge health={zone.health} />
        </div>

        {/* Details row */}
        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          {zone.holeNumber != null && (
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3 shrink-0" aria-hidden="true" />
              {t('zone.hole', 'Hole')} {zone.holeNumber}
            </span>
          )}

          {zone.area != null && (
            <span className="flex items-center gap-1">
              <Ruler className="h-3 w-3 shrink-0" aria-hidden="true" />
              {zone.area} m&sup2;
            </span>
          )}

          {zone.lastMaintenance && (
            <span className="flex items-center gap-1">
              <CalendarDays className="h-3 w-3 shrink-0" aria-hidden="true" />
              {new Date(zone.lastMaintenance).toLocaleDateString()}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
