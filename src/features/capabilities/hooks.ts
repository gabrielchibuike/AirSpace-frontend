import { useQuery } from "@tanstack/react-query"
import { qk } from "@/lib/queryKeys"
import { capabilitiesApi } from "./api"

export function useCapabilities() {
  return useQuery({
    queryKey: qk.capabilities,
    queryFn: capabilitiesApi.get,
    staleTime: 60_000,
  })
}