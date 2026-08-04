import { useCallback, useRef, useState } from 'react';

/**
 * Prevents double-submit while an async action runs.
 * Uses a ref so a second click before React re-renders is ignored.
 */
export default function useSubmitLock(initial = false) {
  const [loading, setLoading] = useState(initial);
  const lockRef = useRef(false);

  const runLocked = useCallback(async (fn) => {
    if (lockRef.current) return undefined;
    lockRef.current = true;
    setLoading(true);
    try {
      return await fn();
    } finally {
      lockRef.current = false;
      setLoading(false);
    }
  }, []);

  return [loading, runLocked, setLoading];
}
