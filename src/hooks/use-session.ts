import { authClient } from "@/server/better-auth/client"

export const useSession = () => {
  const { data: session, isPending, error } = authClient.useSession()

  return {
    session,
    user:       session?.user ?? null,
    role:       (session?.user as any)?.role ?? null,
    isLoading:  isPending,
    isLoggedIn: !!session?.user,
    error,
  }
}