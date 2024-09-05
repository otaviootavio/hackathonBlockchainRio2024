import React, { useState } from "react";
import { PaymentInitiator } from "./PaymentInitiator";
import Link from "next/link";
import { useRoomContext } from "~/_context/room/RoomContext";

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
  const { roomData: room } = useRoomContext();
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);

  const handlePaymentInitiated = (
    newPaymentId: string,
    newPaymentUrl: string,
  ) => {
    setPaymentId(newPaymentId);
    setPaymentUrl(newPaymentUrl);
  };

  if (!room) return null;
  if (!room.isReadyForSettlement) return null;
  return (
    <div>
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
          {paymentUrl && (
            <Link
              href={paymentUrl}
              className="inline-block rounded bg-green-500 px-2 py-1 text-xs font-bold text-white hover:bg-green-700"
            >
              Pay with XUMM!
            </Link>
          )}
        </>
      )}
    </div>
  );
};
