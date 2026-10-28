import { toApiError } from "./errors"

// Base URL is read from env so it can be overridden per deployment.
// Default: the supplied production URL (proxied in dev via Vite if needed).
const BASE_URL =
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ??
  "https://airspace-backend-mvp.onrender.com"

const BASE = `${BASE_URL}/api/v1`

type Options = Omit<RequestInit, "body"> & { body?: unknown }

let onUnauthorized: (() => void) | null = null
export const setUnauthorizedHandler = (fn: () => void) => {
  onUnauthorized = fn
}

// Token is stored in memory only; written once on login/register and cleared on logout.
let _token: string | null = null
export const setToken = (t: string | null) => {
  _token = t
}
export const getToken = () => _token

export async function api<T>(path: string, { body, headers, ...init }: Options = {}): Promise<T> {
  const authHeaders: Record<string, string> = {}
  if (_token) authHeaders["Authorization"] = `Bearer ${_token}`

  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      Accept: "application/json",
      ...(body !== undefined && { "Content-Type": "application/json" }),
      ...authHeaders,
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  if (res.status === 204) return undefined as T
  const data = await res.json().catch(() => null)

  if (!res.ok) {
    // /me and /auth/* handle their own 401s — don't trigger global logout for them
    if (res.status === 401 && path !== "/me" && !path.startsWith("/auth/")) {
      onUnauthorized?.()
    }
    throw toApiError(res.status, data)
  }
  return data as T
}
