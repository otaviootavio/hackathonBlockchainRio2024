import { CompletedPaymentExplorer } from "../payment/CompletedPaymentExplorer";
import OwnerTag from "./OwnerTag";
import PaymentStatusTag from "./PaymentTagStatus";
import RemoveButton from "./RemoveButton";
import WeightAdjuster from "./WeightAdjuster";
import timeElapsedSince from "~/utils/dateFromNow";

const AdminParticipantView = ({
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
  const { weight, payed, userParticipantId, name, role, createdAt } =
    participant;
  const amount = ((totalPrice * weight) / totalWeight).toFixed(2);

  return (
    <div className="flex flex-col justify-start rounded border border-slate-300 bg-slate-50 p-4">
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
          <RemoveButton participantId={userParticipantId} />
        </div>

        <WeightAdjuster
          participantId={userParticipantId}
          weight={weight}
          canUserEditThisParticipantWeight={true}
        />
      </div>
      <div>
        <CompletedPaymentExplorer participantId={userParticipantId} />
      </div>
    </div>
  );
};

export default AdminParticipantView;
