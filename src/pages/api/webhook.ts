import { type NextApiRequest, type NextApiResponse } from "next";
import { WebhookService } from "~/webhook/WebhookService";
import { WebhookPayloadHandler } from "~/webhook/WebhookPayloadHandler";
import { z } from "zod";

const webhookService = new WebhookService({
  webhook: new WebhookPayloadHandler(),
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  try {
    const result = await webhookService.processWebhook(req.body);
    if (result.status === "success") {
      return res
        .status(200)
        .json({ message: "Webhook processed successfully", result });
    } else {
      return res.status(400).json({ error: result.message });
    }
  } catch (e) {
    console.error("Failed to handle webhook:", e);
    if (e instanceof z.ZodError) {
      return res
        .status(400)
        .json({ error: "Invalid payload", details: e.errors });
    } else {
      return res.status(500).json({ error: "Failed to handle webhook" });
    }
  }
}
