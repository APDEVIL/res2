"use client"

import { useMemo } from "react"
import {
  ShoppingBag,
  TrendingUp,
  Clock,
  UtensilsCrossed,
  AlertCircle,
  Plus,
} from "lucide-react"
import { api } from "@/trpc/react"
import { Card, CardContent } from "@/components/ui/card"
import { OrderStatusBadge } from "@/components/shared/order-status-badge"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import Link from "next/link"

// --- Sub-component: StatCard ---
function StatCard({
  label,
  value,
  icon: Icon,
  accent,
}: {
  label:  string
  value:  string | number
  icon:   React.ElementType
  accent: string
}) {
  return (
    <Card className="border border-white/10 bg-white/5 backdrop-blur-sm">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-white/40 text-sm">{label}</p>
            <p className="text-white text-2xl font-bold">{value}</p>
          </div>
          <div
            className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center",
              accent,
            )}
          >
            <Icon className="w-5 h-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// --- Main Component ---
export function OwnerDashboard() {
  const { data: restaurant, isLoading } = api.restaurant.getMyRestaurant.useQuery()

  const stats = useMemo(() => {
    // Safety check for null restaurant or missing arrays
    if (!restaurant?.orders) return null

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const todayOrders = restaurant.orders.filter(
      (o) => new Date(o.createdAt) >= today,
    )

    const totalRevenue = todayOrders
      .filter((o) => o.status !== "REJECTED" && o.status !== "CANCELLED")
      .reduce((sum, o) => sum + parseFloat(o.totalAmount), 0)

    const pendingOrders = restaurant.orders.filter((o) =>
      ["PLACED", "CONFIRMED", "PREPARING"].includes(o.status),
    ).length

    return {
      totalOrdersToday: todayOrders.length,
      totalRevenue:     totalRevenue.toFixed(2),
      pendingOrders,
      menuItemsCount:   restaurant.menuItems?.length ?? 0,
    }
  }, [restaurant])

  const recentOrders = useMemo(() => {
    if (!restaurant?.orders) return []
    return [...restaurant.orders]
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )
      .slice(0, 5)
  }, [restaurant])

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl bg-white/5" />
          ))}
        </div>
        <Skeleton className="h-64 rounded-xl bg-white/5" />
      </div>
    )
  }

  // Handle new owner state (No restaurant record in DB)
  if (!restaurant) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-6">
        <div className="w-20 h-20 rounded-full bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
          <UtensilsCrossed className="w-10 h-10 text-orange-400" />
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-white text-xl font-semibold">Ready to start cooking?</h2>
          <p className="text-white/40 max-w-xs mx-auto">
            You haven't set up your restaurant profile yet.
          </p>
        </div>
        <Link 
          href="/owner-menu" 
          className="flex items-center gap-2 px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-medium transition-colors"
        >
          <Plus className="w-5 h-5" />
          Create Restaurant Profile
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-white text-2xl font-bold">{restaurant.name}</h1>
        <p className="text-white/40 text-sm mt-1">Dashboard overview</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Orders today"
          value={stats?.totalOrdersToday ?? 0}
          icon={ShoppingBag}
          accent="bg-blue-500/10 text-blue-400"
        />
        <StatCard
          label="Revenue today"
          value={`₹${stats?.totalRevenue ?? "0.00"}`}
          icon={TrendingUp}
          accent="bg-emerald-500/10 text-emerald-400"
        />
        <StatCard
          label="Pending orders"
          value={stats?.pendingOrders ?? 0}
          icon={Clock}
          accent="bg-orange-500/10 text-orange-400"
        />
        <StatCard
          label="Menu items"
          value={stats?.menuItemsCount ?? 0}
          icon={UtensilsCrossed}
          accent="bg-purple-500/10 text-purple-400"
        />
      </div>

      <div className="space-y-4">
        <h2 className="text-white font-semibold text-lg">Recent Orders</h2>

        {recentOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3 rounded-xl border border-white/10 bg-white/5">
            <ShoppingBag className="w-8 h-8 text-white/20" />
            <p className="text-white/40 text-sm">No orders yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentOrders.map((order) => (
              <Card
                key={order.id}
                className="border border-white/10 bg-white/5"
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="space-y-0.5">
                      <p className="text-white/40 text-xs font-mono">
                        #{order.id.slice(0, 8).toUpperCase()}
                      </p>
                      <p className="text-white/30 text-xs">
                        {new Date(order.createdAt).toLocaleTimeString("en-IN", {
                          hour:   "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <p className="text-orange-400 font-semibold">
                        ₹{parseFloat(order.totalAmount).toFixed(2)}
                      </p>
                      <OrderStatusBadge status={order.status} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}