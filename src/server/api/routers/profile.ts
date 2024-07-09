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
        wallet: z.string().min(1),
        pix: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.userProfile.create({
        data: {
          name: input.name,
          wallet: input.wallet,
          pix: input.pix,
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

  updateUserProfile: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().optional(),
        wallet: z.string().optional(),
        pix: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.userProfile.update({
        where: { id: input.id },
        data: {
          name: input.name,
          wallet: input.wallet,
          pix: input.pix,
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
});
