"use client";

import React from "react";
import { api } from "~/utils/api";
import { useRouter } from "next/router";
import Link from "next/link";
import { useRoomContext } from "~/_context/room/RoomContext";
import { useSubscribeToEvent } from "~/_hooks";

const getExplorerUrl = (networkId: string, transactionId: string) => {
  switch (networkId) {
    case "0": // Mainnet
      return `https://xrpscan.com/tx/${transactionId}`;
    case "1": // Testnet
      return `https://testnet.xrpl.org//tx/${transactionId}`;
    case "2": // Devnet
      return `https://devnet.xrpl.org/transactions/${transactionId}`;
    default:
      return null;
  }
};

export const CompletedPaymentExplorer = ({
  participantId,
}: {
  participantId: string;
}) => {
  const router = useRouter();
  const roomId = router.query.id as string;
  const { roomData: room } = useRoomContext();

  const {
    data: participant,
    isLoading,
    error,
    refetch,
  } = api.participant.getParticipantByParticipantId.useQuery({
    roomId,
    participantId,
  });
  // THIS IS A WORK ARROUND
  // The correct way should be 1. refactor the room context to include the payment status
  // 2. implement a new context to the participant
  useSubscribeToEvent("participant-payed", () => {
    refetch().catch(console.error);
  });

  if (isLoading) return <div>Loading payment information...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!room) return <div>Room not found.</div>;
  if (!room.isReadyForSettlement)
    return (
      <div className="text-xs text-slate-600">
        Pay after the room is ready for settlement.
      </div>
    );
  if (!participant || !participant.Payment || participant.Payment.length === 0)
    return <div className="text-xs text-slate-600">No payment found.</div>;

  const payment = participant.Payment[0];

  if (!payment?.networkId || !payment?.transactionId || !payment)
    return <div className="text-xs text-slate-600">No payment found.</div>;

  if (payment.status !== "COMPLETED")
    return <div>Payment not yet completed.</div>;

  const explorerUrl = getExplorerUrl(payment.networkId, payment.transactionId);

  if (!explorerUrl)
    return <div>Unable to generate explorer link for this transaction.</div>;

  return (
    <div>
      <p>
        <Link
          href={explorerUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-blue-500 underline hover:text-blue-700"
        >
          View transaction!
        </Link>
      </p>
    </div>
  );
};
