import { createContext, useState, useEffect, useCallback } from 'react';
import api from '../config/api';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user from token on mount
  useEffect(() => {
    const token = localStorage.getItem('greenkeep_token');
    if (token) {
      api
        .get('/auth/me')
        .then(({ data }) => setUser(data))
        .catch(() => {
          localStorage.removeItem('greenkeep_token');
          localStorage.removeItem('greenkeep_refresh_token');
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('greenkeep_token', data.accessToken);
    localStorage.setItem('greenkeep_refresh_token', data.refreshToken);
    if (data.user.tenantId) {
      localStorage.setItem('greenkeep_tenant_id', data.user.tenantId);
    }
    setUser(data.user);
    return data.user;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('greenkeep_token');
    localStorage.removeItem('greenkeep_refresh_token');
    localStorage.removeItem('greenkeep_tenant_id');
    setUser(null);
  }, []);

  const updateProfile = useCallback(async (updates) => {
    const { data } = await api.put('/auth/me', updates);
    setUser(data);
    return data;
  }, []);

  const value = {
    user,
    loading,
    login,
    logout,
    updateProfile,
    isAuthenticated: !!user,
    isSuperadmin: user?.role === 'superadmin',
    isAdmin: user?.role === 'admin' || user?.role === 'superadmin',
    isTeam: user?.role === 'team',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
