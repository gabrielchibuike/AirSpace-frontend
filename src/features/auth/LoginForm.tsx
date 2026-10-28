import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { LuEye, LuEyeOff } from "react-icons/lu"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ApiError, getErrorMessage } from "@/lib/api/errors"
import { useLogin } from "./hooks"
import { loginSchema, type LoginInput } from "./schemas"

export function LoginForm() {
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: string } | null)?.from ?? "/dashboard"
  const login = useLogin()
  const [showPassword, setShowPassword] = useState(false)

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) })

  const onSubmit = handleSubmit(async (values) => {
    try {
      await login.mutateAsync(values)
      navigate(from, { replace: true })
    } catch (e) {
      const wrongCredentials = e instanceof ApiError && (e.status === 401 || e.status === 400)
      setError("root", {
        message: wrongCredentials
          ? "That didn't match. Take your time, or reset your password if needed."
          : getErrorMessage(e),
      })
    }
  })

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-4">
      {errors.root && (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          <span>{errors.root.message}</span>
        </div>
      )}

      <div className="space-y-1.5">
        <div className="flex items-baseline justify-between">
          <Label htmlFor="email">Email or username</Label>
          <span className="text-xs text-muted-foreground">Private &amp; pseudonymous</span>
        </div>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? "email-error" : undefined}
          {...register("email")}
        />
        {errors.email && (
          <p id="email-error" className="text-sm text-destructive">
            {errors.email.message}
          </p>
        )}
      </div>

      <div className="space-y-1.5">
        <div className="flex items-baseline justify-between">
          <Label htmlFor="password">Secret passphrase</Label>
          <button
            type="button"
            className="text-xs text-primary underline-offset-4 hover:underline"
          >
            Forgot password?
          </button>
        </div>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            aria-invalid={!!errors.password}
            aria-describedby={errors.password ? "password-error" : undefined}
            className="pr-10"
            {...register("password")}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <LuEyeOff className="h-4 w-4" /> : <LuEye className="h-4 w-4" />}
          </button>
        </div>
        {errors.password && (
          <p id="password-error" className="text-sm text-destructive">
            {errors.password.message}
          </p>
        )}
      </div>

      <Button type="submit" size="lg" className="mt-2 w-full gap-2" disabled={login.isPending}>
        {login.isPending ? "Logging in…" : "Log in to stillness →"}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        First time here?{" "}
        <Link to="/register" className="font-medium text-primary underline-offset-4 hover:underline">
          Create your space
        </Link>
      </p>
    </form>
  )
}
