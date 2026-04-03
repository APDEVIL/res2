"use client"

import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useCart } from "@/hooks/use-cart"
import { api } from "@/trpc/react"
import { placeOrderSchema } from "@/lib/validators"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import type { PlaceOrderInput } from "@/lib/validators"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { useEffect } from "react"

export function Cart() {
  const router = useRouter()
  const { items, removeItem, updateQty, clearCart, totalAmount, restaurantId } = useCart()

  const { 
    register, 
    handleSubmit, 
    setValue,
    formState: { errors } 
  } = useForm<PlaceOrderInput>({
    resolver: zodResolver(placeOrderSchema),
    defaultValues: { 
      deliveryAddress: "",
      notes: "",
      items: [], 
    },
  })

  // Synchronize Zustand items with React Hook Form state whenever items change
  useEffect(() => {
    setValue("items", items.map(i => ({
      menuItemId: i.menuItemId,
      quantity: i.quantity
    })))
  }, [items, setValue])

  const placeOrder = api.order.place.useMutation({
    onSuccess: () => {
      clearCart()
      toast.success("Order placed successfully!")
      router.push("/customer-orders") // Updated to match your folder structure
    },
    onError: (err) => {
      toast.error(err.message)
    },
  })

  const onSubmit = (data: PlaceOrderInput) => {
    if (!restaurantId) {
      toast.error("Restaurant information is missing")
      return
    }
    
    placeOrder.mutate({
      restaurantId,
      deliveryAddress: data.deliveryAddress,
      notes: data.notes,
      items: data.items, // Now correctly populated from form state
    })
  }

  // Handle silent validation failures
  const onInvalid = (errors: any) => {
    console.error("Form Validation Errors:", errors)
    if (errors.deliveryAddress) toast.error("Delivery address is required")
    else if (errors.items) toast.error("Your cart is empty")
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <div className="w-20 h-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
          <ShoppingBag className="w-9 h-9 text-white/20" />
        </div>
        <p className="text-white/40 text-lg">Your cart is empty</p>
        <Button
          variant="ghost"
          className="text-orange-400 hover:text-orange-300 gap-2"
          onClick={() => router.push("/")}
        >
          <ArrowLeft className="w-4 h-4" />
          Browse restaurants
        </Button>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-8">
        <Button
          variant="ghost"
          size="icon"
          className="text-white/60 hover:text-white"
          onClick={() => router.back()}
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-2xl font-bold text-white">Your Cart</h1>
        <span className="text-white/40 text-sm ml-auto">
          {items.length} {items.length === 1 ? "item" : "items"}
        </span>
      </div>

      <div className="space-y-3 mb-6">
        {items.map((item) => (
          <div
            key={item.menuItemId}
            className="flex items-center gap-4 p-4 rounded-xl border border-white/10 bg-white/5"
          >
            <div className="flex-1 min-w-0">
              <p className="text-white font-medium truncate">{item.name}</p>
              <p className="text-orange-400 text-sm">
                ₹{(parseFloat(item.price) * item.quantity).toFixed(2)}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                size="icon"
                variant="ghost"
                className="h-7 w-7 rounded-full border border-white/10 text-white/60 hover:text-white"
                onClick={() => updateQty(item.menuItemId, item.quantity - 1)}
              >
                <Minus className="w-3 h-3" />
              </Button>
              <span className="text-white text-sm w-4 text-center">
                {item.quantity}
              </span>
              <Button
                size="icon"
                variant="ghost"
                className="h-7 w-7 rounded-full border border-white/10 text-white/60 hover:text-white"
                onClick={() => updateQty(item.menuItemId, item.quantity + 1)}
              >
                <Plus className="w-3 h-3" />
              </Button>
            </div>

            <Button
              size="icon"
              variant="ghost"
              className="h-7 w-7 text-red-400/60 hover:text-red-400 hover:bg-red-500/10"
              onClick={() => removeItem(item.menuItemId)}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </div>
        ))}
      </div>

      <Separator className="bg-white/10 mb-6" />

      <div className="flex items-center justify-between mb-8">
        <span className="text-white/60 text-lg">Total</span>
        <span className="text-white font-bold text-2xl">
          ₹{totalAmount().toFixed(2)}
        </span>
      </div>

      <form onSubmit={handleSubmit(onSubmit, onInvalid)} className="space-y-5">
        <div className="space-y-2">
          <Label className="text-white/70 text-sm">Delivery Address</Label>
          <Input
            {...register("deliveryAddress")}
            placeholder="Enter your full delivery address"
            className={cn(
              "bg-white/5 border-white/10 text-white placeholder:text-white/20",
              "focus:border-orange-500/50 focus:ring-orange-500/20",
              errors.deliveryAddress && "border-red-500/50",
            )}
          />
          {errors.deliveryAddress && (
            <p className="text-red-400 text-xs">{errors.deliveryAddress.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label className="text-white/70 text-sm">Notes (optional)</Label>
          <Textarea
            {...register("notes")}
            placeholder="Any special instructions?"
            rows={3}
            className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-orange-500/50 resize-none"
          />
        </div>

        <Button
          type="submit"
          disabled={placeOrder.isPending}
          className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold h-12 text-base"
        >
          {placeOrder.isPending ? "Placing Order..." : `Place Order · ₹${totalAmount().toFixed(2)}`}
        </Button>
      </form>
    </div>
  )
}