import WeightAdjuster from "./WeightAdjuster";
import PaymentStatusTag from "./PaymentTagStatus";
import timeElapsedSince from "~/utils/dateFromNow";
import OwnerTag from "./OwnerTag";
import PaymentSection from "../payment/PaymentSection";

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
        <PaymentSection
          roomId={roomId}
          participantId={userParticipantId}
          room={room}
          payed={payed}
          amount={amount}
          ownerAddress={ownerAddress}
          role={role}
        />
      </div>
    </div>
  );
};

export default CurrentUserParticipantView;
