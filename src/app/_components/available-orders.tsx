"use client"

import { Bike } from "lucide-react"
import { api } from "@/trpc/react"
import { DeliveryCard } from "@/components/delivery/delivery-card"
import { Skeleton } from "@/components/ui/skeleton"

export function AvailableOrders() {
  // Updated to use api.order.getAvailablePickups to match the router logic
  const { data: orders, isLoading } =
    api.order.getAvailablePickups.useQuery(undefined, {
      refetchInterval: 30000,
    })

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-64 rounded-xl bg-white/5" />
        ))}
      </div>
    )
  }

  if (!orders?.length) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4 rounded-xl border border-white/10 bg-white/5">
        <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
          <Bike className="w-7 h-7 text-white/20" />
        </div>
        <p className="text-white/40">No orders available right now</p>
        <p className="text-white/30 text-sm">
          Check back soon — new orders appear automatically
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {orders.map((order) => (
        <DeliveryCard
          key={order.id}
          id={order.id}
          status={order.status}
          deliveryAddress={order.deliveryAddress}
          totalAmount={order.totalAmount}
          notes={order.notes}
          createdAt={order.createdAt}
          customer={order.customer}
          restaurant={order.restaurant}
          items={order.items}
          mode="available"
        />
      ))}
    </div>
  )
}