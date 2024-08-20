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
        <Link
          href={res.next}
          className="w-full rounded-md bg-blue-600 p-1 text-center text-xs text-white shadow-sm hover:bg-blue-700"
          passHref
        >
          Sign
        </Link>
      ) : (
        <>
          <button
            className="w-full rounded-md bg-blue-600 p-1  text-center text-xs text-white shadow-sm hover:bg-blue-700"
            onClick={handleSubmit}
          >
            Generate Sign Request
          </button>
        </>
      )}
    </>
  );
};

export default CreateSignRequest;
