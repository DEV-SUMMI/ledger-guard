export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

/** Calls our own /api proxy. Writes always send JSON, which the API requires. */
export async function api<T>(path: string, init: { method?: string; body?: unknown } = {}): Promise<T> {
  const method = init.method ?? "GET";
  const write = method !== "GET";
  const res = await fetch(`/api${path}`, {
    method,
    headers: write ? { "Content-Type": "application/json" } : undefined,
    body: write ? JSON.stringify(init.body ?? {}) : undefined,
    credentials: "same-origin",
    cache: "no-store",
  });
  const data = (await res.json().catch(() => ({}))) as { error?: string };
  if (!res.ok) throw new ApiError(res.status, data.error ?? "Something went wrong. Please try again.");
  return data as T;
}
