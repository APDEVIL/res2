import { api, HydrateClient } from "@/trpc/server"
import { OwnerOrderList } from "@/app/_components/owner-order-list"

export default async function OwnerOrdersPage() {
  void api.restaurant.getMyRestaurant.prefetch()

  return (
    <HydrateClient>
      <div className="space-y-6">
        <div>
          <h1 className="text-white text-2xl font-bold">Orders</h1>
          <p className="text-white/40 text-sm mt-1">
            Manage and update incoming orders
          </p>
        </div>
        <OwnerOrderList />
      </div>
    </HydrateClient>
  )
}