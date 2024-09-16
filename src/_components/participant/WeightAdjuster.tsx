import { LiaPizzaSliceSolid } from "react-icons/lia";
import { useRoomContext } from "~/_context/room/RoomContext";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";

const WeightAdjuster = ({
  participantId,
  weight,
  canUserEditThisParticipantWeight,
}: {
  participantId: string;
  weight: number;
  canUserEditThisParticipantWeight: boolean;
}) => {
  const { handleWeightChange } = useRoomContext();

  return (
    <div className="flex items-center space-x-2">
      {canUserEditThisParticipantWeight && (
        <>
          <Button
            variant="outline"
            size="icon"
            onClick={() => handleWeightChange(weight - 1, participantId)}
            disabled={weight <= 1}
          >
            -
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => handleWeightChange(weight + 1, participantId)}
          >
            +
          </Button>
        </>
      )}
      <Badge variant="secondary" className="flex items-center space-x-1">
        <span>{weight}</span>
        <LiaPizzaSliceSolid />
      </Badge>
    </div>
  );
};

export default WeightAdjuster;