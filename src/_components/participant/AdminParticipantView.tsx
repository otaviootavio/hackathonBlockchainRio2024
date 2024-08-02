import PaymentStatusTag from "./PaymentTagStatus";
import RemoveButton from "./RemoveButton";
import WeightAdjuster from "./WeightAdjuster";

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
  };
  totalPrice: number;
  totalWeight: number;
}) => {
  const { weight, payed, userParticipantId, name } = participant;
  const amount = ((totalPrice * weight) / totalWeight).toFixed(2);

  return (
    <div className="flex flex-row justify-between rounded border border-slate-300 bg-slate-50 p-4">
      <div className="flex flex-col">
        <h2 className="text-2xl font-bold">{name}</h2>
        <PaymentStatusTag payed={payed} />
        {participant.role === "owner" && <>Owner!</>}
        <RemoveButton participantId={userParticipantId} />
      </div>
      <div className="self-center p-2 text-right">{amount}</div>
      <WeightAdjuster
        participantId={participant.userParticipantId}
        weight={weight}
        canUserEditThisParticipantWeight={true}
      />
    </div>
  );
};

export default AdminParticipantView;
