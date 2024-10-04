"use client";

import { useRouter } from "next/router";
import { type GetServerSidePropsContext } from "next";
import { getServerSession } from "next-auth";
import { api } from "~/utils/api";
import { Room } from "../_components/room/Room";
import { db } from "~/server/db";
import { Button } from "~/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "~/components/ui/card";
import { authOptions } from "~/server/auth";
import { Skeleton } from "~/components/ui/skeleton";

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const session = await getServerSession(context.req, context.res, authOptions);

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
    props: { userId: session.user.id },
  };
}

export default function Rooms({ userId }: { userId: string }) {
  const router = useRouter();
  const { data: rooms, isLoading } = api.room.getRoomsByUserIdInRoom.useQuery({
    userId,
  });

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>My Rooms</CardTitle>
        <Button onClick={() => void router.push("/room/new")}>New Room</Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <RoomsSkeleton />
        ) : rooms && rooms.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {rooms.map((room) => (
              <Room key={room.id} room={room} />
            ))}
          </div>
        ) : (
          <div className="py-4 text-center">
            <h2 className="text-xl font-semibold text-muted-foreground">
              No Rooms
            </h2>
            <p className="text-lg text-muted-foreground">
              Create a room to start
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function RoomsSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex items-start justify-between">
          <div>
            <Skeleton className="mb-2 h-5 w-40" />
            <Skeleton className="mb-1 h-4 w-60" />
            <Skeleton className="h-3 w-32" />
          </div>
          <div className="flex space-x-2">
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-8 w-16" />
          </div>
        </div>
      ))}
    </div>
  );
}
