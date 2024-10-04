"use client";

import React from "react";
import { useRouter } from "next/router";
import { api } from "~/utils/api";
import { useSession } from "next-auth/react";
import { useSignRequest } from "~/_hooks/useRequestForSign";
import Link from "next/link";
import { z } from "zod";
import { type ParsedUrlQuery } from "querystring";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { Step, Steps } from "~/components/ui/step";

const toUrlQuerySchema = z.object({
  toUrl: z
    .string()
    .refine(
      (value) =>
        /^(https?):\/\/(?=.*\.[a-z]{2,})[^\s$.?#].[^\s]*$/i.test(value),
      {
        message: "Please enter a valid URL",
      },
    ),
});

const StepOne = ({
  profile,
  onRequestChange,
}: {
  profile: { wallet: string | null };
  onRequestChange: (e: React.FormEvent) => void;
}) => (
  <Card>
    <CardHeader>
      <CardTitle>Current Wallet</CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
      <Input
        type="text"
        value={profile?.wallet ?? "No wallet yet :("}
        disabled
        className="cursor-not-allowed"
      />
      <Button onClick={onRequestChange}>Request Wallet Change</Button>
    </CardContent>
  </Card>
);

const StepTwo = ({ toUrl }: { toUrl: string | null }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Sign the Request</CardTitle>
      </CardHeader>
      <CardContent>
        {toUrl ? (
          <Button asChild>
            <Link href={toUrl}>Sign Request</Link>
          </Button>
        ) : (
          <p>Preparing signing request...</p>
        )}
      </CardContent>
    </Card>
  );
};

const StepThree = ({
  wallet,
  onAccept,
}: {
  wallet: string;
  onAccept: () => void;
}) => (
  <Card>
    <CardHeader>
      <CardTitle>Review Changes</CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
      <p>Your wallet change request has been signed and processed.</p>
      <p className="font-bold">New Wallet: {wallet}</p>
      <Button onClick={onAccept}>Accept</Button>
    </CardContent>
  </Card>
);

export default function UpdatePaymentMethod() {
  const router = useRouter();
  const session = useSession();
  const { createSignRequest } = useSignRequest();

  const { data: profile } = api.userProfile.getUserProfileByUserId.useQuery({
    userId: session.data?.user?.id ?? "",
  });

  const step = Number(router.query?.step) || 1;

  const handleRequestChange = async (e: React.FormEvent) => {
    e.preventDefault();
    const returnUrl = `/update-payment-method/3`;
    const res = await createSignRequest(returnUrl, "wallet_change");
    await router.push(
      `/update-payment-method/2?toUrl=${encodeURIComponent(res?.next ?? "")}`,
    );
  };

  const handleAccept = async () => {
    await router.push("/profile");
  };

  const parseSignResponse = (query: ParsedUrlQuery): { toUrl: string } => {
    try {
      return toUrlQuerySchema.parse({
        toUrl: decodeURIComponent(query.toUrl as string),
      });
    } catch (error) {
      console.error("Failed to parse signResponse:", error);
      throw error;
    }
  };

  if (!profile) {
    return <div>Loading...</div>;
  }

  return (
    <div className="mx-auto w-full max-w-md space-y-8">
      <Steps value={step} className="mb-8">
        <Step value={1}>Request Change</Step>
        <Step value={2}>Sign</Step>
        <Step value={3}>Review</Step>
      </Steps>

      {step === 1 && (
        <StepOne profile={profile} onRequestChange={handleRequestChange} />
      )}

      {step === 2 && <StepTwo toUrl={parseSignResponse(router.query)?.toUrl} />}

      {step === 3 && (
        <StepThree wallet={profile?.wallet ?? ""} onAccept={handleAccept} />
      )}
    </div>
  );
}
