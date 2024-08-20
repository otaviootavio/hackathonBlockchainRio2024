import axios from "axios";
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

const xummPayloadDetailsSchema = z.object({
  meta: z.object({
    exists: z.boolean(),
    uuid: z.string().uuid(),
    multisign: z.boolean(),
    submit: z.boolean(),
    pathfinding: z.boolean(),
    pathfinding_fallback: z.boolean(),
    force_network: z.null(),
    destination: z.string(),
    resolved_destination: z.string(),
    resolved: z.boolean(),
    signed: z.boolean(),
    cancelled: z.boolean(),
    expired: z.boolean(),
    pushed: z.boolean(),
    app_opened: z.boolean(),
    opened_by_deeplink: z.boolean(),
    return_url_app: z.string().url(),
    return_url_web: z.string().url(),
    is_xapp: z.boolean(),
    signers: z.null(),
  }),
  application: z.object({
    name: z.string(),
    description: z.string(),
    disabled: z.number().int(),
    uuidv4: z.string().uuid(),
    icon_url: z.string().url(),
    issued_user_token: z.string().uuid(),
  }),
  payload: z.object({
    tx_type: z.string(),
    tx_destination: z.string(),
    tx_destination_tag: z.null(),
    request_json: z.object({
      TransactionType: z.string(),
      Memos: z.array(
        z.object({
          Memo: z.object({
            MemoType: z.string(),
            MemoData: z.string(),
          }),
        }),
      ),
      SignIn: z.boolean(),
    }),
    origintype: z.string(),
    signmethod: z.string(),
    created_at: z.string().datetime(),
    expires_at: z.string().datetime(),
    expires_in_seconds: z.number().int(),
    computed: z.object({
      Memos: z.array(
        z.object({
          Memo: z.object({
            MemoType: z.string(),
            MemoData: z.string(),
          }),
        }),
      ),
    }),
  }),
  response: z.object({
    hex: z.string(),
    txid: z.string(),
    resolved_at: z.string().datetime(),
    dispatched_to: z.string(),
    dispatched_nodetype: z.string(),
    dispatched_result: z.string(),
    dispatched_to_node: z.boolean(),
    environment_nodeuri: z.string().url(),
    environment_nodetype: z.string(),
    multisign_account: z.string(),
    account: z.string(),
    signer: z.string(),
    user: z.string().uuid(),
    environment_networkid: z.number().int(),
  }),
  custom_meta: z.object({
    identifier: z.null(),
    blob: z.null(),
    instruction: z.null(),
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
    console.log(JSON.stringify(req.body));
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
    if (updatedWebhookEvent.roomId) {
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
    } else {
      const url = new URL(
        `/api/v1/platform/payload/${updatedWebhookEvent.payloadId}`,
        "https://xumm.app",
      );

      const response = await axios.get(url.toString(), {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "X-API-Key": process.env.XUMM_API_KEY,
          "X-API-Secret": process.env.XUMM_API_SECRET,
        },
      });

      xummPayloadDetailsSchema.parse(response.data);

      const paredXummPayloadDetailsSchema = xummPayloadDetailsSchema.parse(
        response.data,
      );
      // parsedResponse.response.environment_networkid;
      // Now the user has signed on wallet
      // It means that the user has control over that account
      // So we can attribuite the wallet to the user
      const userid = updatedWebhookEvent.userId;
      const userwallet = paredXummPayloadDetailsSchema.response.account;
      await db.userProfile.upsert({
        where: { userId: userid },
        create: { userId: userid, wallet: userwallet },
        update: { wallet: userwallet },
      });
    }

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
