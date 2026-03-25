import { api, HydrateClient } from "@/trpc/server"
import { OwnerDashboard } from "@/app/_components/owner-dashboard"

export default async function OwnerHomePage() {
  void api.restaurant.getMyRestaurant.prefetch()

  return (
    <HydrateClient>
      <OwnerDashboard />
    </HydrateClient>
  )
}