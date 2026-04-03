import { z } from "zod";
import {
  createTRPCRouter,
  ownerProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import { restaurants, menuCategories } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

export const restaurantRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.query.restaurants.findMany({
      where: eq(restaurants.isOpen, true),
      with: {
        categories: true,
        menuItems: true,
      },
    });
  }),

  getById: publicProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const restaurant = await ctx.db.query.restaurants.findFirst({
        where: eq(restaurants.id, input.id),
        with: {
          categories: true,
          menuItems: true,
        },
      });

      if (!restaurant) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Restaurant not found",
        });
      }

      return restaurant;
    }),

  getMyRestaurant: ownerProcedure.query(async ({ ctx }) => {
    const restaurant = await ctx.db.query.restaurants.findFirst({
      where: eq(restaurants.ownerId, ctx.session.user.id),
      with: {
        categories: true,
        menuItems: true,
        orders: {
          with: {
            customer: true,
            items: true,
          },
        },
      },
    });

    // Returns null instead of throwing to allow the frontend to show setup UI
    return restaurant ?? null;
  }),

  create: ownerProcedure
    .input(
      z.object({
        name: z.string().min(1),
        description: z.string().optional(),
        address: z.string().min(1),
        phone: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const created = await ctx.db
        .insert(restaurants)
        .values({
          ...input,
          ownerId: ctx.session.user.id,
        })
        .returning();

      if (!created[0]) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create restaurant",
        });
      }

      return created[0];
    }),

  // New procedure to fix the empty category dropdown issue
  createCategory: ownerProcedure
    .input(
      z.object({
        name: z.string().min(1),
        restaurantId: z.string().uuid(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const created = await ctx.db
        .insert(menuCategories)
        .values({
          name: input.name,
          restaurantId: input.restaurantId,
        })
        .returning();

      if (!created[0]) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create category",
        });
      }

      return created[0];
    }),

  update: ownerProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        name: z.string().min(1).optional(),
        description: z.string().optional(),
        address: z.string().optional(),
        phone: z.string().optional(),
        isOpen: z.boolean().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;

      const restaurant = await ctx.db.query.restaurants.findFirst({
        where: eq(restaurants.id, id),
      });

      if (!restaurant) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Restaurant not found",
        });
      }

      if (restaurant.ownerId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You do not own this restaurant",
        });
      }

      const updated = await ctx.db
        .update(restaurants)
        .set({
          ...data,
          updatedAt: new Date(),
        })
        .where(eq(restaurants.id, id))
        .returning();

      return updated[0];
    }),
});