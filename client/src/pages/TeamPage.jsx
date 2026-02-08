import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/config/api';
import { useAuth } from '@/hooks/useAuth';
import FeatureGate from '@/components/common/FeatureGate';
import RoleGate from '@/components/common/RoleGate';
import EmptyState from '@/components/common/EmptyState';
import SearchInput from '@/components/common/SearchInput';
import { LoadingCards } from '@/components/common/LoadingState';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Users,
  Plus,
  Clock,
  LogIn,
  LogOut,
  Phone,
  Mail,
  AlertCircle,
  Loader2,
  UserCheck,
  UserX,
} from 'lucide-react';

// ---------- Member card ----------
function MemberCard({ member }) {
  const { t } = useTranslation();

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary shrink-0">
            {(member.firstName?.[0] || '?').toUpperCase()}
            {(member.lastName?.[0] || '').toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold truncate">
                {member.firstName} {member.lastName}
              </h3>
              <Badge variant={member.clockedIn ? 'success' : 'secondary'} className="shrink-0 ml-2">
                {member.clockedIn ? t('team.online') : t('team.offline')}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">{t(`team.role.${member.role}`)}</p>
          </div>
        </div>

        {/* Contact info */}
        <div className="mt-3 space-y-1">
          {member.email && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Mail className="h-3 w-3 shrink-0" aria-hidden="true" />
              <span className="truncate">{member.email}</span>
            </div>
          )}
          {member.phone && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Phone className="h-3 w-3 shrink-0" aria-hidden="true" />
              <span>{member.phone}</span>
            </div>
          )}
        </div>

        {/* Clock info */}
        {member.clockedIn && member.clockInTime && (
          <div className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
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

        {/* Current task */}
        {member.currentTask && (
          <div className="mt-2 p-2 rounded bg-muted/50 text-xs">
            <p className="font-medium truncate">{member.currentTask}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ---------- Availability overview ----------
function AvailabilityOverview({ members }) {
  const { t } = useTranslation();
  const online = members.filter((m) => m.clockedIn).length;
  const offline = members.length - online;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">{t('team.availability')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-green-50 dark:bg-green-950">
            <UserCheck className="h-5 w-5 text-green-600" aria-hidden="true" />
            <div>
              <p className="text-2xl font-bold text-green-600">{online}</p>
              <p className="text-xs text-muted-foreground">{t('team.online')}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-900">
            <UserX className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
            <div>
              <p className="text-2xl font-bold text-muted-foreground">{offline}</p>
              <p className="text-xs text-muted-foreground">{t('team.offline')}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function TeamPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');

  const { data, isLoading, error } = useQuery({
    queryKey: ['team', { search }],
    queryFn: () =>
      api
        .get('/team', { params: { ...(search && { search }) } })
        .then((r) => r.data),
  });

  const members = useMemo(() => data?.data || data || [], [data]);

  // Clock in/out mutation
  const clockMutation = useMutation({
    mutationFn: (action) => api.post(`/team/clock`, { action }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team'] });
    },
  });

  // Determine current user's clock status from team members
  const currentUserMember = members.find((m) => m.id === user?.id || m.userId === user?.id);
  const isClockedIn = currentUserMember?.clockedIn || false;

  return (
    <FeatureGate
      feature="team"
      fallback={
        <EmptyState
          icon={Users}
          title={t('common.featureDisabled')}
          description={t('common.featureDisabledDesc')}
        />
      }
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{t('team.title')}</h1>
            <p className="text-muted-foreground">{t('team.subtitle')}</p>
          </div>
          <div className="flex items-center gap-2">
            {/* Clock in/out for current user */}
            <Button
              variant={isClockedIn ? 'destructive' : 'default'}
              onClick={() => clockMutation.mutate(isClockedIn ? 'clock_out' : 'clock_in')}
              disabled={clockMutation.isPending}
            >
              {clockMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
              ) : isClockedIn ? (
                <LogOut className="mr-2 h-4 w-4" aria-hidden="true" />
              ) : (
                <LogIn className="mr-2 h-4 w-4" aria-hidden="true" />
              )}
              {isClockedIn ? t('team.clockOut') : t('team.clockIn')}
            </Button>

            <RoleGate minRole="admin">
              <Button variant="outline" onClick={() => {}}>
                <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
                {t('team.addMember')}
              </Button>
            </RoleGate>
          </div>
        </div>

        {/* Clock mutation error */}
        {clockMutation.isError && (
          <div className="flex items-center gap-2 rounded-md bg-destructive/10 border border-destructive/20 p-3" role="alert">
            <AlertCircle className="h-4 w-4 text-destructive shrink-0" aria-hidden="true" />
            <p className="text-sm text-destructive">
              {clockMutation.error?.response?.data?.message || t('team.clockError')}
            </p>
          </div>
        )}

        {/* Availability overview */}
        {!isLoading && members.length > 0 && <AvailabilityOverview members={members} />}

        {/* Search */}
        <div className="max-w-md">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder={t('team.searchPlaceholder')}
          />
        </div>

        {/* Error state */}
        {error && (
          <div className="flex items-center gap-2 rounded-md bg-destructive/10 border border-destructive/20 p-4" role="alert">
            <AlertCircle className="h-5 w-5 text-destructive shrink-0" aria-hidden="true" />
            <p className="text-sm text-destructive">{t('common.errorLoading')}</p>
          </div>
        )}

        {/* Content */}
        {isLoading ? (
          <LoadingCards count={6} />
        ) : members.length === 0 ? (
          <EmptyState
            icon={Users}
            title={t('team.empty')}
            description={t('team.emptyDesc')}
            actionLabel={t('team.addMember')}
            onAction={() => {}}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {members.map((member) => (
              <MemberCard key={member.id} member={member} />
            ))}
          </div>
        )}
      </div>
    </FeatureGate>
  );
}
