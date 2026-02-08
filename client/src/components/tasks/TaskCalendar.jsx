import { useState, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const priorityColors = {
  low: 'bg-secondary text-secondary-foreground',
  medium: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100',
  high: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100',
  urgent: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100',
};

const statusColors = {
  pending: 'border-l-2 border-l-muted-foreground',
  in_progress: 'border-l-2 border-l-primary',
  completed: 'border-l-2 border-l-green-500',
  cancelled: 'border-l-2 border-l-destructive opacity-50',
  deferred: 'border-l-2 border-l-yellow-500',
};

const DAY_KEYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

function getStartOfWeek(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Monday start
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

export default function TaskCalendar({ tasks = [], onTaskClick, initialDate }) {
  const { t } = useTranslation();
  const [currentDate, setCurrentDate] = useState(initialDate || new Date());

  const startOfWeek = useMemo(() => getStartOfWeek(currentDate), [currentDate]);

  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(startOfWeek);
      d.setDate(d.getDate() + i);
      return d;
    });
  }, [startOfWeek]);

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const getTasksForDate = useCallback(
    (date) => {
      const dateStr = date.toISOString().split('T')[0];
      return tasks.filter((task) => {
        const taskDate = task.scheduledDate || task.dueDate;
        return taskDate && taskDate.startsWith(dateStr);
      });
    },
    [tasks]
  );

  const prevWeek = useCallback(() => {
    setCurrentDate((prev) => {
      const d = new Date(prev);
      d.setDate(d.getDate() - 7);
      return d;
    });
  }, []);

  const nextWeek = useCallback(() => {
    setCurrentDate((prev) => {
      const d = new Date(prev);
      d.setDate(d.getDate() + 7);
      return d;
    });
  }, []);

  const goToToday = useCallback(() => {
    setCurrentDate(new Date());
  }, []);

  return (
    <div className="space-y-4">
      {/* Week navigation */}
      <div className="flex items-center justify-between">
        <Button variant="outline" size="icon" onClick={prevWeek} aria-label={t('task.prevWeek', 'Previous week')}>
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <div className="flex items-center gap-2">
          <h3 className="text-sm font-medium">
            {startOfWeek.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
            {' - '}
            {weekDays[6].toLocaleDateString(undefined, {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </h3>
          <Button variant="ghost" size="sm" onClick={goToToday} className="text-xs">
            {t('task.today', 'Today')}
          </Button>
        </div>

        <Button variant="outline" size="icon" onClick={nextWeek} aria-label={t('task.nextWeek', 'Next week')}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Week grid */}
      <div className="grid grid-cols-7 gap-2">
        {weekDays.map((day, i) => {
          const isToday = day.getTime() === today.getTime();
          const dayTasks = getTasksForDate(day);

          return (
            <div
              key={i}
              className={`rounded-lg border p-2 min-h-[140px] transition-colors ${
                isToday ? 'border-primary bg-primary/5' : 'bg-background'
              }`}
            >
              {/* Day header */}
              <div className="text-center mb-2">
                <p className="text-xs text-muted-foreground">
                  {t(`common.days.${DAY_KEYS[i]}`, DAY_KEYS[i])}
                </p>
                <p
                  className={`text-sm font-medium ${
                    isToday
                      ? 'bg-primary text-primary-foreground rounded-full w-7 h-7 flex items-center justify-center mx-auto'
                      : ''
                  }`}
                >
                  {day.getDate()}
                </p>
              </div>

              {/* Task chips */}
              <div className="space-y-1">
                {dayTasks.slice(0, 4).map((task) => (
                  <button
                    key={task.id}
                    onClick={() => onTaskClick?.(task)}
                    className={`w-full text-left text-xs px-1.5 py-1 rounded truncate cursor-pointer hover:opacity-80 transition-opacity ${
                      priorityColors[task.priority] || priorityColors.medium
                    } ${statusColors[task.status] || ''}`}
                    title={task.title}
                    aria-label={`${task.title} - ${t(`task.priority.${task.priority}`, task.priority)}`}
                  >
                    {task.scheduledTime && (
                      <span className="font-medium mr-1">{task.scheduledTime.slice(0, 5)}</span>
                    )}
                    {task.title}
                  </button>
                ))}
                {dayTasks.length > 4 && (
                  <p className="text-xs text-muted-foreground text-center font-medium">
                    +{dayTasks.length - 4} {t('common.more', 'more')}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
