import { createTRPCRouter, publicProcedure, protectedProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { users } from "@/server/db/schema";
import { eq } from "drizzle-orm";

export const authRouter = createTRPCRouter({
  getSession: publicProcedure.query(({ ctx }) => {
    return ctx.session;
  }),

  getMe: protectedProcedure.query(({ ctx }) => {
    return ctx.session.user;
  }),

  updateRole: protectedProcedure
    .input(z.object({
      role: z.enum(["CUSTOMER", "OWNER", "DELIVERY"]),
    }))
    .mutation(async ({ ctx, input }) => {
      const updated = await ctx.db
        .update(users)
        .set({ role: input.role, updatedAt: new Date() })
        .where(eq(users.id, ctx.session.user.id))
        .returning();

      if (!updated[0]) throw new TRPCError({ code: "NOT_FOUND" });
      return updated[0];
    }),
});