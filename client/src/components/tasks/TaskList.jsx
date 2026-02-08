import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import TaskCard from '@/components/tasks/TaskCard';
import EmptyState from '@/components/common/EmptyState';
import { ClipboardList } from 'lucide-react';

/**
 * Renders a list of TaskCard components.
 * Supports optional grouping by date.
 */
export default function TaskList({
  tasks = [],
  onTaskClick,
  groupByDate = false,
  emptyAction,
}) {
  const { t } = useTranslation();

  const groupedTasks = useMemo(() => {
    if (!groupByDate || tasks.length === 0) return null;

    const groups = {};

    tasks.forEach((task) => {
      const dateStr = task.scheduledDate || task.dueDate;
      const key = dateStr ? dateStr.split('T')[0] : '__unscheduled__';
      if (!groups[key]) groups[key] = [];
      groups[key].push(task);
    });

    // Sort groups by date, unscheduled last
    return Object.entries(groups).sort(([a], [b]) => {
      if (a === '__unscheduled__') return 1;
      if (b === '__unscheduled__') return -1;
      return a.localeCompare(b);
    });
  }, [tasks, groupByDate]);

  if (tasks.length === 0) {
    return (
      <EmptyState
        icon={ClipboardList}
        title={t('task.empty', 'No tasks found')}
        description={t('task.emptyDesc', 'Create your first task to get started.')}
        actionLabel={emptyAction?.label}
        onAction={emptyAction?.onClick}
      />
    );
  }

  // Grouped rendering
  if (groupedTasks) {
    return (
      <div className="space-y-6">
        {groupedTasks.map(([dateKey, dateTasks]) => (
          <section key={dateKey}>
            <h3 className="text-sm font-semibold text-muted-foreground mb-3">
              {dateKey === '__unscheduled__'
                ? t('task.unscheduled', 'Unscheduled')
                : new Date(dateKey + 'T00:00:00').toLocaleDateString(undefined, {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {dateTasks.map((task) => (
                <TaskCard key={task.id} task={task} onClick={onTaskClick} />
              ))}
            </div>
          </section>
        ))}
      </div>
    );
  }

  // Flat rendering
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {tasks.map((task) => (
        <TaskCard key={task.id} task={task} onClick={onTaskClick} />
      ))}
    </div>
  );
}
