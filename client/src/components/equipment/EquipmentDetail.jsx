import { useTranslation } from 'react-i18next';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/config/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EquipmentStatusBadge } from '@/components/common/StatusBadge';
import {
  Wrench,
  Tag,
  MapPin,
  Calendar,
  Clock,
  User,
  FileText,
  Loader2,
  AlertCircle,
  CheckCircle,
  XCircle,
  PauseCircle,
  Archive,
} from 'lucide-react';

const STATUS_ACTIONS = {
  available: { icon: CheckCircle, color: 'bg-green-600 hover:bg-green-700 text-white' },
  in_use: { icon: User, color: 'bg-blue-600 hover:bg-blue-700 text-white' },
  maintenance: { icon: PauseCircle, color: 'bg-yellow-600 hover:bg-yellow-700 text-white' },
  broken: { icon: XCircle, color: 'bg-red-600 hover:bg-red-700 text-white' },
  retired: { icon: Archive, color: 'bg-gray-600 hover:bg-gray-700 text-white' },
};

function DetailRow({ icon: Icon, label, value }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3 py-2">
      <Icon className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" aria-hidden="true" />
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium">{value}</p>
      </div>
    </div>
  );
}

export default function EquipmentDetail({ equipment }) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const statusMutation = useMutation({
    mutationFn: (newStatus) =>
      api.patch(`/equipment/${equipment.id}`, { status: newStatus }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipment'] });
    },
  });

  const availableStatuses = Object.keys(STATUS_ACTIONS).filter(
    (s) => s !== equipment.status
  );

  return (
    <div className="space-y-6">
      {/* Main info card */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-blue-100 dark:bg-blue-900 p-3">
                <Wrench className="h-6 w-6 text-blue-600 dark:text-blue-400" aria-hidden="true" />
              </div>
              <div>
                <CardTitle className="text-xl">{equipment.name}</CardTitle>
                {equipment.category && (
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {t(`equipment.category.${equipment.category}`)}
                  </p>
                )}
              </div>
            </div>
            <EquipmentStatusBadge status={equipment.status} />
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 divide-y sm:divide-y-0">
            <div className="space-y-1">
              <DetailRow
                icon={Tag}
                label={t('equipment.brand') + ' / ' + t('equipment.model')}
                value={
                  [equipment.brand, equipment.model].filter(Boolean).join(' ') || null
                }
              />
              <DetailRow
                icon={Tag}
                label={t('equipment.serialNumber')}
                value={equipment.serialNumber}
              />
              <DetailRow
                icon={Calendar}
                label={t('equipment.purchaseDate')}
                value={
                  equipment.purchaseDate
                    ? new Date(equipment.purchaseDate).toLocaleDateString()
                    : null
                }
              />
              <DetailRow
                icon={MapPin}
                label={t('equipment.location')}
                value={equipment.location}
              />
            </div>
            <div className="space-y-1 pt-2 sm:pt-0">
              <DetailRow
                icon={Clock}
                label={t('equipment.hoursUsed')}
                value={
                  equipment.hoursUsed != null
                    ? `${equipment.hoursUsed}h`
                    : null
                }
              />
              <DetailRow
                icon={Calendar}
                label={t('equipment.nextMaintenance')}
                value={
                  equipment.nextMaintenanceDate
                    ? new Date(equipment.nextMaintenanceDate).toLocaleDateString()
                    : null
                }
              />
              <DetailRow
                icon={User}
                label={t('equipment.assignedTo')}
                value={
                  equipment.assignedTo?.firstName
                    ? `${equipment.assignedTo.firstName} ${equipment.assignedTo.lastName || ''}`
                    : equipment.assignedToName || null
                }
              />
              {equipment.notes && (
                <DetailRow
                  icon={FileText}
                  label={t('equipment.notes')}
                  value={equipment.notes}
                />
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Status change card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">{t('equipment.changeStatus')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {availableStatuses.map((status) => {
              const { icon: StatusIcon, color } = STATUS_ACTIONS[status];
              return (
                <Button
                  key={status}
                  className={color}
                  size="sm"
                  onClick={() => statusMutation.mutate(status)}
                  disabled={statusMutation.isPending}
                >
                  {statusMutation.isPending && statusMutation.variables === status ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                  ) : (
                    <StatusIcon className="mr-2 h-4 w-4" aria-hidden="true" />
                  )}
                  {t(`equipment.status.${status}`)}
                </Button>
              );
            })}
          </div>

          {statusMutation.isError && (
            <div className="mt-3 flex items-center gap-2 text-destructive text-sm" role="alert">
              <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span>
                {statusMutation.error?.response?.data?.message || t('equipment.statusChangeError')}
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Usage history placeholder */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">{t('equipment.usageHistory')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Clock className="h-8 w-8 text-muted-foreground mb-2" aria-hidden="true" />
            <p className="text-sm text-muted-foreground">
              {t('equipment.usageHistoryPlaceholder')}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
