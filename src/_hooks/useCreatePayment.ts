import { useState } from "react";
import { api } from "~/utils/api";

export const useCreatePayment = () => {
  const mutation = api.xaman.createPaymentRequest.useMutation();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const createPayment = async (
    roomId: string,
    amount: string,
    destination: string,
    destinationTag?: string,
    memo?: string,
  ) => {
    setLoading(true);
    setError(null);
    try {
      const res = await mutation.mutateAsync({
        roomId,
        amount,
        destination,
        destinationTag,
        memo,
      });
      return res;
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return { createPayment, error, loading };
};
