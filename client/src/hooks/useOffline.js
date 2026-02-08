import { useContext } from 'react';
import { SyncContext } from '../contexts/SyncContext';

export function useOffline() {
  const context = useContext(SyncContext);
  if (!context) {
    throw new Error('useOffline must be used within a SyncProvider');
  }
  return context;
}
