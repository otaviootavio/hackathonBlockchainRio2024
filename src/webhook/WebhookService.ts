import { type z } from "zod";
import { webhookPayloadSchema } from "./schemas";
import { type WebhookEvent } from "@prisma/client";

type WebhookPayload = z.infer<typeof webhookPayloadSchema>;

export type WebhookResult =
  | {
      status: "success";
      action: "created" | "updated";
      webhookEvent: WebhookEvent;
    }
  | { status: "error"; message: string };

export interface WebhookHandler<T> {
  handle(input: T): Promise<WebhookResult>;
}

export class WebhookService {
  private handlers: {
    webhook: WebhookHandler<WebhookPayload>;
  };

  constructor(handlers: { webhook: WebhookHandler<WebhookPayload> }) {
    this.handlers = handlers;
  }

  async processWebhook(input: unknown): Promise<WebhookResult> {
    try {
      const webhookPayload = webhookPayloadSchema.parse(input);
      return await this.handlers.webhook.handle(webhookPayload);
    } catch (error) {
      return {
        status: "error",
        message:
          error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  }
}
