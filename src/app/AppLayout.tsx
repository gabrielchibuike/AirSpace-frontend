import { useEffect, useState } from "react"
import { NavLink, Outlet, useLocation } from "react-router-dom"
import {
  LuBookOpen,
  LuChartNoAxesColumnIncreasing,
  LuCircleUserRound,
  LuHouse,
  LuLogOut,
  LuShieldAlert,
} from "react-icons/lu"
import { Button } from "@/components/ui/button"
import { CrisisDialog } from "@/components/CrisisDialog"
import { CrisisFooter } from "@/components/CrisisFooter"
import { useLogout, useMe } from "@/features/auth"

const DESKTOP_LINKS = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/chat", label: "Chat" },
  { to: "/entries", label: "History" },
  { to: "/settings", label: "Settings" },
]

const MOBILE_LINKS = [
  { to: "/dashboard", label: "Home", icon: LuHouse },
  { to: "/entries", label: "Reflections", icon: LuBookOpen },
  { to: "/progress", label: "Progress", icon: LuChartNoAxesColumnIncreasing },
  { to: "/settings", label: "Profile", icon: LuCircleUserRound },
]

function isEditingTarget(target: EventTarget | null): boolean {
  return (
    target instanceof HTMLElement &&
    (target.matches("input, textarea, select, [contenteditable='true']") ||
      !!target.closest("[contenteditable='true']"))
  )
}

export function AppLayout() {
  const logout = useLogout()
  const { data: user } = useMe()
  const { pathname } = useLocation()
  const [keyboardOpen, setKeyboardOpen] = useState(false)

  useEffect(() => {
    const updateKeyboardState = () => {
      const viewport = window.visualViewport
      setKeyboardOpen(!!viewport && viewport.height < window.innerHeight * 0.75)
    }
    const handleFocusIn = (event: FocusEvent) => {
      if (isEditingTarget(event.target)) setKeyboardOpen(true)
    }
    const handleFocusOut = () => {
      window.setTimeout(() => {
        setKeyboardOpen(isEditingTarget(document.activeElement))
      }, 0)
    }

    window.visualViewport?.addEventListener("resize", updateKeyboardState)
    window.addEventListener("resize", updateKeyboardState)
    document.addEventListener("focusin", handleFocusIn)
    document.addEventListener("focusout", handleFocusOut)

    return () => {
      window.visualViewport?.removeEventListener("resize", updateKeyboardState)
      window.removeEventListener("resize", updateKeyboardState)
      document.removeEventListener("focusin", handleFocusIn)
      document.removeEventListener("focusout", handleFocusOut)
    }
  }, [])

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  const initials = user?.email
    ? user.email.slice(0, 2).toUpperCase()
    : <LuCircleUserRound className="h-4 w-4" />

  return (
    <div className="flex min-h-svh flex-col bg-background">
      <header className="mobile-app-header sticky top-0 z-30 border-b bg-card/95 backdrop-blur-sm">
        <nav
          aria-label="Main"
          className="mx-auto flex max-w-4xl items-center gap-1 px-4 py-2.5 sm:px-6"
        >
          <NavLink to="/dashboard" className="mr-3 flex min-w-0 flex-col leading-none">
            <span className="font-heading text-sm font-semibold tracking-tight text-primary">
              AirSpace
            </span>
            <span className="hidden text-[9px] tracking-widest text-muted-foreground uppercase sm:block">
              Vent and Decompress
            </span>
          </NavLink>

          <div className="hidden items-center gap-1 sm:flex">
            {DESKTOP_LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === "/dashboard"}
                className={({ isActive }) =>
                  [
                    "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground",
                  ].join(" ")
                }
              >
                {link.label}
              </NavLink>
            ))}
          </div>

          <div className="ml-auto flex shrink-0 items-center gap-1.5">
            <CrisisDialog
              trigger={
                <button
                  className="flex h-10 w-10 items-center justify-center rounded-lg text-destructive transition-colors hover:bg-destructive/10 sm:w-auto sm:gap-1.5 sm:px-2"
                  aria-label="Need urgent help? View crisis resources"
                  title="Need urgent help?"
                >
                  <LuShieldAlert className="h-4 w-4" aria-hidden />
                  <span className="hidden text-sm sm:inline">Need urgent help?</span>
                </button>
              }
            />

            <Button
              variant="ghost"
              size="sm"
              className="hidden gap-1.5 text-muted-foreground sm:inline-flex"
              onClick={() => logout.mutate()}
              aria-label="Log out"
              disabled={logout.isPending}
            >
              <LuLogOut className="h-4 w-4" aria-hidden />
              <span className="text-sm">Log out</span>
            </Button>

            <NavLink
              to="/settings"
              aria-label={`Account settings for ${user?.email ?? "user"}`}
              title={user?.email}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {typeof initials === "string" ? initials : initials}
            </NavLink>
          </div>
        </nav>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-6 pb-32 sm:px-6 sm:py-10 sm:pb-10">
        <Outlet />
      </main>

      <div className="border-t px-4 py-4 pb-24 sm:px-6 sm:pb-4">
        <CrisisFooter />
      </div>

      {!keyboardOpen && (
        <nav
          aria-label="Mobile navigation"
          className="mobile-bottom-nav fixed inset-x-0 bottom-0 z-40 mx-auto flex w-[calc(100%-2rem)] max-w-sm items-stretch justify-around rounded-2xl border p-1.5 sm:hidden"
        >
          {MOBILE_LINKS.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to !== "/entries"}
              className={({ isActive }) =>
                [
                  "flex min-h-12 min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-xl px-0.5 text-[11px] font-medium leading-tight transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground",
                ].join(" ")
              }
            >
              <Icon className="h-5 w-5 shrink-0" aria-hidden />
              <span className="truncate">{label}</span>
            </NavLink>
          ))}
        </nav>
      )}
    </div>
  )
}
