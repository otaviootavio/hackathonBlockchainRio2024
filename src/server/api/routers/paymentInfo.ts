import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";

export const paymentInfoRouter = createTRPCRouter({
  addPaymentInfo: protectedProcedure
    .input(
      z.object({
        roomId: z.string(),
        payTo: z.string().min(1),
        type: z.string().min(1),
        inputType: z.string().min(1),
        inputValue: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.paymentInfo.create({
        data: {
          roomId: input.roomId,
          payTo: input.payTo,
          type: input.type,
          inputType: input.inputType,
          inputValue: input.inputValue,
        },
      });
    }),

  getPaymentInfoByRoom: publicProcedure
    .input(z.object({ roomId: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.paymentInfo.findUnique({
        where: { roomId: input.roomId },
      });
    }),

  updatePaymentInfo: protectedProcedure
    .input(
      z.object({
        roomId: z.string(),
        payTo: z.string().optional(),
        type: z.string().optional(),
        inputType: z.string().optional(),
        inputValue: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.paymentInfo.update({
        where: { roomId: input.roomId },
        data: {
          payTo: input.payTo,
          type: input.type,
          inputType: input.inputType,
          inputValue: input.inputValue,
        },
      });
    }),

  deletePaymentInfo: protectedProcedure
    .input(z.object({ roomId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.paymentInfo.delete({
        where: { roomId: input.roomId },
      });
    }),
});
