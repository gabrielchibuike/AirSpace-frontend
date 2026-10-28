import { toApiError } from "./errors"

// Base URL is read from env so it can be overridden per deployment.
// Default: same origin in dev (Vite proxies /api to the local backend on :8000),
// the deployed Render API in production.
const BASE_URL =
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ??
  (import.meta.env.DEV ? "" : "https://airspace-backend-mvp.onrender.com")

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

function authHeaders(): Record<string, string> {
  return _token ? { Authorization: `Bearer ${_token}` } : {}
}

async function readError(res: Response, path: string) {
  const data = await res.json().catch(() => null)
  // /me and /auth/* handle their own 401s — don't trigger global logout for them
  if (res.status === 401 && path !== "/me" && !path.startsWith("/auth/")) {
    onUnauthorized?.()
  }
  const error = toApiError(res.status, data)
  const retryAfter = Number(res.headers.get("Retry-After"))
  error.retryAfter = Number.isFinite(retryAfter) && retryAfter > 0 ? retryAfter : null
  return error
}

export async function api<T>(path: string, { body, headers, ...init }: Options = {}): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      Accept: "application/json",
      ...(body !== undefined && { "Content-Type": "application/json" }),
      ...authHeaders(),
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  if (res.status === 204) return undefined as T
  if (!res.ok) throw await readError(res, path)

  return (await res.json().catch(() => null)) as T
}

/**
 * Multipart upload for the voice vent endpoint. The browser sets the boundary,
 * so no Content-Type header is passed here.
 */
export async function apiUpload<T>(path: string, form: FormData): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: { Accept: "application/json", ...authHeaders() },
    body: form,
  })

  if (res.status === 204) return undefined as T
  if (!res.ok) throw await readError(res, path)

  return (await res.json().catch(() => null)) as T
}
