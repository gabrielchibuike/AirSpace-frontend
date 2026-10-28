import { useState } from "react"
import { NavLink, Outlet } from "react-router-dom"
import {
  LuLogOut,
  LuCircleUserRound,
  LuShieldAlert,
  LuMenu,
  LuX,
} from "react-icons/lu"
import { Button } from "@/components/ui/button"
import { CrisisDialog } from "@/components/CrisisDialog"
import { useLogout, useMe } from "@/features/auth"

const NAV_LINKS = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/sessions", label: "History" },
  { to: "/settings", label: "Settings" },
]

export function AppLayout() {
  const logout = useLogout()
  const { data: user } = useMe()
  const [menuOpen, setMenuOpen] = useState(false)

  const initials = user?.email
    ? user.email.slice(0, 2).toUpperCase()
    : <LuCircleUserRound className="h-4 w-4" />

  return (
    <div className="flex min-h-svh flex-col bg-background">
      {/* ── Top nav ─────────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 border-b bg-card/95 backdrop-blur-sm">
        <nav
          aria-label="Main"
          className="mx-auto flex max-w-4xl items-center gap-1 px-4 py-2.5"
        >
          {/* Logo */}
          <NavLink
            to="/dashboard"
            className="mr-3 flex flex-col leading-none"
            onClick={() => setMenuOpen(false)}
          >
            <span className="font-heading text-sm font-semibold tracking-tight text-primary">
              AirSpace
            </span>
            <span className="hidden text-[9px] tracking-widest text-muted-foreground uppercase sm:block">
              Vent and Decompress
            </span>
          </NavLink>

          {/* Desktop page links */}
          <div className="hidden sm:flex sm:items-center sm:gap-1">
            {NAV_LINKS.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                className={({ isActive }) =>
                  [
                    "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground",
                  ].join(" ")
                }
              >
                {l.label}
              </NavLink>
            ))}
          </div>

          {/* Right side */}
          <div className="ml-auto flex items-center gap-1.5">
            {/* Crisis button (always visible) */}
            <CrisisDialog
              trigger={
                <button
                  className="flex items-center gap-1.5 rounded-lg p-2 text-destructive hover:bg-destructive/10 transition-colors"
                  aria-label="Need urgent help? View crisis resources"
                  title="Need urgent help?"
                >
                  <LuShieldAlert className="h-4 w-4" aria-hidden />
                  <span className="hidden text-sm sm:inline">Need urgent help?</span>
                </button>
              }
            />

            {/* Logout — desktop only */}
            <Button
              variant="ghost"
              size="sm"
              className="hidden gap-1.5 text-muted-foreground sm:inline-flex"
              onClick={() => logout.mutate()}
              aria-label="Log out"
              disabled={logout.isPending}
            >
              <LuLogOut className="h-4 w-4" aria-hidden />
              <span className="sr-only sm:not-sr-only text-sm">Log out</span>
            </Button>

            {/* User avatar */}
            <div
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground"
              aria-label={`Logged in as ${user?.email ?? "user"}`}
              title={user?.email}
            >
              {typeof initials === "string" ? initials : initials}
            </div>

            {/* Hamburger (mobile only) */}
            <button
              type="button"
              className="ml-1 flex h-8 w-8 items-center justify-center rounded-lg border text-muted-foreground hover:bg-accent transition-colors sm:hidden"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((v) => !v)}
            >
              {menuOpen ? (
                <LuX className="h-4 w-4" aria-hidden />
              ) : (
                <LuMenu className="h-4 w-4" aria-hidden />
              )}
            </button>
          </div>
        </nav>

        {/* Mobile drawer */}
        {menuOpen && (
          <div className="border-t bg-card px-4 py-3 sm:hidden" role="menu">
            <nav aria-label="Mobile navigation">
              {NAV_LINKS.map((l) => (
                <NavLink
                  key={l.to}
                  to={l.to}
                  role="menuitem"
                  className={({ isActive }) =>
                    [
                      "flex w-full items-center rounded-xl px-3 py-3 text-base font-medium transition-colors",
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-foreground hover:bg-accent",
                    ].join(" ")
                  }
                  onClick={() => setMenuOpen(false)}
                >
                  {l.label}
                </NavLink>
              ))}
              <div className="mt-3 border-t pt-3">
                <button
                  type="button"
                  className="flex w-full items-center gap-2 rounded-xl px-3 py-3 text-base font-medium text-muted-foreground hover:bg-accent transition-colors"
                  onClick={() => {
                    logout.mutate()
                    setMenuOpen(false)
                  }}
                  disabled={logout.isPending}
                >
                  <LuLogOut className="h-5 w-5" aria-hidden />
                  {logout.isPending ? "Logging out…" : "Log out"}
                </button>
              </div>
            </nav>
          </div>
        )}
      </header>

      {/* ── Page content ────────────────────────────────────────────── */}
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-6 sm:py-10">
        <Outlet />
      </main>

      {/* ── Footer ──────────────────────────────────────────────────── */}
      <footer className="border-t py-4 text-center text-xs text-muted-foreground">
        <p>AirSpace isn&apos;t therapy or an emergency service.</p>
        <p className="mt-0.5">
          Call or text{" "}
          <a href="tel:988" className="font-semibold text-foreground hover:underline">
            988
          </a>{" "}
          (USA &amp; Canada) · Text{" "}
          <strong className="text-foreground">HOME</strong> to{" "}
          <strong className="text-foreground">741741</strong>
        </p>
        <div className="mt-2 flex flex-wrap justify-center gap-x-3 gap-y-1">
          <CrisisDialog
            trigger={
              <button className="underline underline-offset-4 hover:no-underline">
                Need urgent help?
              </button>
            }
          />
          <span aria-hidden>·</span>
          <span>Zero tracking</span>
          <span aria-hidden>·</span>
          <span>End-to-end encrypted</span>
        </div>
      </footer>
    </div>
  )
}
