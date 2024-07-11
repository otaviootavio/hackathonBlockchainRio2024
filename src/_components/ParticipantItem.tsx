import { useSession } from "next-auth/react";
import { api } from "~/utils/api";
import { useState } from "react";

export function ParticipantItem({
  participant,
  removeParticipant,
  isOwner,
  totalPrice,
  totalWeight,
  participantsRefetch,
}: {
  participant: {
    id: string;
    name: string;
    payed: boolean;
    role: string;
    roomId: string;
    userId: string;
    weight: number;
  };
  participantsRefetch: () => void;
  totalWeight: number;
  totalPrice: number;
  isOwner: boolean;
  removeParticipant: (participantId: string) => void;
}) {
  const session = useSession();

  const updateParticipant = api.participant.updateParticipant.useMutation();
  const [payed, setPayed] = useState(participant.payed);
  const [weight, setWeight] = useState(participant.weight);
  const canEdit = isOwner || session.data?.user?.id === participant.userId;

  const handlePayedToggle = async () => {
    setPayed(!payed);
    await updateParticipant.mutateAsync({
      id: participant.id,
      payed: !payed,
    });
    participantsRefetch();
  };

  const handleWeightChange = async (newWeight: number) => {
    if (newWeight > 0) {
      setWeight(newWeight);
      await updateParticipant.mutateAsync({
        id: participant.id,
        weight: newWeight,
      });
      participantsRefetch();
    }
  };

  return (
    <div className="flex flex-row justify-between rounded-sm border border-gray-300 bg-white p-4">
      <div className="self-center">
        <h2 className="text-2xl font-bold">{participant.name}</h2>
        {canEdit && (
          <button
            onClick={() => removeParticipant(participant.id)}
            type="button"
            className="me-2 rounded-full bg-red-500 p-1 px-2 text-xs font-medium text-white hover:bg-red-800 focus:outline-none focus:ring-4 focus:ring-red-300 dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-800"
          >
            Delete
          </button>
        )}
      </div>
      <div className="self-center text-right">
        {((totalPrice * participant.weight) / totalWeight).toFixed(2)}
      </div>
      <div className="self-center">
        <button
          onClick={handlePayedToggle}
          type="button"
          className={`rounded-lg p-3 ${
            payed ? "bg-green-500" : "bg-red-500"
          } font-semibold text-white`}
        >
          {payed ? "Ok!" : "Not payed!"}
        </button>
      </div>
      <div className="flex items-center">
        <span className="mx-2">{weight}</span>
        {canEdit && (
          <>
            <button
              onClick={() => handleWeightChange(weight - 1)}
              type="button"
              className="me-2 rounded-full bg-gray-300 p-1 px-2 text-xs font-medium hover:bg-gray-500 focus:outline-none focus:ring-4 focus:ring-gray-300"
              disabled={weight <= 1}
            >
              -
            </button>
            <button
              onClick={() => handleWeightChange(weight + 1)}
              type="button"
              className="me-2 rounded-full bg-gray-300 p-1 px-2 text-xs font-medium hover:bg-gray-500 focus:outline-none focus:ring-4 focus:ring-gray-300"
            >
              +
            </button>
          </>
        )}
      </div>
    </div>
  );
}
