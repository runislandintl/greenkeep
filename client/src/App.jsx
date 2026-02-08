import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { LoadingSpinner } from './components/common/LoadingState';
import ErrorBoundary from './components/common/ErrorBoundary';
import FeatureGate from './components/common/FeatureGate';
import AppShell from './components/layout/AppShell';

// Pages
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ZonesPage from './pages/ZonesPage';
import TasksPage from './pages/TasksPage';
import TeamPage from './pages/TeamPage';
import EquipmentPage from './pages/EquipmentPage';
import InventoryPage from './pages/InventoryPage';
import SettingsPage from './pages/SettingsPage';
import SuperadminPage from './pages/SuperadminPage';
import NotFoundPage from './pages/NotFoundPage';

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner size="lg" />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function PublicRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner size="lg" />;
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default function App() {
  return (
    <ErrorBoundary>
      <Routes>
        {/* Public route */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          }
        />

        {/* Protected routes inside AppShell */}
        <Route
          element={
            <ProtectedRoute>
              <AppShell />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardPage />} />

          <Route
            path="zones"
            element={
              <FeatureGate feature="zones" fallback={<Navigate to="/" replace />}>
                <ZonesPage />
              </FeatureGate>
            }
          />

          <Route
            path="tasks"
            element={
              <FeatureGate feature="tasks" fallback={<Navigate to="/" replace />}>
                <TasksPage />
              </FeatureGate>
            }
          />

          <Route
            path="team"
            element={
              <FeatureGate feature="team" fallback={<Navigate to="/" replace />}>
                <TeamPage />
              </FeatureGate>
            }
          />

          <Route
            path="equipment"
            element={
              <FeatureGate feature="equipment" fallback={<Navigate to="/" replace />}>
                <EquipmentPage />
              </FeatureGate>
            }
          />

          <Route
            path="inventory"
            element={
              <FeatureGate feature="inventory" fallback={<Navigate to="/" replace />}>
                <InventoryPage />
              </FeatureGate>
            }
          />

          <Route path="settings" element={<SettingsPage />} />
          <Route path="admin/tenants" element={<SuperadminPage />} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </ErrorBoundary>
  );
}
