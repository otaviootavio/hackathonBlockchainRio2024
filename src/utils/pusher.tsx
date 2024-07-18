import {
  useEffect,
  useRef,
  useContext,
  createContext,
  useReducer,
  ReactNode,
  Dispatch,
} from "react";
import Pusher, { Channel, PresenceChannel } from "pusher-js";
import { env } from "~/env";

interface PusherProps {
  slug: string;
}

interface PusherState {
  pusherClient: Pusher | null;
  channel: Channel | null;
  presenceChannel: PresenceChannel | null;
  members: Map<string, unknown>;
}

type PusherAction =
  | {
      type: "INIT_PUSHER";
      pusherClient: Pusher;
      channel: Channel;
      presenceChannel: PresenceChannel;
    }
  | { type: "SET_MEMBERS"; members: Record<string, unknown> };

const PusherContext = createContext<PusherState | null>(null);

const pusherReducer = (
  state: PusherState,
  action: PusherAction,
): PusherState => {
  switch (action.type) {
    case "INIT_PUSHER":
      return {
        ...state,
        pusherClient: action.pusherClient,
        channel: action.channel,
        presenceChannel: action.presenceChannel,
      };
    case "SET_MEMBERS":
      return {
        ...state,
        members: new Map(Object.entries(action.members)),
      };
    default:
      return state;
  }
};

const createPusherClient = ({ slug }: PusherProps) => {
  let pusherClient: Pusher;
  if (Pusher.instances.length) {
    pusherClient = Pusher.instances[0] as Pusher;
    pusherClient.connect();
  } else {
    const randomUserId = `random-user-id:${Math.random().toFixed(7)}`;
    pusherClient = new Pusher(env.NEXT_PUBLIC_PUSHER_KEY, {
      cluster: env.NEXT_PUBLIC_PUSHER_CLUSTER,
      authEndpoint: "/api/pusher/auth-channel",
      auth: {
        headers: { user_id: randomUserId },
      },
    });
  }

  const channel = pusherClient.subscribe(slug);
  const presenceChannel = pusherClient.subscribe(
    `presence-${slug}`,
  ) as PresenceChannel;

  return { pusherClient, channel, presenceChannel };
};

type PusherProviderProps = React.PropsWithChildren<PusherProps>;

export const PusherProvider = ({ slug, children }: PusherProviderProps) => {
  const [state, dispatch] = useReducer(pusherReducer, {
    pusherClient: null,
    channel: null,
    presenceChannel: null,
    members: new Map(),
  });

  useEffect(() => {
    const { pusherClient, channel, presenceChannel } = createPusherClient({
      slug,
    });

    dispatch({ type: "INIT_PUSHER", pusherClient, channel, presenceChannel });

    const updateMembers = () => {
      dispatch({
        type: "SET_MEMBERS",
        members: presenceChannel.members.members,
      });
    };

    presenceChannel.bind("pusher:subscription_succeeded", updateMembers);
    presenceChannel.bind("pusher:member_added", updateMembers);
    presenceChannel.bind("pusher:member_removed", updateMembers);

    return () => {
      pusherClient.disconnect();
    };
  }, [slug]);

  if (!state.pusherClient) return null;

  return (
    <PusherContext.Provider value={state}>{children}</PusherContext.Provider>
  );
};

function usePusherState<T>(selector: (state: PusherState) => T): T {
  const state = useContext(PusherContext);
  if (!state) throw new Error("Missing PusherContext.Provider in the tree");
  return selector(state);
}

export function useSubscribeToEvent<MessageType>(
  eventName: string,
  callback: (data: MessageType) => void,
) {
  const channel = usePusherState((state) => state.channel);

  const stableCallback = useRef(callback);

  useEffect(() => {
    stableCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    if (channel) {
      const reference = (data: MessageType) => {
        stableCallback.current(data);
      };
      channel.bind(eventName, reference);
      return () => {
        channel.unbind(eventName, reference);
      };
    }
  }, [channel, eventName]);
}

export const useCurrentMemberCount = () =>
  usePusherState((state) => state.members.size);
