import { useContext } from 'react';
import { SyncContext } from '../contexts/SyncContext';

export function useSync() {
  const { sync, isSyncing, lastSyncAt, pendingCount } = useContext(SyncContext);
  return { sync, isSyncing, lastSyncAt, pendingCount };
}
