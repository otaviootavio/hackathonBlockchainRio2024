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
      const room = await ctx.db.room.findUnique({
        where: { id: input.roomId },
      });

      if (!room) {
        throw new Error("Room not found");
      }

      if (!room.isOpen) {
        const isOwner = await ctx.db.participant.findFirst({
          where: {
            roomId: input.roomId,
            userId: ctx.session.user.id,
            role: "owner",
          },
        });

        if (!isOwner) {
          throw new Error(
            "Only the owner can add participants to a closed room",
          );
        }
      }

      return ctx.db.participant.create({
        data: {
          roomId: input.roomId,
          userId: input.userId,
          name: input.name,
          payed: input.payed,
          role: "normal",
          weight: 1,
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
        weight: z.number().int().positive().optional(), // Added weight field with validation
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const participant = await ctx.db.participant.findUnique({
        where: { id: input.id },
      });

      if (!participant) {
        throw new Error("Participant not found");
      }

      const isOwner = await ctx.db.participant.findFirst({
        where: {
          roomId: participant.roomId,
          userId: ctx.session.user.id,
          role: "owner",
        },
      });

      if (ctx.session.user.id !== participant.userId && !isOwner) {
        throw new Error(
          "Only the owner or the participant themselves can update the participant's details",
        );
      }

      if (input.weight !== undefined && input.weight <= 0) {
        throw new Error("Weight must be greater than zero");
      }

      return ctx.db.participant.update({
        where: { id: input.id },
        data: {
          name: input.name,
          payed: input.payed,
          weight: input.weight,
        },
      });
    }),

  deleteParticipant: protectedProcedure
    .input(z.object({ id: z.string(), userId: z.string(), roomId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const participant = await ctx.db.participant.findFirst({
        where: {
          id: input.id,
          OR: [
            { userId: input.userId },
            {
              room: {
                participants: {
                  some: {
                    userId: ctx.session.user.id,
                    role: "owner",
                  },
                },
              },
            },
          ],
        },
      });

      if (!participant) {
        throw new Error(
          "You do not have permission to delete this participant",
        );
      }

      return ctx.db.participant.delete({
        where: { id: input.id },
      });
    }),

  removeParticipantFromRoom: protectedProcedure
    .input(
      z.object({
        roomId: z.string(),
        participantId: z.string(),
        userId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const participant = await ctx.db.participant.findFirst({
        where: {
          id: input.participantId,
          roomId: input.roomId,
          OR: [
            { userId: input.userId },
            {
              room: {
                participants: {
                  some: {
                    userId: ctx.session.user.id,
                    role: "owner",
                  },
                },
              },
            },
          ],
        },
      });

      if (!participant) {
        throw new Error(
          "You do not have permission to remove this participant",
        );
      }

      return ctx.db.participant.delete({
        where: { id: input.participantId },
      });
    }),
});
