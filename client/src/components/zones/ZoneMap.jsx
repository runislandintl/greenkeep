import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Map, MapPin } from 'lucide-react';

/**
 * Placeholder for future Mapbox integration.
 * Accepts zones GeoJSON data as prop for future use.
 */
export default function ZoneMap({ zones, className }) {
  const { t } = useTranslation();

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Map className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
          {t('zone.mapTitle', 'Zone Map')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div
          className="rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/50 flex flex-col items-center justify-center min-h-[400px]"
          role="img"
          aria-label={t('zone.mapPlaceholder', 'Map placeholder')}
        >
          <div className="relative mb-4">
            <Map className="h-16 w-16 text-muted-foreground/30" aria-hidden="true" />
            <MapPin
              className="h-6 w-6 text-primary/50 absolute -top-1 -right-1"
              aria-hidden="true"
            />
          </div>
          <p className="text-sm text-muted-foreground font-medium">
            {t('zone.mapPlaceholder', 'Interactive map coming soon')}
          </p>
          <p className="text-xs text-muted-foreground mt-1 max-w-xs text-center">
            {t(
              'zone.mapComingSoon',
              'Mapbox integration will allow you to visualize zones on an interactive map.'
            )}
          </p>
          {zones && (
            <p className="text-xs text-muted-foreground mt-3">
              {t('zone.mapZoneCount', '{{count}} zone(s) ready for mapping', {
                count: Array.isArray(zones?.features) ? zones.features.length : 0,
              })}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
