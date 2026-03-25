import { api, HydrateClient } from "@/trpc/server"
import { AvailableOrders } from "@/app/_components/available-orders"

export default async function DeliveryHomePage() {
  void api.delivery.getAvailableOrders.prefetch()

  return (
    <HydrateClient>
      <div className="space-y-6">
        <div>
          <h1 className="text-white text-2xl font-bold">Available Pickups</h1>
          <p className="text-white/40 text-sm mt-1">
            Orders ready to be picked up and delivered
          </p>
        </div>
        <AvailableOrders />
      </div>
    </HydrateClient>
  )
}