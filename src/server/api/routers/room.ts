import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { pusherServerClient } from "~/server/pusher";

export const roomRouter = createTRPCRouter({
  createRoom: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        description: z.string().min(1),
        totalPrice: z.number().min(0),
        participantName: z.string().min(1),
        participantPayed: z.boolean(),
        userId: z.string(),
        profileId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.$transaction(async (prisma) => {
        const room = await prisma.room.create({
          data: {
            name: input.name,
            description: input.description,
            totalPrice: input.totalPrice,
          },
        });

        await prisma.participant.create({
          data: {
            roomId: room.id,
            payed: input.participantPayed,
            userId: input.userId,
            profileId: input.profileId,
            role: "owner",
            weight: 1,
          },
        });

        await pusherServerClient.trigger(`room-${room.id}`, "room-created", {});

        return room;
      });
    }),

  getRoomById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const data = await ctx.db.room.findUnique({
        where: { id: input.id },
        include: {
          participants: {
            include: {
              user: {
                include: {
                  profile: true,
                },
              },
            },
            orderBy: {
              createdAt: "asc",
            },
          },
        },
      });

      if (!data) {
        throw new Error("Room not found");
      }

      const participants = data.participants.map((p) => {
        if (!p.user?.profile?.wallet) {
          throw new Error("User profile not found");
        }
        if (!p.user?.profile?.name) {
          throw new Error("User profile not found");
        }

        return {
          name: p.user.profile.name,
          wallet: p.user.profile.wallet,
          payed: p.payed,
          role: p.role,
          weight: p.weight,
          roomId: p.roomId,
          userId: p.userId,
          createdAt: p.createdAt,
          userParticipantId: p.id,
        };
      });

      const room = {
        id: data.id,
        name: data.name,
        description: data.description,
        totalPrice: data.totalPrice,
        isOpen: data.isOpen,
        isReadyForSettlement: data.isReadyForSettlement,
        hasSettled: data.hasSettled,
      };

      return { ...room, participants };
    }),

  getAllRooms: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.room.findMany();
  }),

  getRoomsByUserIdInEachRoom: protectedProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.room.findMany({
        where: {
          participants: {
            some: {
              userId: input.userId,
            },
          },
        },
      });
    }),

  // TODO
  // This is not being used
  // We need to create a page to update the room
  updateRoomData: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().optional(),
        description: z.string().optional(),
        totalPrice: z.number().optional(),
        userId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const room = await ctx.db.room.findUnique({
        where: { id: input.id },
        include: {
          participants: true,
        },
      });

      if (!room) {
        throw new Error("Room not found");
      } else if (room.isReadyForSettlement) {
        throw new Error("Room is ready for settlement and cannot be updated");
      } else if (room.hasSettled) {
        throw new Error("Room is settled and cannot be updated");
      }
      // Verify that the user is the owner of the room
      const owner = room.participants.find(
        (participant) =>
          participant.userId === input.userId && participant.role === "owner",
      );

      if (!owner) {
        throw new Error("You are not the owner of this room");
      }

      const res = await ctx.db.room.update({
        where: { id: input.id },
        data: {
          name: input.name,
          description: input.description,
          totalPrice: input.totalPrice,
        },
      });

      await pusherServerClient.trigger(`room-${input.id}`, "room-updated", {});

      return res;
    }),

  deleteRoom: protectedProcedure
    .input(z.object({ id: z.string(), userId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const room = await ctx.db.room.findFirst({
        where: {
          id: input.id,
          participants: {
            some: {
              userId: input.userId,
              role: "owner",
            },
          },
        },
      });

      if (!room) {
        throw new Error("Room not found or you are not the owner");
      }

      return ctx.db.$transaction(async (prisma) => {
        await prisma.participant.deleteMany({
          where: { roomId: input.id },
        });

        await pusherServerClient.trigger(
          `room-${input.id}`,
          "room-deleted",
          {},
        );

        return prisma.room.delete({
          where: { id: input.id },
        });
      });
    }),

  openRoom: protectedProcedure
    .input(z.object({ id: z.string(), userId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const room = await ctx.db.room.findFirst({
        where: {
          id: input.id,
          participants: {
            some: {
              userId: input.userId,
              role: "owner",
            },
          },
        },
      });

      if (!room) {
        throw new Error("Room not found or you are not the owner");
      }

      const res = await ctx.db.room.update({
        where: { id: input.id },
        data: { isOpen: true },
      });

      await pusherServerClient.trigger(`room-${input.id}`, "room-opened", {});

      return res;
    }),

  closeRoom: protectedProcedure
    .input(z.object({ id: z.string(), userId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const room = await ctx.db.room.findFirst({
        where: {
          id: input.id,
          participants: {
            some: {
              userId: input.userId,
              role: "owner",
            },
          },
        },
      });

      if (!room) {
        throw new Error("Room not found or you are not the owner");
      }

      const res = await ctx.db.room.update({
        where: { id: input.id },
        data: { isOpen: false },
      });

      await pusherServerClient.trigger(`room-${input.id}`, "room-closed", {});

      return res;
    }),

  setReadyForSettlement: protectedProcedure
    .input(z.object({ id: z.string(), userId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const room = await ctx.db.room.findFirst({
        where: {
          id: input.id,
          participants: {
            some: {
              userId: input.userId,
              role: "owner",
            },
          },
        },
      });

      if (!room) {
        throw new Error("Room not found or you are not the owner");
      }

      if (room.isReadyForSettlement) {
        throw new Error("Room is already set for settlement");
      }

      const res = await ctx.db.room.update({
        where: { id: input.id },
        data: { isReadyForSettlement: true },
      });

      await pusherServerClient.trigger(
        `room-${input.id}`,
        "room-ready-for-settlement",
        {},
      );

      return res;
    }),

  settleRoom: protectedProcedure
    .input(z.object({ id: z.string(), userId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const room = await ctx.db.room.findFirst({
        where: {
          id: input.id,
          participants: {
            some: {
              userId: input.userId,
              role: "owner",
            },
          },
        },
      });

      if (!room) {
        throw new Error("Room not found or you are not the owner");
      }

      if (!room.isReadyForSettlement) {
        throw new Error("Room is not ready for settlement");
      }

      if (room.hasSettled) {
        throw new Error("Room is already settled");
      }

      const res = await ctx.db.room.update({
        where: { id: input.id },
        data: { hasSettled: true },
      });

      await pusherServerClient.trigger(
        `user-${input.userId}`,
        `room-${input.id}-settled`,
        {
          roomId: input.id,
        },
      );

      return res;
    }),
});
