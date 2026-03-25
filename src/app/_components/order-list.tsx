"use client"

import { ClipboardList } from "lucide-react"
import Link from "next/link"
import { api } from "@/trpc/react"
import { OrderStatusBadge } from "@/components/shared/order-status-badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"

export function OrderList() {
  const { data: orders, isLoading } = api.order.getMyOrders.useQuery()

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-36 w-full rounded-xl bg-white/5" />
        ))}
      </div>
    )
  }

  if (!orders?.length) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
          <ClipboardList className="w-7 h-7 text-white/20" />
        </div>
        <p className="text-white/40">No orders yet</p>
        <Link href="/">
          <Button
            variant="ghost"
            className="text-orange-400 hover:text-orange-300"
          >
            Browse restaurants
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {orders.map((order) => (
        <Card
          key={order.id}
          className="border border-white/10 bg-white/5 backdrop-blur-sm"
        >
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="space-y-0.5">
                <p className="text-white font-medium">
                  {order.restaurant.name}
                </p>
                <p className="text-white/40 text-xs font-mono">
                  #{order.id.slice(0, 8).toUpperCase()}
                </p>
              </div>
              <OrderStatusBadge status={order.status} />
            </div>

            <Separator className="bg-white/5 mb-3" />

            <div className="space-y-1 mb-3">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between text-sm"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-orange-500/70">x{item.quantity}</span>
                    <span className="text-white/70">{item.name}</span>
                  </div>
                  <span className="text-white/40">
                    ₹{(parseFloat(item.price) * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between">
              <p className="text-white/30 text-xs">
                {new Date(order.createdAt).toLocaleDateString("en-IN", {
                  day:   "numeric",
                  month: "short",
                  year:  "numeric",
                  hour:  "2-digit",
                  minute: "2-digit",
                })}
              </p>
              <p className="text-orange-400 font-bold">
                ₹{parseFloat(order.totalAmount).toFixed(2)}
              </p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}