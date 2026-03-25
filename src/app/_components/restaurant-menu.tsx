"use client"

import { MapPin, Phone, ShoppingBag } from "lucide-react"
import Link from "next/link"
import { api } from "@/trpc/react"
import { MenuItemCard } from "@/components/customer/menu-item-card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useCart } from "@/hooks/use-cart"
import { cn } from "@/lib/utils"

interface Props {
  restaurantId: string
}

export function RestaurantMenu({ restaurantId }: Props) {
  const { data: restaurant, isLoading } = api.restaurant.getById.useQuery({
    id: restaurantId,
  })
  const { data: menu, isLoading: menuLoading } =
    api.menu.getByRestaurant.useQuery({ restaurantId })
  const { totalItems } = useCart()

  if (isLoading || menuLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-28 w-full rounded-xl bg-white/5" />
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-xl bg-white/5" />
          ))}
        </div>
      </div>
    )
  }

  if (!restaurant) {
    return (
      <p className="text-white/40 text-center py-24">Restaurant not found</p>
    )
  }

  const uncategorized = restaurant.menuItems.filter((i) => !i.categoryId)

  return (
    <div className="space-y-8">
      <div className="p-6 rounded-2xl border border-white/10 bg-white/5">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <h1 className="text-white text-2xl font-bold">
                {restaurant.name}
              </h1>
              <Badge
                className={cn(
                  "border-0 text-xs",
                  restaurant.isOpen
                    ? "bg-emerald-500/20 text-emerald-400"
                    : "bg-red-500/20 text-red-400",
                )}
              >
                {restaurant.isOpen ? "Open" : "Closed"}
              </Badge>
            </div>
            {restaurant.description && (
              <p className="text-white/50 text-sm">{restaurant.description}</p>
            )}
            <div className="flex flex-wrap gap-3 text-white/40 text-sm">
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-orange-500/70" />
                {restaurant.address}
              </div>
              {restaurant.phone && (
                <div className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-orange-500/70" />
                  {restaurant.phone}
                </div>
              )}
            </div>
          </div>

          {totalItems() > 0 && (
            <Link href="/cart">
              <Button className="bg-orange-500 hover:bg-orange-600 text-white gap-2 shrink-0">
                <ShoppingBag className="w-4 h-4" />
                Cart ({totalItems()})
              </Button>
            </Link>
          )}
        </div>
      </div>

      {menu?.map((category) => (
        <div key={category.id} className="space-y-3">
          <h2 className="text-white font-semibold text-lg border-b border-white/10 pb-2">
            {category.name}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {category.menuItems.map((item) => (
              <MenuItemCard
                key={item.id}
                id={item.id}
                name={item.name}
                description={item.description}
                price={item.price}
                isAvailable={item.isAvailable}
                restaurantId={restaurantId}
              />
            ))}
          </div>
        </div>
      ))}

      {uncategorized.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-white font-semibold text-lg border-b border-white/10 pb-2">
            Other Items
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {uncategorized.map((item) => (
              <MenuItemCard
                key={item.id}
                id={item.id}
                name={item.name}
                description={item.description}
                price={item.price}
                isAvailable={item.isAvailable}
                restaurantId={restaurantId}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}