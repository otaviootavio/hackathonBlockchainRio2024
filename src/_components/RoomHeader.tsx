import React from "react";
import { RoomOpenAndClose } from "./RoomOpenAndClose";
import { RoomLeave } from "./RoomLeave";

interface Room {
  name: string;
  description: string;
  isOpen: boolean;
  totalPrice: number;
  participants: { role: string; name: string }[];
}

interface RoomHeaderProps {
  room: Room;
  onBack: () => void;
  isUserOwner: boolean;
  handleOpenRoom: () => void;
  handleCloseRoom: () => void;
  removeParticipant: (participantId: string) => void;
  userParticipantData: {
    payed: boolean;
    role: string;
    roomId: string;
    userId: string;
    weight: number;
    name: string;
    wallet: string;
    userParticipantId: string;
  };
}

export const RoomHeader: React.FC<RoomHeaderProps> = ({
  room,
  onBack,
  isUserOwner,
  handleOpenRoom,
  handleCloseRoom,
  removeParticipant,
  userParticipantData,
}) => {
  const owner =
    room?.participants?.find((p) => p.role === "owner")?.name ?? "None";
  const isOpen = room?.isOpen ?? false;

  return (
    <div className="bg-slate-100 p-1">
      <div className="rounded-sm border border-gray-300 bg-white p-4">
        <div className="flex flex-row justify-between">
          <p
            className="text-sm text-blue-900 underline hover:cursor-pointer"
            onClick={onBack}
          >
            Back to rooms
          </p>
          <div>
            {isUserOwner ? (
              <RoomOpenAndClose
                isOpen={isOpen}
                handleOpenRoom={handleOpenRoom}
                handleCloseRoom={handleCloseRoom}
              />
            ) : (
              <RoomLeave
                removeParticipant={removeParticipant}
                userParticipantData={userParticipantData}
              />
            )}
          </div>
        </div>

        <div className="mt-4 flex flex-row justify-between">
          <div>
            <h2 className="text-2xl font-bold">{room.name}</h2>
            <p className="text-lg text-gray-700">{room.description}</p>
            <p
              className={`text-sm font-semibold ${room.isOpen ? "text-green-600" : "text-red-600"}`}
            ></p>
            <div className="mt-2 flex flex-row items-center gap-2">
              <div className="text-sm font-medium">Owner:</div>
              <div className="text-sm">{owner}</div>
            </div>
          </div>
          <p className="flex flex-col justify-center text-lg font-semibold text-blue-900">
            {room?.totalPrice} ETH
          </p>
        </div>
      </div>
    </div>
  );
};
