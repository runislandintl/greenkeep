import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { InboxIcon } from 'lucide-react';

export default function EmptyState({
  icon: Icon = InboxIcon,
  title,
  description,
  actionLabel,
  onAction,
}) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center" role="status">
      <div className="rounded-full bg-muted p-4 mb-4">
        <Icon className="h-8 w-8 text-muted-foreground" aria-hidden="true" />
      </div>
      <h3 className="text-lg font-semibold mb-1">
        {title || t('common.noData')}
      </h3>
      {description && (
        <p className="text-sm text-muted-foreground mb-4 max-w-md">{description}</p>
      )}
      {actionLabel && onAction && (
        <Button onClick={onAction}>{actionLabel}</Button>
      )}
    </div>
  );
}
