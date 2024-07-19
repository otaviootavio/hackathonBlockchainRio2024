import { useContext } from "react";
import { type PusherState } from "../types/pusherTypes";
import { PusherContext } from "~/_context/pusher/PusherContext";

function usePusherState<T>(selector: (state: PusherState) => T): T {
  const state = useContext(PusherContext);
  if (!state) throw new Error("Missing PusherContext.Provider in the tree");
  return selector(state);
}

export default usePusherState;
