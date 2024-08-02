import { useRouter } from "next/router";
import { getSession, type GetSessionParams, useSession } from "next-auth/react";
import { RoomHeader } from "~/_components/RoomHeader";
import { ParticipantsList } from "~/_components/ParticipantsList";
import { RoomJoin } from "~/_components/RoomJoin";
import RoomStatus from "~/_components/RoomStatus";
import { PusherProvider } from "~/_context/pusher/PusherProvider";
import { RoomProvider, useRoomContext } from "~/_context/room/RoomContext";
import { db } from "~/server/db";

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
  const { data: session } = useSession();
  const {
    roomData,
    isRoomLoading,
    isUserOwner,
    isUserParticipant,
    hasEveryonePayed,
    joinRoom,
  } = useRoomContext();

  if (isRoomLoading) {
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

  if (!session?.user?.name) {
    return <div>Please sign in to join the room</div>;
  }

  if (!roomData) {
    return <div>Room not found</div>;
  }

  const userParticipantData = roomData.participants.find(
    (p: { userId: string }) => p.userId === session.user.id,
  );

  if (!isUserParticipant) {
    return (
      <div className="flex h-screen flex-col items-center bg-blue-200">
        <div className="min-w-96">
          <div className="rounded-lg border-2 bg-white p-4">
            <RoomJoin room={roomData} joinRoom={joinRoom} />
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
        room={roomData}
        hasEveryonePayed={hasEveryonePayed}
      />
      <RoomHeader
        room={roomData}
        onBack={() => router.push("/rooms")}
        isUserOwner={isUserOwner}
        userParticipantData={userParticipantData}
      />
      <ParticipantsList
        room={roomData}
        isUserOwner={isUserOwner}
        participants={roomData.participants}
        isLoading={isRoomLoading}
        totalPrice={roomData.totalPrice}
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
        <RoomProvider>
          <Room />
        </RoomProvider>
      </PusherProvider>
    );
  }
}
