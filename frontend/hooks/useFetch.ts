import { useState, useEffect } from 'react';
import { api } from '../services/api';
import type { ApiResponse } from '../types';

type State<T> = { data: T | null; loading: boolean; error: string | null };

// Generic data-fetching hook with loading + error state
export function useFetch<T>(path: string): State<T> {
  const [state, setState] = useState<State<T>>({ data: null, loading: true, error: null });

  useEffect(() => {
    api.get<T>(path)
      .then((res: ApiResponse<T>) => {
        if (res.success) setState({ data: res.data, loading: false, error: null });
        else setState({ data: null, loading: false, error: res.error ?? 'Error' });
      })
      .catch(() => setState({ data: null, loading: false, error: 'Network error' }));
  }, [path]);

  return state;
}
