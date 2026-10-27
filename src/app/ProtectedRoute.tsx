import { Navigate, Outlet, useLocation } from "react-router-dom"
import { Skeleton } from "@/components/ui/skeleton"
import { useMe } from "@/features/auth"

export function ProtectedRoute() {
  const { data: user, isPending } = useMe()
  const location = useLocation()

  if (isPending) return <Skeleton className="mx-auto mt-24 h-40 w-full max-w-xl rounded-2xl" />
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />
  return <Outlet />
}
