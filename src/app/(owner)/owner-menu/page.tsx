import { api, HydrateClient } from "@/trpc/server"
import { OwnerMenu } from "@/app/_components/owner-menu"

export default async function OwnerMenuPage() {
  void api.restaurant.getMyRestaurant.prefetch()

  return (
    <HydrateClient>
      <div className="space-y-6">
        <div>
          <h1 className="text-white text-2xl font-bold">Menu</h1>
          <p className="text-white/40 text-sm mt-1">
            Manage your menu items and categories
          </p>
        </div>
        <OwnerMenu />
      </div>
    </HydrateClient>
  )
}