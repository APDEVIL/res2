import { api, HydrateClient } from "@/trpc/server"
import { MyDeliveries } from "@/app/_components/my-deliveries"

export default async function MyDeliveriesPage() {
  void api.delivery.getMyDeliveries.prefetch()

  return (
    <HydrateClient>
      <div className="space-y-6">
        <div>
          <h1 className="text-white text-2xl font-bold">My Deliveries</h1>
          <p className="text-white/40 text-sm mt-1">
            Your active and completed deliveries
          </p>
        </div>
        <MyDeliveries />
      </div>
    </HydrateClient>
  )
}