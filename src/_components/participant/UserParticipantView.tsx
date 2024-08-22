import timeElapsedSince from "~/utils/dateFromNow";
import PaymentStatusTag from "./PaymentTagStatus";
import OwnerTag from "./OwnerTag";

const UserParticipantView = ({
  participant,
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
  totalPrice: number;
  totalWeight: number;
}) => {
  const { weight, payed, name, createdAt } = participant;
  const amount = ((totalPrice * weight) / totalWeight).toFixed(2);

  return (
    <div className=" flex flex-col justify-between rounded border border-slate-300 bg-slate-50 p-4">
      <div className="flex flex-row">
        <div className="flex grow flex-row  justify-between">
          <p className="text-xs text-slate-600">
            Joined {timeElapsedSince(createdAt)}
          </p>
        </div>
      </div>

      <div className="flex grow  flex-row justify-between">
        <h2 className="text-2xl font-bold">{name}</h2>
        <div className="self-center p-2 text-right">{amount}</div>
      </div>

      <div className="flex grow flex-row justify-between">
        <div className="flex flex-row content-center items-center justify-start gap-3">
          <PaymentStatusTag payed={payed} />
          {participant.role === "owner" && <OwnerTag />}
        </div>
      </div>
    </div>
  );
};

export default UserParticipantView;
