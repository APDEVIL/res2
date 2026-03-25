"use client"

import { MapPin, User, Package, Clock, CheckCircle } from "lucide-react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { api } from "@/trpc/react"
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLOR } from "@/lib/constants"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface OrderItem {
  id:       string
  name:     string
  price:    string
  quantity: number
}

interface DeliveryCardProps {
  id:              string
  status:          string
  deliveryAddress: string
  totalAmount:     string
  notes:           string | null
  createdAt:       Date
  customer:        { name: string; email: string }
  restaurant:      { name: string; address: string }
  items:           OrderItem[]
  mode:            "available" | "active"
}

export function DeliveryCard({
  id,
  status,
  deliveryAddress,
  totalAmount,
  notes,
  createdAt,
  customer,
  restaurant,
  items,
  mode,
}: DeliveryCardProps) {
  const utils = api.useUtils()

  const acceptOrder = api.delivery.acceptOrder.useMutation({
    onSuccess: () => {
      toast.success("Order accepted — go pick it up!")
      void utils.delivery.getAvailableOrders.invalidate()
      void utils.delivery.getMyDeliveries.invalidate()
    },
    onError: (err) => toast.error(err.message),
  })

  const markDelivered = api.delivery.markDelivered.useMutation({
    onSuccess: () => {
      toast.success("Order marked as delivered")
      void utils.delivery.getMyDeliveries.invalidate()
    },
    onError: (err) => toast.error(err.message),
  })

  const isPending = acceptOrder.isPending || markDelivered.isPending

  return (
    <Card className="border border-white/10 bg-white/5 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <p className="text-white/40 text-xs font-mono">
              #{id.slice(0, 8).toUpperCase()}
            </p>
            <div className="flex items-center gap-2">
              <Package className="w-3.5 h-3.5 text-orange-500/70" />
              <span className="text-white font-medium text-sm">
                {restaurant.name}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <User className="w-3.5 h-3.5 text-orange-500/70" />
              <span className="text-white/60 text-sm">{customer.name}</span>
              <span className="text-white/30 text-xs">{customer.email}</span>
            </div>
          </div>

          <Badge
            className={cn(
              "border-0 text-xs font-medium shrink-0",
              ORDER_STATUS_COLOR[status],
            )}
          >
            {ORDER_STATUS_LABELS[status]}
          </Badge>
        </div>
      </CardHeader>

      <Separator className="bg-white/10" />

      <CardContent className="pt-4 space-y-4">
        <div className="space-y-2">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between text-sm"
            >
              <div className="flex items-center gap-2">
                <span className="text-orange-500/70 font-medium">
                  x{item.quantity}
                </span>
                <span className="text-white/80">{item.name}</span>
              </div>
              <span className="text-white/40">
                ₹{(parseFloat(item.price) * item.quantity).toFixed(2)}
              </span>
            </div>
          ))}
        </div>

        <Separator className="bg-white/5" />

        <div className="space-y-2">
          <div className="flex items-start gap-2 text-white/40 text-xs">
            <Package className="w-3.5 h-3.5 text-orange-500/50 mt-0.5 shrink-0" />
            <div>
              <p className="text-white/30 mb-0.5">Pickup from</p>
              <p className="text-white/60">{restaurant.address}</p>
            </div>
          </div>

          <div className="flex items-start gap-2 text-white/40 text-xs">
            <MapPin className="w-3.5 h-3.5 text-orange-500/50 mt-0.5 shrink-0" />
            <div>
              <p className="text-white/30 mb-0.5">Deliver to</p>
              <p className="text-white/60">{deliveryAddress}</p>
            </div>
          </div>

          {notes && (
            <p className="text-white/30 text-xs italic pl-5">
              Note: {notes}
            </p>
          )}

          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-1.5 text-white/30 text-xs">
              <Clock className="w-3 h-3" />
              <span>{new Date(createdAt).toLocaleTimeString()}</span>
            </div>
            <p className="text-orange-400 font-bold text-lg">
              ₹{parseFloat(totalAmount).toFixed(2)}
            </p>
          </div>
        </div>

        {mode === "available" && (
          <Button
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium h-10"
            disabled={isPending}
            onClick={() => acceptOrder.mutate({ orderId: id })}
          >
            {acceptOrder.isPending ? "Accepting..." : "Accept Order"}
          </Button>
        )}

        {mode === "active" && status === "OUT_FOR_DELIVERY" && (
          <Button
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium h-10 gap-2"
            disabled={isPending}
            onClick={() => markDelivered.mutate({ orderId: id })}
          >
            <CheckCircle className="w-4 h-4" />
            {markDelivered.isPending ? "Marking..." : "Mark as Delivered"}
          </Button>
        )}
      </CardContent>
    </Card>
  )
}