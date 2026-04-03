import { api, HydrateClient } from "@/trpc/server"
import { OwnerDashboard } from "@/app/_components/owner-dashboard"

export default async function OwnerHomePage() {
  // Prefetching the data on the server
  void api.restaurant.getMyRestaurant.prefetch()

  return (
    <HydrateClient>
      <OwnerDashboard />
    </HydrateClient>
  )
}