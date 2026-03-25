import { api, HydrateClient } from "@/trpc/server"
import { RestaurantList } from "./_components/restaurant-list"

export default async function CustomerHomePage() {
  void api.restaurant.getAll.prefetch()

  return (
    <HydrateClient>
      <div className="space-y-6">
        <div>
          <h1 className="text-white text-2xl font-bold">Restaurants</h1>
          <p className="text-white/40 text-sm mt-1">
            Order from your favourite places
          </p>
        </div>
        <RestaurantList />
      </div>
    </HydrateClient>
  )
}