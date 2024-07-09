import { useRouter } from "next/router";
import { api } from "~/utils/api";
import { type GetSessionParams, getSession, useSession } from "next-auth/react";
import { Participant } from "../_components/Participant";

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

  if (room.isLoading)
    return (
      <div className="flex h-screen flex-col items-center bg-blue-200">
        <div className="min-w-96 gap-4">
          <div className="rounded-lg border-2 bg-white p-4">
            <div>Loading...</div>
          </div>
        </div>
      </div>
    );

  if (!session.data?.user?.name)
    return <div>Please sign in to join the room</div>;

  const joinRoom = async () => {
    await addParticipant.mutateAsync({
      roomId,
      userId: session.data?.user?.id ?? "",
      name: session?.data.user?.name ?? "",
      payed: false,
    });

    await room.refetch();
  };

  const handleDeleteParticipant = async (participantId: string) => {
    await removeParticipantFromRoom.mutateAsync({
      roomId,
      participantId,
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
            </div>
            <p className="flex flex-col justify-center text-lg">
              {room.data?.totalPrice} ETH
            </p>
            {(room.data &&
              room.data.participants.filter(
                (participant) => participant.userId == session.data?.user?.id,
              ).length > 0 && (
                <p className=" flex flex-col justify-center rounded-full bg-green-400 p-2 align-middle font-bold text-white">
                  Joined
                </p>
              )) ?? (
              <button
                onClick={joinRoom}
                type="button"
                className="mb-5 me-2 rounded-lg bg-blue-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
              >
                Join
              </button>
            )}
          </div>
          <div className="mt-5 bg-slate-100 p-1 ">
            <div className="gap-1wwwwwwwww flex flex-col">
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
