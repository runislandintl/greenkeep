import { createContext, useState, useEffect, useContext } from 'react';
import api from '../config/api';
import { AuthContext } from './AuthContext';
import { FEATURE_FLAG_DEFAULTS } from '../config/featureFlags';

export const TenantContext = createContext(null);

export function TenantProvider({ children }) {
  const { user, isAuthenticated } = useContext(AuthContext);
  const [tenant, setTenant] = useState(null);
  const [featureFlags, setFeatureFlags] = useState(FEATURE_FLAG_DEFAULTS);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user?.tenantId) {
      setLoading(true);
      Promise.all([
        api.get(`/tenants/${user.tenantId}`).catch(() => ({ data: null })),
        api.get('/feature-flags').catch(() => ({ data: FEATURE_FLAG_DEFAULTS })),
      ])
        .then(([tenantRes, flagsRes]) => {
          if (tenantRes.data) setTenant(tenantRes.data);
          if (flagsRes.data) setFeatureFlags({ ...FEATURE_FLAG_DEFAULTS, ...flagsRes.data });
        })
        .finally(() => setLoading(false));
    } else {
      setTenant(null);
      setFeatureFlags(FEATURE_FLAG_DEFAULTS);
    }
  }, [isAuthenticated, user?.tenantId]);

  const value = {
    tenant,
    featureFlags,
    loading,
    setTenant,
    isFeatureEnabled: (feature) => featureFlags[feature] === true,
  };

  return <TenantContext.Provider value={value}>{children}</TenantContext.Provider>;
}
