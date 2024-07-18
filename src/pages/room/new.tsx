import { type GetSessionParams, getSession, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useState } from "react";
import { db } from "~/server/db";
import { api } from "~/utils/api";

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

export default function NewRoom() {
  const [name, setName] = useState("");
  const [totalPrice, setTotalPrice] = useState<number>(0);
  const [description, setDescription] = useState("");
  const [participantPayed] = useState(true);
  const createRoom = api.room.createRoom.useMutation();
  const router = useRouter();
  const session = useSession();
  const userProfile = api.userProfile.getUserProfileByUserId.useQuery({
    userId: session.data?.user?.id ?? "",
  });
  const handleSubmit = async () => {
    await createRoom
      .mutateAsync({
        name,
        totalPrice,
        description,
        participantName: userProfile.data?.name ?? "",
        participantPayed: participantPayed,
        userId: session.data?.user?.id ?? "",
        userProfileId: userProfile.data?.id ?? "",
      })
      .then(async () => {
        await router.push("/rooms");
      });
  };

  return (
    <div className="p-4">
      <div className="border-1 flex flex-col rounded-lg">
        <article className="break-words">
          <h2 className="text-2xl font-bold">Create Room</h2>
          <h3>You will be the owner of this room</h3>
          <h3>We consider that you payed for the pizza today!</h3>
        </article>

        <div className="flex flex-col">
          <div>
            <label htmlFor="roomName" className="block text-gray-700">
              Room Name
            </label>
            <input
              onChange={(e) => setName(e.target.value)}
              type="text"
              id="roomName"
              className="mb-2 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="roomPrice" className="block text-gray-700">
              Pizza Price (in XRP)
            </label>
            <input
              onChange={(e) => setTotalPrice(Number(e.target.value))}
              type="text"
              id="roomName"
              className="mb-2 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="roomDescription" className="block text-gray-700">
              Room Description
            </label>
            <textarea
              onChange={(e) => setDescription(e.target.value)}
              id="roomDescription"
              className="mb-2 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
            />
          </div>
        </div>
        <button
          type="button"
          className=" me-2 rounded-lg bg-blue-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
          onClick={handleSubmit}
        >
          Create Room
        </button>
      </div>
    </div>
  );
}
