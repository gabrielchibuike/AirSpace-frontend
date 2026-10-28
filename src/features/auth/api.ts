import { api, setToken } from "@/lib/api/client"
import { tokenStore } from "@/lib/tokenStore"

export interface User {
  id: number
  email: string
  created_at: string
}

interface TokenResponse {
  access_token: string
  token_type: string
}

interface LoginRequest {
  email: string
  password: string
}

interface RegisterRequest {
  email: string
  password: string
}

function applyToken(token: string) {
  tokenStore.set(token)
  setToken(token)
}

export const authApi = {
  /** Validate the stored token and return the current user. */
  me: () => api<User>("/me"),

  login: async (b: LoginRequest): Promise<TokenResponse> => {
    const res = await api<TokenResponse>("/auth/login", { method: "POST", body: b })
    applyToken(res.access_token)
    return res
  },

  register: async ({ email, password }: RegisterRequest): Promise<TokenResponse> => {
    const res = await api<TokenResponse>("/auth/register", {
      method: "POST",
      body: { email, password },
    })
    applyToken(res.access_token)
    return res
  },

  /** Client-side logout: wipe token from memory + storage. */
  logout: () => {
    tokenStore.clear()
    setToken(null)
    return Promise.resolve()
  },
}
