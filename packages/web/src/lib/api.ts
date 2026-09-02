/**
 * Central place for API calls.
 * In dev, Vite proxies `/api/*` to the backend (see vite.config.ts).
 * In production, set VITE_API_BASE_URL to the real API origin,
 * or serve both behind the same reverse proxy and keep `/api`.
 */
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || '/api';

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  });

  if (!res.ok) {
    throw new Error(`API error ${res.status}: ${await res.text()}`);
  }
  return res.json() as Promise<T>;
}
