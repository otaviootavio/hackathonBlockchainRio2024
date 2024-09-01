import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import axios from "axios";
import { TRPCError } from "@trpc/server";
import { env } from "~/env";
import { db } from "~/server/db";
import getUrl from "~/utils/getUrl";
import { pusherServerClient } from "~/server/pusher";

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

        const userProfile = await db.userProfile.findUnique({
          where: { userId: ctx.session.user.id },
        });

        if (!userProfile) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "User profile not found",
          });
        }

        const signatureRequest = await db.signatureRequest.create({
          data: {
            payloadId: parsedResponse.uuid,
            userProfileId: userProfile.id,
            status: "PENDING",
          },
        });

        return {
          uuid: parsedResponse.uuid,
          next: parsedResponse.next.always,
          qrCodeUrl: parsedResponse.refs.qr_png,
          signatureRequestId: signatureRequest.id,
        };
      } catch (e) {
        if (e instanceof Error) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: `Failed to create signature request: ${e.message}`,
            cause: e,
          });
        } else {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message:
              "Failed to create signature request due to an unknown error.",
          });
        }
      }
    }),

  getSignatureRequestStatus: protectedProcedure
    .input(z.object({ signatureRequestId: z.string() }))
    .query(async ({ input, ctx }) => {
      const signatureRequest = await db.signatureRequest.findUnique({
        where: { id: input.signatureRequestId },
        include: { userProfile: true },
      });

      if (!signatureRequest) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Signature request not found",
        });
      }

      if (signatureRequest.userProfile.userId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have permission to view this signature request",
        });
      }

      return {
        status: signatureRequest.status,
        networkId: signatureRequest.networkId,
        transactionId: signatureRequest.transactionId,
      };
    }),
  updateSignatureRequestStatus: protectedProcedure
    .input(
      z.object({
        payloadId: z.string(),
        status: z.enum(["COMPLETED", "FAILED"]),
        networkId: z.string().optional(),
        transactionId: z.string().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const updatedSignatureRequest = await db.signatureRequest.update({
        where: { payloadId: input.payloadId },
        data: {
          status: input.status,
          networkId: input.networkId,
          transactionId: input.transactionId,
        },
        include: { userProfile: true },
      });

      if (updatedSignatureRequest.userProfile.userId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have permission to update this signature request",
        });
      }

      // Notify frontend about the signature request update
      await pusherServerClient.trigger(
        `signature-request-${updatedSignatureRequest.id}`,
        "signature-request-updated",
        {
          signatureRequestId: updatedSignatureRequest.id,
          status: updatedSignatureRequest.status,
        },
      );

      return updatedSignatureRequest;
    }),

  // Procedure to create a payment request
  createPaymentRequest: protectedProcedure
    .input(
      z.object({
        roomId: z.string(),
        participantId: z.string(),
        amount: z.string().min(1),
        destination: z.string().min(1),
      }),
    )
    .mutation(async ({ input }) => {
      const url = "https://xumm.app/api/v1/platform/payload";
      const payload = {
        txjson: {
          TransactionType: "Payment",
          Amount: input.amount,
          Destination: input.destination,
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

        const payment = await db.payment.create({
          data: {
            payloadId: parsedResponse.uuid,
            participantId: input.participantId,
            status: "PENDING",
          },
        });

        return {
          uuid: parsedResponse.uuid,
          next: parsedResponse.next.always,
          qrCodeUrl: parsedResponse.refs.qr_png,
          paymentId: payment.id,
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
    .input(z.object({ paymentId: z.string() }))
    .query(async ({ input }) => {
      const payment = await db.payment.findUnique({
        where: { id: input.paymentId },
      });

      if (!payment) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Payment not found",
        });
      }

      return {
        status: payment.status,
        networkId: payment.networkId,
        transactionId: payment.transactionId,
      };
    }),

  updatePaymentStatus: protectedProcedure
    .input(
      z.object({
        payloadId: z.string(),
        status: z.enum(["COMPLETED", "FAILED"]),
        networkId: z.string().optional(),
        transactionId: z.string().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const updatedPayment = await db.payment.update({
        where: { payloadId: input.payloadId },
        data: {
          status: input.status,
          networkId: input.networkId,
          transactionId: input.transactionId,
        },
      });

      // Notify frontend about the payment update
      await pusherServerClient.trigger(
        `payment-${updatedPayment.id}`,
        "payment-updated",
        { paymentId: updatedPayment.id, status: updatedPayment.status },
      );

      return updatedPayment;
    }),
});
