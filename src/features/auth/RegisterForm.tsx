import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Link, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ApiError, getErrorMessage } from "@/lib/api/errors"
import { useRegister } from "./hooks"
import { registerSchema, type RegisterInput } from "./schemas"

export function RegisterForm() {
  const navigate = useNavigate()
  const register_ = useRegister()

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<RegisterInput>({ resolver: zodResolver(registerSchema) })

  const onSubmit = handleSubmit(async (values) => {
    try {
      await register_.mutateAsync(values)
      navigate("/dashboard", { replace: true })
    } catch (e) {
      // Map field-level errors from server (e.g. email already taken)
      if (e instanceof ApiError && e.fieldErrors.email) {
        setError("email", { message: getErrorMessage(e) })
      }
      setError("root", { message: getErrorMessage(e) })
    }
  })

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-5">
      <p className="text-sm text-muted-foreground">
        Your entries are private. Only you can see them.
      </p>

      <div className="space-y-2">
        <Label htmlFor="reg-email">Email</Label>
        <Input
          id="reg-email"
          type="email"
          autoComplete="email"
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? "reg-email-error" : undefined}
          {...register("email")}
        />
        {errors.email && (
          <p id="reg-email-error" className="text-sm text-destructive">{errors.email.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="reg-password">Password</Label>
        <Input
          id="reg-password"
          type="password"
          autoComplete="new-password"
          aria-invalid={!!errors.password}
          aria-describedby={errors.password ? "reg-password-error" : undefined}
          {...register("password")}
        />
        {errors.password && (
          <p id="reg-password-error" className="text-sm text-destructive">{errors.password.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="reg-confirm">Confirm password</Label>
        <Input
          id="reg-confirm"
          type="password"
          autoComplete="new-password"
          aria-invalid={!!errors.confirmPassword}
          aria-describedby={errors.confirmPassword ? "reg-confirm-error" : undefined}
          {...register("confirmPassword")}
        />
        {errors.confirmPassword && (
          <p id="reg-confirm-error" className="text-sm text-destructive">
            {errors.confirmPassword.message}
          </p>
        )}
      </div>

      {errors.root && (
        <p role="alert" className="text-sm text-destructive">{errors.root.message}</p>
      )}

      <Button type="submit" size="lg" className="w-full" disabled={register_.isPending}>
        {register_.isPending ? "Creating…" : "Create my space"}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Already have a space? <Link to="/login" className="underline">Log in</Link>
      </p>
    </form>
  )
}
