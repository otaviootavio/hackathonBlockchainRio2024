import { type Channel, type PresenceChannel } from "pusher-js";
import Pusher from "pusher-js";
import { env } from "../env";
import { type PusherProps } from "../types/pusherTypes";

interface PusherClient {
  pusherClient: Pusher;
  channel: Channel;
  presenceChannel: PresenceChannel;
}

export const createPusherClient = ({
  slug,
  userInfo,
  userId,
}: PusherProps): PusherClient => {
  let pusherClient: Pusher;

  if (Pusher.instances.length > 0) {
    pusherClient = Pusher.instances[0]!;

    if (!pusherClient) {
      throw new Error("Failed to initialize Pusher client");
    }

    pusherClient.connect();
  } else {
    pusherClient = new Pusher(env.NEXT_PUBLIC_PUSHER_KEY, {
      cluster: env.NEXT_PUBLIC_PUSHER_CLUSTER,
      authEndpoint: "/api/pusher/auth-channel",
      auth: {
        headers: { user_id: userId, user_info: JSON.stringify(userInfo) },
      },
    });
  }

  const channel = pusherClient.subscribe(slug);
  const presenceChannel = pusherClient.subscribe(
    `presence-${slug}`,
  ) as PresenceChannel;

  return { pusherClient, channel, presenceChannel };
};
