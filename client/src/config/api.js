import axios from 'axios';

const api = axios.create({
  baseURL: '/api/v1',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: add JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('greenkeep_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    const tenantId = localStorage.getItem('greenkeep_tenant_id');
    if (tenantId) {
      config.headers['X-Tenant-ID'] = tenantId;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = localStorage.getItem('greenkeep_refresh_token');
      if (refreshToken) {
        try {
          const { data } = await axios.post('/api/v1/auth/refresh', { refreshToken });
          localStorage.setItem('greenkeep_token', data.accessToken);
          originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
          return api(originalRequest);
        } catch (refreshError) {
          // Refresh failed, logout
          localStorage.removeItem('greenkeep_token');
          localStorage.removeItem('greenkeep_refresh_token');
          localStorage.removeItem('greenkeep_tenant_id');
          window.location.href = '/login';
          return Promise.reject(refreshError);
        }
      }

      // No refresh token, redirect to login
      localStorage.removeItem('greenkeep_token');
      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

export default api;
