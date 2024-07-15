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
        userProfileId: z.string(),
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
          userProfileId: input.userProfileId,
          roomId: input.roomId,
          userId: input.userId,
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
        weight: z.number().int().positive().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const participant = await ctx.db.participant.findUnique({
        where: { id: input.id },
      });

      if (!participant) {
        throw new Error("Participant not found");
      }

      const room = await ctx.db.room.findUnique({
        where: { id: participant.roomId },
      });

      if (room?.isReadyForSettlement && input.weight !== undefined) {
        throw new Error(
          "Cannot update weight after room is ready for settlement",
        );
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

      return ctx.db.participant.update({
        where: { id: input.id },
        data: {
          payed: input.payed,
          weight: input.weight,
        },
      });
    }),

  deleteParticipant: protectedProcedure
    .input(z.object({ id: z.string(), userId: z.string(), roomId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const participant = await ctx.db.participant.findFirst({
        where: { id: input.id },
      });

      if (!participant) {
        throw new Error("Participant not found");
      }

      if (participant.role === "owner") {
        throw new Error(
          "Owner cannot leave the room. Please delete the room instead.",
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
        where: { id: input.participantId, roomId: input.roomId },
      });

      if (!participant) {
        throw new Error("Participant not found");
      }

      if (participant.role === "owner") {
        throw new Error(
          "Owner cannot leave the room. Please delete the room instead.",
        );
      }

      return ctx.db.participant.delete({
        where: { id: input.participantId },
      });
    }),
});
