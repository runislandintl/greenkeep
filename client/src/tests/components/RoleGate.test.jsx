import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AuthContext } from '../../contexts/AuthContext';
import RoleGate from '../../components/common/RoleGate';

function renderWithUser(user, minRole, children, fallback) {
  return render(
    <AuthContext.Provider
      value={{
        user,
        loading: false,
        login: () => {},
        logout: () => {},
        updateProfile: () => {},
        isAuthenticated: !!user,
        isSuperadmin: user?.role === 'superadmin',
        isAdmin: user?.role === 'admin' || user?.role === 'superadmin',
        isTeam: user?.role === 'team',
      }}
    >
      <RoleGate minRole={minRole} fallback={fallback}>
        {children}
      </RoleGate>
    </AuthContext.Provider>
  );
}

describe('RoleGate', () => {
  it('should show content for superadmin (admin minRole)', () => {
    renderWithUser({ role: 'superadmin' }, 'admin', <div>Admin Content</div>);
    expect(screen.getByText('Admin Content')).toBeInTheDocument();
  });

  it('should show content for admin (admin minRole)', () => {
    renderWithUser({ role: 'admin' }, 'admin', <div>Admin Content</div>);
    expect(screen.getByText('Admin Content')).toBeInTheDocument();
  });

  it('should hide content for team (admin minRole)', () => {
    renderWithUser({ role: 'team' }, 'admin', <div>Admin Content</div>);
    expect(screen.queryByText('Admin Content')).not.toBeInTheDocument();
  });

  it('should show content for team (team minRole)', () => {
    renderWithUser({ role: 'team' }, 'team', <div>Team Content</div>);
    expect(screen.getByText('Team Content')).toBeInTheDocument();
  });

  it('should render fallback when role insufficient', () => {
    renderWithUser(
      { role: 'team' },
      'admin',
      <div>Admin Content</div>,
      <div>Access Denied</div>
    );
    expect(screen.queryByText('Admin Content')).not.toBeInTheDocument();
    expect(screen.getByText('Access Denied')).toBeInTheDocument();
  });

  it('should hide content when no user', () => {
    renderWithUser(null, 'team', <div>Content</div>);
    expect(screen.queryByText('Content')).not.toBeInTheDocument();
  });
});
