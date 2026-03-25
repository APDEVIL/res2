"use client"

import { useState } from "react"
import { Plus, Pencil, Trash2, UtensilsCrossed } from "lucide-react"
import { api } from "@/trpc/react"
import { MenuItemForm } from "@/components/owner/menu-item-form"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

type EditItem = {
  id:          string
  name:        string
  description: string | null
  price:       string
  categoryId:  string | null
  isAvailable: boolean
}

export function OwnerMenu() {
  const [formOpen, setFormOpen]     = useState(false)
  const [editItem, setEditItem]     = useState<EditItem | undefined>()
  const utils                       = api.useUtils()

  const { data: restaurant, isLoading } =
    api.restaurant.getMyRestaurant.useQuery()

  const deleteItem = api.menu.deleteItem.useMutation({
    onSuccess: () => {
      toast.success("Item deleted")
      void utils.restaurant.getMyRestaurant.invalidate()
    },
    onError: (err) => toast.error(err.message),
  })

  const handleEdit = (item: EditItem) => {
    setEditItem(item)
    setFormOpen(true)
  }

  const handleClose = () => {
    setFormOpen(false)
    setEditItem(undefined)
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-32 rounded-xl bg-white/5" />
        ))}
      </div>
    )
  }

  if (!restaurant) {
    return (
      <p className="text-white/40 text-center py-24">No restaurant found</p>
    )
  }

  const categorized   = restaurant.categories
  const uncategorized = restaurant.menuItems.filter((i) => !i.categoryId)

  return (
    <>
      <div className="flex items-center justify-end">
        <Button
          onClick={() => setFormOpen(true)}
          className="bg-orange-500 hover:bg-orange-600 text-white gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Item
        </Button>
      </div>

      {restaurant.menuItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4 rounded-xl border border-white/10 bg-white/5">
          <UtensilsCrossed className="w-8 h-8 text-white/20" />
          <p className="text-white/40 text-sm">No menu items yet</p>
          <Button
            onClick={() => setFormOpen(true)}
            variant="ghost"
            className="text-orange-400 hover:text-orange-300 gap-2"
          >
            <Plus className="w-4 h-4" />
            Add your first item
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {categorized.map((category) => {
            const items = restaurant.menuItems.filter(
              (i) => i.categoryId === category.id,
            )
            if (items.length === 0) return null

            return (
              <div key={category.id} className="space-y-3">
                <h2 className="text-white font-semibold border-b border-white/10 pb-2">
                  {category.name}
                </h2>
                <div className="space-y-2">
                  {items.map((item) => (
                    <MenuItemRow
                      key={item.id}
                      item={item}
                      onEdit={handleEdit}
                      onDelete={() => deleteItem.mutate({ id: item.id })}
                      isDeleting={deleteItem.isPending}
                    />
                  ))}
                </div>
              </div>
            )
          })}

          {uncategorized.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-white font-semibold border-b border-white/10 pb-2">
                Uncategorized
              </h2>
              <div className="space-y-2">
                {uncategorized.map((item) => (
                  <MenuItemRow
                    key={item.id}
                    item={item}
                    onEdit={handleEdit}
                    onDelete={() => deleteItem.mutate({ id: item.id })}
                    isDeleting={deleteItem.isPending}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <MenuItemForm
        open={formOpen}
        onClose={handleClose}
        restaurantId={restaurant.id}
        categories={restaurant.categories}
        editItem={editItem}
      />
    </>
  )
}

function MenuItemRow({
  item,
  onEdit,
  onDelete,
  isDeleting,
}: {
  item: {
    id:          string
    name:        string
    description: string | null
    price:       string
    categoryId:  string | null
    isAvailable: boolean
  }
  onEdit:     (item: any) => void
  onDelete:   () => void
  isDeleting: boolean
}) {
  return (
    <Card className="border border-white/10 bg-white/5">
      <CardContent className="p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <p className="text-white font-medium truncate">{item.name}</p>
              <Badge
                className={cn(
                  "border-0 text-xs shrink-0",
                  item.isAvailable
                    ? "bg-emerald-500/20 text-emerald-400"
                    : "bg-red-500/20 text-red-400",
                )}
              >
                {item.isAvailable ? "Available" : "Unavailable"}
              </Badge>
            </div>
            {item.description && (
              <p className="text-white/40 text-sm truncate">
                {item.description}
              </p>
            )}
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <p className="text-orange-400 font-semibold">
              ₹{parseFloat(item.price).toFixed(2)}
            </p>
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 text-white/40 hover:text-white hover:bg-white/5"
              onClick={() => onEdit(item)}
            >
              <Pencil className="w-3.5 h-3.5" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 text-red-400/50 hover:text-red-400 hover:bg-red-500/10"
              onClick={onDelete}
              disabled={isDeleting}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
