import { toApiError } from "./errors"

const BASE = "/api/v1" // same origin: Vite proxy in dev, FastAPI in prod

type Options = Omit<RequestInit, "body"> & { body?: unknown }

let onUnauthorized: (() => void) | null = null
export const setUnauthorizedHandler = (fn: () => void) => {
  onUnauthorized = fn
}

export async function api<T>(path: string, { body, headers, ...init }: Options = {}): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    credentials: "include", // httpOnly session cookie
    headers: {
      Accept: "application/json",
      ...(body !== undefined && { "Content-Type": "application/json" }),
      // "X-Requested-With": "AirSpace", // enable if the backend requires a CSRF header
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  if (res.status === 204) return undefined as T
  const data = await res.json().catch(() => null)

  if (!res.ok) {
    // /me and /auth/* handle their own 401s
    if (res.status === 401 && path !== "/me" && !path.startsWith("/auth/")) {
      onUnauthorized?.()
    }
    throw toApiError(res.status, data)
  }
  return data as T
}
