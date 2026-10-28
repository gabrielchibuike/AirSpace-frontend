import type { ReactNode } from "react"
import { QueryClientProvider } from "@tanstack/react-query"
import { BrowserRouter } from "react-router-dom"
import { Toaster } from "@/components/ui/sonner"
import { setToken, setUnauthorizedHandler } from "@/lib/api/client"
import "@/lib/themeStore" // apply saved theme before first paint
import { clearPrivateCache, queryClient } from "@/lib/queryClient"
import { tokenStore } from "@/lib/tokenStore"

// Seed the in-memory token from sessionStorage so it is available
// before the first useMe() call (which happens in useMe's queryFn).
const stored = tokenStore.get()
if (stored) setToken(stored)

// Any 401 response (outside auth routes) clears the cache; the ProtectedRoute then redirects.
setUnauthorizedHandler(clearPrivateCache)

export function Providers({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {children}
        <Toaster />
      </BrowserRouter>
    </QueryClientProvider>
  )
}
