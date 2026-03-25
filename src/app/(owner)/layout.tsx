import { redirect } from "next/navigation"
import { getSession } from "@/server/better-auth/server"
import { Navbar } from "@/components/shared/navbar"

export default async function OwnerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getSession()

  if (!session?.user) redirect("/sign-in")
  if ((session.user as any).role !== "OWNER") redirect("/sign-in")

  return (
    <div className="min-h-screen bg-zinc-950">
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  )
}