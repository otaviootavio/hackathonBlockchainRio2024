import { useRouter } from "next/router";
import { api } from "~/utils/api";
import { type GetSessionParams, getSession, useSession } from "next-auth/react";
import { Participant } from "../../_components/Participant";

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

export default function Room() {
  const router = useRouter();
  const roomId = router.query.id as string;
  const room = api.room.getRoomById.useQuery({ id: roomId });
  const session = useSession();
  const addParticipant = api.participant.addParticipant.useMutation();
  const removeParticipantFromRoom =
    api.participant.removeParticipantFromRoom.useMutation();
  const openRoom = api.room.openRoom.useMutation();
  const closeRoom = api.room.closeRoom.useMutation();

  const isUserOwner = room.data?.participants?.some(
    (p) => p.role === "owner" && p.userId === session.data?.user?.id,
  );
  const isUserParticipant = room.data?.participants.some(
    (p) => p.userId === session.data?.user?.id,
  );

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

  const joinRoom = async () => {
    await addParticipant.mutateAsync({
      roomId,
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

  return (
    <div className="flex h-screen flex-col items-center bg-blue-200">
      <div className="min-w-96 gap-4">
        <div className="rounded-lg border-2 bg-white p-4">
          <div>
            <p
              className="text-sm text-blue-900 underline hover:cursor-pointer"
              onClick={() => router.push("/rooms")}
            >
              Back to rooms
            </p>
          </div>
          <div className="flex flex-row justify-between ">
            <div>
              <h2 className="text-2xl font-bold">{room.data?.name}</h2>
              <p className="text-lg">{room.data?.description}</p>
              <p>{room.data?.isOpen ? "Open" : "Closed"}</p>
              <p>
                Owner:{" "}
                {room.data?.participants
                  ? room.data.participants.find((p) => p.role == "owner")?.name
                  : "None"}
              </p>
            </div>
            <p className="flex flex-col justify-center text-lg">
              {room.data?.totalPrice} ETH
            </p>
            <div className="flex flex-col gap-1">
              <div>
                {isUserParticipant ? (
                  <div className="rounded-full bg-green-400 px-5 py-2.5 text-center align-middle font-bold text-white">
                    <p>Joined</p>
                  </div>
                ) : room.data?.isOpen ? (
                  <button
                    onClick={joinRoom}
                    type="button"
                    className="mb-5 me-2 rounded-lg bg-blue-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                  >
                    Join
                  </button>
                ) : null}
              </div>
              <div className="flex flex-col gap-1">
                {isUserOwner &&
                  (!room.data?.isOpen ? (
                    <button
                      onClick={handleOpenRoom}
                      type="button"
                      className="mb-2 rounded-lg bg-green-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-green-800 focus:outline-none focus:ring-4 focus:ring-green-300"
                    >
                      Open Room
                    </button>
                  ) : (
                    <button
                      onClick={handleCloseRoom}
                      type="button"
                      className="rounded-lg bg-red-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-red-800 focus:outline-none focus:ring-4 focus:ring-red-300"
                    >
                      Close Room
                    </button>
                  ))}
              </div>
            </div>
          </div>
          <div className="mt-5 bg-slate-100 p-1">
            <div className="flex flex-col gap-1">
              {room.isLoading ? (
                <div>Loading...</div>
              ) : room.data?.participants?.length ? (
                room.data.participants.map((participant) => (
                  <div key={participant.id}>
                    <Participant
                      participant={participant}
                      removeParticipant={handleDeleteParticipant}
                    />
                  </div>
                ))
              ) : (
                <div>No participants</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
