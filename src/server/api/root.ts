import { createTRPCRouter, createCallerFactory } from "@/server/api/trpc";
import { authRouter } from "./routers/auth.router";
import { restaurantRouter } from "./routers/restaurant.router";
import { menuRouter } from "./routers/menu.router";
import { orderRouter } from "./routers/order.router";
import { deliveryRouter } from "./routers/delivery.router";
import { userRouter } from "./routers/user.router";

export const appRouter = createTRPCRouter({
  auth:       authRouter,
  restaurant: restaurantRouter,
  menu:       menuRouter,
  order:      orderRouter,
  delivery:   deliveryRouter,
  user:       userRouter,
});

export type AppRouter = typeof appRouter;

export const createCaller = createCallerFactory(appRouter);