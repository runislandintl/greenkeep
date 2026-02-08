import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

const INVENTORY_CATEGORIES = ['fertilizer', 'pesticide', 'seeds', 'tools', 'fuel', 'parts', 'other'];
const UNITS = ['kg', 'L', 'units', 'bags', 'boxes', 'rolls', 'pairs', 'gallons', 'lbs'];

export default function InventoryForm({ initialData, onSubmit, isPending }) {
  const { t } = useTranslation();

  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    category: initialData?.category || '',
    unit: initialData?.unit || '',
    currentStock: initialData?.currentStock ?? '',
    minStock: initialData?.minStock ?? '',
    maxStock: initialData?.maxStock ?? '',
    supplier: initialData?.supplier || '',
    location: initialData?.location || '',
    unitCost: initialData?.unitCost ?? '',
    safetyDataSheetUrl: initialData?.safetyDataSheetUrl || '',
    expirationDate: initialData?.expirationDate
      ? new Date(initialData.expirationDate).toISOString().split('T')[0]
      : '',
  });

  const handleChange = (field) => (e) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleNumberChange = (field) => (e) => {
    const val = e.target.value;
    setFormData((prev) => ({ ...prev, [field]: val === '' ? '' : Number(val) }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      ...formData,
      currentStock: formData.currentStock === '' ? 0 : Number(formData.currentStock),
      minStock: formData.minStock === '' ? null : Number(formData.minStock),
      maxStock: formData.maxStock === '' ? null : Number(formData.maxStock),
      unitCost: formData.unitCost === '' ? null : Number(formData.unitCost),
      expirationDate: formData.expirationDate || null,
    };
    onSubmit?.(payload);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">
          {initialData ? t('inventory.editItem') : t('inventory.addItem')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div className="space-y-2">
            <label htmlFor="inv-name" className="text-sm font-medium">
              {t('inventory.name')} *
            </label>
            <Input
              id="inv-name"
              value={formData.name}
              onChange={handleChange('name')}
              placeholder={t('inventory.namePlaceholder')}
              required
            />
          </div>

          {/* Category / Unit row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="inv-category" className="text-sm font-medium">
                {t('inventory.categoryLabel')} *
              </label>
              <select
                id="inv-category"
                value={formData.category}
                onChange={handleChange('category')}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                required
              >
                <option value="">{t('inventory.selectCategory')}</option>
                {INVENTORY_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {t(`inventory.category.${cat}`)}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label htmlFor="inv-unit" className="text-sm font-medium">
                {t('inventory.unit')} *
              </label>
              <select
                id="inv-unit"
                value={formData.unit}
                onChange={handleChange('unit')}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                required
              >
                <option value="">{t('inventory.selectUnit')}</option>
                {UNITS.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Stock levels row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label htmlFor="inv-current" className="text-sm font-medium">
                {t('inventory.currentStock')} *
              </label>
              <Input
                id="inv-current"
                type="number"
                min="0"
                step="0.01"
                value={formData.currentStock}
                onChange={handleNumberChange('currentStock')}
                placeholder="0"
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="inv-min" className="text-sm font-medium">
                {t('inventory.minStock')}
              </label>
              <Input
                id="inv-min"
                type="number"
                min="0"
                step="0.01"
                value={formData.minStock}
                onChange={handleNumberChange('minStock')}
                placeholder="0"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="inv-max" className="text-sm font-medium">
                {t('inventory.maxStock')}
              </label>
              <Input
                id="inv-max"
                type="number"
                min="0"
                step="0.01"
                value={formData.maxStock}
                onChange={handleNumberChange('maxStock')}
                placeholder="0"
              />
            </div>
          </div>

          {/* Supplier */}
          <div className="space-y-2">
            <label htmlFor="inv-supplier" className="text-sm font-medium">
              {t('inventory.supplier')}
            </label>
            <Input
              id="inv-supplier"
              value={formData.supplier}
              onChange={handleChange('supplier')}
              placeholder={t('inventory.supplierPlaceholder')}
            />
          </div>

          {/* Location */}
          <div className="space-y-2">
            <label htmlFor="inv-location" className="text-sm font-medium">
              {t('inventory.location')}
            </label>
            <Input
              id="inv-location"
              value={formData.location}
              onChange={handleChange('location')}
              placeholder={t('inventory.locationPlaceholder')}
            />
          </div>

          {/* Unit cost / Expiration row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="inv-cost" className="text-sm font-medium">
                {t('inventory.unitCost')}
              </label>
              <Input
                id="inv-cost"
                type="number"
                min="0"
                step="0.01"
                value={formData.unitCost}
                onChange={handleNumberChange('unitCost')}
                placeholder="0.00"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="inv-expiration" className="text-sm font-medium">
                {t('inventory.expirationDate')}
              </label>
              <Input
                id="inv-expiration"
                type="date"
                value={formData.expirationDate}
                onChange={handleChange('expirationDate')}
              />
            </div>
          </div>

          {/* Safety Data Sheet URL */}
          <div className="space-y-2">
            <label htmlFor="inv-sds" className="text-sm font-medium">
              {t('inventory.safetyDataSheet')}
            </label>
            <Input
              id="inv-sds"
              type="url"
              value={formData.safetyDataSheetUrl}
              onChange={handleChange('safetyDataSheetUrl')}
              placeholder="https://"
            />
          </div>

          {/* Submit */}
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="submit"
              disabled={isPending || !formData.name || !formData.category || !formData.unit}
            >
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />}
              {initialData ? t('common.save') : t('inventory.addItem')}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
