import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { api } from "~/utils/api";

export default function Room({
  room,
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
    await deleteRoom.mutateAsync({ id: room.id });
    rooms.refetch();
  };
  const handleClick = () => {
    router.push(`/room/${room.id}`);
  };

  return (
    <div className="flex flex-row justify-between rounded-sm border border-gray-300 bg-white p-4">
      <div>
        <h2 className="text-2xl font-bold">{room.name}</h2>
        <p className="text-lg">{room.description}</p>
      </div>
      <div className="self-center">
        <button
          onClick={handleClick}
          className="rounded border border-gray-300 bg-gray-200 px-4 py-2 font-semibold text-gray-700 hover:bg-gray-300"
        >
          Join
        </button>
        <button
          onClick={handleDeleteRoom}
          className="rounded border border-gray-300 bg-red-200 px-4 py-2 font-semibold text-red-700 hover:bg-red-300"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
