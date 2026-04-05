import { useCallback, useState } from 'react';

type LoadingState = Record<string, boolean>;

export function useLoadingState() {
  const [loading, setLoading] = useState<LoadingState>({});

  const withLoading = useCallback(async (key: string, fn: () => Promise<void>) => {
    setLoading(prev => ({ ...prev, [key]: true }));
    try {
      await fn();
    } finally {
      setLoading(prev => ({ ...prev, [key]: false }));
    }
  }, []);

  return { loading, withLoading, setLoading };
}
