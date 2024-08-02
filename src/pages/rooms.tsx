import { useRouter } from "next/router";
import { type GetSessionParams, getSession, useSession } from "next-auth/react";
import { api } from "~/utils/api";
import { Room } from "../_components/Room";

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

export default function Rooms() {
  const router = useRouter();
  const session = useSession();

  const rooms = api.room.getRoomsByUserIdInRoom.useQuery({
    userId: session.data?.user?.id ?? "",
  });

  return (
    <>
      <div className="flex flex-row items-center justify-between rounded-lg border border-slate-300 bg-slate-50 p-2 shadow-sm">
        <h2 className=" text-2xl font-bold">My Rooms</h2>
        <div>
          <button
            type="button"
            className="rounded-lg bg-blue-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
            onClick={() => void router.push("/room/new")}
          >
            New Room
          </button>
        </div>
      </div>
      <div>
        {rooms.isLoading ? (
          <div>Loading...</div>
        ) : rooms.data?.length ? (
          rooms.data.map((room) => (
            <div
              key={room.id}
              className="my-2 rounded-xl border border-slate-300 bg-slate-50 p-2 shadow-sm"
            >
              <Room room={room} />
            </div>
          ))
        ) : (
          <div className="my-2 rounded-xl border border-slate-300 bg-white p-2 shadow-sm">
            <div className="flex flex-row justify-between">
              <article className="text-wrap break-all">
                <h2 className="slate-700 text-xl text-slate-600">No Rooms</h2>
                <p className="text-lg text-slate-600">Create a room to start</p>
              </article>
              <div className="flex flex-col justify-around gap-2"></div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
