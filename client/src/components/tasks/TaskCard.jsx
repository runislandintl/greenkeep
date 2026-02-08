import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TaskStatusBadge, PriorityBadge } from '@/components/common/StatusBadge';
import {
  MapPin,
  Users,
  Clock,
  CalendarDays,
  Timer,
  Star,
  Wrench,
  Scissors,
  Droplets,
  Bug,
  Eye,
  Truck,
  ClipboardList,
} from 'lucide-react';

const taskTypeIcons = {
  mowing: Scissors,
  irrigation: Droplets,
  fertilization: Truck,
  inspection: Eye,
  pest_control: Bug,
  repair: Wrench,
  other: ClipboardList,
};

export default function TaskCard({ task, onClick }) {
  const { t } = useTranslation();
  const today = new Date().toISOString().split('T')[0];
  const scheduledDate = task.scheduledDate || task.dueDate;
  const isToday = scheduledDate?.startsWith(today);
  const TypeIcon = taskTypeIcons[task.type] || ClipboardList;

  const assigneeNames =
    task.assigneeNames ||
    (task.assignees || [])
      .map((a) => `${a.firstName || ''} ${a.lastName || ''}`.trim())
      .filter(Boolean)
      .join(', ') ||
    (task.assigneeName ? task.assigneeName : null);

  return (
    <Card
      className={`hover:shadow-md transition-shadow cursor-pointer ${
        isToday ? 'ring-2 ring-primary/30' : ''
      }`}
      onClick={() => onClick?.(task)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick?.(task);
        }
      }}
      aria-label={task.title}
    >
      <CardContent className="p-4">
        {/* Title + today indicator */}
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2 min-w-0 flex-1 mr-2">
            <TypeIcon className="h-4 w-4 text-muted-foreground shrink-0" aria-hidden="true" />
            <h3 className="text-sm font-semibold line-clamp-2">{task.title}</h3>
          </div>
          {isToday && (
            <Star className="h-4 w-4 text-primary shrink-0" aria-label={t('task.todayTask', 'Today')} />
          )}
        </div>

        {/* Badges: type, priority, status */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          <Badge variant="outline" className="text-xs">
            {t(`task.type.${task.type}`, task.type)}
          </Badge>
          <PriorityBadge priority={task.priority} />
          <TaskStatusBadge status={task.status} />
        </div>

        {/* Details */}
        <div className="space-y-1.5">
          {/* Zone */}
          {(task.zoneName || task.zone?.name) && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <MapPin className="h-3 w-3 shrink-0" aria-hidden="true" />
              <span className="truncate">{task.zoneName || task.zone?.name}</span>
            </div>
          )}

          {/* Assignees */}
          {assigneeNames && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Users className="h-3 w-3 shrink-0" aria-hidden="true" />
              <span className="truncate">{assigneeNames}</span>
            </div>
          )}

          {/* Scheduled date/time */}
          {scheduledDate && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <CalendarDays className="h-3 w-3 shrink-0" aria-hidden="true" />
              <span>
                {new Date(scheduledDate).toLocaleDateString()}
                {task.scheduledTime && (
                  <span className="ml-1">
                    <Clock className="inline h-3 w-3 mx-0.5" aria-hidden="true" />
                    {task.scheduledTime}
                  </span>
                )}
              </span>
            </div>
          )}

          {/* Estimated duration */}
          {task.estimatedDuration && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Timer className="h-3 w-3 shrink-0" aria-hidden="true" />
              <span>
                {task.estimatedDuration} {t('task.minutes', 'min')}
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
