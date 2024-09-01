import WeightAdjuster from "./WeightAdjuster";
import PaymentStatusTag from "./PaymentTagStatus";
import timeElapsedSince from "~/utils/dateFromNow";
import OwnerTag from "./OwnerTag";
import { PaymentFlow } from "../payment/PaymentFlow";
import { CompletedPaymentExplorer } from "../payment/CompletedPaymentExplorer";

const CurrentUserParticipantView = ({
  participant,
  room,
  totalPrice,
  ownerAddress,
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
  const { weight, payed, name, userParticipantId, role, createdAt } =
    participant;
  const amount = ((totalPrice * weight) / totalWeight).toFixed(2);

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
          {!participant.payed && (
            <PaymentFlow
              roomId={participant.roomId}
              participantId={userParticipantId}
              amount={amount}
              destination={ownerAddress}
            />
          )}
        </div>

        <WeightAdjuster
          participantId={userParticipantId}
          weight={weight}
          canUserEditThisParticipantWeight={
            !room.isReadyForSettlement && !room.hasSettled
          }
        />
      </div>
      <div>
        {role !== "owner" && (
          <CompletedPaymentExplorer participantId={userParticipantId} />
        )}
      </div>
    </div>
  );
};

export default CurrentUserParticipantView;
