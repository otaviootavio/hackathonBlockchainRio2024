import React, { useState } from "react";
import { useCreatePayment } from "../_hooks/useCreatePayment";
import Link from "next/link";

const CreatePayment: React.FC = () => {
  const { createPayment, error, loading, res } = useCreatePayment();
  const [amount, setAmount] = useState("");
  const [destination, setDestination] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createPayment(amount, destination);
  };

  return (
    <div className="rounded-lg border p-4 shadow-md">
      <h2 className="mb-4 text-xl font-bold">Create Payment</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Amount:</label>
          <input
            type="text"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Destination:</label>
          <input
            type="text"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-blue-600 px-4 py-2 text-white shadow-sm hover:bg-blue-700"
        >
          {loading ? "Loading..." : "Create Payment"}
        </button>
        {error && <p className="text-red-500">{error}</p>}
      </form>
      {res && (
        <div className="mt-4">
          <p>
            <strong>UUID:</strong> {res.uuid}
          </p>
          <p>
            <strong>Next:</strong> {res.next}
            <Link href={res.next} passHref>
              Pay wit XRP
            </Link>
          </p>
          <p>
            <strong>QR Code URL:</strong>
            <a href={res.qrCodeUrl} target="_blank" rel="noreferrer">
              {res.qrCodeUrl}
            </a>
          </p>
        </div>
      )}
    </div>
  );
};

export default CreatePayment;
