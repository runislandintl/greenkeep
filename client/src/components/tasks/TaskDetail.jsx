import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import RoleGate from '@/components/common/RoleGate';
import { TaskStatusBadge, PriorityBadge } from '@/components/common/StatusBadge';
import {
  Pencil,
  Play,
  CheckCircle2,
  PauseCircle,
  XCircle,
  MapPin,
  Users,
  CalendarDays,
  Clock,
  Timer,
  FileText,
  Repeat,
  ClipboardList,
  Wrench,
  Scissors,
  Droplets,
  Bug,
  Eye,
  Truck,
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

export default function TaskDetail({ task, onEdit, onStatusChange }) {
  const { t } = useTranslation();

  if (!task) return null;

  const TypeIcon = taskTypeIcons[task.type] || ClipboardList;
  const scheduledDate = task.scheduledDate || task.dueDate;

  const assigneeNames =
    task.assigneeNames ||
    (task.assignees || [])
      .map((a) => `${a.firstName || ''} ${a.lastName || ''}`.trim())
      .filter(Boolean) ||
    [];

  const statusActions = [
    {
      key: 'in_progress',
      label: t('task.actions.start', 'Start'),
      icon: Play,
      variant: 'default',
      show: task.status === 'pending' || task.status === 'deferred',
    },
    {
      key: 'completed',
      label: t('task.actions.complete', 'Complete'),
      icon: CheckCircle2,
      variant: 'default',
      show: task.status === 'in_progress',
    },
    {
      key: 'deferred',
      label: t('task.actions.defer', 'Defer'),
      icon: PauseCircle,
      variant: 'secondary',
      show: task.status === 'pending' || task.status === 'in_progress',
    },
    {
      key: 'cancelled',
      label: t('task.actions.cancel', 'Cancel'),
      icon: XCircle,
      variant: 'destructive',
      show: task.status !== 'completed' && task.status !== 'cancelled',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Main info card */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="rounded-full bg-primary/10 p-3 shrink-0">
                <TypeIcon className="h-6 w-6 text-primary" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <CardTitle className="text-xl">{task.title}</CardTitle>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {t(`task.type.${task.type}`, task.type)}
                </p>
              </div>
            </div>

            <RoleGate minRole="admin">
              <Button variant="outline" size="sm" onClick={() => onEdit?.(task)}>
                <Pencil className="mr-1.5 h-4 w-4" aria-hidden="true" />
                {t('common.edit', 'Edit')}
              </Button>
            </RoleGate>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Status + Priority badges */}
          <div className="flex flex-wrap gap-2">
            <TaskStatusBadge status={task.status} />
            <PriorityBadge priority={task.priority} />
          </div>

          {/* Description */}
          {task.description && (
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                <FileText className="h-3 w-3" aria-hidden="true" />
                {t('task.fields.description', 'Description')}
              </p>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{task.description}</p>
            </div>
          )}

          {/* Info grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Zone */}
            {(task.zoneName || task.zone?.name) && (
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                  <MapPin className="h-3 w-3" aria-hidden="true" />
                  {t('task.fields.zone', 'Zone')}
                </p>
                <p className="text-sm font-medium">{task.zoneName || task.zone?.name}</p>
              </div>
            )}

            {/* Assignees */}
            {assigneeNames.length > 0 && (
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                  <Users className="h-3 w-3" aria-hidden="true" />
                  {t('task.fields.assignees', 'Assignees')}
                </p>
                <div className="flex flex-wrap gap-1">
                  {(Array.isArray(assigneeNames) ? assigneeNames : [assigneeNames]).map(
                    (name, i) => (
                      <Badge key={i} variant="secondary" className="text-xs">
                        {name}
                      </Badge>
                    )
                  )}
                </div>
              </div>
            )}

            {/* Scheduled date */}
            {scheduledDate && (
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                  <CalendarDays className="h-3 w-3" aria-hidden="true" />
                  {t('task.fields.scheduledDate', 'Scheduled Date')}
                </p>
                <p className="text-sm font-medium">
                  {new Date(scheduledDate).toLocaleDateString(undefined, {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
            )}

            {/* Scheduled time */}
            {task.scheduledTime && (
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                  <Clock className="h-3 w-3" aria-hidden="true" />
                  {t('task.fields.scheduledTime', 'Scheduled Time')}
                </p>
                <p className="text-sm font-medium">{task.scheduledTime}</p>
              </div>
            )}

            {/* Duration */}
            {task.estimatedDuration && (
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                  <Timer className="h-3 w-3" aria-hidden="true" />
                  {t('task.fields.estimatedDuration', 'Estimated Duration')}
                </p>
                <p className="text-sm font-medium">
                  {task.estimatedDuration} {t('task.minutes', 'min')}
                </p>
              </div>
            )}

            {/* Recurrence */}
            {task.recurrence && task.recurrence !== 'none' && (
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                  <Repeat className="h-3 w-3" aria-hidden="true" />
                  {t('task.fields.recurrence', 'Recurrence')}
                </p>
                <p className="text-sm font-medium">
                  {t(`task.recurrence.${task.recurrence}`, task.recurrence)}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Status change actions */}
      {statusActions.some((a) => a.show) && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">
              {t('task.actions.title', 'Actions')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {statusActions
                .filter((a) => a.show)
                .map((action) => (
                  <Button
                    key={action.key}
                    variant={action.variant}
                    size="sm"
                    onClick={() => onStatusChange?.(task.id, action.key)}
                  >
                    <action.icon className="mr-1.5 h-4 w-4" aria-hidden="true" />
                    {action.label}
                  </Button>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
