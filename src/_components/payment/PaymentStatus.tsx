import React, { useEffect, useState } from "react";
import Pusher from "pusher-js";
import { api } from "~/utils/api";

interface PaymentStatusProps {
  paymentId: string;
}

export const PaymentStatus: React.FC<PaymentStatusProps> = ({ paymentId }) => {
  const [status, setStatus] = useState<"PENDING" | "COMPLETED" | "FAILED">(
    "PENDING",
  );
  const { data, refetch } = api.xaman.getPaymentStatus.useQuery({
    paymentId,
  });

  useEffect(() => {
    if (data) {
      setStatus(data.status);
    }
  }, [data]);

  useEffect(() => {
    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    });

    const channel = pusher.subscribe(`payment-${paymentId}`);
    channel.bind(
      "payment-updated",
      async (data: { status: "PENDING" | "COMPLETED" | "FAILED" }) => {
        setStatus(data.status);
        await refetch();
      },
    );

    return () => {
      pusher.unsubscribe(`payment-${paymentId}`);
    };
  }, [paymentId, refetch]);

  return (
    <div className="mt-4">
      <h3 className="text-lg font-semibold">Payment Status</h3>
      <p
        className={`mt-2 ${status === "COMPLETED" ? "text-green-600" : status === "FAILED" ? "text-red-600" : "text-yellow-600"}`}
      >
        {status}
      </p>
      {status === "COMPLETED" && data?.transactionId && (
        <p className="mt-2">Transaction ID: {data.transactionId}</p>
      )}
    </div>
  );
};
