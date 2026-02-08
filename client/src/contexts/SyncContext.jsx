import { createContext, useState, useEffect, useCallback, useContext } from 'react';
import api from '../config/api';
import db, { getPendingSync, clearPendingSync, getSyncMeta, saveSyncMeta, saveToOffline } from '../config/offlineDb';
import { AuthContext } from './AuthContext';

export const SyncContext = createContext(null);

export function SyncProvider({ children }) {
  const { isAuthenticated } = useContext(AuthContext);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncAt, setLastSyncAt] = useState(null);
  const [pendingCount, setPendingCount] = useState(0);

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Update pending count
  useEffect(() => {
    const updateCount = async () => {
      const pending = await getPendingSync();
      setPendingCount(pending.length);
    };
    updateCount();
    const interval = setInterval(updateCount, 10000);
    return () => clearInterval(interval);
  }, []);

  // Auto-sync when coming back online
  useEffect(() => {
    if (isOnline && isAuthenticated && pendingCount > 0) {
      sync();
    }
  }, [isOnline, isAuthenticated]);

  const sync = useCallback(async () => {
    if (isSyncing || !isOnline || !isAuthenticated) return;

    setIsSyncing(true);
    try {
      // Push pending changes
      const pending = await getPendingSync();
      if (pending.length > 0) {
        const changes = {};
        for (const item of pending) {
          if (!changes[item.collection]) changes[item.collection] = [];
          changes[item.collection].push(item.data);
        }

        const { data: pushResult } = await api.post('/sync/push', { changes });

        // Clear synced items
        const syncedIds = pending.map((p) => p.id);
        await clearPendingSync(syncedIds);
      }

      // Pull server changes
      const syncMeta = await getSyncMeta();
      const { data: pullResult } = await api.post('/sync/pull', {
        lastSyncVersions: syncMeta,
      });

      // Save pulled data to offline DB
      for (const [collection, records] of Object.entries(pullResult)) {
        await saveToOffline(collection, records);

        // Update sync version
        const maxVersion = Math.max(...records.map((r) => r._syncVersion || 0));
        await saveSyncMeta(collection, maxVersion);
      }

      setLastSyncAt(new Date());
      setPendingCount(0);
    } catch (error) {
      console.error('Sync failed:', error);
    } finally {
      setIsSyncing(false);
    }
  }, [isSyncing, isOnline, isAuthenticated]);

  const value = {
    isOnline,
    isSyncing,
    lastSyncAt,
    pendingCount,
    sync,
  };

  return <SyncContext.Provider value={value}>{children}</SyncContext.Provider>;
}
