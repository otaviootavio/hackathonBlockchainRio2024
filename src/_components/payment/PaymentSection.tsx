import { api } from "~/utils/api";
import PayAmountToAddress from "../payment/PayAmountToAddress";
import { useSubscribeToEvent } from "~/_hooks";
import ParticipantTransactionViewer from "./ParticipantTransactionViewer";

interface PaymentSectionProps {
  participantId: string;
  roomId: string;
  room: {
    isReadyForSettlement: boolean;
  };
  payed: boolean;
  amount: string;
  ownerAddress: string;
  role: string;
}

const PaymentSection: React.FC<PaymentSectionProps> = ({
  participantId,
  roomId,
  room,
  payed,
  amount,
  ownerAddress,
  role,
}) => {
  const {
    data: webhookEvents,
    isLoading,
    error,
    refetch,
  } = api.xaman.getSuccessfulWebhookEventsByParticipantId.useQuery({
    participantId,
    roomId: roomId,
  });

  useSubscribeToEvent("participant-payed", () => {
    refetch().catch(console.error);
  });

  if (isLoading) return <p>Loading webhook events...</p>;
  if (error) return <p>Error loading webhook events: {error.message}</p>;

  const noPaymentsConfirmed = webhookEvents?.successfulWebhookEvents.find(
    (event) => event.dispachedToNode === true,
  )
    ? false
    : true;

  return (
    <>
      {room.isReadyForSettlement && noPaymentsConfirmed && !payed && (
        <PayAmountToAddress amount={amount} address={ownerAddress} />
      )}
      {payed && role != "owner" && (
        <ParticipantTransactionViewer
          participantId={participantId}
          roomId={roomId}
          role={role}
        />
      )}
    </>
  );
};

export default PaymentSection;
