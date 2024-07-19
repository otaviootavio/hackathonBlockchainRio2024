import { useEffect, useRef } from "react";
import usePusherState from "./usePusherState";

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
