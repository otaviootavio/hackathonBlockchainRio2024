import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { api } from "~/utils/api";

export function Room({
  room = { name: "Unknown Room", description: "", id: "" },
}: {
  room: { name: string; description: string; id: string };
}) {
  const router = useRouter();
  const session = useSession();
  const deleteRoom = api.room.deleteRoom.useMutation();
  const rooms = api.room.getRoomsByUserIdInEachRoom.useQuery({
    userId: session.data?.user?.id ?? "",
  });

  const handleDeleteRoom = async () => {
    await deleteRoom.mutateAsync({
      id: room.id,
      userId: session.data?.user?.id ?? "",
    });
    await rooms.refetch();
  };

  const handleClick = async () => {
    await router.push(`/room/${room.id}`);
  };

  return (
    <div className="flex flex-row justify-between">
      <article className="text-wrap break-all">
        <h2 className="text-2xl font-bold">{room.name}</h2>
        <p className="text-lg">{room.description}</p>
      </article>
      <div className="flex flex-col justify-around gap-2">
        <button
          onClick={handleClick}
          className="rounded-xl border border-gray-300 bg-gray-200 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-300"
        >
          Join
        </button>
        <button
          onClick={handleDeleteRoom}
          className="rounded-xl border border-gray-300 bg-red-200 px-4 py-2 text-xs font-semibold text-red-700 hover:bg-red-300"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
