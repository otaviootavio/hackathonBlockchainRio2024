import React, { useState } from "react";
import { useCreatePayment } from "../_hooks/useCreatePayment";
import Link from "next/link";
import { api } from "~/utils/api";
import { useSession } from "next-auth/react";

const PayAmountToAddress = ({
  amount,
  address,
}: {
  amount: string;
  address: string;
}) => {
  const { createPayment, error, loading } = useCreatePayment();
  const createWebhookEvent = api.xaman.createWebhookEvent.useMutation();
  const session = useSession();
  const [res, setRes] = useState<
    | {
        uuid: string;
        next: string;
        qrCodeUrl: string;
      }
    | undefined
  >();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // ammount in xrp
    const amountXrp = 100000 * parseInt(amount);

    const res = await createPayment(amountXrp.toString(), address);
    await createWebhookEvent.mutateAsync({
      payloadId: res?.uuid ?? "",
      referenceId: res?.uuid ?? "",
      userId: session.data?.user?.id ?? "",
    });
    setRes(res);
  };

  return (
    <>
      {res ? (
        <Link
          href={res.next}
          className="w-full rounded-md bg-blue-600 p-1 text-center text-xs text-white shadow-sm hover:bg-blue-700"
          passHref
        >
          Pay!
        </Link>
      ) : (
        <>
          <button
            className="w-full rounded-md bg-blue-600 p-1  text-center text-xs text-white shadow-sm hover:bg-blue-700"
            onClick={handleSubmit}
          >
            Generate invoice
          </button>
        </>
      )}
    </>
  );
};

export default PayAmountToAddress;
