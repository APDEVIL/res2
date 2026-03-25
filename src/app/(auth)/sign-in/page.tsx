"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { UtensilsCrossed, Eye, EyeOff } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { authClient } from "@/server/better-auth/client"
import { signInSchema, type SignInInput } from "@/lib/validators"
import { ROLE_REDIRECTS } from "@/lib/constants"
import type { UserRole } from "@/lib/constants"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

export default function SignInPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignInInput>({
    resolver: zodResolver(signInSchema),
  })

  const onSubmit = async (data: SignInInput) => {
    const { error, data: session } = await authClient.signIn.email({
      email:    data.email,
      password: data.password,
    })

    if (error) {
      toast.error(error.message ?? "Sign in failed")
      return
    }

    const role = (session?.user as any)?.role as UserRole
    router.push(ROLE_REDIRECTS[role] ?? "/")
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center mb-4">
            <UtensilsCrossed className="w-6 h-6 text-orange-500" />
          </div>
          <h1 className="text-white text-2xl font-bold">Welcome back</h1>
          <p className="text-white/40 text-sm mt-1">Sign in to your FoodRush account</p>
        </div>

        <Card className="border border-white/10 bg-white/5 backdrop-blur-sm">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label className="text-white/70 text-sm">Email</Label>
                <Input
                  {...register("email")}
                  type="email"
                  placeholder="you@example.com"
                  className={cn(
                    "bg-white/5 border-white/10 text-white placeholder:text-white/20",
                    "focus:border-orange-500/50 focus:ring-0",
                    errors.email && "border-red-500/50",
                  )}
                />
                {errors.email && (
                  <p className="text-red-400 text-xs">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-white/70 text-sm">Password</Label>
                <div className="relative">
                  <Input
                    {...register("password")}
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className={cn(
                      "bg-white/5 border-white/10 text-white placeholder:text-white/20 pr-10",
                      "focus:border-orange-500/50 focus:ring-0",
                      errors.password && "border-red-500/50",
                    )}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                  >
                    {showPassword
                      ? <EyeOff className="w-4 h-4" />
                      : <Eye className="w-4 h-4" />
                    }
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-400 text-xs">{errors.password.message}</p>
                )}
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold h-11 mt-2"
              >
                {isSubmitting ? "Signing in..." : "Sign in"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-white/40 text-sm mt-6">
          Don't have an account?{" "}
          <Link
            href="/sign-up"
            className="text-orange-400 hover:text-orange-300 transition-colors"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  )
}