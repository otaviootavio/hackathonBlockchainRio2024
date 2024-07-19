import { type Channel, type PresenceChannel } from "pusher-js";
import type Pusher from "pusher-js";

export interface PusherProps {
  slug: string;
  userInfo: { name: string };
  userId: string;
}

export interface PusherState {
  pusherClient: Pusher | null;
  channel: Channel | null;
  presenceChannel: PresenceChannel | null;
  members: Map<string, { name: string }>;
}

export type PusherAction =
  | {
      type: "INIT_PUSHER";
      pusherClient: Pusher;
      channel: Channel;
      presenceChannel: PresenceChannel;
    }
  | { type: "SET_MEMBERS"; members: Record<string, { name: string }> };
