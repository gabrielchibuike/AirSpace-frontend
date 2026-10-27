import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { qk } from "@/lib/queryKeys"
import { checkInsApi } from "./api"

export const useCheckIns = (sessionId: string) =>
  useQuery({
    queryKey: qk.checkIns(sessionId),
    queryFn: () => checkInsApi.list(sessionId),
  })

export function useCreateCheckIn() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: checkInsApi.create,
    onSuccess: (_, v) => qc.invalidateQueries({ queryKey: qk.checkIns(v.sessionId) }),
  })
}
