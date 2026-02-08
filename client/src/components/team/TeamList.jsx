import { useTranslation } from 'react-i18next';
import { Users } from 'lucide-react';
import EmptyState from '@/components/common/EmptyState';
import TeamCard from '@/components/team/TeamCard';

export default function TeamList({ members = [], onMemberClick, onAddMember }) {
  const { t } = useTranslation();

  if (members.length === 0) {
    return (
      <EmptyState
        icon={Users}
        title={t('team.empty')}
        description={t('team.emptyDesc')}
        actionLabel={onAddMember ? t('team.addMember') : undefined}
        onAction={onAddMember}
      />
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {members.map((member) => (
        <TeamCard key={member.id} member={member} onClick={onMemberClick} />
      ))}
    </div>
  );
}
