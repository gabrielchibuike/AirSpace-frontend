import { Link, Route, Routes } from "react-router-dom"
import { AppLayout } from "./AppLayout"
import { ProtectedRoute } from "./ProtectedRoute"
import LandingPage from "@/routes/Landing"
import LoginPage from "@/routes/Login"
import RegisterPage from "@/routes/Register"
import DashboardPage from "@/routes/Dashboard"
import WritePage from "@/routes/Write"
import HistoryPage from "@/routes/History"
import SessionPage from "@/routes/Session"
import SettingsPage from "@/routes/Settings"

export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Protected — all app pages require auth */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/write" element={<WritePage />} />
          <Route path="/sessions" element={<HistoryPage />} />
          <Route path="/sessions/:id" element={<SessionPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
      </Route>

      {/* 404 */}
      <Route
        path="*"
        element={
          <main className="flex min-h-svh flex-col items-center justify-center gap-4 px-4 text-center">
            <p className="text-4xl font-light tracking-wide text-foreground">
              We couldn&apos;t find that page.
            </p>
            <p className="text-muted-foreground">
              It may have been moved or deleted.
            </p>
            <Link
              to="/"
              className="inline-flex h-10 items-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/80"
            >
              Go home
            </Link>
          </main>
        }
      />
    </Routes>
  )
}
