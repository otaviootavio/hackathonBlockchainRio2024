import { type z } from "zod";
import { webhookPayloadSchema } from "./schemas";
import {
  type Participant,
  type Payment,
  type SignatureRequest,
} from "@prisma/client";

type WebhookPayload = z.infer<typeof webhookPayloadSchema>;

export type PaymentWebhookResult =
  | {
      status: "success";
      action: "updated";
      data: (Payment & { participant: Participant }) | SignatureRequest;
    }
  | { status: "error"; message: string };

export interface PaymentWebhookHandler {
  handle(input: WebhookPayload): Promise<PaymentWebhookResult>;
}

export class PaymentWebhookService {
  private handler: PaymentWebhookHandler;

  constructor(handler: PaymentWebhookHandler) {
    this.handler = handler;
  }

  async processWebhook(input: unknown): Promise<PaymentWebhookResult> {
    try {
      const webhookPayload = webhookPayloadSchema.parse(input);
      return await this.handler.handle(webhookPayload);
    } catch (error) {
      return {
        status: "error",
        message:
          error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  }
}
