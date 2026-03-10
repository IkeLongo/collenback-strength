
export async function fetchGetJSON<T = any>(url: string): Promise<T> {
  try {
    const data = await fetch(url).then((res) => res.json());
    return data as T;
  } catch (err: any) {
    throw new Error(err.message);
  }
}


export async function fetchPostJSON<T = any>(url: string, data?: unknown): Promise<T> {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data ?? {}),
  });

  const text = await response.text();

  // Helpful debugging:
  if (!response.ok) {
    throw new Error(`HTTP ${response.status} ${response.statusText}: ${text || "(no body)"}`);
  }

  // If success but empty (rare), return as any
  if (!text) return {} as T;

  return JSON.parse(text) as T;
}