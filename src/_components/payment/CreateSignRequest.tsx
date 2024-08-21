import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useSignRequest } from "~/_hooks/useRequestForSign";

const CreateSignRequest = () => {
  const { createSignRequest } = useSignRequest();
  const router = useRouter();
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

    const returnUrl = router.pathname;
    const res = await createSignRequest(returnUrl, "memo");

    setRes(res);
  };

  return (
    <>
      {res ? (
        <div>
          <Link
            href={res.next}
            className="w-full rounded-md bg-green-600 p-2  text-center text-sm text-white shadow-sm hover:bg-green-700"
            passHref
          >
            Sign
          </Link>
        </div>
      ) : (
        <div>
          <button
            className="w-full rounded-md bg-blue-600 p-2  text-center text-sm text-white shadow-sm hover:bg-blue-700"
            onClick={handleSubmit}
          >
            New wallet
          </button>
        </div>
      )}
    </>
  );
};

export default CreateSignRequest;
