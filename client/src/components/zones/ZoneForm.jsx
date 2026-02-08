import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Loader2 } from 'lucide-react';

const ZONE_TYPES = ['green', 'garden', 'sports', 'playground', 'water', 'forest', 'other'];
const HEALTH_OPTIONS = ['excellent', 'good', 'fair', 'poor', 'critical'];
const GRASS_TYPES = ['bermuda', 'bentgrass', 'fescue', 'ryegrass', 'bluegrass', 'zoysia', 'other'];

const initialFormState = {
  name: '',
  type: 'green',
  holeNumber: '',
  area: '',
  grassType: '',
  health: 'good',
  notes: '',
};

export default function ZoneForm({ zone, onSubmit, onCancel, isLoading = false }) {
  const { t } = useTranslation();

  const [form, setForm] = useState({
    name: zone?.name || initialFormState.name,
    type: zone?.type || initialFormState.type,
    holeNumber: zone?.holeNumber ?? initialFormState.holeNumber,
    area: zone?.area ?? initialFormState.area,
    grassType: zone?.grassType || initialFormState.grassType,
    health: zone?.health || initialFormState.health,
    notes: zone?.notes || initialFormState.notes,
  });

  const [errors, setErrors] = useState({});

  const isEditing = Boolean(zone?.id);

  const handleChange = useCallback((field) => (e) => {
    const value = e.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));
    // Clear field error on change
    setErrors((prev) => {
      if (prev[field]) {
        const next = { ...prev };
        delete next[field];
        return next;
      }
      return prev;
    });
  }, []);

  const validate = useCallback(() => {
    const newErrors = {};

    if (!form.name.trim()) {
      newErrors.name = t('validation.required', 'This field is required');
    }

    if (!form.type) {
      newErrors.type = t('validation.required', 'This field is required');
    }

    if (form.holeNumber !== '' && form.holeNumber !== undefined) {
      const num = Number(form.holeNumber);
      if (isNaN(num) || num < 1 || num > 36) {
        newErrors.holeNumber = t('validation.holeRange', 'Must be between 1 and 36');
      }
    }

    if (form.area !== '' && form.area !== undefined) {
      const num = Number(form.area);
      if (isNaN(num) || num <= 0) {
        newErrors.area = t('validation.positiveNumber', 'Must be a positive number');
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
        holeNumber: form.holeNumber !== '' ? Number(form.holeNumber) : null,
        area: form.area !== '' ? Number(form.area) : null,
        grassType: form.grassType || null,
        notes: form.notes.trim() || null,
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
          {isEditing ? t('zone.editTitle', 'Edit Zone') : t('zone.createTitle', 'Create Zone')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          {/* Name */}
          <div className="space-y-1.5">
            <label htmlFor="zone-name" className="text-sm font-medium">
              {t('zone.fields.name', 'Name')} <span className="text-destructive">*</span>
            </label>
            <Input
              id="zone-name"
              value={form.name}
              onChange={handleChange('name')}
              placeholder={t('zone.fields.namePlaceholder', 'e.g. Green #5')}
              disabled={isLoading}
              aria-invalid={!!errors.name}
              aria-describedby={errors.name ? 'zone-name-error' : undefined}
            />
            {errors.name && (
              <p id="zone-name-error" className="text-xs text-destructive flex items-center gap-1">
                <AlertCircle className="h-3 w-3" aria-hidden="true" />
                {errors.name}
              </p>
            )}
          </div>

          {/* Type */}
          <div className="space-y-1.5">
            <label htmlFor="zone-type" className="text-sm font-medium">
              {t('zone.fields.type', 'Type')} <span className="text-destructive">*</span>
            </label>
            <select
              id="zone-type"
              value={form.type}
              onChange={handleChange('type')}
              disabled={isLoading}
              className={selectClasses}
              aria-invalid={!!errors.type}
            >
              {ZONE_TYPES.map((type) => (
                <option key={type} value={type}>
                  {t(`zone.type.${type}`, type)}
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

          {/* Hole Number + Area row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="zone-hole" className="text-sm font-medium">
                {t('zone.fields.holeNumber', 'Hole Number')}
              </label>
              <Input
                id="zone-hole"
                type="number"
                min={1}
                max={36}
                value={form.holeNumber}
                onChange={handleChange('holeNumber')}
                placeholder="1-36"
                disabled={isLoading}
                aria-invalid={!!errors.holeNumber}
                aria-describedby={errors.holeNumber ? 'zone-hole-error' : undefined}
              />
              {errors.holeNumber && (
                <p id="zone-hole-error" className="text-xs text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" aria-hidden="true" />
                  {errors.holeNumber}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <label htmlFor="zone-area" className="text-sm font-medium">
                {t('zone.fields.area', 'Area (m\u00B2)')}
              </label>
              <Input
                id="zone-area"
                type="number"
                min={0}
                step="0.1"
                value={form.area}
                onChange={handleChange('area')}
                placeholder="e.g. 450"
                disabled={isLoading}
                aria-invalid={!!errors.area}
                aria-describedby={errors.area ? 'zone-area-error' : undefined}
              />
              {errors.area && (
                <p id="zone-area-error" className="text-xs text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" aria-hidden="true" />
                  {errors.area}
                </p>
              )}
            </div>
          </div>

          {/* Grass Type */}
          <div className="space-y-1.5">
            <label htmlFor="zone-grass" className="text-sm font-medium">
              {t('zone.fields.grassType', 'Grass Type')}
            </label>
            <select
              id="zone-grass"
              value={form.grassType}
              onChange={handleChange('grassType')}
              disabled={isLoading}
              className={selectClasses}
            >
              <option value="">{t('common.select', 'Select...')}</option>
              {GRASS_TYPES.map((grass) => (
                <option key={grass} value={grass}>
                  {t(`zone.grassType.${grass}`, grass)}
                </option>
              ))}
            </select>
          </div>

          {/* Health */}
          <div className="space-y-1.5">
            <label htmlFor="zone-health" className="text-sm font-medium">
              {t('zone.fields.health', 'Health')}
            </label>
            <select
              id="zone-health"
              value={form.health}
              onChange={handleChange('health')}
              disabled={isLoading}
              className={selectClasses}
            >
              {HEALTH_OPTIONS.map((h) => (
                <option key={h} value={h}>
                  {t(`zone.health.${h}`, h)}
                </option>
              ))}
            </select>
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <label htmlFor="zone-notes" className="text-sm font-medium">
              {t('zone.fields.notes', 'Notes')}
            </label>
            <textarea
              id="zone-notes"
              value={form.notes}
              onChange={handleChange('notes')}
              rows={3}
              disabled={isLoading}
              placeholder={t('zone.fields.notesPlaceholder', 'Additional notes...')}
              className={`${selectClasses} min-h-[80px] resize-y`}
            />
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
