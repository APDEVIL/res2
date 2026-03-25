import { createTRPCRouter, publicProcedure, ownerProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { restaurants } from "@/server/db/schema";
import { eq } from "drizzle-orm";

export const restaurantRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.query.restaurants.findMany({
      where: eq(restaurants.isOpen, true),
      with:  { categories: true, menuItems: true },
    });
  }),

  getById: publicProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const restaurant = await ctx.db.query.restaurants.findFirst({
        where: eq(restaurants.id, input.id),
        with: {
          categories: true,
          menuItems:  true,
        },
      });
      if (!restaurant) throw new TRPCError({ code: "NOT_FOUND" });
      return restaurant;
    }),

  getMyRestaurant: ownerProcedure.query(async ({ ctx }) => {
    const restaurant = await ctx.db.query.restaurants.findFirst({
      where: eq(restaurants.ownerId, ctx.session.user.id),
      with: {
        categories: true,
        menuItems:  true,
        orders: {
          with: {
            customer: true,
            items:    true,
          },
        },
      },
    });
    if (!restaurant) throw new TRPCError({ code: "NOT_FOUND" });
    return restaurant;
  }),

  create: ownerProcedure
    .input(z.object({
      name:        z.string().min(1),
      description: z.string().optional(),
      address:     z.string().min(1),
      phone:       z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const created = await ctx.db
        .insert(restaurants)
        .values({ ...input, ownerId: ctx.session.user.id })
        .returning();

      if (!created[0]) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      return created[0];
    }),

  update: ownerProcedure
    .input(z.object({
      id:          z.string().uuid(),
      name:        z.string().min(1).optional(),
      description: z.string().optional(),
      address:     z.string().optional(),
      phone:       z.string().optional(),
      isOpen:      z.boolean().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;

      const restaurant = await ctx.db.query.restaurants.findFirst({
        where: eq(restaurants.id, id),
      });
      if (!restaurant) throw new TRPCError({ code: "NOT_FOUND" });
      if (restaurant.ownerId !== ctx.session.user.id)
        throw new TRPCError({ code: "FORBIDDEN" });

      const updated = await ctx.db
        .update(restaurants)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(restaurants.id, id))
        .returning();

      return updated[0];
    }),
});