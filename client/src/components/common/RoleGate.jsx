import { useAuth } from '@/hooks/useAuth';

const ROLE_LEVELS = { superadmin: 3, admin: 2, team: 1 };

export default function RoleGate({ minRole = 'team', children, fallback = null }) {
  const { user } = useAuth();

  if (!user) return fallback;

  const userLevel = ROLE_LEVELS[user.role] || 0;
  const requiredLevel = ROLE_LEVELS[minRole] || 999;

  if (userLevel < requiredLevel) {
    return fallback;
  }

  return children;
}
