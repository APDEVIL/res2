import { createTRPCRouter, publicProcedure, ownerProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { menuItems, menuCategories, restaurants } from "@/server/db/schema";
import { eq } from "drizzle-orm";

export const menuRouter = createTRPCRouter({
  getByRestaurant: publicProcedure
    .input(z.object({ restaurantId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.query.menuCategories.findMany({
        where: eq(menuCategories.restaurantId, input.restaurantId),
        with:  { menuItems: true },
      });
    }),

  createCategory: ownerProcedure
    .input(z.object({
      restaurantId: z.string().uuid(),
      name:         z.string().min(1),
      sortOrder:    z.number().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const restaurant = await ctx.db.query.restaurants.findFirst({
        where: eq(restaurants.id, input.restaurantId),
      });
      if (!restaurant) throw new TRPCError({ code: "NOT_FOUND" });
      if (restaurant.ownerId !== ctx.session.user.id)
        throw new TRPCError({ code: "FORBIDDEN" });

      const created = await ctx.db
        .insert(menuCategories)
        .values(input)
        .returning();

      if (!created[0]) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      return created[0];
    }),

  createItem: ownerProcedure
    .input(z.object({
      restaurantId: z.string().uuid(),
      categoryId:   z.string().uuid().optional(),
      name:         z.string().min(1),
      description:  z.string().optional(),
      price:        z.string().regex(/^\d+(\.\d{1,2})?$/),
      isAvailable:  z.boolean().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const restaurant = await ctx.db.query.restaurants.findFirst({
        where: eq(restaurants.id, input.restaurantId),
      });
      if (!restaurant) throw new TRPCError({ code: "NOT_FOUND" });
      if (restaurant.ownerId !== ctx.session.user.id)
        throw new TRPCError({ code: "FORBIDDEN" });

      const created = await ctx.db
        .insert(menuItems)
        .values(input)
        .returning();

      if (!created[0]) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      return created[0];
    }),

  updateItem: ownerProcedure
    .input(z.object({
      id:          z.string().uuid(),
      name:        z.string().min(1).optional(),
      description: z.string().optional(),
      price:       z.string().regex(/^\d+(\.\d{1,2})?$/).optional(),
      isAvailable: z.boolean().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;

      const item = await ctx.db.query.menuItems.findFirst({
        where: eq(menuItems.id, id),
        with:  { restaurant: true },
      });
      if (!item) throw new TRPCError({ code: "NOT_FOUND" });
      if (item.restaurant.ownerId !== ctx.session.user.id)
        throw new TRPCError({ code: "FORBIDDEN" });

      const updated = await ctx.db
        .update(menuItems)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(menuItems.id, id))
        .returning();

      return updated[0];
    }),

  deleteItem: ownerProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const item = await ctx.db.query.menuItems.findFirst({
        where: eq(menuItems.id, input.id),
        with:  { restaurant: true },
      });
      if (!item) throw new TRPCError({ code: "NOT_FOUND" });
      if (item.restaurant.ownerId !== ctx.session.user.id)
        throw new TRPCError({ code: "FORBIDDEN" });

      await ctx.db
        .delete(menuItems)
        .where(eq(menuItems.id, input.id));

      return { success: true };
    }),
});