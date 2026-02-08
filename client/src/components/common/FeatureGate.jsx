import { useFeatureFlag } from '@/hooks/useFeatureFlag';

export default function FeatureGate({ feature, children, fallback = null }) {
  const isEnabled = useFeatureFlag(feature);

  if (!isEnabled) {
    return fallback;
  }

  return children;
}
