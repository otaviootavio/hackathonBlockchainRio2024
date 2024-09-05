import { TRPCError } from "@trpc/server";
import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { pusherServerClient } from "~/server/pusher";

export const participantRouter = createTRPCRouter({
  addParticipant: protectedProcedure
    .input(
      z.object({
        roomId: z.string(),
        userId: z.string(),
        name: z.string().min(1),
        payed: z.boolean(),
        profileId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const room = await ctx.db.room.findUniqueOrThrow({
        where: { id: input.roomId },
      });

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

      const participant = await ctx.db.participant.create({
        data: {
          profileId: input.profileId,
          roomId: input.roomId,
          userId: input.userId,
          payed: input.payed,
          role: "normal",
          weight: 1,
        },
      });

      await pusherServerClient.trigger(
        `room-${input.roomId}`,
        "participant-added",
        {
          participantId: participant.id,
        },
      );

      return participant;
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
      const participant = await ctx.db.participant.findUniqueOrThrow({
        where: { id: input.id },
      });

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

      const res = await ctx.db.participant.update({
        where: { id: input.id },
        data: {
          payed: input.payed,
          weight: input.weight,
        },
      });

      await pusherServerClient.trigger(
        `room-${participant.roomId}`,
        "participant-updated",
        {
          participantId: participant.id,
        },
      );

      return res;
    }),

  deleteParticipant: protectedProcedure
    .input(z.object({ id: z.string(), userId: z.string(), roomId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const participant = await ctx.db.participant.findUniqueOrThrow({
        where: { id: input.id },
      });

      if (participant.role === "owner") {
        throw new Error(
          "Owner cannot leave the room. Please delete the room instead.",
        );
      }

      const res = await ctx.db.participant.delete({
        where: { id: input.id },
      });

      await pusherServerClient.trigger(
        `room-${participant.roomId}`,
        "participant-deleted",
        {
          participantId: participant.id,
        },
      );

      return res;
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
      const participant = await ctx.db.participant.findFirstOrThrow({
        where: { id: input.participantId, roomId: input.roomId },
      });

      if (participant.role === "owner") {
        throw new Error(
          "Owner cannot leave the room. Please delete the room instead.",
        );
      }

      const res = await ctx.db.participant.delete({
        where: { id: input.participantId },
      });

      await pusherServerClient.trigger(
        `room-${input.roomId}`,
        "participant-deleted",
        {
          participantId: participant.id,
        },
      );

      return res;
    }),

  getParticipantByParticipantId: protectedProcedure
    .input(
      z.object({
        participantId: z.string(),
        roomId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      // First, check if the requesting user is in the room
      const requestingUserInRoom = await ctx.db.participant.findFirst({
        where: {
          roomId: input.roomId,
          userId: ctx.session.user.id,
        },
      });

      if (!requestingUserInRoom) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message:
            "You don't have permission to view information from this room",
        });
      }

      // Now fetch the requested participant
      const participant = await ctx.db.participant.findUnique({
        where: {
          id: input.participantId,
          roomId: input.roomId,
        },
        include: {
          Payment: {
            orderBy: { createdAt: "desc" },
            take: 1,
          },
        },
      });

      if (!participant) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Participant not found in the specified room",
        });
      }

      return participant;
    }),
});
