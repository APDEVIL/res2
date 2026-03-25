"use client"

import { useState } from "react"
import { PackageCheck } from "lucide-react"
import { api } from "@/trpc/react"
import { DeliveryCard } from "@/components/delivery/delivery-card"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

const ACTIVE_STATUSES    = ["OUT_FOR_DELIVERY"]
const COMPLETED_STATUSES = ["DELIVERED"]

export function MyDeliveries() {
  const [tab, setTab] = useState("active")

  const { data: deliveries, isLoading } =
    api.delivery.getMyDeliveries.useQuery()

  const filtered = deliveries?.filter((o) => {
    if (tab === "active")    return ACTIVE_STATUSES.includes(o.status)
    if (tab === "completed") return COMPLETED_STATUSES.includes(o.status)
    return true
  }) ?? []

  const sorted = [...filtered].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  )

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-64 rounded-xl bg-white/5" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="bg-white/5 border border-white/10">
          {[
            { value: "active",    label: "Active"    },
            { value: "completed", label: "Completed" },
            { value: "all",       label: "All"       },
          ].map((t) => (
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
          <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
            <PackageCheck className="w-7 h-7 text-white/20" />
          </div>
          <p className="text-white/40">No deliveries in this category</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sorted.map((order) => (
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
              mode="active"
            />
          ))}
        </div>
      )}
    </div>
  )
}
