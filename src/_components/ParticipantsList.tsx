import React from "react";
import { ParticipantItem } from "./ParticipantItem";

export const ParticipantsList = ({
  participants,
  isLoading,
  handleDeleteParticipant,
}: {
  participants: {
    id: string;
    name: string;
    payed: boolean;
    role: string;
    roomId: string;
    userId: string;
  }[];
  isLoading: boolean;
  handleDeleteParticipant: (participantId: string) => void;
}) => {
  return (
    <div className="mt-5 bg-slate-100 p-1">
      <div className="flex flex-col gap-1">
        {isLoading ? (
          <div>Loading...</div>
        ) : participants?.length ? (
          participants.map((participant) => (
            <div key={participant.id}>
              <ParticipantItem
                participant={participant}
                removeParticipant={handleDeleteParticipant}
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
