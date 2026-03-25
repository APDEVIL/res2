import { api, HydrateClient } from "@/trpc/server"
import { RestaurantMenu } from "@/app/_components/restaurant-menu"

interface Props {
  params: { id: string }
}

export default async function RestaurantPage({ params }: Props) {
  void api.restaurant.getById.prefetch({ id: params.id })

  return (
    <HydrateClient>
      <RestaurantMenu restaurantId={params.id} />
    </HydrateClient>
  )
}