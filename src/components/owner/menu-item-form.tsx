"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { api } from "@/trpc/react"
import { menuItemSchema, type MenuItemInput } from "@/lib/validators"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface MenuCategory {
  id:   string
  name: string
}

interface MenuItemFormProps {
  open:         boolean
  onClose:      () => void
  restaurantId: string
  categories:   MenuCategory[]
  editItem?: {
    id:          string
    name:        string
    description: string | null
    price:       string
    categoryId:  string | null
    isAvailable: boolean
  }
}

export function MenuItemForm({
  open,
  onClose,
  restaurantId,
  categories,
  editItem,
}: MenuItemFormProps) {
  const utils = api.useUtils()
  const isEditing = !!editItem

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<MenuItemInput>({
    resolver: zodResolver(menuItemSchema),
    defaultValues: editItem
      ? {
          name:        editItem.name,
          description: editItem.description ?? "",
          price:       editItem.price,
          categoryId:  editItem.categoryId ?? undefined,
          isAvailable: editItem.isAvailable,
        }
      : { isAvailable: true },
  })

  const createItem = api.menu.createItem.useMutation({
    onSuccess: () => {
      toast.success("Menu item created")
      void utils.menu.getByRestaurant.invalidate()
      reset()
      onClose()
    },
    onError: (err) => toast.error(err.message),
  })

  const updateItem = api.menu.updateItem.useMutation({
    onSuccess: () => {
      toast.success("Menu item updated")
      void utils.menu.getByRestaurant.invalidate()
      onClose()
    },
    onError: (err) => toast.error(err.message),
  })

  const onSubmit = (data: MenuItemInput) => {
    if (isEditing) {
      updateItem.mutate({ id: editItem.id, ...data })
    } else {
      createItem.mutate({ ...data, restaurantId })
    }
  }

  const isPending = createItem.isPending || updateItem.isPending

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-zinc-900 border-white/10 text-white max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-white text-lg font-semibold">
              {isEditing ? "Edit Item" : "Add Menu Item"}
            </DialogTitle>
            <Button
              size="icon"
              variant="ghost"
              className="h-7 w-7 text-white/40 hover:text-white"
              onClick={onClose}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
          <div className="space-y-2">
            <Label className="text-white/70 text-sm">Name</Label>
            <Input
              {...register("name")}
              placeholder="e.g. Margherita Pizza"
              className={cn(
                "bg-white/5 border-white/10 text-white placeholder:text-white/20",
                "focus:border-orange-500/50",
                errors.name && "border-red-500/50",
              )}
            />
            {errors.name && (
              <p className="text-red-400 text-xs">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label className="text-white/70 text-sm">
              Description
              <span className="text-white/30 ml-1">(optional)</span>
            </Label>
            <Textarea
              {...register("description")}
              placeholder="Brief description of the item"
              rows={2}
              className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-orange-500/50 resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-white/70 text-sm">Price (₹)</Label>
              <Input
                {...register("price")}
                placeholder="0.00"
                className={cn(
                  "bg-white/5 border-white/10 text-white placeholder:text-white/20",
                  "focus:border-orange-500/50",
                  errors.price && "border-red-500/50",
                )}
              />
              {errors.price && (
                <p className="text-red-400 text-xs">{errors.price.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-white/70 text-sm">Category</Label>
              <Select
                defaultValue={editItem?.categoryId ?? undefined}
                onValueChange={(val) => setValue("categoryId", val)}
              >
                <SelectTrigger className="bg-white/5 border-white/10 text-white focus:border-orange-500/50">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-white/10">
                  {categories.map((cat) => (
                    <SelectItem
                      key={cat.id}
                      value={cat.id}
                      className="text-white/70 focus:text-white focus:bg-white/5"
                    >
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-lg border border-white/10 bg-white/5">
            <input
              type="checkbox"
              id="isAvailable"
              {...register("isAvailable")}
              className="w-4 h-4 accent-orange-500"
            />
            <Label
              htmlFor="isAvailable"
              className="text-white/70 text-sm cursor-pointer"
            >
              Item is available for ordering
            </Label>
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="ghost"
              className="flex-1 border border-white/10 text-white/60 hover:text-white hover:border-white/30"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-medium"
            >
              {isPending
                ? isEditing ? "Saving..." : "Adding..."
                : isEditing ? "Save Changes" : "Add Item"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}