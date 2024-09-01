import React, { useState } from "react";
import { api } from "~/utils/api";

interface PaymentInitiatorProps {
  roomId: string;
  participantId: string;
  amount: string;
  destination: string;
  onPaymentInitiated: (paymentId: string, payloadUrl: string) => void;
}

export const PaymentInitiator: React.FC<PaymentInitiatorProps> = ({
  roomId,
  participantId,
  amount,
  destination,
  onPaymentInitiated,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const createPaymentMutation = api.xaman.createPaymentRequest.useMutation();

  const handleInitiatePayment = async () => {
    setIsLoading(true);
    try {
      const amountInDrops = (Number(amount) * 1_000_000).toString();

      const result = await createPaymentMutation.mutateAsync({
        roomId,
        participantId,
        amount: amountInDrops,
        destination,
      });
      onPaymentInitiated(result.paymentId, result.next);
    } catch (error) {
      console.error("Failed to initiate payment:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleInitiatePayment}
      disabled={isLoading}
      className="rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700"
    >
      {isLoading ? "Initiating..." : "Initiate Payment"}
    </button>
  );
};
