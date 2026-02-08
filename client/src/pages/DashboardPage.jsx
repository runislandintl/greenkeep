import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import api from '@/config/api';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import WeatherWidget from '@/components/common/WeatherWidget';
import FeatureGate from '@/components/common/FeatureGate';
import { HealthBadge, TaskStatusBadge, PriorityBadge } from '@/components/common/StatusBadge';
import {
  MapPin,
  ClipboardList,
  Users,
  Package,
  Plus,
  ArrowRight,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Wifi,
  WifiOff,
  Calendar,
} from 'lucide-react';

// ---------- Stats counter card ----------
function StatCard({ icon: Icon, label, value, color, isLoading, onClick }) {
  return (
    <Card
      className={`cursor-pointer hover:shadow-md transition-shadow ${onClick ? '' : 'pointer-events-none'}`}
      onClick={onClick}
    >
      <CardContent className="p-4 flex items-center gap-4">
        <div className={`rounded-full p-2.5 ${color}`}>
          <Icon className="h-5 w-5 text-white" aria-hidden="true" />
        </div>
        <div className="min-w-0">
          <p className="text-sm text-muted-foreground truncate">{label}</p>
          {isLoading ? (
            <Skeleton className="h-7 w-12 mt-1" />
          ) : (
            <p className="text-2xl font-bold">{value ?? 0}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// ---------- Quick action button ----------
function QuickAction({ icon: Icon, label, onClick }) {
  return (
    <Button variant="outline" className="flex flex-col items-center gap-2 h-auto py-4 px-6" onClick={onClick}>
      <Icon className="h-5 w-5" aria-hidden="true" />
      <span className="text-xs">{label}</span>
    </Button>
  );
}

export default function DashboardPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();

  // ---------- Data queries ----------
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: () => api.get('/dashboard/stats').then((r) => r.data),
  });

  const { data: todayTasks, isLoading: tasksLoading } = useQuery({
    queryKey: ['dashboard', 'todayTasks'],
    queryFn: () => api.get('/tasks', { params: { date: 'today', limit: 5 } }).then((r) => r.data),
  });

  const { data: zones, isLoading: zonesLoading } = useQuery({
    queryKey: ['dashboard', 'zones'],
    queryFn: () => api.get('/zones', { params: { limit: 6 } }).then((r) => r.data),
  });

  const { data: teamStatus, isLoading: teamLoading } = useQuery({
    queryKey: ['dashboard', 'teamStatus'],
    queryFn: () => api.get('/team/status').then((r) => r.data),
  });

  const { data: lowStock, isLoading: stockLoading } = useQuery({
    queryKey: ['dashboard', 'lowStock'],
    queryFn: () => api.get('/inventory/low-stock').then((r) => r.data),
  });

  // ---------- Helpers ----------
  const tasksList = todayTasks?.data || todayTasks || [];
  const zonesList = zones?.data || zones || [];
  const teamList = teamStatus?.data || teamStatus || [];
  const lowStockList = lowStock?.data || lowStock || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t('dashboard.title')}</h1>
        <p className="text-muted-foreground">
          {t('dashboard.welcome', { name: user?.firstName || user?.name || '' })}
        </p>
      </div>

      {/* Weather */}
      <FeatureGate feature="weather">
        <WeatherWidget />
      </FeatureGate>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={MapPin}
          label={t('dashboard.totalZones')}
          value={stats?.totalZones}
          color="bg-green-600"
          isLoading={statsLoading}
          onClick={() => navigate('/zones')}
        />
        <StatCard
          icon={ClipboardList}
          label={t('dashboard.tasksToday')}
          value={stats?.tasksToday}
          color="bg-blue-600"
          isLoading={statsLoading}
          onClick={() => navigate('/tasks')}
        />
        <StatCard
          icon={Users}
          label={t('dashboard.teamOnline')}
          value={stats?.teamOnline}
          color="bg-purple-600"
          isLoading={statsLoading}
          onClick={() => navigate('/team')}
        />
        <StatCard
          icon={AlertTriangle}
          label={t('dashboard.lowStockItems')}
          value={stats?.lowStockItems}
          color="bg-orange-600"
          isLoading={statsLoading}
          onClick={() => navigate('/inventory')}
        />
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's tasks */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg">{t('dashboard.todaysTasks')}</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => navigate('/tasks')}>
              {t('common.viewAll')}
              <ArrowRight className="ml-1 h-4 w-4" aria-hidden="true" />
            </Button>
          </CardHeader>
          <CardContent>
            {tasksLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : tasksList.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-green-500" aria-hidden="true" />
                <p className="text-sm">{t('dashboard.noTasksToday')}</p>
              </div>
            ) : (
              <ul className="space-y-2" role="list">
                {tasksList.map((task) => (
                  <li
                    key={task.id}
                    className="flex items-center justify-between p-3 rounded-md bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{task.title}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {task.zoneName || task.zone?.name || ''}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <PriorityBadge priority={task.priority} />
                      <TaskStatusBadge status={task.status} />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Zones health overview */}
        <FeatureGate feature="zones">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg">{t('dashboard.zonesHealth')}</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => navigate('/zones')}>
                {t('common.viewAll')}
                <ArrowRight className="ml-1 h-4 w-4" aria-hidden="true" />
              </Button>
            </CardHeader>
            <CardContent>
              {zonesLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-10 w-full" />
                  ))}
                </div>
              ) : zonesList.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <MapPin className="h-8 w-8 mx-auto mb-2 opacity-50" aria-hidden="true" />
                  <p className="text-sm">{t('dashboard.noZones')}</p>
                </div>
              ) : (
                <ul className="space-y-2" role="list">
                  {zonesList.map((zone) => (
                    <li
                      key={zone.id}
                      className="flex items-center justify-between p-3 rounded-md bg-muted/50 hover:bg-muted transition-colors"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate">{zone.name}</p>
                        <p className="text-xs text-muted-foreground">{t(`zone.type.${zone.type}`)}</p>
                      </div>
                      <HealthBadge health={zone.health} />
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </FeatureGate>

        {/* Team status */}
        <FeatureGate feature="team">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg">{t('dashboard.teamStatus')}</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => navigate('/team')}>
                {t('common.viewAll')}
                <ArrowRight className="ml-1 h-4 w-4" aria-hidden="true" />
              </Button>
            </CardHeader>
            <CardContent>
              {teamLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-10 w-full" />
                  ))}
                </div>
              ) : teamList.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-8 w-8 mx-auto mb-2 opacity-50" aria-hidden="true" />
                  <p className="text-sm">{t('dashboard.noTeamMembers')}</p>
                </div>
              ) : (
                <ul className="space-y-2" role="list">
                  {teamList.slice(0, 5).map((member) => (
                    <li
                      key={member.id}
                      className="flex items-center justify-between p-3 rounded-md bg-muted/50"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium text-primary shrink-0">
                          {(member.firstName?.[0] || member.name?.[0] || '?').toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">
                            {member.firstName} {member.lastName}
                          </p>
                          <p className="text-xs text-muted-foreground">{t(`team.role.${member.role}`)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {member.clockedIn ? (
                          <Wifi className="h-4 w-4 text-green-500" aria-hidden="true" />
                        ) : (
                          <WifiOff className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                        )}
                        <span className="text-xs text-muted-foreground">
                          {member.clockedIn ? t('team.online') : t('team.offline')}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </FeatureGate>

        {/* Low stock alerts */}
        <FeatureGate feature="inventory">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg">{t('dashboard.lowStockAlerts')}</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => navigate('/inventory')}>
                {t('common.viewAll')}
                <ArrowRight className="ml-1 h-4 w-4" aria-hidden="true" />
              </Button>
            </CardHeader>
            <CardContent>
              {stockLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-10 w-full" />
                  ))}
                </div>
              ) : lowStockList.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Package className="h-8 w-8 mx-auto mb-2 opacity-50" aria-hidden="true" />
                  <p className="text-sm">{t('dashboard.noLowStock')}</p>
                </div>
              ) : (
                <ul className="space-y-2" role="list">
                  {lowStockList.slice(0, 5).map((item) => (
                    <li
                      key={item.id}
                      className="flex items-center justify-between p-3 rounded-md bg-destructive/5 border border-destructive/10"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate">{item.name}</p>
                        <p className="text-xs text-muted-foreground">{item.category}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-semibold text-destructive">
                          {item.currentStock} {item.unit}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {t('inventory.minStock')}: {item.minStock}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </FeatureGate>
      </div>

      {/* Quick actions */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">{t('dashboard.quickActions')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <QuickAction
              icon={ClipboardList}
              label={t('task.create')}
              onClick={() => navigate('/tasks?action=create')}
            />
            <FeatureGate feature="zones">
              <QuickAction
                icon={MapPin}
                label={t('zone.viewMap')}
                onClick={() => navigate('/zones?view=map')}
              />
            </FeatureGate>
            <FeatureGate feature="team">
              <QuickAction
                icon={Clock}
                label={t('team.clockIn')}
                onClick={() => navigate('/team?action=clock')}
              />
            </FeatureGate>
            <FeatureGate feature="inventory">
              <QuickAction
                icon={Package}
                label={t('inventory.recordMovement')}
                onClick={() => navigate('/inventory?action=movement')}
              />
            </FeatureGate>
            <QuickAction
              icon={Calendar}
              label={t('dashboard.viewCalendar')}
              onClick={() => navigate('/tasks?view=calendar')}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
