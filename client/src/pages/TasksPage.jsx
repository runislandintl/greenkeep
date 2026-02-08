import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/config/api';
import { useAuth } from '@/hooks/useAuth';
import EmptyState from '@/components/common/EmptyState';
import SearchInput from '@/components/common/SearchInput';
import { LoadingCards } from '@/components/common/LoadingState';
import { TaskStatusBadge, PriorityBadge } from '@/components/common/StatusBadge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ClipboardList,
  Plus,
  List,
  Calendar,
  Filter,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  User,
  AlertCircle,
  Star,
} from 'lucide-react';

const STATUSES = ['pending', 'in_progress', 'completed', 'cancelled', 'deferred'];
const PRIORITIES = ['low', 'medium', 'high', 'urgent'];

// ---------- Simple week calendar view ----------
function WeekCalendar({ tasks, currentDate, onDateChange }) {
  const { t } = useTranslation();

  const startOfWeek = useMemo(() => {
    const d = new Date(currentDate);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Monday start
    return new Date(d.setDate(diff));
  }, [currentDate]);

  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(startOfWeek);
      d.setDate(d.getDate() + i);
      return d;
    });
  }, [startOfWeek]);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const getTasksForDate = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    return (tasks || []).filter((task) => {
      const taskDate = task.scheduledDate || task.dueDate;
      return taskDate && taskDate.startsWith(dateStr);
    });
  };

  const prevWeek = () => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() - 7);
    onDateChange(d);
  };

  const nextWeek = () => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() + 7);
    onDateChange(d);
  };

  const dayNames = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

  return (
    <div className="space-y-4">
      {/* Week navigation */}
      <div className="flex items-center justify-between">
        <Button variant="outline" size="icon" onClick={prevWeek} aria-label={t('task.prevWeek')}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h3 className="text-sm font-medium">
          {startOfWeek.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
          {' - '}
          {weekDays[6].toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
        </h3>
        <Button variant="outline" size="icon" onClick={nextWeek} aria-label={t('task.nextWeek')}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Week grid */}
      <div className="grid grid-cols-7 gap-2">
        {weekDays.map((day, i) => {
          const isToday = day.getTime() === today.getTime();
          const dayTasks = getTasksForDate(day);

          return (
            <div
              key={i}
              className={`rounded-lg border p-2 min-h-[120px] ${
                isToday ? 'border-primary bg-primary/5' : 'bg-background'
              }`}
            >
              <div className="text-center mb-2">
                <p className="text-xs text-muted-foreground">{t(`common.days.${dayNames[i]}`)}</p>
                <p className={`text-sm font-medium ${isToday ? 'text-primary' : ''}`}>
                  {day.getDate()}
                </p>
              </div>
              <div className="space-y-1">
                {dayTasks.slice(0, 3).map((task) => (
                  <div
                    key={task.id}
                    className="text-xs p-1 rounded bg-muted truncate"
                    title={task.title}
                  >
                    {task.title}
                  </div>
                ))}
                {dayTasks.length > 3 && (
                  <p className="text-xs text-muted-foreground text-center">
                    +{dayTasks.length - 3} {t('common.more')}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ---------- Task card ----------
function TaskCard({ task }) {
  const { t } = useTranslation();
  const today = new Date().toISOString().split('T')[0];
  const isToday = (task.scheduledDate || task.dueDate || '').startsWith(today);

  return (
    <Card className={`hover:shadow-md transition-shadow ${isToday ? 'ring-2 ring-primary/30' : ''}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-sm font-semibold line-clamp-2 flex-1 mr-2">{task.title}</h3>
          {isToday && (
            <Star className="h-4 w-4 text-primary shrink-0" aria-label={t('task.todayTask')} />
          )}
        </div>

        <div className="flex flex-wrap gap-2 mb-3">
          <TaskStatusBadge status={task.status} />
          <PriorityBadge priority={task.priority} />
        </div>

        {task.description && (
          <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{task.description}</p>
        )}

        <div className="space-y-1">
          {(task.zoneName || task.zone?.name) && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <MapPin className="h-3 w-3 shrink-0" aria-hidden="true" />
              <span className="truncate">{task.zoneName || task.zone?.name}</span>
            </div>
          )}
          {(task.assigneeName || task.assignee?.firstName) && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <User className="h-3 w-3 shrink-0" aria-hidden="true" />
              <span className="truncate">
                {task.assigneeName || `${task.assignee?.firstName || ''} ${task.assignee?.lastName || ''}`}
              </span>
            </div>
          )}
          {(task.scheduledDate || task.dueDate) && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Clock className="h-3 w-3 shrink-0" aria-hidden="true" />
              <span>{new Date(task.scheduledDate || task.dueDate).toLocaleDateString()}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default function TasksPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [viewMode, setViewMode] = useState('list');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [zoneFilter, setZoneFilter] = useState('');
  const [assigneeFilter, setAssigneeFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [calendarDate, setCalendarDate] = useState(new Date());

  const { data, isLoading, error } = useQuery({
    queryKey: ['tasks', { search, status: statusFilter, priority: priorityFilter, zone: zoneFilter, assignee: assigneeFilter }],
    queryFn: () =>
      api
        .get('/tasks', {
          params: {
            ...(search && { search }),
            ...(statusFilter && { status: statusFilter }),
            ...(priorityFilter && { priority: priorityFilter }),
            ...(zoneFilter && { zoneId: zoneFilter }),
            ...(assigneeFilter && { assigneeId: assigneeFilter }),
          },
        })
        .then((r) => r.data),
  });

  // Zones for filter dropdown
  const { data: zonesData } = useQuery({
    queryKey: ['zones', 'list'],
    queryFn: () => api.get('/zones').then((r) => r.data),
  });

  // Team members for filter dropdown
  const { data: teamData } = useQuery({
    queryKey: ['team', 'list'],
    queryFn: () => api.get('/team').then((r) => r.data),
  });

  const tasks = useMemo(() => data?.data || data || [], [data]);
  const zonesList = useMemo(() => zonesData?.data || zonesData || [], [zonesData]);
  const teamList = useMemo(() => teamData?.data || teamData || [], [teamData]);

  const activeFilterCount = [statusFilter, priorityFilter, zoneFilter, assigneeFilter].filter(Boolean).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t('task.title')}</h1>
          <p className="text-muted-foreground">{t('task.subtitle')}</p>
        </div>
        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="flex items-center rounded-md border bg-background">
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              aria-label={t('task.listView')}
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'calendar' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('calendar')}
              aria-label={t('task.calendarView')}
            >
              <Calendar className="h-4 w-4" />
            </Button>
          </div>

          <Button onClick={() => {}}>
            <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
            {t('task.create')}
          </Button>
        </div>
      </div>

      {/* Search and filters */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder={t('task.searchPlaceholder')}
            />
          </div>
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="sm:w-auto"
          >
            <Filter className="mr-2 h-4 w-4" aria-hidden="true" />
            {t('common.filters')}
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="ml-2 h-5 px-1.5">
                {activeFilterCount}
              </Badge>
            )}
            <ChevronDown className={`ml-2 h-4 w-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </Button>
        </div>

        {showFilters && (
          <div className="flex flex-wrap gap-3 p-4 rounded-lg border bg-muted/30">
            {/* Status filter */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">{t('task.statusLabel')}</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="flex h-9 rounded-md border border-input bg-background px-3 py-1 text-sm"
              >
                <option value="">{t('common.all')}</option>
                {STATUSES.map((s) => (
                  <option key={s} value={s}>{t(`task.status.${s}`)}</option>
                ))}
              </select>
            </div>

            {/* Priority filter */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">{t('task.priorityLabel')}</label>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="flex h-9 rounded-md border border-input bg-background px-3 py-1 text-sm"
              >
                <option value="">{t('common.all')}</option>
                {PRIORITIES.map((p) => (
                  <option key={p} value={p}>{t(`task.priority.${p}`)}</option>
                ))}
              </select>
            </div>

            {/* Zone filter */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">{t('task.zoneLabel')}</label>
              <select
                value={zoneFilter}
                onChange={(e) => setZoneFilter(e.target.value)}
                className="flex h-9 rounded-md border border-input bg-background px-3 py-1 text-sm"
              >
                <option value="">{t('common.all')}</option>
                {zonesList.map((z) => (
                  <option key={z.id} value={z.id}>{z.name}</option>
                ))}
              </select>
            </div>

            {/* Assignee filter */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">{t('task.assigneeLabel')}</label>
              <select
                value={assigneeFilter}
                onChange={(e) => setAssigneeFilter(e.target.value)}
                className="flex h-9 rounded-md border border-input bg-background px-3 py-1 text-sm"
              >
                <option value="">{t('common.all')}</option>
                {teamList.map((m) => (
                  <option key={m.id} value={m.id}>{m.firstName} {m.lastName}</option>
                ))}
              </select>
            </div>

            {activeFilterCount > 0 && (
              <div className="flex items-end">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setStatusFilter('');
                    setPriorityFilter('');
                    setZoneFilter('');
                    setAssigneeFilter('');
                  }}
                >
                  {t('common.clearFilters')}
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Error state */}
      {error && (
        <div className="flex items-center gap-2 rounded-md bg-destructive/10 border border-destructive/20 p-4" role="alert">
          <AlertCircle className="h-5 w-5 text-destructive shrink-0" aria-hidden="true" />
          <p className="text-sm text-destructive">{t('common.errorLoading')}</p>
        </div>
      )}

      {/* Content */}
      {viewMode === 'calendar' ? (
        <WeekCalendar tasks={tasks} currentDate={calendarDate} onDateChange={setCalendarDate} />
      ) : isLoading ? (
        <LoadingCards count={6} />
      ) : tasks.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title={t('task.empty')}
          description={t('task.emptyDesc')}
          actionLabel={t('task.create')}
          onAction={() => {}}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </div>
      )}
    </div>
  );
}
