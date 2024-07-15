import { useSession } from "next-auth/react";
import { api } from "~/utils/api";
import { LiaPizzaSliceSolid } from "react-icons/lia";
import { MdOutlinePlaylistRemove } from "react-icons/md";
import { TbCashBanknoteOff } from "react-icons/tb";
import { TbCashBanknote } from "react-icons/tb";

export function ParticipantItem({
  participant,
  removeParticipant,
  isUserOwner,
  totalPrice,
  totalWeight,
  participantsRefetch,
}: {
  participant: {
    userParticipantId: string;
    payed: boolean;
    role: string;
    roomId: string;
    userId: string;
    weight: number;
    name: string;
  };
  participantsRefetch: () => void;
  totalWeight: number;
  totalPrice: number;
  isUserOwner: boolean;
  removeParticipant: (participantId: string) => void;
}) {
  const session = useSession();
  const updateParticipant = api.participant.updateParticipant.useMutation();
  const weight = participant.weight;
  const payed = participant.payed;
  const isThisParticipantUser = participant.userId === session.data?.user?.id;
  const canUserEditThisParticipantWeight = isUserOwner || isThisParticipantUser;
  const canRemoveThisParticipant = isUserOwner && !isThisParticipantUser;
  const canUserSetPayed = isUserOwner || isThisParticipantUser;

  const handlePayedToggle = async () => {
    await updateParticipant.mutateAsync({
      id: participant.userParticipantId,
      payed: !payed,
    });
    participantsRefetch();
  };

  const handleWeightChange = async (newWeight: number) => {
    if (newWeight > 0) {
      await updateParticipant.mutateAsync({
        id: participant.userParticipantId,
        weight: newWeight,
      });
      participantsRefetch();
    }
  };

  return (
    <div className="flex flex-row  justify-between rounded border border-gray-300 bg-white p-4">
      <div className="self-center">
        <h2 className=" text-2xl font-bold">{participant.name}</h2>
        {canUserSetPayed ? (
          <button
            onClick={handlePayedToggle}
            type="button"
            className={`me-2 inline-flex items-center rounded p-1 px-2 text-xs font-medium text-white shadow focus:outline-none focus:ring-1 ${
              payed
                ? "bg-green-500 hover:bg-green-800 focus:ring-green-300 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800"
                : "bg-red-500 hover:bg-red-800 focus:ring-red-300 dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-800"
            }`}
          >
            {payed ? (
              <>
                <TbCashBanknote />
                Payed
              </>
            ) : (
              <>
                <TbCashBanknoteOff />
                Not Payed
              </>
            )}
          </button>
        ) : (
          <span className="me-2 inline-flex items-center text-sm font-bold text-red-500">
            {payed ? (
              <>
                <TbCashBanknote />
                Payed
              </>
            ) : (
              <>
                <TbCashBanknoteOff />
                Not Payed
              </>
            )}
          </span>
        )}
        {canRemoveThisParticipant && (
          <button
            onClick={() => removeParticipant(participant.userParticipantId)}
            type="button"
            className="me-2 inline-flex items-center rounded bg-red-500 p-1 px-2 text-xs font-medium text-white hover:bg-red-800 focus:outline-none focus:ring-1 focus:ring-red-300 dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-800"
          >
            <MdOutlinePlaylistRemove />
            Remove
          </button>
        )}
      </div>
      <div>
        <div className="self-center p-2 text-right">
          {((totalPrice * participant.weight) / totalWeight).toFixed(2)}
        </div>
        <div className="flex items-center justify-end">
          {canUserEditThisParticipantWeight && (
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
          {weight} <LiaPizzaSliceSolid />
        </div>
      </div>
    </div>
  );
}
