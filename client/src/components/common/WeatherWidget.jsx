import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import api from '@/config/api';
import { Card, CardContent } from '@/components/ui/card';
import { Cloud, Droplets, Wind, Thermometer } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function WeatherWidget() {
  const { t } = useTranslation();

  const { data: weather, isLoading, error } = useQuery({
    queryKey: ['weather', 'current'],
    queryFn: () => api.get('/weather/current').then((r) => r.data),
    staleTime: 30 * 60 * 1000, // 30 min
    retry: 1,
  });

  if (error) return null;

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-4">
          <Skeleton className="h-16 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!weather) return null;

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={`https://openweathermap.org/img/wn/${weather.icon}@2x.png`}
              alt={weather.description}
              className="h-12 w-12"
            />
            <div>
              <p className="text-2xl font-bold">{Math.round(weather.temperature)}&deg;C</p>
              <p className="text-sm text-muted-foreground capitalize">{weather.description}</p>
            </div>
          </div>
          <div className="flex flex-col gap-1 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Wind className="h-3.5 w-3.5" aria-hidden="true" />
              <span>{Math.round(weather.windSpeed)} km/h</span>
            </div>
            <div className="flex items-center gap-1">
              <Droplets className="h-3.5 w-3.5" aria-hidden="true" />
              <span>{weather.humidity}%</span>
            </div>
            {weather.rain > 0 && (
              <div className="flex items-center gap-1">
                <Cloud className="h-3.5 w-3.5" aria-hidden="true" />
                <span>{weather.rain}mm</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
