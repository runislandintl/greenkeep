import { useTranslation } from 'react-i18next';
import ZoneCard from '@/components/zones/ZoneCard';
import EmptyState from '@/components/common/EmptyState';
import { MapPin } from 'lucide-react';

export default function ZoneList({ zones = [], onZoneClick, emptyAction }) {
  const { t } = useTranslation();

  if (zones.length === 0) {
    return (
      <EmptyState
        icon={MapPin}
        title={t('zone.empty', 'No zones found')}
        description={t('zone.emptyDesc', 'Create your first zone to get started.')}
        actionLabel={emptyAction?.label}
        onAction={emptyAction?.onClick}
      />
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {zones.map((zone) => (
        <ZoneCard key={zone.id} zone={zone} onClick={onZoneClick} />
      ))}
    </div>
  );
}
