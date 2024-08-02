import { MdOutlinePlaylistRemove } from "react-icons/md";
import { useRoomContext } from "~/_context/room/RoomContext";

const RemoveButton = ({ participantId }: { participantId: string }) => {
  const { removeParticipant } = useRoomContext();

  return (
    <button
      onClick={() => removeParticipant(participantId)}
      type="button"
      className="inline-flex w-28 items-center justify-center rounded bg-red-500 p-1 px-2 text-xs font-medium text-white hover:bg-red-800 focus:outline-none focus:ring-1 focus:ring-red-300 dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-800"
    >
      <MdOutlinePlaylistRemove className="mr-1" />
      Remove
    </button>
  );
};

export default RemoveButton;
