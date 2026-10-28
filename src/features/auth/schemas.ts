import { z } from "zod"

export const loginSchema = z.object({
  email: z.string().min(1, "Enter your email"),
  password: z.string().min(1, "Enter your password"),
})

export const registerSchema = z
  .object({
    email: z.string().min(1, "Enter your email").email("That doesn't look like an email"),
    // API requires minLength 10
    password: z.string().min(10, "Use at least 10 characters"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords don't match",
  })

export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>
