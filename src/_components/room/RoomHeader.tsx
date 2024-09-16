import React from "react";
import { RoomOpenAndClose } from "./RoomOpenAndClose";
import { RoomLeave } from "./RoomLeave";
import { useRoomContext } from "~/_context/room/RoomContext";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";

export const RoomHeader = () => {
  const { roomData: room, isUserOwner, userProfile } = useRoomContext();

  if (!room || !userProfile) return null;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{room.name}</CardTitle>
        <div>{isUserOwner ? <RoomOpenAndClose /> : <RoomLeave />}</div>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground mb-2">{room.description}</p>
        <p className="font-semibold">Amount: {room?.totalPrice} XRP</p>
      </CardContent>
    </Card>
  );
};