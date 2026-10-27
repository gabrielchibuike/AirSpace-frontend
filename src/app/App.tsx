import { Route, Routes } from "react-router-dom"
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
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route element={<AppLayout />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/write" element={<WritePage />} />
        <Route path="/sessions" element={<HistoryPage />} />
        <Route path="/sessions/:id" element={<SessionPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>
      {/* <Route element={<ProtectedRoute />}>
      </Route> */}

      <Route path="*" element={<p className="p-10">We couldn&apos;t find that page.</p>} />
    </Routes>
  )
}
