import { useState, useCallback } from 'react';

export function usePagination(initialLimit = 20) {
  const [page, setPage] = useState(1);
  const [limit] = useState(initialLimit);

  const nextPage = useCallback(() => setPage((p) => p + 1), []);
  const prevPage = useCallback(() => setPage((p) => Math.max(1, p - 1)), []);
  const goToPage = useCallback((p) => setPage(p), []);
  const reset = useCallback(() => setPage(1), []);

  return { page, limit, nextPage, prevPage, goToPage, reset };
}
