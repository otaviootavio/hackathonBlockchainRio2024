import { useRoomContext } from "~/_context/room/RoomContext";

export const RoomLeave = () => {
  const { removeParticipant, roomData: room } = useRoomContext();
  const userParticipantData = room?.participants.find(
    (p: { payed: boolean; role: string; roomId: string; userId: string }) =>
      p.payed === false && p.role === "user",
  );

  if (!userParticipantData) return null;

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
