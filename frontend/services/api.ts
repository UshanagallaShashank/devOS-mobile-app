import { ENV } from '../config/env';
import type { ApiResponse } from '../types';

// Base HTTP client — all API calls go through here
async function request<T>(path: string, options?: RequestInit): Promise<ApiResponse<T>> {
  const res = await fetch(`${ENV.API_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    ...options,
  });

  const json = await res.json();

  if (!res.ok) {
    return { success: false, data: null as T, error: json.detail ?? 'Request failed' };
  }

  return { success: true, data: json };
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'POST', body: JSON.stringify(body) }),
};
