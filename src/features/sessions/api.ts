import { api } from "@/lib/api/client"

export interface Session {
  id: string
  content: string
  created_at: string
  updated_at: string
}

export const sessionsApi = {
  list: () => api<Session[]>("/sessions"),
  get: (id: string) => api<Session>(`/sessions/${id}`),
  create: (body: { content: string }) => api<Session>("/sessions", { method: "POST", body }),
  remove: (id: string) => api<void>(`/sessions/${id}`, { method: "DELETE" }),
}
