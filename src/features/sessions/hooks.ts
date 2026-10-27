import { useCallback, useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { draftStore } from "@/lib/draft"
import { qk } from "@/lib/queryKeys"
import { sessionsApi } from "./api"

export const useSessions = () =>
  useQuery({ queryKey: qk.sessions.all, queryFn: sessionsApi.list })

export const useSession = (id: string) =>
  useQuery({
    queryKey: qk.sessions.detail(id),
    queryFn: () => sessionsApi.get(id),
    enabled: !!id,
  })

export function useCreateSession() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: sessionsApi.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.sessions.all }),
  })
}

export function useDeleteSession() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: sessionsApi.remove,
    onSuccess: (_, id) => {
      qc.removeQueries({ queryKey: qk.sessions.detail(id) })
      qc.invalidateQueries({ queryKey: qk.sessions.all })
    },
  })
}

// Draft survives refresh, but only for this tab and only until saved or logged out
export function useDraft() {
  const [value, setValue] = useState(draftStore.read)
  const update = useCallback((v: string) => {
    setValue(v)
    draftStore.write(v)
  }, [])
  const clear = useCallback(() => {
    setValue("")
    draftStore.clear()
  }, [])
  return { value, update, clear }
}
