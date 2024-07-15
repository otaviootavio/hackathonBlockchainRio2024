import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import axios from "axios";
import { TRPCError } from "@trpc/server";
import { env } from "~/env";

const XUMM_API_KEY = env.XUMM_API_KEY;
const XUMM_API_SECRET = env.XUMM_API_SECRET;

export const walletRouter = createTRPCRouter({
  // Procedure to create a payment request
  createPaymentRequest: protectedProcedure
    .input(
      z.object({
        amount: z.string().min(1),
        destination: z.string().min(1),
        destinationTag: z.string().optional(),
        memo: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const url = "https://xumm.app/api/v1/platform/payload";
      const payload = {
        txjson: {
          TransactionType: "Payment",
          Amount: input.amount,
          Destination: input.destination,
          ...(input.destinationTag && { DestinationTag: input.destinationTag }),
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
        const json = response.data;
        return {
          uuid: json.uuid,
          next: json.next.always,
          qrCodeUrl: json.refs.qr_png,
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
    .query(async ({ ctx, input }) => {
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
        const json = response.data.response;

        console.log(json);
        return {
          // hex: json.hex,
          txid: json.txid as string,
          resolved_at: json.resolved_at as string,
          // dispatched_to: json.dispatched_to,
          // dispatched_nodetype: json.dispatched_nodetype,
          dispatched_result: json.dispatched_result as string,
          dispatched_to_node: json.dispatched_to_node,
          // environment_nodeuri: json.environment_nodeuri,
          // environment_nodetype: json.environment_nodetype,
          // multisign_account: json.multisign_account,
          // account: json.account,
          // signer: json.signer,
          // user: json.user,
          environment_networkid: json.environment_networkid as string,
        };

        // return json;
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
});
