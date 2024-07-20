import { useSession } from "next-auth/react";
import { api } from "~/utils/api";
import { LiaPizzaSliceSolid } from "react-icons/lia";
import { MdOutlinePlaylistRemove } from "react-icons/md";
import { TbCashBanknoteOff, TbCashBanknote } from "react-icons/tb";
import PayAmountToAddress from "./PayAmountToAddress";
import PaymentStatusResult from "./PaymentStatusResult";
import { useSubscribeToEvent } from "~/_hooks";

const PaymentStatusTag = ({ payed }: { payed: boolean }) => (
  <div
    className={`inline-flex w-28 items-center justify-start whitespace-nowrap text-sm font-bold ${payed ? "text-green-500" : "text-red-500"}`}
  >
    {payed ? (
      <>
        <TbCashBanknote className="mr-1" />
        Payed
      </>
    ) : (
      <>
        <TbCashBanknoteOff className="mr-1" />
        Not Payed
      </>
    )}
  </div>
);

const RemoveButton = ({
  removeParticipant,
  participantId,
}: {
  removeParticipant: (participantId: string) => void;
  participantId: string;
}) => (
  <button
    onClick={() => removeParticipant(participantId)}
    type="button"
    className="inline-flex w-28 items-center justify-center rounded bg-red-500 p-1 px-2 text-xs font-medium text-white hover:bg-red-800 focus:outline-none focus:ring-1 focus:ring-red-300 dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-800"
  >
    <MdOutlinePlaylistRemove className="mr-1" />
    Remove
  </button>
);

const ParticipantActions = ({
  canRemoveThisParticipant,
  removeParticipant,
  participantId,
  ownerAddress,
  isThisParticipantUser,
  amount,
  noPaymentsConfirmed,
  isReadyForSettlement,
  payed,
}: {
  canRemoveThisParticipant: boolean;
  removeParticipant: (participantId: string) => void;
  participantId: string;
  ownerAddress: string;
  isThisParticipantUser: boolean;
  amount: string;
  noPaymentsConfirmed: boolean;
  isReadyForSettlement: boolean;
  payed: boolean;
}) => (
  <div className="flex flex-col justify-start space-y-2 md:flex-row md:space-x-2 md:space-y-0">
    {canRemoveThisParticipant && (
      <RemoveButton
        removeParticipant={removeParticipant}
        participantId={participantId}
      />
    )}
    {isThisParticipantUser &&
      isReadyForSettlement &&
      noPaymentsConfirmed &&
      !payed && <PayAmountToAddress amount={amount} address={ownerAddress} />}
  </div>
);

const WeightAdjuster = ({
  weight,
  handleWeightChange,
  canUserEditThisParticipantWeight,
}: {
  weight: number;
  handleWeightChange: (newWeight: number) => void;
  canUserEditThisParticipantWeight: boolean;
}) => (
  <div className="flex w-24  items-center justify-end">
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
);

export function ParticipantItem({
  ownerAddress,
  participant,
  removeParticipant,
  isUserOwner,
  room,
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
  ownerAddress: string;
  room: {
    isReadyForSettlement: boolean;
    hasSettled: boolean;
  };
  participantsRefetch: () => void;
  totalWeight: number;
  totalPrice: number;
  isUserOwner: boolean;
  removeParticipant: (participantId: string) => void;
}) {
  const session = useSession();
  const updateParticipant = api.participant.updateParticipant.useMutation();
  const { weight, payed, userId, userParticipantId, name } = participant;
  const isThisParticipantUser = userId === session.data?.user?.id;
  const canUserEditThisParticipantWeight =
    !room.isReadyForSettlement &&
    !room.hasSettled &&
    (isThisParticipantUser || isUserOwner);
  const canRemoveThisParticipant = isUserOwner && !isThisParticipantUser;
  const isParticipantOwner = participant.role === "owner";
  const amount = ((totalPrice * weight) / totalWeight).toFixed(2);

  const handleWeightChange = async (newWeight: number) => {
    if (newWeight > 0) {
      await updateParticipant.mutateAsync({
        id: userParticipantId,
        weight: newWeight,
      });
      participantsRefetch();
    }
  };

  // Fetch successful webhook events for the user
  const {
    data: webhookEvents,
    isLoading,
    error,
    refetch,
  } = api.xaman.getSuccessfulWebhookEvents.useQuery({
    userId: userId,
    roomId: participant.roomId ?? "",
  });

  useSubscribeToEvent("participant-payed", () => {
    refetch().catch(console.error);
  });

  // Determine if there are no payments confirmed yet
  const noPaymentsConfirmed =
    webhookEvents?.successfulWebhookEvents.length === 0;

  return (
    <div className="flex flex-row justify-between rounded border border-slate-300 bg-slate-50 p-4">
      <div className="flex flex-col">
        <div className="flex flex-row justify-between">
          <h2 className="text-2xl font-bold">{name}</h2>
        </div>
        <PaymentStatusTag payed={payed} />
        {isParticipantOwner && <>Owner!</>}
        <ParticipantActions
          canRemoveThisParticipant={canRemoveThisParticipant}
          removeParticipant={removeParticipant}
          participantId={userParticipantId}
          ownerAddress={ownerAddress}
          amount={amount}
          isThisParticipantUser={isThisParticipantUser}
          noPaymentsConfirmed={noPaymentsConfirmed}
          payed={payed}
          isReadyForSettlement={room.isReadyForSettlement}
        />
        {isLoading && <p>Loading webhook events...</p>}
        {error && <p>Error loading webhook events: {error.message}</p>}
        {webhookEvents && (
          <div>
            <ul>
              {webhookEvents.successfulWebhookEvents.map((event) => (
                <li key={event.id}>
                  {event.payloadId && (
                    <PaymentStatusResult uuid={event.payloadId} />
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      <div className="self-center p-2 text-right">{amount}</div>
      <WeightAdjuster
        weight={weight}
        handleWeightChange={handleWeightChange}
        canUserEditThisParticipantWeight={canUserEditThisParticipantWeight}
      />
    </div>
  );
}
