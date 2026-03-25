import { Badge } from "@/components/ui/badge"
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLOR } from "@/lib/constants"
import { cn } from "@/lib/utils"

interface OrderStatusBadgeProps {
  status:    string
  className?: string
}

export function OrderStatusBadge({ status, className }: OrderStatusBadgeProps) {
  return (
    <Badge
      className={cn(
        "border-0 text-xs font-medium",
        ORDER_STATUS_COLOR[status],
        className,
      )}
    >
      {ORDER_STATUS_LABELS[status] ?? status}
    </Badge>
  )
}