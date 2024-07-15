import React from "react";
import { ParticipantItem } from "./ParticipantItem";

export const ParticipantsList = ({
  participants,
  isLoading,
  handleDeleteParticipant,
  isUserOwner,
  totalPrice,
  participantsRefetch,
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
  isLoading: boolean;
  participantsRefetch: () => void;
  handleDeleteParticipant: (participantId: string) => void;
  isUserOwner: boolean;
  totalPrice: number;
}) => {
  return (
    <div className="mt-5 bg-slate-100 p-1">
      <div className="flex flex-col gap-1">
        {isLoading ? (
          <div>Loading...</div>
        ) : participants?.length ? (
          participants.map((participant) => (
            <div key={participant.userParticipantId}>
              <ParticipantItem
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
