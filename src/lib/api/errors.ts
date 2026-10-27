export class ApiError extends Error {
  status: number
  fieldErrors: Record<string, string>

  constructor(status: number, fieldErrors: Record<string, string> = {}) {
    super(`Request failed (${status})`) // never include server text or user content
    this.name = "ApiError"
    this.status = status
    this.fieldErrors = fieldErrors
  }
}

// FastAPI 422 shape: { detail: [{ loc: ["body", "email"], msg: "..." }] }
export function toApiError(status: number, body: unknown) {
  const fieldErrors: Record<string, string> = {}
  const detail = (body as { detail?: unknown } | null)?.detail
  if (Array.isArray(detail)) {
    for (const d of detail) {
      const field = d?.loc?.at(-1)
      if (typeof field === "string" && typeof d?.msg === "string") {
        fieldErrors[field] = d.msg
      }
    }
  }
  return new ApiError(status, fieldErrors)
}

// One place that turns any failure into calm, user-facing copy
export function getErrorMessage(error: unknown): string {
  if (
    error instanceof DOMException &&
    (error.name === "TimeoutError" || error.name === "AbortError")
  ) {
    return "That took longer than expected. Please try again."
  }
  if (error instanceof ApiError) {
    if (error.status === 401) return "Your session has ended. Please log in again."
    if (error.status === 404) return "We couldn't find that."
    if (error.status === 422) return "Please check the highlighted fields."
    if (error.status === 429) return "You're going a little fast. Give it a moment."
    if (error.status >= 500) return "Something went wrong on our side."
  }
  if (error instanceof TypeError) return "We can't reach AirSpace. Check your connection."
  return "Something went wrong. Please try again."
}
