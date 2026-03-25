"use client"

import { MapPin, Phone, Clock } from "lucide-react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface RestaurantCardProps {
  id:          string
  name:        string
  description: string | null
  address:     string
  phone:       string | null
  isOpen:      boolean
}

export function RestaurantCard({
  id,
  name,
  description,
  address,
  phone,
  isOpen,
}: RestaurantCardProps) {
  const router = useRouter()

  return (
    <Card
      onClick={() => router.push(`/restaurant/${id}`)}
      className={cn(
        "group cursor-pointer border border-white/10 bg-white/5 backdrop-blur-sm",
        "transition-all duration-200 hover:border-orange-500/50 hover:bg-white/10",
      )}
    >
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-white font-semibold text-lg truncate group-hover:text-orange-400 transition-colors">
                {name}
              </h3>
              <Badge
                className={cn(
                  "shrink-0 text-xs font-medium border-0",
                  isOpen
                    ? "bg-emerald-500/20 text-emerald-400"
                    : "bg-red-500/20 text-red-400",
                )}
              >
                {isOpen ? "Open" : "Closed"}
              </Badge>
            </div>

            {description && (
              <p className="text-white/50 text-sm line-clamp-2 mb-3">
                {description}
              </p>
            )}

            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-2 text-white/40 text-sm">
                <MapPin className="w-3.5 h-3.5 shrink-0 text-orange-500/70" />
                <span className="truncate">{address}</span>
              </div>
              {phone && (
                <div className="flex items-center gap-2 text-white/40 text-sm">
                  <Phone className="w-3.5 h-3.5 shrink-0 text-orange-500/70" />
                  <span>{phone}</span>
                </div>
              )}
            </div>
          </div>

          <div className="shrink-0 w-16 h-16 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
            <Clock className="w-7 h-7 text-orange-500/60" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}