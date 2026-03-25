"use client"

import { useState } from "react"
import { ClipboardList } from "lucide-react"
import { api } from "@/trpc/react"
import { OrderCard } from "@/components/owner/order-card"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

const STATUS_TABS = [
  { value: "active",    label: "Active"     },
  { value: "completed", label: "Completed"  },
  { value: "all",       label: "All"        },
]

const ACTIVE_STATUSES    = ["PLACED", "CONFIRMED", "PREPARING", "READY_FOR_PICKUP"]
const COMPLETED_STATUSES = ["DELIVERED", "REJECTED", "CANCELLED"]

export function OwnerOrderList() {
  const [tab, setTab] = useState("active")

  const { data: restaurant, isLoading } =
    api.restaurant.getMyRestaurant.useQuery()

  const filteredOrders = restaurant?.orders.filter((o) => {
    if (tab === "active")    return ACTIVE_STATUSES.includes(o.status)
    if (tab === "completed") return COMPLETED_STATUSES.includes(o.status)
    return true
  }) ?? []

  const sorted = [...filteredOrders].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  )

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-48 rounded-xl bg-white/5" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="bg-white/5 border border-white/10">
          {STATUS_TABS.map((t) => (
            <TabsTrigger
              key={t.value}
              value={t.value}
              className="data-[state=active]:bg-orange-500 data-[state=active]:text-white text-white/50"
            >
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {sorted.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4 rounded-xl border border-white/10 bg-white/5">
          <ClipboardList className="w-8 h-8 text-white/20" />
          <p className="text-white/40 text-sm">No orders in this category</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sorted.map((order) => (
            <OrderCard
              key={order.id}
              id={order.id}
              status={order.status}
              deliveryAddress={order.deliveryAddress}
              totalAmount={order.totalAmount}
              notes={order.notes}
              createdAt={order.createdAt}
              customer={order.customer}
              items={order.items}
            />
          ))}
        </div>
      )}
    </div>
  )
}