import { useRouter } from "next/router";
import { api } from "~/utils/api";
import { useSession } from "next-auth/react";

import { type GetSessionParams, getSession } from "next-auth/react";
import { RoomHeader } from "~/_components/RoomHeader";
import { ParticipantsList } from "~/_components/ParticipantsList";
import { RoomJoin } from "~/_components/RoomJoin";
import { db } from "~/server/db";
import RoomStatus from "~/_components/RoomStatus";
import { PusherProvider } from "~/_context/pusher/PusherProvider";
import { useSubscribeToEvent } from "~/_hooks";

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
  const router = useRouter();
  const roomId = router.query.id as string;
  const room = api.room.getRoomById.useQuery({ id: roomId });
  const session = useSession();
  const hasEveryonePayed =
    room.data?.participants.every((p: { payed: boolean }) => p.payed) ?? false;
  const addParticipant = api.participant.addParticipant.useMutation();
  const removeParticipantFromRoom =
    api.participant.removeParticipantFromRoom.useMutation();
  const openRoom = api.room.openRoom.useMutation();
  const closeRoom = api.room.closeRoom.useMutation();
  const { data: userProfile } = api.userProfile.getUserProfileByUserId.useQuery(
    {
      userId: session.data?.user?.id ?? "",
    },
  );

  const setreadyForSettlement = api.room.setReadyForSettlement.useMutation();
  const settleRoom = api.room.settleRoom.useMutation();

  // useSubscribeToEvent("room-opened", () => {
  //   console.log("Room has been opened.");
  // });

  useSubscribeToEvent("room-closed", () => {
    console.log("Room has been opened.");
    room.refetch().catch(console.error);
  });

  useSubscribeToEvent("room-created", () => {
    console.log("Room has been created.");
    room.refetch().catch(console.error);
  });

  useSubscribeToEvent("room-updated", () => {
    console.log("Room has been updated.");
    room.refetch().catch(console.error);
  });

  // useSubscribeToEvent("room-deleted", async() => {
  //   console.log("Room has been deleted.");
  //   await room.refetch();
  // });

  useSubscribeToEvent("room-ready-for-settlement", () => {
    console.log("Room is ready for settlement.");
    room.refetch().catch(console.error);
  });

  useSubscribeToEvent("room-settled", () => {
    console.log("Room has been settled.");
    room.refetch().catch(console.error);
  });

  useSubscribeToEvent("participant-added", () => {
    console.log("Participant has been added.");
    room.refetch().catch(console.error);
  });

  useSubscribeToEvent("participant-updated", () => {
    console.log("Participant has been updated.");
    room.refetch().catch(console.error);
  });

  useSubscribeToEvent("participant-deleted", () => {
    console.log("Participant has been deleted.");
    room.refetch().catch(console.error);
  });

  useSubscribeToEvent("participant-payed", () => {
    console.log("Participant has been payed.");
    room.refetch().catch(console.error);
  });

  const handleSetReadyForSettlement = async () => {
    await setreadyForSettlement.mutateAsync({
      id: roomId,
      userId: session.data?.user?.id ?? "",
    });
    await room.refetch();
    return;
  };

  const handleSetteleRoom = async () => {
    if (hasEveryonePayed) {
      await settleRoom.mutateAsync({
        id: roomId,
        userId: session.data?.user?.id ?? "",
      });
      await room.refetch();
    }
  };

  const isUserOwner =
    room.data?.participants?.some(
      (p: { role: string; userId: string }) =>
        p.role === "owner" && p.userId === session.data?.user.id,
    ) ?? false;
  const isUserParticipant =
    room.data?.participants.some(
      (p: { userId: string | undefined }) =>
        p.userId === session.data?.user?.id,
    ) ?? false;

  if (room.isLoading) {
    return (
      <div className="flex h-screen flex-col items-center bg-blue-200">
        <div className="min-w-96 gap-4">
          <div className="rounded-lg border-2 bg-white p-4">
            <div>Loading...</div>
          </div>
        </div>
      </div>
    );
  }

  if (!session.data?.user?.name) {
    return <div>Please sign in to join the room</div>;
  }

  if (!room.data) {
    return <div>Room not found</div>;
  }

  const joinRoom = async () => {
    await addParticipant.mutateAsync({
      roomId: roomId,
      userProfileId: userProfile?.id ?? "",
      userId: session.data?.user?.id ?? "",
      name: session.data.user?.name ?? "",
      payed: false,
    });

    await room.refetch();
  };

  const handleDeleteParticipant = async (participantId: string) => {
    await removeParticipantFromRoom.mutateAsync({
      userId: session.data?.user?.id ?? "",
      roomId,
      participantId,
    });
    await room.refetch();
  };

  const handleOpenRoom = async () => {
    await openRoom.mutateAsync({
      id: roomId,
      userId: session.data?.user?.id ?? "",
    });
    await room.refetch();
  };

  const handleCloseRoom = async () => {
    await closeRoom.mutateAsync({
      id: roomId,
      userId: session.data?.user?.id ?? "",
    });
    await room.refetch();
  };

  const userParticipantData = room.data.participants.find(
    (p: { userId: string }) => p.userId === session.data?.user?.id,
  );

  if (!isUserParticipant) {
    return (
      <div className="flex h-screen flex-col items-center bg-blue-200">
        <div className="min-w-96">
          <div className="rounded-lg border-2 bg-white p-4">
            <RoomJoin room={room.data} joinRoom={joinRoom} />
          </div>
        </div>
      </div>
    );
  }

  if (!userParticipantData) {
    return <div>Error loading participant data</div>;
  }

  return (
    <>
      <RoomStatus
        isUserOwner={isUserOwner}
        room={room.data}
        handleSettleRoom={handleSetteleRoom}
        handleSetReadyForSettlement={handleSetReadyForSettlement}
        hasEveryonePayed={hasEveryonePayed}
      />
      <RoomHeader
        room={room.data}
        onBack={() => router.push("/rooms")}
        isUserOwner={isUserOwner}
        userParticipantData={userParticipantData}
        handleOpenRoom={handleOpenRoom}
        handleCloseRoom={handleCloseRoom}
        removeParticipant={handleDeleteParticipant}
      />
      <ParticipantsList
        room={room.data}
        participantsRefetch={room.refetch}
        isUserOwner={isUserOwner}
        participants={room.data.participants}
        isLoading={room.isLoading}
        handleDeleteParticipant={handleDeleteParticipant}
        totalPrice={room.data.totalPrice}
      />
    </>
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
        <Room />
      </PusherProvider>
    );
  }
}
