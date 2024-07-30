import { type NextApiRequest, type NextApiResponse } from "next";
import { z } from "zod";
import { db } from "~/server/db";
import { pusherServerClient } from "~/server/pusher";
// TODO
// Uncomment this when on mainnet
// import { TxData } from "xrpl-txdata";

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

    // Fetch the payload
    // The payload is created by the User and stored in the database
    const webhookEvent = await db.webhookEvent.findUnique({
      where: { payloadId: input.payloadResponse.payload_uuidv4 },
    });

    // If the payload is not found, return an error
    if (!webhookEvent) {
      console.error(
        "Webhook event not found:",
        input.payloadResponse.payload_uuidv4,
      );
      return res.status(404).json({ error: "Webhook event not found." });
    }

    const updatedWebhookEvent = await db.webhookEvent.update({
      where: { payloadId: input.payloadResponse.payload_uuidv4 },
      data: {
        signed: input.payloadResponse.signed,
        txid: input.payloadResponse.txid,
        status: input.payloadResponse.signed ? "signed" : "rejected",
      },
    });

    if (input.payloadResponse.signed === false) {
      console.warn("Payment not signed:", input.payloadResponse.payload_uuidv4);
      return res.status(400).json({ error: "Payment not signed." });
    }

    if (!updatedWebhookEvent) {
      console.error(
        "Failed to update webhook event:",
        input.payloadResponse.payload_uuidv4,
      );
      return res.status(404).json({ error: "Webhook event not found." });
    }

    if (!updatedWebhookEvent.userId) {
      console.error(
        "User not found for event:",
        input.payloadResponse.payload_uuidv4,
      );
      return res.status(404).json({ error: "User not found." });
    }

    if (!updatedWebhookEvent.roomId) {
      console.error(
        "Room not found for event:",
        input.payloadResponse.payload_uuidv4,
      );
      return res.status(404).json({ error: "Room not found." });
    }

    // TODO
    // Uncomment this when on mainnet
    // // Fetch Transaction Details and Check Delivered Amount
    // const verifyTx = new TxData(["wss://xrplcluster.com", "wss://xrpl.link"], {
    //   OverallTimeoutMs: 6000,
    //   EndpointTimeoutMs: 1500,
    // });

    // if (!input.payloadResponse.txid) {
    //   return res.status(400).json({ error: "No transaction ID provided." });
    // }

    // const transaction = await verifyTx.getOne(input.payloadResponse.txid, 20);

    // verifyTx.end();

    // const errorSchema = z.object({
    //   error: z.string(),
    //   error_code: z.number(),
    // });

    // if (transaction.result.error) {
    //   const errorMessage = (() => {
    //     try {
    //       // Parse and validate the error using zod schema
    //       const parsedError = errorSchema.parse(transaction.result.error);
    //       return parsedError.error_code;
    //     } catch (e) {
    //       // If parsing fails, fall back to a string representation of the error
    //       return typeof transaction.result.error === "object"
    //         ? JSON.stringify(transaction.result.error)
    //         : String(transaction.result.error);
    //     }
    //   })();

    //   return res.status(400).json({
    //     error: `Transaction failed: ${errorMessage}`,
    //   });
    // }

    await db.participant.updateMany({
      where: {
        userId: updatedWebhookEvent.userId,
        roomId: updatedWebhookEvent.roomId,
      },
      data: { payed: true },
    });
    await pusherServerClient.trigger(
      `room-${updatedWebhookEvent.roomId}`,
      `participant-payed`,
      {
        participantId: updatedWebhookEvent.userId,
      },
    );

    console.log(
      "Webhook handled successfully for event:",
      input.payloadResponse.payload_uuidv4,
    );
    return res.status(200).json({ status: "success", updatedWebhookEvent });
  } catch (e) {
    console.error("Failed to handle webhook:", e);
    if (e instanceof z.ZodError) {
      return res
        .status(400)
        .json({ error: "Invalid payload.", details: e.errors });
    }
    return res.status(500).json({ error: "Failed to handle webhook." });
  }
}
