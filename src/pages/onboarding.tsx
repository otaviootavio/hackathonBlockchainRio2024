import { useState } from "react";

export default function Onboarding() {
  const [payment, setPayment] = useState("");
  const [inputType, setInputType] = useState<string | null>(null);

  return (
    <div className="flex h-screen flex-col items-center bg-blue-200">
      <div className="min-w-96 gap-4">
        <div className=" rounded-lg border-2 bg-white p-4">
          <h2 className="text-2xl font-bold">Select Payment</h2>
          <form className="mx-auto max-w-sm">
            <label htmlFor="payment" className="block text-gray-700">
              Select an option
            </label>
            <select
              id="payments"
              className="mb-2 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
              onChange={(e) => setPayment(e.target.value)}
              defaultValue="Choose a payment method"
            >
              <option value="wallet">Wallet</option>
              <option value="pix">PIX</option>
            </select>
            {payment === "wallet" && (
              <div className="mt-1 block w-full">
                <button
                  type="button"
                  className="mb-5 me-2 rounded-lg bg-blue-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                >
                  Connect wallet!
                </button>
              </div>
            )}
            {payment === "pix" && (
              <>
                <div>
                  <label className="block text-gray-700">
                    Select Input Type:
                  </label>
                  <select
                    className="mb-2 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                    onChange={(e) => setInputType(e.target.value)}
                    value={inputType ?? ""}
                  >
                    <option value="">Select a Pix Key</option>
                    <option value="phone">Phone Number</option>
                    <option value="cpf">CPF</option>
                    <option value="email">Email</option>
                  </select>
                </div>
                {inputType === "phone" && (
                  <div>
                    <label className="block text-gray-700">Phone Number:</label>
                    <input
                      placeholder="11 9876 54321"
                      type="tel"
                      className="mb-2 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                    />
                  </div>
                )}

                {inputType === "cpf" && (
                  <div>
                    <label className="block text-gray-700">CPF:</label>
                    <input
                      placeholder="123.456.789-00"
                      type="text"
                      className="mb-2 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                    />
                  </div>
                )}
                {inputType === "email" && (
                  <div>
                    <label className="block text-gray-700">Email:</label>
                    <input
                      placeholder="example@example.com"
                      type="email"
                      className="mb-2 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                    />
                  </div>
                )}
              </>
            )}
            <button
              type="submit"
              className="mt-2 rounded-lg bg-blue-700 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
            >
              Add payment
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
