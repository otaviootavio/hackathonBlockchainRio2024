import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";

export const paymentRouter = createTRPCRouter({
  getCompletedPayment: protectedProcedure
    .input(z.object({ participantId: z.string() }))
    .query(async ({ ctx, input }) => {
      const payment = await ctx.db.payment.findFirst({
        where: {
          participantId: input.participantId,
          status: "COMPLETED",
        },
        orderBy: {
          createdAt: "desc",
        },
        select: {
          id: true,
          status: true,
          networkId: true,
          transactionId: true,
          participant: {
            select: {
              userId: true,
            },
          },
        },
      });

      if (!payment) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "No completed payment found for this participant",
        });
      }

      if (payment.participant.userId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have permission to view this payment",
        });
      }

      return payment;
    }),
});
