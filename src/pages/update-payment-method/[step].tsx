import React from "react";
import { useRouter } from "next/router";
import { api } from "~/utils/api";
import { useSession } from "next-auth/react";
import { useSignRequest } from "~/_hooks/useRequestForSign";
import Link from "next/link";

const StepOne = ({
  profile,
  onRequestChange,
}: {
  profile: { wallet: string | null };
  onRequestChange: (e: React.FormEvent) => void;
}) => (
  <div className="flex flex-col gap-4">
    <h2 className="text-xl font-bold">Current Wallet</h2>
    <input
      type="text"
      value={profile?.wallet ?? ""}
      disabled
      className="w-full cursor-not-allowed rounded border border-gray-300 bg-gray-200 px-3 py-2 text-gray-700 shadow-sm"
    />
    <button
      onClick={onRequestChange}
      className="mt-4 rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700"
    >
      Request Wallet Change
    </button>
  </div>
);

const StepTwo = ({
  signResponse,
}: {
  signResponse: { uuid: string; next: string; qrCodeUrl: string };
}) => (
  <div className="flex flex-col gap-4">
    <h2 className="text-xl font-bold">Sign the Request</h2>
    {signResponse ? (
      <Link
        target="_blank"
        href={signResponse.next}
        className="mt-4 rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700"
      >
        Sign Request
      </Link>
    ) : (
      <p>Preparing signing request...</p>
    )}
  </div>
);

const StepThree = ({
  wallet,
  onAccept,
}: {
  wallet: string;
  onAccept: () => void;
}) => (
  <div>
    <h2 className="mb-4 text-xl font-bold">Review Changes</h2>
    <p>Your wallet change request has been signed and processed.</p>
    <p className="mt-2 font-bold">New Wallet: {wallet}</p>
    <button
      onClick={onAccept}
      className="mt-4 rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700"
    >
      Accept
    </button>
  </div>
);

const UpdatePaymentMethod = () => {
  const router = useRouter();
  const session = useSession();
  const { createSignRequest } = useSignRequest();

  const { data: profile } = api.userProfile.getUserProfileByUserId.useQuery({
    userId: session.data?.user?.id ?? "",
  });

  const step = Number(router.query.step) || 1;

  const handleRequestChange = async (e: React.FormEvent) => {
    e.preventDefault();
    const returnUrl = `/update-payment-method/3`;
    const res = await createSignRequest(returnUrl, "wallet_change");
    await router.push(
      `/update-payment-method/2?signResponse=${encodeURIComponent(JSON.stringify(res))}`,
    );
  };

  const handleAccept = async () => {
    await router.push("/profile");
  };

  if (!profile) {
    return <div>Loading...</div>;
  }

  return (
    <div className="mx-auto w-full max-w-md">
      <ol className="mb-8 flex w-full items-center space-x-2 rounded-lg border border-gray-200 bg-white p-3 text-center text-sm font-medium text-gray-500 shadow-sm sm:space-x-4 sm:p-4 sm:text-base rtl:space-x-reverse">
        <li className={`flex items-center ${step >= 1 ? "text-blue-600" : ""}`}>
          <span
            className={`me-2 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${step >= 1 ? "border-blue-600" : "border-gray-500"} text-xs`}
          >
            1
          </span>
          Request Change
        </li>
        <li className={`flex items-center ${step >= 2 ? "text-blue-600" : ""}`}>
          <span
            className={`me-2 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${step >= 2 ? "border-blue-600" : "border-gray-500"} text-xs`}
          >
            2
          </span>
          Sign
        </li>
        <li className={`flex items-center ${step >= 3 ? "text-blue-600" : ""}`}>
          <span
            className={`me-2 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${step >= 3 ? "border-blue-600" : "border-gray-500"} text-xs`}
          >
            3
          </span>
          Review
        </li>
      </ol>

      {step === 1 && (
        <StepOne profile={profile} onRequestChange={handleRequestChange} />
      )}

      {step === 2 && (
        <StepTwo
          signResponse={
            router.query.signResponse
              ? JSON.parse(
                  decodeURIComponent(router.query.signResponse as string),
                )
              : ""
          }
        />
      )}

      {step === 3 && (
        <StepThree wallet={profile?.wallet ?? ""} onAccept={handleAccept} />
      )}
    </div>
  );
};

export default UpdatePaymentMethod;
