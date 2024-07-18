import usePusherState from "./usePusherState";

export const useCurrentMembers = () =>
  usePusherState((state) =>
    Array.from(state.members.values()).map((member) => member.name),
  );
