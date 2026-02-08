import { useContext } from 'react';
import { TenantContext } from '../contexts/TenantContext';

export function useFeatureFlag(featureName) {
  const { featureFlags } = useContext(TenantContext);
  return featureFlags[featureName] === true;
}
