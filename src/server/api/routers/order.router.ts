import { createTRPCRouter, customerProcedure, ownerProcedure, protectedProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { orders, orderItems, menuItems } from "@/server/db/schema";
import { eq, inArray } from "drizzle-orm";

const ALLOWED_TRANSITIONS: Record<string, string[]> = {
  CUSTOMER: ["CANCELLED"],
  OWNER:    ["CONFIRMED", "REJECTED", "PREPARING", "READY_FOR_PICKUP"],
  DELIVERY: ["OUT_FOR_DELIVERY", "DELIVERED"],
};

export const orderRouter = createTRPCRouter({
  place: customerProcedure
    .input(z.object({
      restaurantId:    z.string().uuid(),
      deliveryAddress: z.string().min(1),
      notes:           z.string().optional(),
      items: z.array(z.object({
        menuItemId: z.string().uuid(),
        quantity:   z.number().min(1),
      })).min(1),
    }))
    .mutation(async ({ ctx, input }) => {
      const menuItemIds = input.items.map((i) => i.menuItemId);

      const fetchedItems = await ctx.db.query.menuItems.findMany({
        where: inArray(menuItems.id, menuItemIds),
      });

      if (fetchedItems.length !== input.items.length) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Some menu items not found" });
      }

      const unavailable = fetchedItems.filter((m) => !m.isAvailable);
      if (unavailable.length > 0) {
        throw new TRPCError({ code: "BAD_REQUEST", message: `Some items are unavailable: ${unavailable.map((m) => m.name).join(", ")}` });
      }

      const totalAmount = input.items.reduce((sum, item) => {
        const menuItem = fetchedItems.find((m) => m.id === item.menuItemId)!;
        return sum + parseFloat(menuItem.price) * item.quantity;
      }, 0);

      const [order] = await ctx.db
        .insert(orders)
        .values({
          customerId:      ctx.session.user.id,
          restaurantId:    input.restaurantId,
          deliveryAddress: input.deliveryAddress,
          notes:           input.notes,
          totalAmount:     totalAmount.toFixed(2),
          status:          "PLACED",
        })
        .returning();

      if (!order) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      await ctx.db.insert(orderItems).values(
        input.items.map((item) => {
          const menuItem = fetchedItems.find((m) => m.id === item.menuItemId)!;
          return {
            orderId:    order.id,
            menuItemId: item.menuItemId,
            name:       menuItem.name,
            price:      menuItem.price,
            quantity:   item.quantity,
          };
        }),
      );

      return order;
    }),

  getMyOrders: customerProcedure.query(async ({ ctx }) => {
    return ctx.db.query.orders.findMany({
      where: eq(orders.customerId, ctx.session.user.id),
      with:  { items: true, restaurant: true },
    });
  }),

  getRestaurantOrders: ownerProcedure
    .input(z.object({ restaurantId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.query.orders.findMany({
        where: eq(orders.restaurantId, input.restaurantId),
        with:  { items: true, customer: true },
      });
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const order = await ctx.db.query.orders.findFirst({
        where: eq(orders.id, input.id),
        with:  { items: true, restaurant: true, customer: true },
      });
      if (!order) throw new TRPCError({ code: "NOT_FOUND" });
      return order;
    }),

  updateStatus: protectedProcedure
    .input(z.object({
      orderId: z.string().uuid(),
      status:  z.enum([
        "CONFIRMED", "REJECTED", "PREPARING",
        "READY_FOR_PICKUP", "OUT_FOR_DELIVERY",
        "DELIVERED", "CANCELLED",
      ]),
    }))
    .mutation(async ({ ctx, input }) => {
      const role = (ctx.session.user as any).role as string;
      const allowed = ALLOWED_TRANSITIONS[role] ?? [];

      if (!allowed.includes(input.status)) {
        throw new TRPCError({
          code:    "FORBIDDEN",
          message: `${role} cannot set status to ${input.status}`,
        });
      }

      const order = await ctx.db.query.orders.findFirst({
        where: eq(orders.id, input.orderId),
      });
      if (!order) throw new TRPCError({ code: "NOT_FOUND" });

      const updated = await ctx.db
        .update(orders)
        .set({ status: input.status, updatedAt: new Date() })
        .where(eq(orders.id, input.orderId))
        .returning();

      return updated[0];
    }),
});