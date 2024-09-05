import React from "react";
import { RoomOpenAndClose } from "./RoomOpenAndClose";
import { RoomLeave } from "./RoomLeave";
import { useRoomContext } from "~/_context/room/RoomContext";

interface Room {
  name: string;
  description: string;
  isOpen: boolean;
  totalPrice: number;
  participants: {
    payed: boolean;
    role: string;
    roomId: string;
    userId: string;
    weight: number;
    name: string;
    wallet: string | null;
    userParticipantId: string;
  }[];
}

export const RoomHeader = () => {
  const { roomData: room, isUserOwner, userProfile } = useRoomContext();

  if (!room || !userProfile) return null;

  return (
    <div className="p-2">
      <div className=" flex flex-col gap-1 rounded-md border border-slate-300 bg-slate-50 p-2">
        <div className="flex flex-row items-center justify-between">
          <div>
            <div className="text-xs  text-slate-600">Room Name:</div>
            <h2 className="text-2xl font-bold">{room.name}</h2>
          </div>
          <div>{isUserOwner ? <RoomOpenAndClose /> : <RoomLeave />}</div>
        </div>
        <div className="flex flex-col items-start ">
          <div className="text-xs  text-slate-600">Description:</div>
          <p className="text-lg text-slate-900">{room.description}</p>
        </div>
        <div className="flex flex-col items-start ">
          <div className="text-xs  text-slate-600">Ammount:</div>
          <div className="text-wrap break-all text-sm">
            {room?.totalPrice} XRP
          </div>
        </div>
      </div>
    </div>
  );
};
