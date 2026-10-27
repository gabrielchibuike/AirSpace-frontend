import { api } from "@/lib/api/client"

export type Stage = "before" | "after"
export interface CheckIn {
  id: string
  stage: Stage
  value: number
  created_at: string
}

export const checkInsApi = {
  list: (sessionId: string) => api<CheckIn[]>(`/sessions/${sessionId}/check-ins`),
  create: ({ sessionId, ...body }: { sessionId: string; stage: Stage; value: number }) =>
    api<CheckIn>(`/sessions/${sessionId}/check-ins`, { method: "POST", body }),
}
