import { useState } from "react";
import { api } from "~/utils/api";

export const useSignRequest = () => {
  const mutation = api.xaman.createSignRequest.useMutation();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const createSignRequest = async (returnUrl: string, memo: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await mutation.mutateAsync({
        returnUrl,
        memo,
      });
      return res;
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return { createSignRequest, error, loading };
};
