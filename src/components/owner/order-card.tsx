"use client"

import { Clock, MapPin, User, ChevronDown } from "lucide-react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Separator } from "@/components/ui/separator"
import { api } from "@/trpc/react"
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLOR } from "@/lib/constants"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

const OWNER_TRANSITIONS: Record<string, string[]> = {
  PLACED:           ["CONFIRMED", "REJECTED"],
  CONFIRMED:        ["PREPARING"],
  PREPARING:        ["READY_FOR_PICKUP"],
  READY_FOR_PICKUP: [],
  REJECTED:         [],
  CANCELLED:        [],
  OUT_FOR_DELIVERY: [],
  DELIVERED:        [],
}

interface OrderItem {
  id:       string
  name:     string
  price:    string
  quantity: number
}

interface OrderCardProps {
  id:              string
  status:          string
  deliveryAddress: string
  totalAmount:     string
  notes:           string | null
  createdAt:       Date
  customer:        { name: string; email: string }
  items:           OrderItem[]
  onStatusUpdate?: () => void
}

export function OrderCard({
  id,
  status,
  deliveryAddress,
  totalAmount,
  notes,
  createdAt,
  customer,
  items,
  onStatusUpdate,
}: OrderCardProps) {
  const utils = api.useUtils()

  const updateStatus = api.order.updateStatus.useMutation({
    onSuccess: () => {
      toast.success("Order status updated")
      void utils.order.getRestaurantOrders.invalidate()
      onStatusUpdate?.()
    },
    onError: (err) => toast.error(err.message),
  })

  const nextStatuses = OWNER_TRANSITIONS[status] ?? []

  return (
    <Card className="border border-white/10 bg-white/5 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <p className="text-white/40 text-xs font-mono">
              #{id.slice(0, 8).toUpperCase()}
            </p>
            <div className="flex items-center gap-2">
              <User className="w-3.5 h-3.5 text-orange-500/70" />
              <span className="text-white text-sm font-medium">
                {customer.name}
              </span>
              <span className="text-white/30 text-xs">{customer.email}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Badge
              className={cn(
                "border-0 text-xs font-medium",
                ORDER_STATUS_COLOR[status],
              )}
            >
              {ORDER_STATUS_LABELS[status]}
            </Badge>

            {nextStatuses.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 px-2 border border-white/10 text-white/60 hover:text-white hover:border-white/30 gap-1"
                    disabled={updateStatus.isPending}
                  >
                    Update
                    <ChevronDown className="w-3 h-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="bg-zinc-900 border-white/10"
                >
                  {nextStatuses.map((s) => (
                    <DropdownMenuItem
                      key={s}
                      className="text-white/70 hover:text-white focus:text-white focus:bg-white/5 cursor-pointer"
                      onClick={() =>
                        updateStatus.mutate({ orderId: id, status: s as any })
                      }
                    >
                      {ORDER_STATUS_LABELS[s]}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
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

        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-white/40 text-xs">
              <MapPin className="w-3 h-3 text-orange-500/50" />
              <span className="truncate max-w-[200px]">{deliveryAddress}</span>
            </div>
            {notes && (
              <p className="text-white/30 text-xs italic">Note: {notes}</p>
            )}
            <div className="flex items-center gap-1.5 text-white/30 text-xs">
              <Clock className="w-3 h-3" />
              <span>{new Date(createdAt).toLocaleTimeString()}</span>
            </div>
          </div>

          <div className="text-right">
            <p className="text-white/40 text-xs mb-0.5">Total</p>
            <p className="text-orange-400 font-bold text-lg">
              ₹{parseFloat(totalAmount).toFixed(2)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}