import WeightAdjuster from "./WeightAdjuster";
import PaymentStatusTag from "./PaymentTagStatus";
import timeElapsedSince from "~/utils/dateFromNow";
import OwnerTag from "./OwnerTag";
import { PaymentFlow } from "../payment/PaymentFlow";
import { CompletedPaymentExplorer } from "../payment/CompletedPaymentExplorer";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
  CardDescription,
} from "~/components/ui/card";

const UserViewsHimself = ({
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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{name} (You)</span>
          <span>{amount} XRP</span>
        </CardTitle>
        <CardDescription>Joined {timeElapsedSince(createdAt)}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
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
      </CardContent>
      <CardFooter className="flex flex-col items-start space-y-2">
        {!payed && (
          <PaymentFlow
            roomId={participant.roomId}
            participantId={userParticipantId}
            amount={amount}
            destination={ownerAddress}
          />
        )}
        {role !== "owner" && payed && (
          <CompletedPaymentExplorer participantId={userParticipantId} />
        )}
      </CardFooter>
    </Card>
  );
};

export default UserViewsHimself;
