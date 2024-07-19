import usePusherState from "./usePusherState";

export const useCurrentMembers = () =>
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  usePusherState((state) =>
    Array.from(state.members.values()).map((member) => member.name),
  );
