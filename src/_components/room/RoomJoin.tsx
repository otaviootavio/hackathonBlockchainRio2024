"use client";

import React from "react";
import { useRoomContext } from "~/_context/room/RoomContext";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";

export function RoomJoin() {
  const { roomData: room, joinRoom } = useRoomContext();

  if (!room) return null;

  return (
    <div className="flex flex-row justify-center">
      {room.isOpen ? (
        <Card className="mx-auto mt-8 w-full max-w-md">
          <CardContent className="p-6">
            <CardHeader>
              <CardTitle>You discovered a room!</CardTitle>
              <CardDescription>
                Click the button to join and pay for the pizza
              </CardDescription>
            </CardHeader>
            <CardFooter>
              <Button
                onClick={joinRoom}
                variant="default"
                className="px-5 py-2.5 font-medium"
              >
                Join room
              </Button>
            </CardFooter>
          </CardContent>
        </Card>
      ) : (
        <Card className="mx-auto mt-8 w-full max-w-md">
          <CardContent className="p-6">
            <CardHeader>
              <CardTitle>Ops!</CardTitle>
              <CardDescription>Ask the owner to open the room</CardDescription>
            </CardHeader>
            <CardFooter>
              <Badge variant="destructive" className="px-5 py-2.5 font-bold">
                Closed
              </Badge>
            </CardFooter>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
