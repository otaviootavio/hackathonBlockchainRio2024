import React from "react";
import { api } from "~/utils/api";
import { useRouter } from "next/router";
import Link from "next/link";

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

  const {
    data: participant,
    isLoading,
    error,
  } = api.participant.getParticipantByParticipantId.useQuery({
    roomId,
    participantId,
  });

  if (isLoading) return <div>Loading payment information...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!participant || !participant.Payment || participant.Payment.length === 0)
    return <div>No completed payment found.</div>;

  const payment = participant.Payment[0];

  if (!payment?.networkId || !payment?.transactionId || !payment)
    return <div>No completed payment found.</div>;

  if (payment.status !== "COMPLETED")
    return <div>Payment not yet completed.</div>;

  const explorerUrl = getExplorerUrl(payment.networkId, payment.transactionId);

  if (!explorerUrl)
    return <div>Unable to generate explorer link for this transaction.</div>;

  return (
    <div className="mt-4">
      <p>
        <Link
          href={explorerUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 underline hover:text-blue-700"
        >
          See at Block Explorer
        </Link>
      </p>
    </div>
  );
};
