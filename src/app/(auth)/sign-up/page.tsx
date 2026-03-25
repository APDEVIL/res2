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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { authClient } from "@/server/better-auth/client"
import { signUpSchema, type SignUpInput } from "@/lib/validators"
import { ROLE_REDIRECTS } from "@/lib/constants"
import type { UserRole } from "@/lib/constants"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

const ROLE_OPTIONS = [
  { value: "CUSTOMER", label: "Customer",           description: "Order food" },
  { value: "OWNER",    label: "Restaurant Owner",   description: "Manage your restaurant" },
  { value: "DELIVERY", label: "Delivery Partner",   description: "Deliver orders" },
]

export default function SignUpPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<SignUpInput>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { role: "CUSTOMER" },
  })

  const onSubmit = async (data: SignUpInput) => {
    const { error } = await authClient.signUp.email({
      name:     data.name,
      email:    data.email,
      password: data.password,
      role:     data.role,
      phone:    data.phone,
    } as any)

    if (error) {
      toast.error(error.message ?? "Sign up failed")
      return
    }

    toast.success("Account created!")
    router.push(ROLE_REDIRECTS[data.role as UserRole] ?? "/")
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center mb-4">
            <UtensilsCrossed className="w-6 h-6 text-orange-500" />
          </div>
          <h1 className="text-white text-2xl font-bold">Create account</h1>
          <p className="text-white/40 text-sm mt-1">Join FoodRush today</p>
        </div>

        <Card className="border border-white/10 bg-white/5 backdrop-blur-sm">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label className="text-white/70 text-sm">Full Name</Label>
                <Input
                  {...register("name")}
                  placeholder="John Doe"
                  className={cn(
                    "bg-white/5 border-white/10 text-white placeholder:text-white/20",
                    "focus:border-orange-500/50 focus:ring-0",
                    errors.name && "border-red-500/50",
                  )}
                />
                {errors.name && (
                  <p className="text-red-400 text-xs">{errors.name.message}</p>
                )}
              </div>

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
                <Label className="text-white/70 text-sm">
                  Phone
                  <span className="text-white/30 ml-1">(optional)</span>
                </Label>
                <Input
                  {...register("phone")}
                  type="tel"
                  placeholder="+91 98765 43210"
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-orange-500/50 focus:ring-0"
                />
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

              <div className="space-y-2">
                <Label className="text-white/70 text-sm">I am a</Label>
                <Select
                  defaultValue="CUSTOMER"
                  onValueChange={(val) =>
                    setValue("role", val as SignUpInput["role"])
                  }
                >
                  <SelectTrigger className="bg-white/5 border-white/10 text-white focus:border-orange-500/50 focus:ring-0">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-white/10">
                    {ROLE_OPTIONS.map((opt) => (
                      <SelectItem
                        key={opt.value}
                        value={opt.value}
                        className="text-white/70 focus:text-white focus:bg-white/5"
                      >
                        <div className="flex flex-col">
                          <span>{opt.label}</span>
                          <span className="text-white/30 text-xs">
                            {opt.description}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.role && (
                  <p className="text-red-400 text-xs">{errors.role.message}</p>
                )}
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold h-11 mt-2"
              >
                {isSubmitting ? "Creating account..." : "Create account"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-white/40 text-sm mt-6">
          Already have an account?{" "}
          <Link
            href="/sign-in"
            className="text-orange-400 hover:text-orange-300 transition-colors"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}