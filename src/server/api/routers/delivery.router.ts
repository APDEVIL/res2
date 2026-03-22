import { createTRPCRouter, deliveryProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { orders } from "@/server/db/schema";
import { eq } from "drizzle-orm";

export const deliveryRouter = createTRPCRouter({
  getAvailableOrders: deliveryProcedure.query(async ({ ctx }) => {
    return ctx.db.query.orders.findMany({
      where: eq(orders.status, "READY_FOR_PICKUP"),
      with:  { restaurant: true, customer: true, items: true },
    });
  }),

  getMyDeliveries: deliveryProcedure.query(async ({ ctx }) => {
    return ctx.db.query.orders.findMany({
      where: eq(orders.deliveryPartnerId, ctx.session.user.id),
      with:  { restaurant: true, customer: true, items: true },
    });
  }),

  acceptOrder: deliveryProcedure
    .input(z.object({ orderId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const order = await ctx.db.query.orders.findFirst({
        where: eq(orders.id, input.orderId),
      });

      if (!order) throw new TRPCError({ code: "NOT_FOUND" });
      if (order.status !== "READY_FOR_PICKUP")
        throw new TRPCError({ code: "BAD_REQUEST", message: "Order is not ready for pickup" });
      if (order.deliveryPartnerId)
        throw new TRPCError({ code: "CONFLICT", message: "Order already taken" });

      const updated = await ctx.db
        .update(orders)
        .set({
          deliveryPartnerId: ctx.session.user.id,
          status:            "OUT_FOR_DELIVERY",
          updatedAt:         new Date(),
        })
        .where(eq(orders.id, input.orderId))
        .returning();

      if (!updated[0]) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      return updated[0];
    }),

  markDelivered: deliveryProcedure
    .input(z.object({ orderId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const order = await ctx.db.query.orders.findFirst({
        where: eq(orders.id, input.orderId),
      });

      if (!order) throw new TRPCError({ code: "NOT_FOUND" });
      if (order.deliveryPartnerId !== ctx.session.user.id)
        throw new TRPCError({ code: "FORBIDDEN" });
      if (order.status !== "OUT_FOR_DELIVERY")
        throw new TRPCError({ code: "BAD_REQUEST", message: "Order is not out for delivery" });

      const updated = await ctx.db
        .update(orders)
        .set({ status: "DELIVERED", updatedAt: new Date() })
        .where(eq(orders.id, input.orderId))
        .returning();

      if (!updated[0]) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      return updated[0];
    }),
});