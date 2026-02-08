import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

const EQUIPMENT_CATEGORIES = ['mowing', 'trimming', 'irrigation', 'transport', 'safety', 'tools', 'other'];
const EQUIPMENT_STATUSES = ['available', 'in_use', 'maintenance', 'broken', 'retired'];

export default function EquipmentForm({ initialData, onSubmit, isPending }) {
  const { t } = useTranslation();

  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    category: initialData?.category || '',
    brand: initialData?.brand || '',
    model: initialData?.model || '',
    serialNumber: initialData?.serialNumber || '',
    purchaseDate: initialData?.purchaseDate
      ? new Date(initialData.purchaseDate).toISOString().split('T')[0]
      : '',
    status: initialData?.status || 'available',
    location: initialData?.location || '',
    notes: initialData?.notes || '',
  });

  const handleChange = (field) => (e) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit?.(formData);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">
          {initialData ? t('equipment.edit') : t('equipment.create')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div className="space-y-2">
            <label htmlFor="eq-name" className="text-sm font-medium">
              {t('equipment.name')} *
            </label>
            <Input
              id="eq-name"
              value={formData.name}
              onChange={handleChange('name')}
              placeholder={t('equipment.namePlaceholder')}
              required
            />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <label htmlFor="eq-category" className="text-sm font-medium">
              {t('equipment.categoryLabel')} *
            </label>
            <select
              id="eq-category"
              value={formData.category}
              onChange={handleChange('category')}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              required
            >
              <option value="">{t('equipment.selectCategory')}</option>
              {EQUIPMENT_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {t(`equipment.category.${cat}`)}
                </option>
              ))}
            </select>
          </div>

          {/* Brand / Model row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="eq-brand" className="text-sm font-medium">
                {t('equipment.brand')}
              </label>
              <Input
                id="eq-brand"
                value={formData.brand}
                onChange={handleChange('brand')}
                placeholder={t('equipment.brandPlaceholder')}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="eq-model" className="text-sm font-medium">
                {t('equipment.model')}
              </label>
              <Input
                id="eq-model"
                value={formData.model}
                onChange={handleChange('model')}
                placeholder={t('equipment.modelPlaceholder')}
              />
            </div>
          </div>

          {/* Serial Number */}
          <div className="space-y-2">
            <label htmlFor="eq-serial" className="text-sm font-medium">
              {t('equipment.serialNumber')}
            </label>
            <Input
              id="eq-serial"
              value={formData.serialNumber}
              onChange={handleChange('serialNumber')}
              placeholder={t('equipment.serialNumberPlaceholder')}
            />
          </div>

          {/* Purchase Date */}
          <div className="space-y-2">
            <label htmlFor="eq-purchase-date" className="text-sm font-medium">
              {t('equipment.purchaseDate')}
            </label>
            <Input
              id="eq-purchase-date"
              type="date"
              value={formData.purchaseDate}
              onChange={handleChange('purchaseDate')}
            />
          </div>

          {/* Status */}
          <div className="space-y-2">
            <label htmlFor="eq-status" className="text-sm font-medium">
              {t('equipment.statusLabel')}
            </label>
            <select
              id="eq-status"
              value={formData.status}
              onChange={handleChange('status')}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              {EQUIPMENT_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {t(`equipment.status.${status}`)}
                </option>
              ))}
            </select>
          </div>

          {/* Location */}
          <div className="space-y-2">
            <label htmlFor="eq-location" className="text-sm font-medium">
              {t('equipment.location')}
            </label>
            <Input
              id="eq-location"
              value={formData.location}
              onChange={handleChange('location')}
              placeholder={t('equipment.locationPlaceholder')}
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <label htmlFor="eq-notes" className="text-sm font-medium">
              {t('equipment.notes')}
            </label>
            <textarea
              id="eq-notes"
              value={formData.notes}
              onChange={handleChange('notes')}
              placeholder={t('equipment.notesPlaceholder')}
              rows={3}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          {/* Submit */}
          <div className="flex justify-end gap-2 pt-2">
            <Button type="submit" disabled={isPending || !formData.name || !formData.category}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />}
              {initialData ? t('common.save') : t('equipment.create')}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
