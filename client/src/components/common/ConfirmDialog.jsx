import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';

export default function ConfirmDialog({ open, onClose, onConfirm, title, description, confirmLabel, variant = 'destructive' }) {
  const { t } = useTranslation();

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" role="dialog" aria-modal="true">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-card rounded-lg shadow-lg p-6 max-w-md w-full mx-4">
        <h2 className="text-lg font-semibold mb-2">{title || t('common.confirm')}</h2>
        {description && <p className="text-sm text-muted-foreground mb-6">{description}</p>}
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button variant={variant} onClick={onConfirm}>
            {confirmLabel || t('common.confirm')}
          </Button>
        </div>
      </div>
    </div>
  );
}
