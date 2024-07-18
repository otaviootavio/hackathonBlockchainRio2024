import { type PusherAction, type PusherState } from "~/types/pusherTypes";

export const pusherReducer = (
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
