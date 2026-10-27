import { api } from "@/lib/api/client"
import type { LoginInput, RegisterInput } from "./schemas"

export interface User {
  id: string
  email: string
  created_at: string
}

export const authApi = {
  me: () => api<User>("/me"),
  login: (b: LoginInput) => api<void>("/auth/login", { method: "POST", body: b }),
  register: ({ email, password }: RegisterInput) =>
    api<void>("/auth/register", { method: "POST", body: { email, password } }),
  logout: () => api<void>("/auth/logout", { method: "POST" }),
}
