import { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";
import { db } from "~/server/db";

const webhookPayloadSchema = z.object({
  meta: z.object({
    url: z.string(),
    application_uuidv4: z.string(),
    payload_uuidv4: z.string(),
    opened_by_deeplink: z.boolean(),
  }),
  custom_meta: z.object({
    identifier: z.string().nullable(),
    blob: z.string().nullable(),
    instruction: z.string().nullable(),
  }),
  payloadResponse: z.object({
    payload_uuidv4: z.string(),
    reference_call_uuidv4: z.string(),
    signed: z.boolean(),
    user_token: z.boolean(),
    return_url: z.object({
      app: z.string().nullable(),
      web: z.string().nullable(),
    }),
    txid: z.string().nullable(),
  }),
  userToken: z.object({
    user_token: z.string(),
    token_issued: z.number(),
    token_expiration: z.number(),
  }),
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const input = webhookPayloadSchema.parse(req.body);

    // Log the webhook payload for debugging purposes
    console.log("Received webhook payload:", input);

    // Find the corresponding webhook event
    const webhookEvent = await db.webhookEvent.findUnique({
      where: { payloadId: input.payloadResponse.payload_uuidv4 },
    });

    if (!webhookEvent) {
      return res.status(404).json({ error: "Webhook event not found." });
    }

    // Update the webhook event with the received information
    const updatedWebhookEvent = await db.webhookEvent.update({
      where: { payloadId: input.payloadResponse.payload_uuidv4 },
      data: {
        signed: input.payloadResponse.signed,
        txid: input.payloadResponse.txid,
        status: input.payloadResponse.signed ? "signed" : "rejected",
      },
    });

    if (!updatedWebhookEvent) {
      return res.status(404).json({ error: "Webhook event not found." });
    }

    if (!updatedWebhookEvent.userId) {
      return res.status(404).json({ error: "User  not found." });
    }

    if (!updatedWebhookEvent.roomId) {
      return res.status(404).json({ error: "Room not found." });
    }

    await db.participant.updateMany({
      where: {
        userId: updatedWebhookEvent.userId,
        roomId: updatedWebhookEvent.roomId,
      },
      data: { payed: true },
    });

    return res.status(200).json({ status: "success", updatedWebhookEvent });
  } catch (e) {
    console.error("Failed to handle webhook:", e);
    return res.status(500).json({ error: "Failed to handle webhook." });
  }
}
