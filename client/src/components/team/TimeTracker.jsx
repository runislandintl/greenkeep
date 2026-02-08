import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/config/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { LogIn, LogOut, Loader2, Clock, AlertCircle } from 'lucide-react';

function formatElapsed(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

export default function TimeTracker({ isClockedIn, clockInTime }) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [elapsed, setElapsed] = useState('00:00:00');

  // Live elapsed timer
  useEffect(() => {
    if (!isClockedIn || !clockInTime) {
      setElapsed('00:00:00');
      return;
    }

    const updateElapsed = () => {
      const diff = Date.now() - new Date(clockInTime).getTime();
      setElapsed(formatElapsed(diff));
    };

    updateElapsed();
    const interval = setInterval(updateElapsed, 1000);
    return () => clearInterval(interval);
  }, [isClockedIn, clockInTime]);

  const clockMutation = useMutation({
    mutationFn: (action) => api.post('/team/clock', { action }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team'] });
    },
  });

  const handleToggle = () => {
    clockMutation.mutate(isClockedIn ? 'clock_out' : 'clock_in');
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col items-center gap-4">
          {/* Status indicator */}
          <div className="flex items-center gap-2">
            <span
              className={`h-3 w-3 rounded-full ${isClockedIn ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}
              aria-hidden="true"
            />
            <span className="text-sm font-medium">
              {isClockedIn ? t('team.currentlyClockedIn') : t('team.notClockedIn')}
            </span>
          </div>

          {/* Elapsed time */}
          {isClockedIn && (
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 text-muted-foreground text-xs mb-1">
                <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                <span>
                  {t('team.clockedInSince')}{' '}
                  {new Date(clockInTime).toLocaleTimeString(undefined, {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
              <p className="text-3xl font-mono font-bold tabular-nums" aria-live="polite">
                {elapsed}
              </p>
            </div>
          )}

          {/* Big clock in/out button */}
          <Button
            size="lg"
            className={`w-full max-w-xs h-14 text-base font-semibold ${
              isClockedIn
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-green-600 hover:bg-green-700 text-white'
            }`}
            onClick={handleToggle}
            disabled={clockMutation.isPending}
          >
            {clockMutation.isPending ? (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" aria-hidden="true" />
            ) : isClockedIn ? (
              <LogOut className="mr-2 h-5 w-5" aria-hidden="true" />
            ) : (
              <LogIn className="mr-2 h-5 w-5" aria-hidden="true" />
            )}
            {isClockedIn ? t('team.clockOut') : t('team.clockIn')}
          </Button>

          {/* Error */}
          {clockMutation.isError && (
            <div className="flex items-center gap-2 text-destructive text-sm" role="alert">
              <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span>
                {clockMutation.error?.response?.data?.message || t('team.clockError')}
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
