import { useTranslation } from 'react-i18next';
import { Card } from '@/components/ui/card';
import { Clock } from 'lucide-react';
import EmptyState from '@/components/common/EmptyState';

function formatDuration(minutes) {
  if (!minutes && minutes !== 0) return '-';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

function formatTime(dateStr) {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatDate(dateStr) {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

export default function TimeEntryList({ entries = [] }) {
  const { t } = useTranslation();

  if (entries.length === 0) {
    return (
      <EmptyState
        icon={Clock}
        title={t('team.noTimeEntries')}
        description={t('team.noTimeEntriesDesc')}
      />
    );
  }

  return (
    <Card>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="text-left p-3 font-medium">{t('team.date')}</th>
              <th className="text-left p-3 font-medium">{t('team.clockIn')}</th>
              <th className="text-left p-3 font-medium">{t('team.clockOut')}</th>
              <th className="text-left p-3 font-medium">{t('team.duration')}</th>
              <th className="text-left p-3 font-medium hidden md:table-cell">{t('team.task')}</th>
              <th className="text-left p-3 font-medium hidden lg:table-cell">{t('team.zone')}</th>
              <th className="text-left p-3 font-medium hidden lg:table-cell">{t('team.notes')}</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry) => (
              <tr key={entry.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                <td className="p-3 font-medium whitespace-nowrap">
                  {formatDate(entry.clockIn || entry.date)}
                </td>
                <td className="p-3 whitespace-nowrap">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-green-500" aria-hidden="true" />
                    {formatTime(entry.clockIn)}
                  </span>
                </td>
                <td className="p-3 whitespace-nowrap">
                  {entry.clockOut ? (
                    <span className="inline-flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-red-500" aria-hidden="true" />
                      {formatTime(entry.clockOut)}
                    </span>
                  ) : (
                    <span className="text-muted-foreground italic">{t('team.stillActive')}</span>
                  )}
                </td>
                <td className="p-3 whitespace-nowrap font-mono text-xs">
                  {entry.duration ? formatDuration(entry.duration) : '-'}
                </td>
                <td className="p-3 hidden md:table-cell truncate max-w-[200px]">
                  {entry.taskName || entry.task || '-'}
                </td>
                <td className="p-3 hidden lg:table-cell truncate max-w-[150px]">
                  {entry.zoneName || entry.zone || '-'}
                </td>
                <td className="p-3 hidden lg:table-cell truncate max-w-[200px] text-muted-foreground">
                  {entry.notes || '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
