import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TenantContext } from '../../contexts/TenantContext';
import FeatureGate from '../../components/common/FeatureGate';

function renderWithFlags(featureFlags, featureName, children, fallback) {
  return render(
    <TenantContext.Provider
      value={{
        tenant: null,
        featureFlags,
        loading: false,
        setTenant: () => {},
        isFeatureEnabled: (f) => featureFlags[f] === true,
      }}
    >
      <FeatureGate feature={featureName} fallback={fallback}>
        {children}
      </FeatureGate>
    </TenantContext.Provider>
  );
}

describe('FeatureGate', () => {
  it('should render children when feature is enabled', () => {
    renderWithFlags({ zones: true }, 'zones', <div>Zone Content</div>);
    expect(screen.getByText('Zone Content')).toBeInTheDocument();
  });

  it('should not render children when feature is disabled', () => {
    renderWithFlags({ zones: false }, 'zones', <div>Zone Content</div>);
    expect(screen.queryByText('Zone Content')).not.toBeInTheDocument();
  });

  it('should render fallback when feature is disabled', () => {
    renderWithFlags(
      { zones: false },
      'zones',
      <div>Zone Content</div>,
      <div>Feature Disabled</div>
    );
    expect(screen.queryByText('Zone Content')).not.toBeInTheDocument();
    expect(screen.getByText('Feature Disabled')).toBeInTheDocument();
  });

  it('should handle experimental features (iot defaults to false)', () => {
    renderWithFlags({ iot: false }, 'iot', <div>IoT Content</div>);
    expect(screen.queryByText('IoT Content')).not.toBeInTheDocument();
  });

  it('should show experimental features when enabled', () => {
    renderWithFlags({ iot: true }, 'iot', <div>IoT Content</div>);
    expect(screen.getByText('IoT Content')).toBeInTheDocument();
  });
});
