"use client";

/** Cliente fetch minimalista para las API routes internas. */
async function request<T>(
  url: string,
  options?: RequestInit & { json?: unknown },
): Promise<T> {
  const { json, ...rest } = options ?? {};
  const res = await fetch(url, {
    ...rest,
    headers: {
      "Content-Type": "application/json",
      ...(rest.headers ?? {}),
    },
    body: json !== undefined ? JSON.stringify(json) : rest.body,
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data?.error || `Error ${res.status}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

export const api = {
  get: <T>(url: string) => request<T>(url),
  post: <T>(url: string, json?: unknown) =>
    request<T>(url, { method: "POST", json }),
  patch: <T>(url: string, json?: unknown) =>
    request<T>(url, { method: "PATCH", json }),
  del: <T>(url: string) => request<T>(url, { method: "DELETE" }),
};
