import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";

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
            name: input.participantName,
            payed: input.participantPayed,
            userId: input.userId,
            role: "owner",
          },
        });

        return room;
      });
    }),

  getRoomById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.room.findUnique({
        where: { id: input.id },
        include: {
          participants: true,
          paymentInfo: true,
        },
      });
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

  updateRoom: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().optional(),
        description: z.string().optional(),
        totalPrice: z.number().optional(),
        isOpen: z.boolean().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.room.update({
        where: { id: input.id },
        data: {
          name: input.name,
          description: input.description,
          totalPrice: input.totalPrice,
          isOpen: input.isOpen,
        },
      });
    }),

  deleteRoom: protectedProcedure
    .input(z.object({ id: z.string(), userId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Find the room and ensure the user is the owner
      const room = await ctx.db.room.findUnique({
        where: { id: input.id },
        include: {
          participants: true,
        },
      });

      if (!room) {
        throw new Error("Room not found");
      }

      const owner = room.participants.find(
        (participant) =>
          participant.userId === input.userId && participant.role === "owner",
      );

      if (!owner) {
        throw new Error("You are not the owner of this room");
      }

      return ctx.db.$transaction(async (prisma) => {
        // Delete all participants associated with the room
        await prisma.participant.deleteMany({
          where: { roomId: input.id },
        });

        // Delete the room
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

      return ctx.db.room.update({
        where: { id: input.id },
        data: { isOpen: true },
      });
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

      return ctx.db.room.update({
        where: { id: input.id },
        data: { isOpen: false },
      });
    }),
});
