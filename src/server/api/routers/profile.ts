import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";

export const userProfileRouter = createTRPCRouter({
  createUserProfile: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        userId: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.userProfile.create({
        data: {
          name: input.name,
          userId: input.userId,
        },
      });
    }),

  getUserProfileById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.userProfile.findUnique({
        where: { id: input.id },
      });
    }),

  getUserProfileByUserId: publicProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.userProfile.findUnique({
        where: { userId: input.userId },
      });
    }),

  updateUserProfile: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().optional(),
        wallet: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.userProfile.update({
        where: { id: input.id },
        data: {
          name: input.name,
          wallet: input.wallet,
        },
      });
    }),

  deleteUserProfile: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.userProfile.delete({
        where: { id: input.id },
      });
    }),

  addWalletToProfile: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        wallet: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.userProfile.update({
        where: { id: input.id },
        data: {
          wallet: input.wallet,
        },
      });
    }),
});
