import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Loader2 } from 'lucide-react';

const TASK_TYPES = ['mowing', 'irrigation', 'fertilization', 'inspection', 'pest_control', 'repair', 'other'];
const PRIORITIES = ['low', 'medium', 'high', 'urgent'];
const RECURRENCE_OPTIONS = ['none', 'daily', 'weekly', 'biweekly', 'monthly'];

const initialFormState = {
  title: '',
  description: '',
  type: 'mowing',
  priority: 'medium',
  scheduledDate: '',
  scheduledTime: '',
  estimatedDuration: '',
  zoneId: '',
  assigneeIds: [],
  recurrence: 'none',
};

export default function TaskForm({
  task,
  zones = [],
  members = [],
  onSubmit,
  onCancel,
  isLoading = false,
}) {
  const { t } = useTranslation();

  const [form, setForm] = useState({
    title: task?.title || initialFormState.title,
    description: task?.description || initialFormState.description,
    type: task?.type || initialFormState.type,
    priority: task?.priority || initialFormState.priority,
    scheduledDate: task?.scheduledDate
      ? task.scheduledDate.split('T')[0]
      : initialFormState.scheduledDate,
    scheduledTime: task?.scheduledTime || initialFormState.scheduledTime,
    estimatedDuration: task?.estimatedDuration ?? initialFormState.estimatedDuration,
    zoneId: task?.zoneId || task?.zone?.id || initialFormState.zoneId,
    assigneeIds: task?.assigneeIds || (task?.assignees || []).map((a) => a.id) || initialFormState.assigneeIds,
    recurrence: task?.recurrence || initialFormState.recurrence,
  });

  const [errors, setErrors] = useState({});
  const isEditing = Boolean(task?.id);

  const handleChange = useCallback(
    (field) => (e) => {
      const value = e.target.value;
      setForm((prev) => ({ ...prev, [field]: value }));
      setErrors((prev) => {
        if (prev[field]) {
          const next = { ...prev };
          delete next[field];
          return next;
        }
        return prev;
      });
    },
    []
  );

  const handleAssigneeToggle = useCallback((memberId) => {
    setForm((prev) => {
      const ids = prev.assigneeIds.includes(memberId)
        ? prev.assigneeIds.filter((id) => id !== memberId)
        : [...prev.assigneeIds, memberId];
      return { ...prev, assigneeIds: ids };
    });
  }, []);

  const validate = useCallback(() => {
    const newErrors = {};

    if (!form.title.trim()) {
      newErrors.title = t('validation.required', 'This field is required');
    }

    if (!form.type) {
      newErrors.type = t('validation.required', 'This field is required');
    }

    if (!form.priority) {
      newErrors.priority = t('validation.required', 'This field is required');
    }

    if (form.estimatedDuration !== '' && form.estimatedDuration !== undefined) {
      const num = Number(form.estimatedDuration);
      if (isNaN(num) || num <= 0) {
        newErrors.estimatedDuration = t('validation.positiveNumber', 'Must be a positive number');
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [form, t]);

  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault();
      if (!validate()) return;

      const payload = {
        ...form,
        estimatedDuration: form.estimatedDuration !== '' ? Number(form.estimatedDuration) : null,
        zoneId: form.zoneId || null,
        description: form.description.trim() || null,
        scheduledDate: form.scheduledDate || null,
        scheduledTime: form.scheduledTime || null,
        recurrence: form.recurrence === 'none' ? null : form.recurrence,
      };

      onSubmit?.(payload);
    },
    [form, validate, onSubmit]
  );

  const selectClasses =
    'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50';

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">
          {isEditing ? t('task.editTitle', 'Edit Task') : t('task.createTitle', 'Create Task')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          {/* Title */}
          <div className="space-y-1.5">
            <label htmlFor="task-title" className="text-sm font-medium">
              {t('task.fields.title', 'Title')} <span className="text-destructive">*</span>
            </label>
            <Input
              id="task-title"
              value={form.title}
              onChange={handleChange('title')}
              placeholder={t('task.fields.titlePlaceholder', 'e.g. Mow Green #5')}
              disabled={isLoading}
              aria-invalid={!!errors.title}
              aria-describedby={errors.title ? 'task-title-error' : undefined}
            />
            {errors.title && (
              <p id="task-title-error" className="text-xs text-destructive flex items-center gap-1">
                <AlertCircle className="h-3 w-3" aria-hidden="true" />
                {errors.title}
              </p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label htmlFor="task-description" className="text-sm font-medium">
              {t('task.fields.description', 'Description')}
            </label>
            <textarea
              id="task-description"
              value={form.description}
              onChange={handleChange('description')}
              rows={3}
              disabled={isLoading}
              placeholder={t('task.fields.descriptionPlaceholder', 'Task details...')}
              className={`${selectClasses} min-h-[80px] resize-y`}
            />
          </div>

          {/* Type + Priority row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="task-type" className="text-sm font-medium">
                {t('task.fields.type', 'Type')} <span className="text-destructive">*</span>
              </label>
              <select
                id="task-type"
                value={form.type}
                onChange={handleChange('type')}
                disabled={isLoading}
                className={selectClasses}
                aria-invalid={!!errors.type}
              >
                {TASK_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {t(`task.type.${type}`, type)}
                  </option>
                ))}
              </select>
              {errors.type && (
                <p className="text-xs text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" aria-hidden="true" />
                  {errors.type}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <label htmlFor="task-priority" className="text-sm font-medium">
                {t('task.fields.priority', 'Priority')} <span className="text-destructive">*</span>
              </label>
              <select
                id="task-priority"
                value={form.priority}
                onChange={handleChange('priority')}
                disabled={isLoading}
                className={selectClasses}
                aria-invalid={!!errors.priority}
              >
                {PRIORITIES.map((p) => (
                  <option key={p} value={p}>
                    {t(`task.priority.${p}`, p)}
                  </option>
                ))}
              </select>
              {errors.priority && (
                <p className="text-xs text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" aria-hidden="true" />
                  {errors.priority}
                </p>
              )}
            </div>
          </div>

          {/* Scheduled Date + Time row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="task-date" className="text-sm font-medium">
                {t('task.fields.scheduledDate', 'Scheduled Date')}
              </label>
              <Input
                id="task-date"
                type="date"
                value={form.scheduledDate}
                onChange={handleChange('scheduledDate')}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="task-time" className="text-sm font-medium">
                {t('task.fields.scheduledTime', 'Scheduled Time')}
              </label>
              <Input
                id="task-time"
                type="time"
                value={form.scheduledTime}
                onChange={handleChange('scheduledTime')}
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Estimated Duration */}
          <div className="space-y-1.5">
            <label htmlFor="task-duration" className="text-sm font-medium">
              {t('task.fields.estimatedDuration', 'Estimated Duration (min)')}
            </label>
            <Input
              id="task-duration"
              type="number"
              min={1}
              value={form.estimatedDuration}
              onChange={handleChange('estimatedDuration')}
              placeholder="e.g. 60"
              disabled={isLoading}
              aria-invalid={!!errors.estimatedDuration}
              aria-describedby={errors.estimatedDuration ? 'task-duration-error' : undefined}
            />
            {errors.estimatedDuration && (
              <p id="task-duration-error" className="text-xs text-destructive flex items-center gap-1">
                <AlertCircle className="h-3 w-3" aria-hidden="true" />
                {errors.estimatedDuration}
              </p>
            )}
          </div>

          {/* Zone select */}
          <div className="space-y-1.5">
            <label htmlFor="task-zone" className="text-sm font-medium">
              {t('task.fields.zone', 'Zone')}
            </label>
            <select
              id="task-zone"
              value={form.zoneId}
              onChange={handleChange('zoneId')}
              disabled={isLoading}
              className={selectClasses}
            >
              <option value="">{t('common.select', 'Select...')}</option>
              {zones.map((z) => (
                <option key={z.id} value={z.id}>
                  {z.name}
                </option>
              ))}
            </select>
          </div>

          {/* Assignees - multi-select checkboxes */}
          {members.length > 0 && (
            <fieldset className="space-y-1.5">
              <legend className="text-sm font-medium">
                {t('task.fields.assignees', 'Assignees')}
              </legend>
              <div className="rounded-md border border-input bg-background p-3 max-h-48 overflow-y-auto space-y-2">
                {members.map((member) => (
                  <label
                    key={member.id}
                    className="flex items-center gap-2 text-sm cursor-pointer hover:bg-muted/50 rounded px-1 py-0.5"
                  >
                    <input
                      type="checkbox"
                      checked={form.assigneeIds.includes(member.id)}
                      onChange={() => handleAssigneeToggle(member.id)}
                      disabled={isLoading}
                      className="rounded border-input text-primary focus:ring-ring h-4 w-4"
                    />
                    <span>
                      {member.firstName} {member.lastName}
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>
          )}

          {/* Recurrence */}
          <div className="space-y-1.5">
            <label htmlFor="task-recurrence" className="text-sm font-medium">
              {t('task.fields.recurrence', 'Recurrence')}
            </label>
            <select
              id="task-recurrence"
              value={form.recurrence}
              onChange={handleChange('recurrence')}
              disabled={isLoading}
              className={selectClasses}
            >
              {RECURRENCE_OPTIONS.map((r) => (
                <option key={r} value={r}>
                  {t(`task.recurrence.${r}`, r)}
                </option>
              ))}
            </select>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
                {t('common.cancel', 'Cancel')}
              </Button>
            )}
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />}
              {isEditing ? t('common.save', 'Save') : t('common.create', 'Create')}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
