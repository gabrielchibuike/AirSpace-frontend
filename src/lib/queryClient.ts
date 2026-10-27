import { QueryClient } from "@tanstack/react-query"
import { ApiError } from "./api/errors"
import { draftStore } from "./draft"
import { qk } from "./queryKeys"

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      refetchOnWindowFocus: false,
      retry: (count, error) =>
        count < 1 && !(error instanceof ApiError && error.status < 500),
    },
  },
})

// On logout or expired session: wipe every private thing held in the browser
export function clearPrivateCache() {
  draftStore.clear()
  queryClient.removeQueries({ predicate: (q) => q.queryKey[0] !== "me" })
  queryClient.setQueryData(qk.me, null)
}
