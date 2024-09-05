import {
  type PaymentWebhookHandler,
  type PaymentWebhookResult,
} from "./WebhookService";
import { type z } from "zod";
import { type webhookPayloadSchema, xummPayloadDetailsSchema } from "./schemas";
import { db } from "~/server/db";
import { pusherServerClient } from "~/server/pusher";
import axios from "axios";
import { type SignatureRequest, type Payment } from "@prisma/client";
import { env } from "~/env";

type WebhookPayload = z.infer<typeof webhookPayloadSchema>;

export class PaymentWebhookPayloadHandler implements PaymentWebhookHandler {
  async handle(input: WebhookPayload): Promise<PaymentWebhookResult> {
    try {
      const payment = await db.payment.findUnique({
        where: { payloadId: input.payloadResponse.payload_uuidv4 },
      });

      if (payment) {
        return this.updatePaymentStatus(input, payment);
      }

      const signatureRequest = await db.signatureRequest.findUnique({
        where: { payloadId: input.payloadResponse.payload_uuidv4 },
      });

      if (signatureRequest) {
        return this.updateSignatureRequestStatus(input, signatureRequest);
      }

      return {
        status: "error",
        message: "No matching payment or signature request found",
      };
    } catch (error) {
      console.error("Error handling webhook payload:", error);
      return {
        status: "error",
        message:
          error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  }

  private async updateSignatureRequestStatus(
    input: WebhookPayload,
    signatureRequest: SignatureRequest,
  ): Promise<PaymentWebhookResult> {
    const payloadDetails = await this.fetchXummPayloadDetails(
      signatureRequest.payloadId,
    );

    const result = await db.$transaction(async (prisma) => {
      const updatedSignatureRequest = await prisma.signatureRequest.update({
        where: { id: signatureRequest.id },
        data: {
          status: input.payloadResponse.signed ? "COMPLETED" : "FAILED",
          networkId: payloadDetails.response.environment_networkid.toString(),
          transactionId: input.payloadResponse.txid ?? undefined,
        },
        include: { userProfile: true }, // Include the userProfile to get the userId
      });

      if (input.payloadResponse.signed) {
        // If the signature was successful, update the user's wallet
        await prisma.userProfile.update({
          where: { id: updatedSignatureRequest.userProfile.id },
          data: {
            wallet: payloadDetails.response.account,
          },
        });
      }

      return updatedSignatureRequest;
    });

    await pusherServerClient.trigger(
      `signature-request-${result.id}`,
      "signature-request-updated",
      {
        signatureRequestId: result.id,
        status: result.status,
      },
    );

    return {
      status: "success",
      action: "updated",
      data: result,
    };
  }

  private async updatePaymentStatus(
    input: WebhookPayload,
    payment: Payment,
  ): Promise<PaymentWebhookResult> {
    const payloadDetails = await this.fetchXummPayloadDetails(
      payment.payloadId,
    );

    const result = await db.$transaction(async (prisma) => {
      // include participant and room
      const updatedPayment = await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: input.payloadResponse.signed ? "COMPLETED" : "FAILED",
          networkId: payloadDetails.response.environment_networkid.toString(),
          transactionId: input.payloadResponse.txid ?? undefined,
        },
        include: { participant: true }, // Include the participant to get access to its id
      });

      if (input.payloadResponse.signed) {
        // If the payment was successful, update the participant's payed status
        await prisma.participant.update({
          where: { id: updatedPayment.participant.id },
          data: { payed: true },
        });
      }

      return updatedPayment;
    });

    await pusherServerClient.trigger(
      `room-${result.participant.roomId}`,
      "participant-payed",
      {
        paymentId: result.id,
        status: result.status,
        participantId: result.participant.id,
        payed: input.payloadResponse.signed,
      },
    );

    return {
      status: "success",
      action: "updated",
      data: result,
    };
  }

  private async fetchXummPayloadDetails(payloadId: string) {
    const url = new URL(
      `/api/v1/platform/payload/${payloadId}`,
      "https://xumm.app",
    );

    try {
      const response = await axios.get(url.toString(), {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "X-API-Key": env.XUMM_API_KEY,
          "X-API-Secret": env.XUMM_API_SECRET,
        },
      });

      const parsedResponse = xummPayloadDetailsSchema.parse(response.data);
      return parsedResponse;
    } catch (error) {
      console.error("Error fetching XUMM payload details:", error);
      throw new Error("Failed to fetch XUMM payload details");
    }
  }
}
