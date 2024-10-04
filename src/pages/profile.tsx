"use client";

import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { api } from "~/utils/api";
import { getSession, type GetSessionParams, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { toast } from "~/hooks/use-toast";
import { Button } from "~/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "~/components/ui/card";
import { Skeleton } from "~/components/ui/skeleton";
import { Label } from "~/components/ui/label";
import { Input } from "~/components/ui/input";
import Link from "next/link";

const formSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }).nullable(),
  wallet: z.string().nullable(),
});

export async function getServerSideProps(
  context: GetSessionParams | undefined,
) {
  const session = await getSession(context);

  if (!session) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  return {
    props: { session },
  };
}

const Profile = () => {
  const session = useSession();
  const [editMode, setEditMode] = useState(false);
  const router = useRouter();

  if (!session.data) return <SkeletonProfile />;

  const { data: profile, refetch: refetchProfile } =
    api.userProfile.getUserProfileByUserId.useQuery({
      userId: session.data?.user?.id ?? "",
    });

  const createUserProfile = api.userProfile.createUserProfile.useMutation();
  const edtiUserProfile = api.userProfile.updateUserProfile.useMutation();

  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: profile?.name ?? "",
      wallet: profile?.wallet ?? "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const adjustedValues = {
      ...values,
      name: values.name ?? undefined,
      wallet: values.wallet ?? undefined,
    };

    if (profile) {
      await edtiUserProfile.mutateAsync({ id: profile.id, ...adjustedValues });
      await refetchProfile();
      toast({
        title: "Profile Updated",
        description: `Profile with name ${values.name} updated successfully.`,
      });
      setEditMode(false);
    } else {
      await createUserProfile.mutateAsync({
        userId: session.data?.user?.id ?? "",
        name: values.name ?? "",
      });
      await router.push("/rooms");
      toast({
        title: "Profile Created",
        description: `Profile with name ${values.name} created successfully.`,
      });
    }
  };

  return (
    <Card>
      <CardHeader className="flex justify-between">
        <CardTitle className="my-4 text-2xl font-bold">User Profile</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="name">Name</Label>
            <Controller
              control={control}
              name="name"
              render={({ field }) => (
                <Input
                  id="name"
                  placeholder={profile?.name || "Enter your name"}
                  {...field}
                  value={field.value ?? ""}
                  disabled={!editMode}
                />
              )}
            />
            {errors.name && (
              <p className="text-red-500">{errors.name.message}</p>
            )}
          </div>
          <div>
            <Label htmlFor="wallet">Wallet</Label>
            <Input
              id="wallet"
              placeholder={profile?.wallet ? "" : "Add a wallet"}
              value={profile?.wallet ?? ""}
              disabled
            />
          </div>
          <div className="flex gap-2 ">
            {!!profile && (
              <Button
                onClick={() => setEditMode(!editMode)}
                variant="outline"
                type="button"
              >
                {editMode ? "Cancel" : "Edit"}
              </Button>
            )}
            {editMode && (
              <Button type="submit" color="primary" variant="outline">
                {profile ? "Save" : "Create"}
              </Button>
            )}
            {profile && (
              <Link href="/update-payment-method/1">
                <Button variant="destructive">
                  Change Wallet
                </Button>
              </Link>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default Profile;

const SkeletonProfile = () => (
  <Card>
    <CardHeader className="flex justify-between">
      <CardTitle className="my-4 text-2xl font-bold">
        Loading Profile...
      </CardTitle>
    </CardHeader>
    <CardContent>
      <Skeleton className="mb-4 h-8 w-48" />
      <Skeleton className="mb-2 h-6 w-64" />
      <Skeleton className="mb-2 h-6 w-40" />
      <Skeleton className="h-6 w-32" />
    </CardContent>
  </Card>
);
