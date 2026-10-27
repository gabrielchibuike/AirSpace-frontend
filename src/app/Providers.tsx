import type { ReactNode } from "react"
import { QueryClientProvider } from "@tanstack/react-query"
import { BrowserRouter } from "react-router-dom"
import { Toaster } from "@/components/ui/sonner"
import { setUnauthorizedHandler } from "@/lib/api/client"
import { clearPrivateCache, queryClient } from "@/lib/queryClient"

setUnauthorizedHandler(clearPrivateCache) // any 401 clears the cache; the guard then redirects to /login

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
