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
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.room.update({
        where: { id: input.id },
        data: {
          name: input.name,
          description: input.description,
          totalPrice: input.totalPrice,
        },
      });
    }),

  deleteRoom: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
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
});
