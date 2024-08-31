import React from "react";
import { api } from "~/utils/api";
import Link from "next/link";
import { useSubscribeToEvent } from "~/_hooks";

interface ParticipantTransactionViewerProps {
  participantId: string;
  roomId: string;
  role: string;
}

const ParticipantTransactionViewer: React.FC<
  ParticipantTransactionViewerProps
> = ({ participantId, roomId }) => {
  const {
    data: webhookEvents,
    isLoading: isLoadingWebhook,
    error: webhookError,
    refetch: refetchWebhook,
  } = api.xaman.getSuccessfulWebhookEventsByParticipantId.useQuery({
    participantId,
    roomId,
  });

  const successfulEvent = webhookEvents?.successfulWebhookEvents[0];

  const {
    data: paymentStatus,
    isLoading: isLoadingPayment,
    error: paymentError,
    refetch: refetchPayment,
  } = api.xaman.getPaymentStatus.useQuery(
    { uuid: successfulEvent?.payloadId ?? "" },
    { enabled: !!successfulEvent?.payloadId },
  );

  useSubscribeToEvent("participant-payed", () => {
    refetchWebhook()
      .then(() => {
        refetchPayment().catch(console.error);
      })
      .catch(console.error);
  });

  if (isLoadingWebhook || isLoadingPayment) return <p>Loading...</p>;
  if (webhookError)
    return <p className="text-red-500">{webhookError.message}</p>;
  if (paymentError)
    return <p className="text-red-500">{paymentError.message}</p>;

  if (!successfulEvent || !paymentStatus) {
    return <p>No data available.</p>;
  }

  const getExplorerUrl = () => {
    if (!paymentStatus.txid) return "";
    const networkName =
      paymentStatus.environment_networkid === 0
        ? "livenet"
        : paymentStatus.environment_networkid === 1
          ? "testnet"
          : "devnet";
    return `https://${networkName}.xrpl.org/transactions/${paymentStatus.txid}`;
  };

  const ViewPayload = () => {
    if (!paymentStatus.resolved_at) {
      return <p>Payment is still pending.</p>;
    }

    if (
      paymentStatus.resolved_at &&
      paymentStatus.dispatched_to_node === false
    ) {
      return <p>User rejected the payment.</p>;
    }

    if (
      paymentStatus.resolved_at &&
      paymentStatus.dispatched_to_node === true
    ) {
      return (
        <div>
          <p>Transaction completed</p>
          <div>
            <Link
              href={getExplorerUrl()}
              className="text-blue-500 hover:underline"
            >
              See at block explorer
            </Link>
          </div>
        </div>
      );
    }

    return null;
  };

  return <ViewPayload />;
};

export default ParticipantTransactionViewer;
