import { z } from "zod"

export const signUpSchema = z.object({
  name:     z.string().min(1, "Name is required"),
  email:    z.string().email("Invalid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role:     z.enum(["CUSTOMER", "OWNER", "DELIVERY"]),
  phone:    z.string().optional(),
})

export const signInSchema = z.object({
  email:    z.string().email("Invalid email"),
  password: z.string().min(1, "Password is required"),
})

export const restaurantSchema = z.object({
  name:        z.string().min(1, "Restaurant name is required"),
  description: z.string().optional(),
  address:     z.string().min(1, "Address is required"),
  phone:       z.string().optional(),
})

export const menuCategorySchema = z.object({
  name:      z.string().min(1, "Category name is required"),
  sortOrder: z.number().optional(),
})

export const menuItemSchema = z.object({
  name:        z.string().min(1, "Item name is required"),
  description: z.string().optional(),
  price:       z.string().regex(/^\d+(\.\d{1,2})?$/, "Invalid price format"),
  categoryId:  z.string().uuid().optional(),
  isAvailable: z.boolean(),
})

export const placeOrderSchema = z.object({
  deliveryAddress: z.string().min(1, "Delivery address is required"),
  notes:           z.string().optional(),
  items: z.array(z.object({
    menuItemId: z.string().uuid(),
    quantity:   z.number().min(1),
  })).min(1, "Add at least one item"),
})

export const updateProfileSchema = z.object({
  name:  z.string().min(1, "Name is required").optional(),
  phone: z.string().optional(),
})

export type SignUpInput       = z.infer<typeof signUpSchema>
export type SignInInput       = z.infer<typeof signInSchema>
export type RestaurantInput   = z.infer<typeof restaurantSchema>
export type MenuCategoryInput = z.infer<typeof menuCategorySchema>
export type MenuItemInput     = z.infer<typeof menuItemSchema>
export type PlaceOrderInput   = z.infer<typeof placeOrderSchema>
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>