import Link from "next/link";
import React from "react";
import { useSubscribeToEvent } from "~/_hooks";
import { api } from "~/utils/api";

interface PaymentStatusResultProps {
  uuid: string;
}

const PaymentStatusResult: React.FC<PaymentStatusResultProps> = ({ uuid }) => {
  const { data, error, isLoading, refetch } =
    api.xaman.getPaymentStatus.useQuery({
      uuid,
    });

  // TODO
  // Even tho it is working, looks like it breaks the pattern
  // All other event subscriptions are on [id].tsx
  // We should think about how to refactor this

  useSubscribeToEvent("participant-payed", () => {
    refetch().catch(console.error);
  });

  if (isLoading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p className="text-red-500">{error.message}</p>;
  }

  if (!data) {
    return <p>No data available.</p>;
  }

  const ViewPayload = () => {
    if (!data.resolved_at) {
      return <p>Payment is still pending.</p>;
    }

    if (data.resolved_at && data.dispatched_to_node === false) {
      return <p>User rejected the payment.</p>;
    }

    if (data.resolved_at && data.dispatched_to_node === true) {
      return (
        <>
          <p>Transaction completed</p>
          <div>
            <Link
              href={`https://${data.environment_networkid == 0 ? "livenet" : data.environment_networkid == 1 ? "testnet" : "devnet"}.xrpl.org/transactions/${data.txid}`}
              passHref
              className="text-blue-500 hover:underline"
            >
              See at block explorer
            </Link>
          </div>
        </>
      );
    }

    return null;
  };

  return (
    <div>
      <ViewPayload />
    </div>
  );
};

export default PaymentStatusResult;
