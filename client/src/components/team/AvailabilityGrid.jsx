import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Pencil, Check, X } from 'lucide-react';

const DAYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
const HOURS = Array.from({ length: 14 }, (_, i) => i + 6); // 6:00 - 19:00

const DEFAULT_AVAILABILITY = DAYS.reduce((acc, day) => {
  acc[day] = [];
  return acc;
}, {});

export default function AvailabilityGrid({
  availability = DEFAULT_AVAILABILITY,
  onChange,
}) {
  const { t } = useTranslation();
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(availability);
  const [isDragging, setIsDragging] = useState(false);
  const [dragMode, setDragMode] = useState(null); // 'add' or 'remove'

  const isAvailable = useCallback(
    (day, hour) => {
      const data = isEditing ? draft : availability;
      return (data[day] || []).includes(hour);
    },
    [isEditing, draft, availability]
  );

  const toggleHour = useCallback(
    (day, hour, forceMode) => {
      if (!isEditing) return;

      setDraft((prev) => {
        const hours = prev[day] || [];
        const mode = forceMode ?? (hours.includes(hour) ? 'remove' : 'add');

        let updated;
        if (mode === 'add' && !hours.includes(hour)) {
          updated = [...hours, hour].sort((a, b) => a - b);
        } else if (mode === 'remove') {
          updated = hours.filter((h) => h !== hour);
        } else {
          return prev;
        }

        return { ...prev, [day]: updated };
      });
    },
    [isEditing]
  );

  const handleMouseDown = (day, hour) => {
    if (!isEditing) return;
    const current = (draft[day] || []).includes(hour);
    const mode = current ? 'remove' : 'add';
    setIsDragging(true);
    setDragMode(mode);
    toggleHour(day, hour, mode);
  };

  const handleMouseEnter = (day, hour) => {
    if (!isEditing || !isDragging || !dragMode) return;
    toggleHour(day, hour, dragMode);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setDragMode(null);
  };

  const startEditing = () => {
    setDraft({ ...availability });
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setDraft(availability);
    setIsEditing(false);
  };

  const saveEditing = () => {
    onChange?.(draft);
    setIsEditing(false);
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{t('team.weeklyAvailability')}</CardTitle>
          <div className="flex items-center gap-2">
            {isEditing ? (
              <>
                <Button variant="ghost" size="sm" onClick={cancelEditing}>
                  <X className="mr-1 h-3.5 w-3.5" aria-hidden="true" />
                  {t('common.cancel')}
                </Button>
                <Button size="sm" onClick={saveEditing}>
                  <Check className="mr-1 h-3.5 w-3.5" aria-hidden="true" />
                  {t('common.save')}
                </Button>
              </>
            ) : (
              <Button variant="outline" size="sm" onClick={startEditing}>
                <Pencil className="mr-1 h-3.5 w-3.5" aria-hidden="true" />
                {t('common.edit')}
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Legend */}
        <div className="flex items-center gap-4 mb-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-6 rounded-sm bg-green-500/80" aria-hidden="true" />
            <span>{t('team.available')}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-6 rounded-sm bg-gray-200 dark:bg-gray-700" aria-hidden="true" />
            <span>{t('team.unavailable')}</span>
          </div>
        </div>

        {/* Grid */}
        <div
          className="overflow-x-auto select-none"
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          role="grid"
          aria-label={t('team.weeklyAvailability')}
        >
          <div className="min-w-[600px]">
            {/* Hour headers */}
            <div className="flex">
              <div className="w-12 shrink-0" />
              {HOURS.map((hour) => (
                <div
                  key={hour}
                  className="flex-1 text-center text-[10px] text-muted-foreground pb-1 font-medium"
                >
                  {`${hour}:00`}
                </div>
              ))}
            </div>

            {/* Day rows */}
            {DAYS.map((day) => (
              <div key={day} className="flex items-center" role="row">
                <div className="w-12 shrink-0 text-xs font-medium text-muted-foreground py-1 pr-2 text-right" role="rowheader">
                  {t(`team.days.${day}`)}
                </div>
                <div className="flex flex-1 gap-0.5">
                  {HOURS.map((hour) => {
                    const available = isAvailable(day, hour);
                    return (
                      <button
                        key={hour}
                        type="button"
                        className={`flex-1 h-7 rounded-sm transition-colors ${
                          available
                            ? 'bg-green-500/80 hover:bg-green-600/80'
                            : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
                        } ${isEditing ? 'cursor-pointer' : 'cursor-default'}`}
                        onMouseDown={() => handleMouseDown(day, hour)}
                        onMouseEnter={() => handleMouseEnter(day, hour)}
                        disabled={!isEditing}
                        aria-label={`${t(`team.days.${day}`)} ${hour}:00 - ${
                          available ? t('team.available') : t('team.unavailable')
                        }`}
                        role="gridcell"
                        aria-selected={available}
                      />
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {isEditing && (
          <p className="text-xs text-muted-foreground mt-3">
            {t('team.availabilityHint')}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
