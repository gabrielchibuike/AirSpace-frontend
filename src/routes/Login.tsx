import { LoginForm } from "@/features/auth"

export default function LoginPage() {
  return (
    <main className="mx-auto mt-16 w-full max-w-md rounded-2xl bg-card p-8 shadow-sm">
      <h1 className="mb-6 text-3xl">Welcome back</h1>
      <LoginForm />
    </main>
  )
}
