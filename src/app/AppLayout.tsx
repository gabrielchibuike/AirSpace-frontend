import { NavLink, Outlet } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { SupportDialog } from "@/components/SupportDialog"
import { useLogout } from "@/features/auth"

const links = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/sessions", label: "History" },
  { to: "/settings", label: "Settings" },
]

export function AppLayout() {
  const logout = useLogout()
  return (
    <div className="flex min-h-svh flex-col">
      <header className="border-b bg-card">
        <nav aria-label="Main" className="mx-auto flex max-w-3xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-4">
          <span className="font-heading text-xl tracking-wide">AirSpace</span>
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                isActive ? "font-medium underline underline-offset-8" : "text-muted-foreground"
              }
            >
              {l.label}
            </NavLink>
          ))}
          <Button variant="ghost" size="sm" className="ml-auto" onClick={() => logout.mutate()}>
            Log out
          </Button>
        </nav>
      </header>

      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-10">
        <Outlet />
      </main>

      <footer className="border-t py-4 text-center text-sm text-muted-foreground">
        AirSpace isn&apos;t therapy or an emergency service. <SupportDialog />
      </footer>
    </div>
  )
}
