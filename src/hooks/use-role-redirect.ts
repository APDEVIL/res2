"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "./use-session"
import { type UserRole, ROLE_REDIRECTS } from "@/lib/constants"

export const useRoleRedirect = (requiredRole: UserRole) => {
  const { role, isLoading, isLoggedIn } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (isLoading) return

    if (!isLoggedIn) {
      router.replace("/sign-in")
      return
    }

    if (role !== requiredRole) {
      router.replace(ROLE_REDIRECTS[role as UserRole] ?? "/sign-in")
    }
  }, [role, isLoading, isLoggedIn, requiredRole, router])

  return { isLoading, isAuthorized: role === requiredRole }
}