import { api } from "@/lib/api/client"

// ─── API shapes (matching OpenAPI schema) ────────────────────────────────────

export interface CrisisResource {
  name: string
  phone: string
  alt_phone: string | null
  hours: string
  description: string
  url: string
}

export interface CheckInResponse {
  id: number
  before_score: number
  after_score: number | null
  emotion: string | null
  note: string | null
  created_at: string
  safety_notice: string | null
  crisis_resources: CrisisResource[] | null
}

export interface CheckInCreate {
  before_score: number
  after_score?: number | null
  emotion?: string | null
  note?: string | null
}

export interface CheckInUpdate {
  after_score?: number | null
  emotion?: string | null
  note?: string | null
}

// ─── API client ──────────────────────────────────────────────────────────────

export const checkInsApi = {
  list: (limit = 100, offset = 0) =>
    api<CheckInResponse[]>(`/checkins?limit=${limit}&offset=${offset}`),
  create: (body: CheckInCreate) => api<CheckInResponse>("/checkins", { method: "POST", body }),
  update: (id: number, body: CheckInUpdate) =>
    api<CheckInResponse>(`/checkins/${id}`, { method: "PATCH", body }),
  remove: (id: number) => api<void>(`/checkins/${id}`, { method: "DELETE" }),
}
