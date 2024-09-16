import timeElapsedSince from "~/utils/dateFromNow";
import PaymentStatusTag from "./PaymentTagStatus";
import OwnerTag from "./OwnerTag";
import { LiaPizzaSliceSolid } from "react-icons/lia";
import { CompletedPaymentExplorer } from "../payment/CompletedPaymentExplorer";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
  CardDescription,
} from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";

const ParticipantViewsOthers = ({
  participant,
  totalPrice,
  totalWeight,
}: {
  participant: {
    userParticipantId: string;
    weight: number;
    payed: boolean;
    name: string;
    createdAt: Date;
    role: string;
    roomId: string;
  };
  totalPrice: number;
  totalWeight: number;
}) => {
  const { weight, payed, name, createdAt, role } = participant;
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
          </div>
          <Badge variant="outline" className="flex items-center space-x-1">
            <span>{weight}</span>
            <LiaPizzaSliceSolid />
          </Badge>
        </div>
      </CardContent>
      <CardFooter>
        {role !== "owner" && (
          <CompletedPaymentExplorer
            participantId={participant.userParticipantId}
          />
        )}
      </CardFooter>
    </Card>
  );
};

export default ParticipantViewsOthers;
