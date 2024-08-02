import { api } from "~/utils/api";
import PayAmountToAddress from "../PayAmountToAddress";
import PaymentStatusResult from "../PaymentStatusResult";

import WeightAdjuster from "./WeightAdjuster";
import { useSubscribeToEvent } from "~/_hooks";
import PaymentStatusTag from "./PaymentTagStatus";

const CurrentUserParticipantView = ({
  participant,
  ownerAddress,
  room,
  totalPrice,
  totalWeight,
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
  totalWeight: number;
  totalPrice: number;
}) => {
  const { weight, payed, name } = participant;
  const amount = ((totalPrice * weight) / totalWeight).toFixed(2);

  const {
    data: webhookEvents,
    isLoading,
    error,
    refetch,
  } = api.xaman.getSuccessfulWebhookEvents.useQuery({
    userId: participant.userId,
    roomId: participant.roomId ?? "",
  });

  useSubscribeToEvent("participant-payed", () => {
    refetch().catch(console.error);
  });

  const noPaymentsConfirmed =
    webhookEvents?.successfulWebhookEvents.length === 0;

  return (
    <div className="flex flex-row justify-between rounded border border-slate-500 bg-slate-50 p-4">
      <div className="flex flex-col">
        <div className="text-xs text-slate-600">
          This is you{participant.role == "owner" && " and you are the owner"}!
        </div>
        <h2 className="text-2xl font-bold">{name}</h2>
        <PaymentStatusTag payed={payed} />
        {room.isReadyForSettlement && noPaymentsConfirmed && !payed && (
          <PayAmountToAddress amount={amount} address={ownerAddress} />
        )}
        {isLoading && <p>Loading webhook events...</p>}
        {error && <p>Error loading webhook events: {error.message}</p>}
        {webhookEvents && (
          <ul>
            {webhookEvents.successfulWebhookEvents.map((event) => (
              <li key={event.id}>
                {event.payloadId && (
                  <PaymentStatusResult uuid={event.payloadId} />
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="self-center p-2 text-right">{amount}</div>
      <WeightAdjuster
        participantId={participant.userParticipantId}
        weight={weight}
        canUserEditThisParticipantWeight={
          !room.isReadyForSettlement && !room.hasSettled
        }
      />
    </div>
  );
};

export default CurrentUserParticipantView;
