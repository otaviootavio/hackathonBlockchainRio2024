import type { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";
import { pusherServerClient } from "~/server/pusher";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { channel_name, socket_id } = z
      .object({ channel_name: z.string(), socket_id: z.string() })
      .parse(req.body);
    const { user_id, user_info } = req.headers;

    if (!user_id || !user_info) {
      res.status(404).send("Missing user_id or user_info");
      return;
    }

    const userIdParsed = z.string().parse(user_id.toString());
    const userInfoParsed = z
      .object({ name: z.string() })
      .parse(JSON.parse(user_info.toString()));

    const auth = pusherServerClient.authorizeChannel(socket_id, channel_name, {
      user_id: userIdParsed,
      user_info: userInfoParsed,
    });
    res.send(auth);
  } catch (e) {
    res.status(404).send("Unable to parse user info or user id");
    return;
  }
}
