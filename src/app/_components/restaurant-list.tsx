"use client"

import { UtensilsCrossed } from "lucide-react"
import { api } from "@/trpc/react"
import { RestaurantCard } from "@/components/customer/restaurant-card"

export function RestaurantList() {
  const { data: restaurants, isLoading } = api.restaurant.getAll.useQuery()

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-40 rounded-xl border border-white/10 bg-white/5 animate-pulse"
          />
        ))}
      </div>
    )
  }

  if (!restaurants?.length) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
          <UtensilsCrossed className="w-7 h-7 text-white/20" />
        </div>
        <p className="text-white/40">No restaurants available yet</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {restaurants.map((r) => (
        <RestaurantCard
          key={r.id}
          id={r.id}
          name={r.name}
          description={r.description}
          address={r.address}
          phone={r.phone}
          isOpen={r.isOpen}
        />
      ))}
    </div>
  )
}