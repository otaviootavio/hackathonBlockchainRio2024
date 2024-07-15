import React from "react";
import { ParticipantItem } from "./ParticipantItem";

export const ParticipantsList = ({
  participants,
  isLoading,
  handleDeleteParticipant,
  isUserOwner,
  totalPrice,
  participantsRefetch,
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
  participantsRefetch: () => void;
  handleDeleteParticipant: (participantId: string) => void;
  isUserOwner: boolean;
  totalPrice: number;
}) => {
  const ownerAddress =
    participants.find(
      (p: { role: string; wallet: string }) => p.role === "owner",
    )?.wallet || "";

  return (
    <div className="mt-5 bg-slate-100 p-1">
      <div className="flex flex-col gap-1">
        {isLoading ? (
          <div>Loading...</div>
        ) : participants?.length ? (
          participants.map((participant) => (
            <div key={participant.userParticipantId}>
              <ParticipantItem
                ownerAddress={ownerAddress}
                room={room}
                isUserOwner={isUserOwner}
                participant={participant}
                removeParticipant={handleDeleteParticipant}
                totalPrice={totalPrice}
                totalWeight={participants.reduce(
                  (acc, curr) => acc + curr.weight,
                  0,
                )}
                participantsRefetch={participantsRefetch}
              />
            </div>
          ))
        ) : (
          <div>No participants</div>
        )}
      </div>
    </div>
  );
};
