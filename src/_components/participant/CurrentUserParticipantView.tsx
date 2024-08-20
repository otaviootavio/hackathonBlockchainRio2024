import { api } from "~/utils/api";
import WeightAdjuster from "./WeightAdjuster";
import { useSubscribeToEvent } from "~/_hooks";
import PaymentStatusTag from "./PaymentTagStatus";
import timeElapsedSince from "~/utils/dateFromNow";
import OwnerTag from "./OwnerTag";
import PayAmountToAddress from "../payment/PayAmountToAddress";
import PaymentStatusResult from "../payment/PaymentStatusResult";

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
    createdAt: Date;
  };
  ownerAddress: string;
  room: {
    isReadyForSettlement: boolean;
    hasSettled: boolean;
  };
  totalWeight: number;
  totalPrice: number;
}) => {
  const {
    weight,
    payed,
    name,
    userParticipantId,
    userId,
    roomId,
    role,
    createdAt,
  } = participant;
  const amount = ((totalPrice * weight) / totalWeight).toFixed(2);

  const {
    data: webhookEvents,
    isLoading,
    error,
    refetch,
  } = api.xaman.getSuccessfulWebhookEvents.useQuery({
    userId,
    roomId: roomId ?? "",
  });

  useSubscribeToEvent("participant-payed", () => {
    refetch().catch(console.error);
  });

  const noPaymentsConfirmed =
    webhookEvents?.successfulWebhookEvents.length === 0;

  return (
    <div className="flex flex-col justify-between rounded border border-slate-500 bg-slate-50 p-4">
      <div className="flex flex-row">
        <div className="flex grow flex-row justify-between">
          <p className="text-xs text-slate-600">
            Joined {timeElapsedSince(createdAt)}
          </p>
        </div>
      </div>

      <div className="flex grow flex-row justify-between">
        <h2 className="text-2xl font-bold">{name}</h2>
        <div className="self-center p-2 text-right">{amount}</div>
      </div>

      <div className="flex grow flex-row justify-between">
        <div className="flex flex-row items-center justify-start gap-3">
          <PaymentStatusTag payed={payed} />
          {role === "owner" && <OwnerTag />}
        </div>

        <WeightAdjuster
          participantId={userParticipantId}
          weight={weight}
          canUserEditThisParticipantWeight={
            !room.isReadyForSettlement && !room.hasSettled
          }
        />
      </div>
      <div className="flex flex-col justify-start space-y-2 md:flex-row md:space-x-2 md:space-y-0">
        {renderPaymentSection()}
      </div>
    </div>
  );

  function renderPaymentSection() {
    if (isLoading) return <p>Loading webhook events...</p>;
    if (error) return <p>Error loading webhook events: {error.message}</p>;

    return (
      <>
        {room.isReadyForSettlement && noPaymentsConfirmed && !payed && (
          <PayAmountToAddress amount={amount} address={ownerAddress} />
        )}
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
      </>
    );
  }
};

export default CurrentUserParticipantView;
