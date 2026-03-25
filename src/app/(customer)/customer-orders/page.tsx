import { api, HydrateClient } from "@/trpc/server"
import { OrderList } from "@/app/_components/order-list"

export default async function CustomerOrdersPage() {
  void api.order.getMyOrders.prefetch()

  return (
    <HydrateClient>
      <div className="space-y-6">
        <div>
          <h1 className="text-white text-2xl font-bold">My Orders</h1>
          <p className="text-white/40 text-sm mt-1">
            Track your current and past orders
          </p>
        </div>
        <OrderList />
      </div>
    </HydrateClient>
  )
}