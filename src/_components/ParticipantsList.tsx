import React from "react";
import { ParticipantItem } from "./ParticipantItem";

export const ParticipantsList = ({
  participants,
  isLoading,
  isUserOwner,
  totalPrice,
  room,
}: {
  participants: {
    name: string;
    wallet: string;
    userParticipantId: string;
    payed: boolean;
    role: string;
    roomId: string;
    userId: string;
    weight: number;
  }[];
  room: {
    isOpen: boolean;
    isReadyForSettlement: boolean;
    hasSettled: boolean;
    id: string;
    totalPrice: number;
  };
  isLoading: boolean;
  isUserOwner: boolean;
  totalPrice: number;
}) => {
  const ownerAddress =
    participants.find(
      (p: { role: string; wallet: string }) => p.role === "owner",
    )?.wallet ?? "";

  return (
    <div className="flex flex-col gap-1">
      {isLoading ? (
        <div>Loading...</div>
      ) : participants?.length ? (
        participants.map((participant) => (
          <div key={participant.userParticipantId} className="p-2">
            <ParticipantItem
              ownerAddress={ownerAddress}
              room={room}
              isUserOwner={isUserOwner}
              participant={participant}
              totalPrice={totalPrice}
              totalWeight={participants.reduce(
                (acc, curr) => acc + curr.weight,
                0,
              )}
            />
          </div>
        ))
      ) : (
        <div>No participants</div>
      )}
    </div>
  );
};
