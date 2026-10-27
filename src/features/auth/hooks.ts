import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useNavigate } from "react-router-dom"
import { ApiError } from "@/lib/api/errors"
import { clearPrivateCache } from "@/lib/queryClient"
import { qk } from "@/lib/queryKeys"
import { authApi } from "./api"
import type { RegisterInput } from "./schemas"

// Session bootstrap: resolves to the user, or null when logged out
export function useMe() {
  return useQuery({
    queryKey: qk.me,
    queryFn: async () => {
      try {
        return await authApi.me()
      } catch (e) {
        if (e instanceof ApiError && e.status === 401) return null
        throw e
      }
    },
    staleTime: Infinity,
    retry: false,
  })
}

export function useLogin() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: authApi.login,
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.me }), // waits for /me
  })
}

export function useRegister() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (input: RegisterInput) => {
      await authApi.register(input)
      await authApi.login({ email: input.email, password: input.password })
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.me }),
  })
}

export function useLogout() {
  const navigate = useNavigate()
  return useMutation({
    mutationFn: authApi.logout,
    onSettled: () => {
      clearPrivateCache()
      navigate("/login", { replace: true })
    },
  })
}
