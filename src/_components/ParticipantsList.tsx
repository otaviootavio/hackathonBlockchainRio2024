import { useSession } from "next-auth/react";
import React from "react";
import CurrentUserParticipantView from "./participant/CurrentUserParticipantView";
import AdminParticipantView from "./participant/AdminParticipantView";
import UserParticipantView from "./participant/UserParticipantView";

export const ParticipantsList = ({
  participants,
  isLoading,
  isUserOwner,
  totalPrice,
  room,
}: {
  participants: {
    name: string;
    wallet: string | null;
    userParticipantId: string;
    payed: boolean;
    role: string;
    roomId: string;
    userId: string;
    weight: number;
    createdAt: Date;
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
  const session = useSession();

  const ownerAddress =
    participants.find((p) => p.role === "owner")?.wallet ?? "";
  const currentUserId = session.data?.user?.id;
  const totalWeight = participants.reduce((acc, curr) => acc + curr.weight, 0);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!participants?.length) {
    return <div>No participants</div>;
  }

  // filter out current user
  // then rener current user, if is normal user or admin
  // then render the users

  const participantsToRender = participants.filter(
    (p) => p.userId !== currentUserId,
  );

  const currentUserParticipant = participants.find(
    (p) => p.userId === currentUserId,
  );

  if (isUserOwner) {
    return (
      <div className="flex flex-col gap-1">
        {currentUserParticipant && (
          <div key={currentUserParticipant.userParticipantId} className="p-2">
            <CurrentUserParticipantView
              participant={currentUserParticipant}
              ownerAddress={ownerAddress}
              room={room}
              totalPrice={totalPrice}
              totalWeight={totalWeight}
            />
          </div>
        )}
        {participantsToRender.map((participant) => {
          return (
            <div key={participant.userParticipantId} className="p-2">
              <AdminParticipantView
                participant={participant}
                totalPrice={totalPrice}
                totalWeight={totalWeight}
              />
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      {currentUserParticipant && (
        <div key={currentUserParticipant.userParticipantId} className="p-2">
          <CurrentUserParticipantView
            participant={currentUserParticipant}
            ownerAddress={ownerAddress}
            room={room}
            totalPrice={totalPrice}
            totalWeight={totalWeight}
          />
        </div>
      )}
      {participantsToRender.map((participant) => {
        return (
          <div key={participant.userParticipantId} className="p-2">
            <UserParticipantView
              participant={participant}
              totalPrice={totalPrice}
              totalWeight={totalWeight}
            />
          </div>
        );
      })}
    </div>
  );
};
