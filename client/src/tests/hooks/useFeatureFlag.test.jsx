import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { TenantContext } from '../../contexts/TenantContext';
import { useFeatureFlag } from '../../hooks/useFeatureFlag';

function createWrapper(flags) {
  return function Wrapper({ children }) {
    return (
      <TenantContext.Provider
        value={{
          tenant: null,
          featureFlags: flags,
          loading: false,
          setTenant: () => {},
          isFeatureEnabled: (f) => flags[f] === true,
        }}
      >
        {children}
      </TenantContext.Provider>
    );
  };
}

describe('useFeatureFlag', () => {
  it('should return true for enabled feature', () => {
    const wrapper = createWrapper({ zones: true });
    const { result } = renderHook(() => useFeatureFlag('zones'), { wrapper });
    expect(result.current).toBe(true);
  });

  it('should return false for disabled feature', () => {
    const wrapper = createWrapper({ zones: false });
    const { result } = renderHook(() => useFeatureFlag('zones'), { wrapper });
    expect(result.current).toBe(false);
  });

  it('should return false for undefined feature', () => {
    const wrapper = createWrapper({});
    const { result } = renderHook(() => useFeatureFlag('nonexistent'), { wrapper });
    expect(result.current).toBe(false);
  });
});
