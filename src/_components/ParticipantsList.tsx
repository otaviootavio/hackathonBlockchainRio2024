import { useSession } from "next-auth/react";
import React from "react";
import ParticipantViewsOthers from "./participant/ParticipantViewsOthers";
import { useRoomContext } from "~/_context/room/RoomContext";
import UserViewsHimself from "./participant/UserViewsHimself";
import AdminViewsParticipant from "./participant/AdminViewsParticipant";

export const ParticipantsList = () => {
  const {
    roomData: room,
    isUserOwner,
    isRoomLoading: isLoading,
  } = useRoomContext();
  const session = useSession();

  const participants = room?.participants ?? [];

  const ownerAddress =
    participants.find((p) => p.role === "owner")?.wallet ?? "";
  const currentUserId = session.data?.user?.id;
  const totalWeight = participants.reduce((acc, curr) => acc + curr.weight, 0);

  const totalPrice = room?.totalPrice ?? 0;

  if (!room) return null;

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
            <UserViewsHimself
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
              <AdminViewsParticipant
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
          <UserViewsHimself
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
            <ParticipantViewsOthers
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
