import usePusherState from "./usePusherState";

export const useCurrentMemberCount = () =>
  usePusherState((state) => state.members.size);
