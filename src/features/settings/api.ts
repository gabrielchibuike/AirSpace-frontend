import { api } from "@/lib/api/client"

export const settingsApi = {
  deleteAccount: () => api<void>("/account", { method: "DELETE" }),
}
