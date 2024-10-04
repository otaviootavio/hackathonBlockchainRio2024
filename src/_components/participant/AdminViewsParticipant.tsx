import { CompletedPaymentExplorer } from "../payment/CompletedPaymentExplorer";
import OwnerTag from "./OwnerTag";
import PaymentStatusTag from "./PaymentTagStatus";
import RemoveButton from "./RemoveButton";
import WeightAdjuster from "./WeightAdjuster";
import timeElapsedSince from "~/utils/dateFromNow";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
  CardDescription,
} from "~/components/ui/card";

const AdminViewsParticipant = ({
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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{name}</span>
          <span>{amount} XRP</span>
        </CardTitle>
        <CardDescription>Joined {timeElapsedSince(createdAt)}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
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
      </CardContent>
      <CardFooter>
        <CompletedPaymentExplorer participantId={userParticipantId} />
      </CardFooter>
    </Card>
  );
};

export default AdminViewsParticipant;
