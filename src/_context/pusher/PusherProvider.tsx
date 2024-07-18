import React, { useEffect, useReducer } from "react";
import { PusherContext } from "./PusherContext";
import { pusherReducer } from "./pusherReducer";
import { createPusherClient } from "../../utils/pusher";
import { PusherProps } from "../../types/pusherTypes";

type PusherProviderProps = React.PropsWithChildren<PusherProps>;

export const PusherProvider = ({
  slug,
  children,
  userInfo,
  userId,
}: PusherProviderProps) => {
  const [state, dispatch] = useReducer(pusherReducer, {
    pusherClient: null,
    channel: null,
    presenceChannel: null,
    members: new Map(),
  });

  useEffect(() => {
    const { pusherClient, channel, presenceChannel } = createPusherClient({
      slug,
      userInfo,
      userId,
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
  }, [slug, userInfo, userId]);

  if (!state.pusherClient) return null;

  return (
    <PusherContext.Provider value={state}>{children}</PusherContext.Provider>
  );
};
