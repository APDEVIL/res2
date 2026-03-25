import { redirect } from "next/navigation"
import { getSession } from "@/server/better-auth/server"
import { ROLE_REDIRECTS } from "@/lib/constants"
import type { UserRole } from "@/lib/constants"

export default async function RootPage() {
  const session = await getSession()

  if (!session?.user) {
    redirect("/sign-in")
  }

  const role = (session.user as any).role as UserRole
  redirect(ROLE_REDIRECTS[role] ?? "/sign-in")
}