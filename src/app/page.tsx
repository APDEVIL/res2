import { redirect } from "next/navigation"
import { getSession } from "@/server/better-auth/server"
import { ROLE_REDIRECTS } from "@/lib/constants"
import type { UserRole } from "@/lib/constants"
import CustomerHomePage from "./(customer)/page" // Import your customer view

export default async function RootPage() {
  const session = await getSession()

  if (!session?.user) {
    redirect("/sign-in")
  }

  const role = (session.user as any).role as UserRole
  const destination = ROLE_REDIRECTS[role] ?? "/sign-in"

  // FIX: If the destination is the root "/", don't redirect. 
  // Just render the Customer component directly or use a different path.
  if (destination === "/") {
    return <CustomerHomePage />
  }

  redirect(destination)
}