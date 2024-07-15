import { useState } from "react";
import { api } from "~/utils/api";

export const useCreatePayment = () => {
  const mutation = api.wallet.createPaymentRequest.useMutation();
  const [error, setError] = useState<string | null>(null);
  const [res, setRes] = useState<typeof mutation.data>();
  const [loading, setLoading] = useState(false);

  const createPayment = async (
    amount: string,
    destination: string,
    destinationTag?: string,
    memo?: string,
  ) => {
    setLoading(true);
    setError(null);
    try {
      const res = await mutation.mutateAsync({
        amount,
        destination,
        destinationTag,
        memo,
      });
      setRes(res);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return { createPayment, error, loading, res };
};
