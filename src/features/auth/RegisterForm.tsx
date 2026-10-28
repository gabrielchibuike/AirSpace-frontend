import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Link, useNavigate } from "react-router-dom"
import { LuEye, LuEyeOff, LuCircleCheck } from "react-icons/lu"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ApiError, getErrorMessage } from "@/lib/api/errors"
import { useRegister } from "./hooks"
import { registerSchema, type RegisterInput } from "./schemas"

export function RegisterForm() {
  const navigate = useNavigate()
  const register_ = useRegister()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const {
    register,
    handleSubmit,
    setError,
    watch,
    formState: { errors },
  } = useForm<RegisterInput>({ resolver: zodResolver(registerSchema) })

  const password = watch("password") ?? ""
  const confirmPassword = watch("confirmPassword") ?? ""
  const passwordsMatch = password.length >= 10 && password === confirmPassword

  const onSubmit = handleSubmit(async (values) => {
    try {
      await register_.mutateAsync(values)
      navigate("/dashboard", { replace: true })
    } catch (e) {
      if (e instanceof ApiError && (e.status === 409 || e.fieldErrors.email)) {
        setError("email", {
          message:
            e.detail ?? "An account with this email already exists.",
        })
      }
      setError("root", { message: getErrorMessage(e) })
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
          <Label htmlFor="reg-email">Email or pseudonymous alias</Label>
          <span className="text-xs text-muted-foreground">Private &amp; optional alias</span>
        </div>
        <Input
          id="reg-email"
          type="email"
          autoComplete="email"
          placeholder="you@domain.com or an anonymous alias"
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? "reg-email-error" : undefined}
          {...register("email")}
        />
        {errors.email && (
          <p id="reg-email-error" className="text-sm text-destructive">
            {errors.email.message}
          </p>
        )}
        <p className="text-xs text-muted-foreground">
          We never require your legal name or phone number.
        </p>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="reg-password">Passphrase or Password</Label>
        <div className="relative">
          <Input
            id="reg-password"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            aria-invalid={!!errors.password}
            aria-describedby="reg-password-error reg-password-hint"
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
        {errors.password ? (
          <p id="reg-password-error" className="text-sm text-destructive">
            {errors.password.message}
          </p>
        ) : (
          <p id="reg-password-hint" className="text-xs text-muted-foreground">
            10+ characters · memorable passphrase recommended
          </p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="reg-confirm">Confirm your passphrase</Label>
        <div className="relative">
          <Input
            id="reg-confirm"
            type={showConfirm ? "text" : "password"}
            autoComplete="new-password"
            aria-invalid={!!errors.confirmPassword}
            aria-describedby={errors.confirmPassword ? "reg-confirm-error" : undefined}
            className="pr-10"
            {...register("confirmPassword")}
          />
          <button
            type="button"
            onClick={() => setShowConfirm((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            aria-label={showConfirm ? "Hide password" : "Show password"}
          >
            {showConfirm ? <LuEyeOff className="h-4 w-4" /> : <LuEye className="h-4 w-4" />}
          </button>
        </div>
        {errors.confirmPassword ? (
          <p id="reg-confirm-error" className="text-sm text-destructive">
            {errors.confirmPassword.message}
          </p>
        ) : passwordsMatch ? (
          <p className="flex items-center gap-1 text-xs text-green-700 dark:text-green-400">
            <LuCircleCheck className="h-3.5 w-3.5" aria-hidden />
            Passphrases match perfectly
          </p>
        ) : null}
      </div>

      <Button type="submit" size="lg" className="w-full" disabled={register_.isPending}>
        {register_.isPending ? "Creating your space…" : "Create my space"}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Already have a space?{" "}
        <Link to="/login" className="font-medium text-primary underline-offset-4 hover:underline">
          Log in
        </Link>
      </p>
    </form>
  )
}
