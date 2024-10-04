"use client";

import { useRouter } from "next/router";
import { getSession, type GetSessionParams, useSession } from "next-auth/react";
import { ParticipantsList } from "~/_components/ParticipantsList";

import { PusherProvider } from "~/_context/pusher/PusherProvider";
import { RoomProvider, useRoomContext } from "~/_context/room/RoomContext";
import { db } from "~/server/db";
import { RoomJoin } from "~/_components/room/RoomJoin";
import RoomStatus from "~/_components/room/RoomStatus";
import { RoomHeader } from "~/_components/room/RoomHeader";
import { ModalProvider } from "~/_context/ui/ModalProvider";
import {
  Card,
  CardContent,
} from "~/components/ui/card";
import { Skeleton } from "~/components/ui/skeleton";

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

  const userProfile = await db.userProfile.findUnique({
    where: { userId: session.user.id },
  });

  if (!userProfile) {
    return {
      redirect: {
        destination: "/profile",
        permanent: false,
      },
    };
  }

  return {
    props: { session },
  };
}

export function Room() {
  const { data: session } = useSession();
  const { roomData, isRoomLoading, isUserParticipant } = useRoomContext();

  if (isRoomLoading) {
    return (
      <Card className="mx-auto mt-8 w-full max-w-md">
        <CardContent className="p-6">
          <Skeleton className="mb-4 h-8 w-full" />
          <Skeleton className="mb-2 h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </CardContent>
      </Card>
    );
  }

  if (!session?.user?.name) {
    return <Card className="p-6">Please sign in to join the room</Card>;
  }

  if (!roomData) {
    return <Card className="p-6">Room not found</Card>;
  }

  if (!isUserParticipant) {
    return <RoomJoin />;
  }

  return (
    <div className="space-y-4">
      <RoomStatus />
      <RoomHeader />
      <ParticipantsList />
    </div>
  );
}

export default function Page() {
  const { data: session, status } = useSession();
  const router = useRouter();
  if (status === "unauthenticated") {
    return <div>Please sign in</div>;
  } else if (status === "loading") {
    return <div>Loading...</div>;
  } else if (
    status === "authenticated" &&
    typeof router?.query?.id == "string"
  ) {
    return (
      <PusherProvider
        slug={`room-${router?.query?.id ?? ""}`}
        userInfo={{ name: session.user.name ?? "" }}
        userId={session.user.id}
      >
        <ModalProvider>
          <RoomProvider>
            <Room />
          </RoomProvider>
        </ModalProvider>
      </PusherProvider>
    );
  }
}
