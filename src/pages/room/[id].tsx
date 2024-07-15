import { useRouter } from "next/router";
import { api } from "~/utils/api";
import { useSession } from "next-auth/react";

import { type GetSessionParams, getSession } from "next-auth/react";
import { RoomHeader } from "~/_components/RoomHeader";
import { ParticipantsList } from "~/_components/ParticipantsList";
import { RoomJoin } from "~/_components/RoomJoin";
import { db } from "~/server/db";
import RoomStatus from "~/_components/RoomStatus";

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

export default function Room() {
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

  const handleSetReadyForSettlement = async () => {
    await setreadyForSettlement.mutateAsync({
      id: roomId,
      userId: session.data?.user?.id ?? "",
    });
    await room.refetch();
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
    return <RoomJoin room={room.data} joinRoom={joinRoom} />;
  }

  if (!userParticipantData) {
    return <div>Error loading participant data</div>;
  }

  return (
    <div className="flex h-screen flex-col items-center bg-blue-200">
      <div className="min-w-96">
        <div className="rounded-lg border-2 bg-white p-4">
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
        </div>
      </div>
    </div>
  );
}
