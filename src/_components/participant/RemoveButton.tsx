import { MdOutlinePlaylistRemove } from "react-icons/md";
import { useRoomContext } from "~/_context/room/RoomContext";
import { Button } from "~/components/ui/button";

const RemoveButton = ({ participantId }: { participantId: string }) => {
  const { removeParticipant } = useRoomContext();

  return (
    <Button
      variant="destructive"
      size="sm"
      onClick={() => removeParticipant(participantId)}
      className="flex items-center"
    >
      <MdOutlinePlaylistRemove className="mr-1" />
      Remove
    </Button>
  );
};

export default RemoveButton;