import { type WebhookHandler, type WebhookResult } from "./WebhookService";
import { type z } from "zod";
import { type webhookPayloadSchema, xummPayloadDetailsSchema } from "./schemas";
import { db } from "~/server/db";
import { pusherServerClient } from "~/server/pusher";
import axios from "axios";
import { type WebhookEvent } from "@prisma/client";

type WebhookPayload = z.infer<typeof webhookPayloadSchema>;

export class WebhookPayloadHandler implements WebhookHandler<WebhookPayload> {
  async handle(input: WebhookPayload): Promise<WebhookResult> {
    try {
      const webhookEvent = await db.webhookEvent.findUnique({
        where: { payloadId: input.payloadResponse.payload_uuidv4 },
      });

      if (!webhookEvent) {
        return this.createNewWebhookEvent(input);
      }

      return this.updateExistingWebhookEvent(input);
    } catch (error) {
      console.error("Error handling webhook payload:", error);
      return {
        status: "error",
        message:
          error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  }

  private async createNewWebhookEvent(
    input: WebhookPayload,
  ): Promise<WebhookResult> {
    const newWebhookEvent = await db.webhookEvent.create({
      data: {
        payloadId: input.payloadResponse.payload_uuidv4,
        signed: input.payloadResponse.signed,
        txid: input.payloadResponse.txid,
        status: input.payloadResponse.signed ? "signed" : "rejected",
      },
    });

    return {
      status: "success",
      action: "created",
      webhookEvent: newWebhookEvent,
    };
  }

  private async updateExistingWebhookEvent(
    input: WebhookPayload,
  ): Promise<WebhookResult> {
    const updatedWebhookEvent: WebhookEvent = await db.webhookEvent.update({
      where: { payloadId: input.payloadResponse.payload_uuidv4 },
      data: {
        signed: input.payloadResponse.signed,
        txid: input.payloadResponse.txid,
        status: input.payloadResponse.signed ? "signed" : "rejected",
      },
    });

    if (input.payloadResponse.signed && updatedWebhookEvent.userId) {
      if (updatedWebhookEvent.roomId) {
        await this.handleRoomPayment(updatedWebhookEvent);
      } else {
        await this.handleWalletAttribution(updatedWebhookEvent);
      }
    }

    return {
      status: "success",
      action: "updated",
      webhookEvent: updatedWebhookEvent,
    };
  }

  private async handleRoomPayment(webhookEvent: WebhookEvent): Promise<void> {
    if (webhookEvent.userId && webhookEvent.roomId) {
      await db.participant.updateMany({
        where: {
          userId: webhookEvent.userId,
          roomId: webhookEvent.roomId,
        },
        data: { payed: true },
      });
      await pusherServerClient.trigger(
        `room-${webhookEvent.roomId}`,
        `participant-payed`,
        {
          participantId: webhookEvent.userId,
        },
      );
    }
  }

  private async handleWalletAttribution(
    webhookEvent: WebhookEvent,
  ): Promise<void> {
    if (webhookEvent.userId && webhookEvent.payloadId) {
      const payloadDetails = await this.fetchXummPayloadDetails(
        webhookEvent.payloadId,
      );
      const userwallet = payloadDetails.response.account;
      await db.userProfile.upsert({
        where: { userId: webhookEvent.userId },
        create: {
          userId: webhookEvent.userId,
          wallet: userwallet,
        },
        update: { wallet: userwallet },
      });
    }
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
          "X-API-Key": process.env.XUMM_API_KEY ?? "",
          "X-API-Secret": process.env.XUMM_API_SECRET ?? "",
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
