import { useTranslation } from 'react-i18next';
import { Wrench } from 'lucide-react';
import EmptyState from '@/components/common/EmptyState';
import EquipmentCard from '@/components/equipment/EquipmentCard';

export default function EquipmentList({ equipment = [], onItemClick, onAddEquipment }) {
  const { t } = useTranslation();

  if (equipment.length === 0) {
    return (
      <EmptyState
        icon={Wrench}
        title={t('equipment.empty')}
        description={t('equipment.emptyDesc')}
        actionLabel={onAddEquipment ? t('equipment.create') : undefined}
        onAction={onAddEquipment}
      />
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {equipment.map((item) => (
        <EquipmentCard key={item.id} equipment={item} onClick={onItemClick} />
      ))}
    </div>
  );
}
