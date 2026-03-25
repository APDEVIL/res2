"use client"

import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import {
  UtensilsCrossed,
  ShoppingBag,
  ClipboardList,
  LayoutDashboard,
  Bike,
  PackageCheck,
  LogOut,
  User,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { authClient } from "@/server/better-auth/client"
import { useSession } from "@/hooks/use-session"
import { useCart } from "@/hooks/use-cart"
import { cn } from "@/lib/utils"

const NAV_LINKS = {
  CUSTOMER: [
    { href: "/",                label: "Restaurants", icon: UtensilsCrossed },
    { href: "/customer-orders", label: "My Orders",   icon: ClipboardList  },
    { href: "/cart",            label: "Cart",        icon: ShoppingBag    },
  ],
  OWNER: [
    { href: "/dashboard",    label: "Dashboard", icon: LayoutDashboard },
    { href: "/owner-menu",   label: "Menu",      icon: UtensilsCrossed },
    { href: "/owner-orders", label: "Orders",    icon: ClipboardList   },
  ],
  DELIVERY: [
    { href: "/pickups",       label: "Available",     icon: Bike        },
    { href: "/my-deliveries", label: "My Deliveries", icon: PackageCheck },
  ],
}

export function Navbar() {
  const { user, role, isLoading } = useSession()
  const { totalItems } = useCart()
  const router = useRouter()
  const pathname = usePathname()

  const links = NAV_LINKS[role as keyof typeof NAV_LINKS] ?? []

  const handleSignOut = async () => {
    await authClient.signOut()
    router.push("/sign-in")
  }

  if (isLoading) return null

  return (
    <nav className="sticky top-0 z-50 border-b border-white/10 bg-zinc-950/80 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
        <Link
          href="/"
          className="text-orange-500 font-bold text-lg tracking-tight shrink-0"
        >
          FoodRush
        </Link>

        <div className="flex items-center gap-1">
          {links.map(({ href, label, icon: Icon }) => {
            const isCart   = href === "/cart"
            const isActive = pathname === href

            return (
              <Link key={href} href={href}>
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "gap-2 text-white/50 hover:text-white hover:bg-white/5 relative",
                    isActive && "text-white bg-white/5",
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{label}</span>
                  {isCart && totalItems() > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-orange-500 text-white text-[10px] font-bold flex items-center justify-center">
                      {totalItems()}
                    </span>
                  )}
                </Button>
              </Link>
            )
          })}
        </div>

        {user && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full border border-white/10 hover:border-white/30 shrink-0"
              >
                <Avatar className="w-7 h-7">
                  <AvatarFallback className="bg-orange-500/20 text-orange-400 text-xs font-medium">
                    {user.name?.charAt(0).toUpperCase() ?? "U"}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="bg-zinc-900 border-white/10 min-w-[180px]"
            >
              <div className="px-3 py-2">
                <p className="text-white text-sm font-medium truncate">
                  {user.name}
                </p>
                <p className="text-white/40 text-xs truncate">{user.email}</p>
                <span className="inline-block mt-1 text-[10px] font-medium px-1.5 py-0.5 rounded bg-orange-500/20 text-orange-400">
                  {role}
                </span>
              </div>

              <DropdownMenuSeparator className="bg-white/10" />

              <DropdownMenuItem
                className="text-white/60 hover:text-white focus:text-white focus:bg-white/5 gap-2 cursor-pointer"
                onClick={() => router.push("/profile")}
              >
                <User className="w-3.5 h-3.5" />
                Profile
              </DropdownMenuItem>

              <DropdownMenuSeparator className="bg-white/10" />

              <DropdownMenuItem
                className="text-red-400/70 hover:text-red-400 focus:text-red-400 focus:bg-red-500/5 gap-2 cursor-pointer"
                onClick={handleSignOut}
              >
                <LogOut className="w-3.5 h-3.5" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </nav>
  )
}
