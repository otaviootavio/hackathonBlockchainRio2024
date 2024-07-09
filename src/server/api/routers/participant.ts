import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";

export const participantRouter = createTRPCRouter({
  addParticipant: protectedProcedure
    .input(
      z.object({
        roomId: z.string(),
        userId: z.string(),
        name: z.string().min(1),
        payed: z.boolean(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.participant.create({
        data: {
          roomId: input.roomId,
          userId: input.userId,
          name: input.name,
          payed: input.payed,
        },
      });
    }),

  getParticipantsByRoom: publicProcedure
    .input(z.object({ roomId: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.participant.findMany({
        where: { roomId: input.roomId },
      });
    }),

  updateParticipant: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().optional(),
        payed: z.boolean().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.participant.update({
        where: { id: input.id },
        data: {
          name: input.name,
          payed: input.payed,
        },
      });
    }),

  deleteParticipant: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.participant.delete({
        where: { id: input.id },
      });
    }),

  removeParticipantFromRoom: protectedProcedure
    .input(
      z.object({
        roomId: z.string(),
        participantId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.participant.deleteMany({
        where: {
          id: input.participantId,
          roomId: input.roomId,
        },
      });
    }),
});
