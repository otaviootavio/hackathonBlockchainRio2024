import Link from "next/link";
import React, { useState } from "react";

import { api } from "~/utils/api";

const GetPaymentStatus: React.FC = () => {
  const [uuid, setUuid] = useState<string | null>(null);
  const queryResult = api.wallet.getPaymentStatus.useQuery({
    uuid: uuid || "",
  });
  const { data, error } = queryResult;
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const uuidInput = form.elements.namedItem("uuid") as HTMLInputElement;
    setUuid(uuidInput.value);
    setLoading(true);
    queryResult.refetch();
    setLoading(false);
  };

  const ViewPayload = () => {
    if (!data?.resolved_at) {
      return <p>Payment is still pending.</p>;
    }

    if (data?.resolved_at && data.dispatched_to_node === false) {
      return <p>User rejected the payment.</p>;
    }

    if (data?.resolved_at && data.dispatched_to_node === true) {
      return (
        <>
          <p>Transaction completed</p>
          <div>
            <Link
              href={`https://${data.environment_networkid == "0" ? "livenet" : data.environment_networkid == "1" ? "testnet" : "devnet"}.xrpl.org/transactions/${data.txid}`}
              passHref
              className="text-blue-500 hover:underline"
            >
              See at blockexplorer
            </Link>{" "}
          </div>
        </>
      );
    }
  };
  return (
    <div className="rounded-lg border p-4 shadow-md">
      <h2 className="mb-4 text-xl font-bold">Get Payment Status</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">UUID:</label>
          <input
            name="uuid"
            type="text"
            className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-blue-600 px-4 py-2 text-white shadow-sm hover:bg-blue-700"
        >
          {loading ? "Loading..." : "Get Status"}
        </button>
        {error && <p className="text-red-500">{error.message}</p>}
        {data && <ViewPayload />}
      </form>
    </div>
  );
};

export default GetPaymentStatus;
