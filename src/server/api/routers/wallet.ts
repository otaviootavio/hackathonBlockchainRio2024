import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import axios from "axios";
import { TRPCError } from "@trpc/server";
import { env } from "~/env";
import { db } from "~/server/db";
import getUrl from "~/utils/getUrl";

const XUMM_API_KEY = env.XUMM_API_KEY;
const XUMM_API_SECRET = env.XUMM_API_SECRET;

// Define the schema for the payment request response
const paymentRequestResponseSchema = z.object({
  uuid: z.string(),
  next: z.object({
    always: z.string(),
  }),
  refs: z.object({
    qr_png: z.string(),
  }),
});

// Define the schema for the payment status response
export const paymentStatusResponseSchema = z.object({
  response: z.object({
    txid: z.string().or(z.null()),
    resolved_at: z.string().or(z.null()),
    dispatched_result: z.string().or(z.null()),
    dispatched_to_node: z.boolean().or(z.null()),
    environment_networkid: z.number().or(z.undefined()),
  }),
});

export const xamanRouter = createTRPCRouter({
  createSignRequest: protectedProcedure
    .input(
      z.object({
        returnUrl: z.string(),
        memo: z.string().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const url = "https://xumm.app/api/v1/platform/payload";
      const payload = {
        txjson: {
          TransactionType: "SignIn",
          ...(input.memo && {
            Memos: [
              {
                Memo: {
                  MemoType: Buffer.from("memo", "utf8").toString("hex"),
                  MemoData: Buffer.from(input.memo, "utf8").toString("hex"),
                },
              },
            ],
          }),
        },
        options: {
          return_url: {
            app: getUrl(`${input.returnUrl}`),
            web: getUrl(`${input.returnUrl}`),
          },
        },
      };

      const options = {
        method: "POST",
        headers: {
          accept: "application/json",
          "Content-Type": "application/json",
          "X-API-Key": XUMM_API_KEY,
          "X-API-Secret": XUMM_API_SECRET,
        },
        data: payload,
      };

      try {
        const response = await axios(url, options);
        const parsedResponse = paymentRequestResponseSchema.parse(
          response.data,
        );

        await db.webhookEvent.create({
          data: {
            payloadId: parsedResponse.uuid,
            userId: ctx.session.user.id,
            status: "pending",
          },
        });

        return {
          uuid: parsedResponse.uuid,
          next: parsedResponse.next.always,
          qrCodeUrl: parsedResponse.refs.qr_png,
        };
      } catch (e) {
        if (e instanceof Error) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: `Failed to retrieve payment status: ${e.message}`,
            cause: e,
          });
        } else {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message:
              "Failed to retrieve payment status due to an unknown error.",
          });
        }
      }
    }),

  // Procedure to create a payment request
  createPaymentRequest: protectedProcedure
    .input(
      z.object({
        roomId: z.string(),
        amount: z.string().min(1),
        destination: z.string().min(1),
        destinationTag: z.string().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const url = "https://xumm.app/api/v1/platform/payload";
      const payload = {
        txjson: {
          TransactionType: "Payment",
          Amount: input.amount,
          Destination: input.destination,
          ...(input.destinationTag && { DestinationTag: input.destinationTag }),
        },
        options: {
          return_url: {
            app: getUrl(`/room/${input.roomId}`),
            web: getUrl(`/room/${input.roomId}`),
          },
        },
      };

      const options = {
        method: "POST",
        headers: {
          accept: "application/json",
          "Content-Type": "application/json",
          "X-API-Key": XUMM_API_KEY,
          "X-API-Secret": XUMM_API_SECRET,
        },
        data: payload,
      };

      try {
        const response = await axios(url, options);
        const parsedResponse = paymentRequestResponseSchema.parse(
          response.data,
        );

        return {
          uuid: parsedResponse.uuid,
          next: parsedResponse.next.always,
          qrCodeUrl: parsedResponse.refs.qr_png,
        };
      } catch (e) {
        if (e instanceof Error) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: `Failed to retrieve payment status: ${e.message}`,
            cause: e,
          });
        } else {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message:
              "Failed to retrieve payment status due to an unknown error.",
          });
        }
      }
    }),

  // Procedure to get the status of a payment request
  getPaymentStatus: protectedProcedure
    .input(z.object({ uuid: z.string() }))
    .query(async ({ input }) => {
      const url = `https://xumm.app/api/v1/platform/payload/${input.uuid}`;

      const options = {
        method: "GET",
        headers: {
          accept: "application/json",
          "Content-Type": "application/json",
          "X-API-Key": XUMM_API_KEY,
          "X-API-Secret": XUMM_API_SECRET,
        },
      };

      try {
        const response = await axios(url, options);
        const parsedResponse = paymentStatusResponseSchema.parse(response.data);

        return {
          txid: parsedResponse.response.txid,
          resolved_at: parsedResponse.response.resolved_at,
          dispatched_result: parsedResponse.response.dispatched_result,
          dispatched_to_node: parsedResponse.response.dispatched_to_node,
          environment_networkid: parsedResponse.response.environment_networkid,
        };
      } catch (e) {
        if (e instanceof Error) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: `Failed to retrieve payment status: ${e.message}`,
            cause: e,
          });
        } else {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message:
              "Failed to retrieve payment status due to an unknown error.",
          });
        }
      }
    }),
  createWebhookEvent: publicProcedure
    .input(
      z.object({
        payloadId: z.string(),
        userId: z.string(),
        roomId: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      try {
        const webhookEvent = await db.webhookEvent.create({
          data: {
            payloadId: input.payloadId,
            roomId: input.roomId,
            userId: input.userId,
            status: "pending",
          },
        });

        return { status: "success", webhookEvent };
      } catch (e) {
        console.error("Failed to create webhook event:", e);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create webhook event.",
          cause: e,
        });
      }
    }),
  getSuccessfulWebhookEvents: protectedProcedure
    .input(
      z.object({
        userId: z.string(),
        roomId: z.string(),
      }),
    )
    .query(async ({ input }) => {
      try {
        const successfulWebhookEvents = await db.webhookEvent.findMany({
          where: {
            userId: input.userId,
            roomId: input.roomId,
            status: "signed",
          },
        });

        return { status: "success", successfulWebhookEvents };
      } catch (e) {
        console.error("Failed to retrieve successful webhook events:", e);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to retrieve successful webhook events.",
          cause: e,
        });
      }
    }),

  getSuccessfulWebhookEventsByParticipantId: protectedProcedure
    .input(
      z.object({
        participantId: z.string(),
        roomId: z.string(),
      }),
    )
    .query(async ({ input, ctx }) => {
      try {
        const participant = await ctx.db.participant.findUnique({
          where: { id: input.participantId },
          select: { userId: true },
        });

        if (!participant) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Participant not found",
          });
        }

        const successfulWebhookEvents = await ctx.db.webhookEvent.findMany({
          where: {
            userId: participant.userId,
            roomId: input.roomId,
            status: "signed",
          },
        });

        return { status: "success", successfulWebhookEvents };
      } catch (e) {
        console.error(
          "Failed to retrieve successful webhook events by participant id:",
          e,
        );
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message:
            "Failed to retrieve successful webhook events by participant id.",
          cause: e,
        });
      }
    }),
});
