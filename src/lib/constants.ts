export const ORDER_STATUS_LABELS: Record<string, string> = {
  PLACED:           "Order Placed",
  CONFIRMED:        "Confirmed",
  REJECTED:         "Rejected",
  PREPARING:        "Preparing",
  READY_FOR_PICKUP: "Ready for Pickup",
  OUT_FOR_DELIVERY: "Out for Delivery",
  DELIVERED:        "Delivered",
  CANCELLED:        "Cancelled",
}

export const ORDER_STATUS_COLOR: Record<string, string> = {
  PLACED:           "bg-blue-500/20 text-blue-400",
  CONFIRMED:        "bg-yellow-500/20 text-yellow-400",
  REJECTED:         "bg-red-500/20 text-red-400",
  PREPARING:        "bg-orange-500/20 text-orange-400",
  READY_FOR_PICKUP: "bg-purple-500/20 text-purple-400",
  OUT_FOR_DELIVERY: "bg-indigo-500/20 text-indigo-400",
  DELIVERED:        "bg-emerald-500/20 text-emerald-400",
  CANCELLED:        "bg-gray-500/20 text-gray-400",
}

export const ROLES = {
  CUSTOMER: "CUSTOMER",
  OWNER:    "OWNER",
  DELIVERY: "DELIVERY",
} as const

export type UserRole = keyof typeof ROLES

export const ROLE_REDIRECTS: Record<UserRole, string> = {
  CUSTOMER: "/",
  OWNER:    "/dashboard",
  DELIVERY: "/pickups",
}