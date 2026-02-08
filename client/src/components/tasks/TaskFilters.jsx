import { useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Filter, X } from 'lucide-react';

const STATUSES = ['pending', 'in_progress', 'completed', 'cancelled', 'deferred'];
const PRIORITIES = ['low', 'medium', 'high', 'urgent'];
const TASK_TYPES = ['mowing', 'irrigation', 'fertilization', 'inspection', 'pest_control', 'repair', 'other'];

export default function TaskFilters({
  filters = {},
  onChange,
  zones = [],
  members = [],
}) {
  const { t } = useTranslation();

  const {
    status = '',
    priority = '',
    type = '',
    zoneId = '',
    assigneeId = '',
  } = filters;

  const activeFilterCount = useMemo(
    () => [status, priority, type, zoneId, assigneeId].filter(Boolean).length,
    [status, priority, type, zoneId, assigneeId]
  );

  const handleChange = useCallback(
    (field) => (e) => {
      onChange?.({ ...filters, [field]: e.target.value });
    },
    [filters, onChange]
  );

  const handleClearAll = useCallback(() => {
    onChange?.({
      status: '',
      priority: '',
      type: '',
      zoneId: '',
      assigneeId: '',
    });
  }, [onChange]);

  const selectClasses =
    'flex h-9 rounded-md border border-input bg-background px-3 py-1 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2';

  return (
    <div className="flex flex-wrap items-end gap-3 p-4 rounded-lg border bg-muted/30">
      {/* Filter icon + label */}
      <div className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground mr-1 self-center">
        <Filter className="h-4 w-4" aria-hidden="true" />
        {t('common.filters', 'Filters')}
        {activeFilterCount > 0 && (
          <Badge variant="secondary" className="h-5 px-1.5 text-xs">
            {activeFilterCount}
          </Badge>
        )}
      </div>

      {/* Status */}
      <div className="space-y-1">
        <label className="text-xs font-medium text-muted-foreground">
          {t('task.statusLabel', 'Status')}
        </label>
        <select value={status} onChange={handleChange('status')} className={selectClasses}>
          <option value="">{t('common.all', 'All')}</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {t(`task.status.${s}`, s)}
            </option>
          ))}
        </select>
      </div>

      {/* Priority */}
      <div className="space-y-1">
        <label className="text-xs font-medium text-muted-foreground">
          {t('task.priorityLabel', 'Priority')}
        </label>
        <select value={priority} onChange={handleChange('priority')} className={selectClasses}>
          <option value="">{t('common.all', 'All')}</option>
          {PRIORITIES.map((p) => (
            <option key={p} value={p}>
              {t(`task.priority.${p}`, p)}
            </option>
          ))}
        </select>
      </div>

      {/* Type */}
      <div className="space-y-1">
        <label className="text-xs font-medium text-muted-foreground">
          {t('task.typeLabel', 'Type')}
        </label>
        <select value={type} onChange={handleChange('type')} className={selectClasses}>
          <option value="">{t('common.all', 'All')}</option>
          {TASK_TYPES.map((tt) => (
            <option key={tt} value={tt}>
              {t(`task.type.${tt}`, tt)}
            </option>
          ))}
        </select>
      </div>

      {/* Zone */}
      {zones.length > 0 && (
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">
            {t('task.zoneLabel', 'Zone')}
          </label>
          <select value={zoneId} onChange={handleChange('zoneId')} className={selectClasses}>
            <option value="">{t('common.all', 'All')}</option>
            {zones.map((z) => (
              <option key={z.id} value={z.id}>
                {z.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Assignee */}
      {members.length > 0 && (
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">
            {t('task.assigneeLabel', 'Assignee')}
          </label>
          <select
            value={assigneeId}
            onChange={handleChange('assigneeId')}
            className={selectClasses}
          >
            <option value="">{t('common.all', 'All')}</option>
            {members.map((m) => (
              <option key={m.id} value={m.id}>
                {m.firstName} {m.lastName}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Clear all */}
      {activeFilterCount > 0 && (
        <Button variant="ghost" size="sm" onClick={handleClearAll} className="self-end">
          <X className="mr-1 h-3 w-3" aria-hidden="true" />
          {t('common.clearFilters', 'Clear all')}
        </Button>
      )}
    </div>
  );
}
