import { LiaPizzaSliceSolid } from "react-icons/lia";
import { useRoomContext } from "~/_context/room/RoomContext";

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
    <div className="flex w-24 items-center justify-end">
      {canUserEditThisParticipantWeight && (
        <>
          <button
            onClick={() => handleWeightChange(weight - 1, participantId)}
            type="button"
            className="me-2 rounded-full bg-gray-300 p-1 px-2 text-xs font-medium hover:bg-gray-500 focus:outline-none focus:ring-4 focus:ring-gray-300"
            disabled={weight <= 1}
          >
            -
          </button>
          <button
            onClick={() => handleWeightChange(weight + 1, participantId)}
            type="button"
            className="me-2 rounded-full bg-gray-300 p-1 px-2 text-xs font-medium hover:bg-gray-500 focus:outline-none focus:ring-4 focus:ring-gray-300"
          >
            +
          </button>
        </>
      )}
      {weight} <LiaPizzaSliceSolid />
    </div>
  );
};

export default WeightAdjuster;
