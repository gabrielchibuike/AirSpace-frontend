import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { qk } from "@/lib/queryKeys"
import { checkInsApi, type CheckInCreate, type CheckInUpdate } from "./api"

export const useCheckIns = () =>
  useQuery({
    queryKey: qk.checkIns,
    queryFn: checkInsApi.list,
  })

export function useCreateCheckIn() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: CheckInCreate) => checkInsApi.create(body),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.checkIns }),
  })
}

export function useUpdateCheckIn() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, body }: { id: number; body: CheckInUpdate }) =>
      checkInsApi.update(id, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.checkIns }),
  })
}

export function useDeleteCheckIn() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => checkInsApi.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.checkIns }),
  })
}
