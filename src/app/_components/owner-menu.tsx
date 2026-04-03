"use client"

import { useState } from "react"
import { Plus, Pencil, Trash2, UtensilsCrossed, Store, LayoutGrid } from "lucide-react"
import { api } from "@/trpc/react"
import { MenuItemForm } from "@/components/owner/menu-item-form"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type EditItem = {
  id:          string
  name:        string
  description: string | null
  price:       string
  categoryId:  string | null
  isAvailable: boolean
}

export function OwnerMenu() {
  const [formOpen, setFormOpen] = useState(false)
  const [editItem, setEditItem] = useState<EditItem | undefined>()
  const utils = api.useUtils()

  const [resName, setResName] = useState("")
  const [resAddress, setResAddress] = useState("")
  const [newCatName, setNewCatName] = useState("")

  const { data: restaurant, isLoading } = api.restaurant.getMyRestaurant.useQuery()

  const createRestaurant = api.restaurant.create.useMutation({
    onSuccess: () => {
      toast.success("Restaurant created!")
      void utils.restaurant.getMyRestaurant.invalidate()
    },
    onError: (err) => toast.error(err.message),
  })

  const createCategory = api.restaurant.createCategory.useMutation({
    onSuccess: () => {
      toast.success("Category added")
      setNewCatName("")
      void utils.restaurant.getMyRestaurant.invalidate()
    },
    onError: (err) => toast.error(err.message),
  })

  const deleteItem = api.menu.deleteItem.useMutation({
    onSuccess: () => {
      toast.success("Item deleted")
      void utils.restaurant.getMyRestaurant.invalidate()
    },
    onError: (err) => toast.error(err.message),
  })

  if (isLoading) return <div className="space-y-4">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-32 rounded-xl bg-white/5" />)}</div>

  if (!restaurant) {
    return (
      <Card className="border border-white/10 bg-white/5 max-w-md mx-auto p-6 space-y-4">
        <h2 className="text-white text-xl font-bold flex items-center gap-2"><Store className="w-5 h-5 text-orange-400" /> Setup Restaurant</h2>
        <Input value={resName} onChange={(e) => setResName(e.target.value)} placeholder="Restaurant Name" className="bg-white/5 text-white" />
        <Input value={resAddress} onChange={(e) => setResAddress(e.target.value)} placeholder="Address" className="bg-white/5 text-white" />
        <Button className="w-full bg-orange-500" onClick={() => createRestaurant.mutate({ name: resName, address: resAddress })} disabled={!resName || !resAddress}>Create Profile</Button>
      </Card>
    )
  }

  // LOGIC FIX: Group items by category properly
  const categories = restaurant.categories ?? []
  const menuItems = restaurant.menuItems ?? []
  const uncategorized = menuItems.filter((item) => !item.categoryId)

  return (
    <div className="space-y-8">
      {/* Category Creation Bar */}
      <div className="flex gap-2 p-4 bg-white/5 border border-white/10 rounded-xl items-end">
        <div className="flex-1 space-y-1">
          <Label className="text-white/40 text-xs">Add Category (Required for the dropdown)</Label>
          <Input 
            value={newCatName} 
            onChange={(e) => setNewCatName(e.target.value)} 
            placeholder="e.g. Beverages" 
            className="bg-transparent text-white h-10 border-white/10" 
          />
        </div>
        <Button 
          variant="outline" 
          className="text-white border-white/10 h-10" 
          onClick={() => createCategory.mutate({ name: newCatName, restaurantId: restaurant.id })} 
          disabled={!newCatName || createCategory.isPending}
        >
          {createCategory.isPending ? "..." : "Add"}
        </Button>
      </div>

      <div className="flex items-center justify-end">
        <Button 
          onClick={() => setFormOpen(true)} 
          className="bg-orange-500 hover:bg-orange-600 text-white gap-2 h-10 px-6 font-medium"
        >
          <Plus className="w-4 h-4" /> Add Menu Item
        </Button>
      </div>

      {menuItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4 bg-white/5 rounded-xl border border-white/10">
          <UtensilsCrossed className="w-8 h-8 text-white/20" />
          <p className="text-white/40 text-sm">No items found in your menu.</p>
        </div>
      ) : (
        <div className="space-y-10">
          {/* 1. Categorized Items */}
          {categories.map((cat) => {
            const items = menuItems.filter((i) => i.categoryId === cat.id)
            if (items.length === 0) return null // Hide empty categories

            return (
              <div key={cat.id} className="space-y-4">
                <h3 className="text-white font-bold text-lg border-b border-white/10 pb-2 flex items-center gap-2">
                  <LayoutGrid className="w-4 h-4 text-orange-400" />
                  {cat.name}
                </h3>
                <div className="grid gap-3">
                  {items.map((item) => (
                    <MenuItemRow 
                      key={item.id} 
                      item={item} 
                      onEdit={(i: any) => { setEditItem(i); setFormOpen(true); }} 
                      onDelete={() => deleteItem.mutate({ id: item.id })} 
                      isDeleting={deleteItem.isPending} 
                    />
                  ))}
                </div>
              </div>
            )
          })}

          {/* 2. Uncategorized Items (Safety Net) */}
          {uncategorized.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-white/60 font-bold text-lg border-b border-white/10 pb-2">Uncategorized</h3>
              <div className="grid gap-3">
                {uncategorized.map((item) => (
                  <MenuItemRow 
                    key={item.id} 
                    item={item} 
                    onEdit={(i: any) => { setEditItem(i); setFormOpen(true); }} 
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
        onClose={() => { setFormOpen(false); setEditItem(undefined); }} 
        restaurantId={restaurant.id} 
        categories={categories} 
        editItem={editItem} 
      />
    </div>
  )
}

function MenuItemRow({ item, onEdit, onDelete, isDeleting }: any) {
  return (
    <Card className="border border-white/10 bg-white/5 hover:bg-white/[0.07] transition-colors">
      <CardContent className="p-4 flex items-center justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-1">
            <span className="text-white font-semibold truncate">{item.name}</span>
            <Badge className={cn("border-0 text-[10px] h-4", item.isAvailable ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400")}>
              {item.isAvailable ? "Available" : "Sold Out"}
            </Badge>
          </div>
          {item.description && <p className="text-white/40 text-xs truncate">{item.description}</p>}
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <p className="text-orange-400 font-bold">₹{parseFloat(item.price).toFixed(2)}</p>
          <div className="flex items-center border-l border-white/10 ml-2 pl-2">
            <Button size="icon" variant="ghost" onClick={() => onEdit(item)} className="h-8 w-8 text-white/40 hover:text-white"><Pencil className="w-4 h-4" /></Button>
            <Button size="icon" variant="ghost" onClick={onDelete} disabled={isDeleting} className="h-8 w-8 text-red-400/50 hover:text-red-400"><Trash2 className="w-4 h-4" /></Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}