declare global {
  interface Window {
    __AISCU_CONFIG__?: {
      apiBaseUrl?: string;
    };
  }
}

function configuredApiBaseUrl() {
  const buildTimeUrl = import.meta.env.VITE_API_BASE_URL?.trim();
  const runtimeUrl = window.__AISCU_CONFIG__?.apiBaseUrl?.trim();
  return (buildTimeUrl || runtimeUrl || "").replace(/\/$/, "");
}

export function apiUrl(path: string) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${configuredApiBaseUrl()}${normalizedPath}`;
}

export async function apiJson<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(apiUrl(path), {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init.headers || {}),
    },
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    throw new Error(payload?.message || `API request failed (${response.status}).`);
  }

  return response.json() as Promise<T>;
}
