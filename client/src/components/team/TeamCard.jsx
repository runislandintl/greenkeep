import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Phone, Clock } from 'lucide-react';

function getInitials(firstName, lastName) {
  const first = (firstName?.[0] || '?').toUpperCase();
  const last = (lastName?.[0] || '').toUpperCase();
  return `${first}${last}`;
}

export default function TeamCard({ member, onClick }) {
  const { t } = useTranslation();

  const initials = getInitials(member.firstName, member.lastName);
  const isClockedIn = member.clockedIn || false;

  return (
    <Card
      className="hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => onClick?.(member)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick?.(member);
        }
      }}
    >
      <CardContent className="p-4">
        {/* Header: Avatar + Name + Status */}
        <div className="flex items-start gap-3">
          <div className="relative shrink-0">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
              {initials}
            </div>
            <span
              className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white dark:border-gray-900 ${
                isClockedIn ? 'bg-green-500' : 'bg-gray-400'
              }`}
              aria-label={isClockedIn ? t('team.online') : t('team.offline')}
            />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-semibold truncate">
              {member.firstName} {member.lastName}
            </h3>
            {member.position && (
              <p className="text-xs text-muted-foreground truncate">{member.position}</p>
            )}
          </div>
        </div>

        {/* Skills tags */}
        {member.skills?.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1">
            {member.skills.map((skill) => (
              <Badge key={skill} variant="secondary" className="text-[10px] px-1.5 py-0">
                {skill}
              </Badge>
            ))}
          </div>
        )}

        {/* Phone */}
        {member.phone && (
          <div className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
            <Phone className="h-3 w-3 shrink-0" aria-hidden="true" />
            <span>{member.phone}</span>
          </div>
        )}

        {/* Clock in info */}
        {isClockedIn && member.clockInTime && (
          <div className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock className="h-3 w-3 shrink-0" aria-hidden="true" />
            <span>
              {t('team.clockedInSince')}{' '}
              {new Date(member.clockInTime).toLocaleTimeString(undefined, {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
