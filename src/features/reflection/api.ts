import { api } from "@/lib/api/client"

export interface Reflection {
  content: string
}

export const reflectionApi = {
  reflect: (sessionId: string) =>
    api<Reflection>(`/sessions/${sessionId}/reflect`, {
      method: "POST",
      signal: AbortSignal.timeout(30_000), // never hang forever
    }),
}
