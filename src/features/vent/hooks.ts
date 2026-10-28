import { useMutation, useQuery } from "@tanstack/react-query"
import { qk } from "@/lib/queryKeys"
import { ventApi, type ReframeRequest, type VentRequest } from "./api"

export function useVent() {
  return useMutation({
    mutationFn: (body: VentRequest) => ventApi.vent(body),
  })
}

export function useReframe() {
  return useMutation({
    mutationFn: (body: ReframeRequest) => ventApi.reframe(body),
  })
}

export function useCrisisResources() {
  return useQuery({
    queryKey: qk.crisisResources,
    queryFn: ventApi.crisisResources,
    staleTime: 60 * 60 * 1000, // 1 hour — these rarely change
    retry: 2,
  })
}
