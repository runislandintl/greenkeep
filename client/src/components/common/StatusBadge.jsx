import { Badge } from '@/components/ui/badge';
import { useTranslation } from 'react-i18next';

const healthColors = {
  excellent: 'bg-green-500 text-white',
  good: 'bg-lime-500 text-white',
  fair: 'bg-yellow-500 text-white',
  poor: 'bg-orange-500 text-white',
  critical: 'bg-red-500 text-white',
};

const taskStatusColors = {
  pending: 'secondary',
  in_progress: 'default',
  completed: 'success',
  cancelled: 'destructive',
  deferred: 'warning',
};

const priorityColors = {
  low: 'secondary',
  medium: 'outline',
  high: 'warning',
  urgent: 'destructive',
};

const equipmentStatusColors = {
  available: 'success',
  in_use: 'default',
  maintenance: 'warning',
  broken: 'destructive',
  retired: 'secondary',
};

export function HealthBadge({ health }) {
  const { t } = useTranslation();
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${healthColors[health] || 'bg-gray-200'}`}>
      {t(`zone.health.${health}`)}
    </span>
  );
}

export function TaskStatusBadge({ status }) {
  const { t } = useTranslation();
  return <Badge variant={taskStatusColors[status] || 'secondary'}>{t(`task.status.${status}`)}</Badge>;
}

export function PriorityBadge({ priority }) {
  const { t } = useTranslation();
  return <Badge variant={priorityColors[priority] || 'secondary'}>{t(`task.priority.${priority}`)}</Badge>;
}

export function EquipmentStatusBadge({ status }) {
  const { t } = useTranslation();
  return <Badge variant={equipmentStatusColors[status] || 'secondary'}>{t(`equipment.status.${status}`)}</Badge>;
}
