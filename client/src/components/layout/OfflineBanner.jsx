import { useOffline } from '@/hooks/useOffline';
import { useTranslation } from 'react-i18next';
import { WifiOff } from 'lucide-react';

export default function OfflineBanner() {
  const { isOnline } = useOffline();
  const { t } = useTranslation();

  if (isOnline) return null;

  return (
    <div
      className="bg-yellow-500 text-yellow-950 text-center text-sm py-1.5 px-4 flex items-center justify-center gap-2"
      role="alert"
      aria-live="polite"
    >
      <WifiOff className="h-4 w-4" aria-hidden="true" />
      <span>{t('common.offlineMessage')}</span>
    </div>
  );
}
