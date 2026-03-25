import { create } from "zustand"
import { persist } from "zustand/middleware"

interface CartItem {
  menuItemId:   string
  name:         string
  price:        string
  quantity:     number
  restaurantId: string
}

interface CartStore {
  items:        CartItem[]
  restaurantId: string | null

  addItem:      (item: CartItem) => void
  removeItem:   (menuItemId: string) => void
  updateQty:    (menuItemId: string, quantity: number) => void
  clearCart:    () => void
  totalAmount:  () => number
  totalItems:   () => number
}

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items:        [],
      restaurantId: null,

      addItem: (item) => {
        const { items, restaurantId } = get()

        if (restaurantId && restaurantId !== item.restaurantId) {
          set({ items: [item], restaurantId: item.restaurantId })
          return
        }

        const existing = items.find((i) => i.menuItemId === item.menuItemId)

        if (existing) {
          set({
            items: items.map((i) =>
              i.menuItemId === item.menuItemId
                ? { ...i, quantity: i.quantity + item.quantity }
                : i,
            ),
          })
        } else {
          set({
            items:        [...items, item],
            restaurantId: item.restaurantId,
          })
        }
      },

      removeItem: (menuItemId) => {
        const items = get().items.filter((i) => i.menuItemId !== menuItemId)
        set({
          items,
          restaurantId: items.length === 0 ? null : get().restaurantId,
        })
      },

      updateQty: (menuItemId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(menuItemId)
          return
        }
        set({
          items: get().items.map((i) =>
            i.menuItemId === menuItemId ? { ...i, quantity } : i,
          ),
        })
      },

      clearCart: () => set({ items: [], restaurantId: null }),

      totalAmount: () =>
        get().items.reduce(
          (sum, item) => sum + parseFloat(item.price) * item.quantity,
          0,
        ),

      totalItems: () =>
        get().items.reduce((sum, item) => sum + item.quantity, 0),
    }),
    {
      name: "cart-storage",
    },
  ),
)