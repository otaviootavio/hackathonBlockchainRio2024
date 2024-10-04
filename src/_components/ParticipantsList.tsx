// src/_components/ParticipantsList.tsx
import { useSession } from "next-auth/react";
import React from "react";
import { useRoomContext } from "~/_context/room/RoomContext";
import { Card, CardContent } from "~/components/ui/card";
import { Skeleton } from "~/components/ui/skeleton";
import UserViewsHimself from "./participant/UserViewsHimself";
import AdminViewsParticipant from "./participant/AdminViewsParticipant";
import ParticipantViewsOthers from "./participant/ParticipantViewsOthers";

export const ParticipantsList = () => {
  const { roomData: room, isUserOwner, isRoomLoading } = useRoomContext();
  const session = useSession();

  const participants = room?.participants ?? [];
  const ownerAddress =
    participants.find((p) => p.role === "owner")?.wallet ?? "";
  const currentUserId = session.data?.user?.id;
  const totalWeight = participants.reduce((acc, curr) => acc + curr.weight, 0);
  const totalPrice = room?.totalPrice ?? 0;

  if (!room) return null;
  if (isRoomLoading) return <Skeleton className="h-40 w-full" />;
  if (!participants?.length)
    return <Card className="p-4">No participants</Card>;

  return (
    <Card>
      <CardContent className="space-y-4 p-4">
        {participants.map((participant) => {
          if (participant.userId === currentUserId) {
            return (
              <UserViewsHimself
                key={participant.userParticipantId}
                participant={participant}
                ownerAddress={ownerAddress}
                room={room}
                totalPrice={totalPrice}
                totalWeight={totalWeight}
              />
            );
          } else if (isUserOwner) {
            return (
              <AdminViewsParticipant
                key={participant.userParticipantId}
                participant={participant}
                totalPrice={totalPrice}
                totalWeight={totalWeight}
              />
            );
          } else {
            return (
              <ParticipantViewsOthers
                key={participant.userParticipantId}
                participant={participant}
                totalPrice={totalPrice}
                totalWeight={totalWeight}
              />
            );
          }
        })}
      </CardContent>
    </Card>
  );
};
