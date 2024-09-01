import React, { useState } from "react";
import { PaymentInitiator } from "./PaymentInitiator";
import { PaymentStatus } from "./PaymentStatus";
import Link from "next/link";

interface PaymentFlowProps {
  roomId: string;
  participantId: string;
  amount: string;
  destination: string;
}

export const PaymentFlow: React.FC<PaymentFlowProps> = ({
  roomId,
  participantId,
  amount,
  destination,
}) => {
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);

  const handlePaymentInitiated = (
    newPaymentId: string,
    newPaymentUrl: string,
  ) => {
    setPaymentId(newPaymentId);
    setPaymentUrl(newPaymentUrl);
  };

  return (
    <div className="space-y-4">
      {!paymentId && (
        <PaymentInitiator
          roomId={roomId}
          participantId={participantId}
          amount={amount}
          destination={destination}
          onPaymentInitiated={handlePaymentInitiated}
        />
      )}
      {paymentId && (
        <>
          <PaymentStatus paymentId={paymentId} />
          {paymentUrl && (
            <Link
              href={paymentUrl}
              className="mt-4 inline-block rounded bg-green-500 px-4 py-2 font-bold text-white hover:bg-green-700"
            >
              Complete Payment in Xumm
            </Link>
          )}
        </>
      )}
    </div>
  );
};
