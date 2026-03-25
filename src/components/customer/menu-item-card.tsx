"use client"

import { Plus, Minus, ShoppingBag } from "lucide-react"
import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useCart } from "@/hooks/use-cart"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

interface MenuItemCardProps {
  id:           string
  name:         string
  description:  string | null
  price:        string
  isAvailable:  boolean
  restaurantId: string
}

export function MenuItemCard({
  id,
  name,
  description,
  price,
  isAvailable,
  restaurantId,
}: MenuItemCardProps) {
  const [quantity, setQuantity] = useState(1)
  const { addItem, items } = useCart()

  const existingItem = items.find((i) => i.menuItemId === id)

  const handleAdd = () => {
    addItem({
      menuItemId: id,
      name,
      price,
      quantity,
      restaurantId,
    })
    toast.success(`${name} added to cart`)
    setQuantity(1)
  }

  return (
    <Card
      className={cn(
        "border border-white/10 bg-white/5 backdrop-blur-sm transition-all duration-200",
        !isAvailable && "opacity-50 pointer-events-none",
        isAvailable && "hover:border-orange-500/30",
      )}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="text-white font-medium truncate">{name}</h4>
              {!isAvailable && (
                <Badge className="bg-red-500/20 text-red-400 border-0 text-xs shrink-0">
                  Unavailable
                </Badge>
              )}
              {existingItem && (
                <Badge className="bg-orange-500/20 text-orange-400 border-0 text-xs shrink-0">
                  {existingItem.quantity} in cart
                </Badge>
              )}
            </div>
            {description && (
              <p className="text-white/40 text-sm line-clamp-2 mb-3">
                {description}
              </p>
            )}
            <span className="text-orange-400 font-semibold text-base">
              ₹{parseFloat(price).toFixed(2)}
            </span>
          </div>

          <div className="flex flex-col items-end gap-2 shrink-0">
            <div className="flex items-center gap-2">
              <Button
                size="icon"
                variant="ghost"
                className="h-7 w-7 rounded-full border border-white/10 text-white/60 hover:text-white hover:border-white/30"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              >
                <Minus className="w-3 h-3" />
              </Button>
              <span className="text-white text-sm w-4 text-center">
                {quantity}
              </span>
              <Button
                size="icon"
                variant="ghost"
                className="h-7 w-7 rounded-full border border-white/10 text-white/60 hover:text-white hover:border-white/30"
                onClick={() => setQuantity((q) => q + 1)}
              >
                <Plus className="w-3 h-3" />
              </Button>
            </div>

            <Button
              size="sm"
              onClick={handleAdd}
              className="bg-orange-500 hover:bg-orange-600 text-white text-xs h-8 px-3 gap-1.5"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              Add
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}