import { useRoomContext } from "~/_context/pusher/room/RoomContext";

export const RoomLeave = ({
  userParticipantData,
}: {
  userParticipantData: {
    payed: boolean;
    role: string;
    roomId: string;
    userId: string;
    weight: number;
    userParticipantId: string;
  };
}) => {
  const { removeParticipant } = useRoomContext();

  return (
    <div className="self-center">
      <button
        onClick={() => removeParticipant(userParticipantData.userParticipantId)}
        type="button"
        className="rounded-lg bg-red-500 p-2 px-4 text-xs font-semibold text-white hover:bg-red-800 focus:outline-none focus:ring-1 focus:ring-red-300 dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-800"
      >
        Quit
      </button>
    </div>
  );
};
