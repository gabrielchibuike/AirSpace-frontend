import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useNavigate } from "react-router-dom"
import { setToken } from "@/lib/api/client"
import { ApiError } from "@/lib/api/errors"
import { clearPrivateCache } from "@/lib/queryClient"
import { tokenStore } from "@/lib/tokenStore"
import { qk } from "@/lib/queryKeys"
import { authApi } from "./api"
import type { LoginInput, RegisterInput } from "./schemas"

// Session bootstrap: resolves to the user, or null when logged out.
// On first mount, seed the in-memory token from storage so the client
// can attach the Bearer header before the first /me call.
export function useMe() {
  return useQuery({
    queryKey: qk.me,
    queryFn: async () => {
      // Seed in-memory token from storage (after a page reload)
      const stored = tokenStore.get()
      if (stored) setToken(stored)
      try {
        return await authApi.me()
      } catch (e) {
        if (e instanceof ApiError && e.status === 401) {
          tokenStore.clear()
          setToken(null)
          return null
        }
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
    mutationFn: (input: LoginInput) => authApi.login(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.me }),
  })
}

export function useRegister() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: RegisterInput) =>
      authApi.register({ email: input.email, password: input.password }),
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
