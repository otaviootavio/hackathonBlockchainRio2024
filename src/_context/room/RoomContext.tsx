import React, { createContext, useContext, type ReactNode } from "react";
import { api, type RouterOutputs } from "~/utils/api";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useSubscribeToEvent } from "~/_hooks";
import { OwnerWalletNotFoundError } from "~/_errors/OwnerWalletNotFound";

type roomDataType = RouterOutputs["room"]["getRoomById"] | undefined;
type userProfileType =
  | RouterOutputs["userProfile"]["getUserProfileByUserId"]
  | undefined;

interface RoomContextType {
  userProfile: userProfileType;
  roomData: roomDataType;
  isUserOwner: boolean;
  isUserParticipant: boolean;
  hasEveryonePayed: boolean;
  isRoomLoading: boolean;
  joinRoom: () => Promise<void>;
  handleDeleteParticipant: (participantId: string) => Promise<void>;
  handleOpenRoom: () => Promise<void>;
  handleCloseRoom: () => Promise<void>;
  handleSetReadyForSettlement: () => Promise<void>;
  handleSettleRoom: () => Promise<void>;
  removeParticipant: (participantId: string) => Promise<void>;
  handleWeightChange: (
    newWeight: number,
    userParticipantId: string,
  ) => Promise<void>;
}

const RoomContext = createContext<RoomContextType | undefined>(undefined);

export const RoomProvider = ({ children }: { children: ReactNode }) => {
  const router = useRouter();
  const roomId = router.query.id as string;
  const session = useSession();

  const room = api.room.getRoomById.useQuery({ id: roomId });
  const { data: roomData } = api.room.getRoomById.useQuery({ id: roomId });
  const { data: userProfile } = api.userProfile.getUserProfileByUserId.useQuery(
    {
      userId: session.data?.user?.id ?? "",
    },
  );

  const addParticipant = api.participant.addParticipant.useMutation();
  const removeParticipantFromRoom =
    api.participant.removeParticipantFromRoom.useMutation();
  const openRoom = api.room.openRoom.useMutation();
  const closeRoom = api.room.closeRoom.useMutation();
  const setreadyForSettlement = api.room.setReadyForSettlement.useMutation();
  const settleRoom = api.room.settleRoom.useMutation();
  const updateParticipant = api.participant.updateParticipant.useMutation();

  const isUserOwner =
    room.data?.participants?.some(
      (p: { role: string; userId: string }) =>
        p.role === "owner" && p.userId === session.data?.user.id,
    ) ?? false;

  const isUserParticipant =
    room.data?.participants.some(
      (p: { userId: string | undefined }) =>
        p.userId === session.data?.user?.id,
    ) ?? false;

  const hasEveryonePayed =
    room.data?.participants.every((p: { payed: boolean }) => p.payed) ?? false;

  const joinRoom = async () => {
    await addParticipant.mutateAsync({
      roomId: roomId,
      profileId: userProfile?.id ?? "",
      userId: session.data?.user?.id ?? "",
      name: session.data?.user?.name ?? "",
      payed: false,
    });

    await room.refetch();
  };

  const handleDeleteParticipant = async (participantId: string) => {
    await removeParticipantFromRoom.mutateAsync({
      userId: session.data?.user?.id ?? "",
      roomId,
      participantId,
    });
    await room.refetch();
  };

  const handleOpenRoom = async () => {
    await openRoom.mutateAsync({
      id: roomId,
      userId: session.data?.user?.id ?? "",
    });
    await room.refetch();
  };

  const handleCloseRoom = async () => {
    await closeRoom.mutateAsync({
      id: roomId,
      userId: session.data?.user?.id ?? "",
    });
    await room.refetch();
  };

  const handleSetReadyForSettlement = async () => {
    const owner = room.data?.participants.find(
      (p: { role: string; userId: string }) =>
        p.role === "owner" && p.userId === session.data?.user?.id,
    );
    if (!owner?.wallet) {
      throw new OwnerWalletNotFoundError();
    }

    await setreadyForSettlement.mutateAsync({
      id: roomId,
      userId: session.data?.user?.id ?? "",
    });
    await room.refetch();
    return;
  };

  const handleSettleRoom = async () => {
    if (hasEveryonePayed) {
      await settleRoom.mutateAsync({
        id: roomId,
        userId: session.data?.user?.id ?? "",
      });
      await room.refetch();
    }
  };

  const removeParticipant = async (participantId: string) => {
    await removeParticipantFromRoom.mutateAsync({
      userId: session.data?.user?.id ?? "",
      roomId,
      participantId,
    });
    await room.refetch();
  };

  const handleWeightChange = async (
    newWeight: number,
    userParticipantId: string,
  ) => {
    if (newWeight > 0) {
      await updateParticipant.mutateAsync({
        id: userParticipantId,
        weight: newWeight,
      });

      await room.refetch();
    }
  };

  useSubscribeToEvent("room-closed", () => {
    room.refetch().catch(console.error);
  });

  useSubscribeToEvent("room-created", () => {
    room.refetch().catch(console.error);
  });

  useSubscribeToEvent("room-updated", () => {
    room.refetch().catch(console.error);
  });

  useSubscribeToEvent("room-ready-for-settlement", () => {
    room.refetch().catch(console.error);
  });

  useSubscribeToEvent("room-settled", () => {
    room.refetch().catch(console.error);
  });

  useSubscribeToEvent("participant-added", () => {
    room.refetch().catch(console.error);
  });

  useSubscribeToEvent("participant-updated", () => {
    room.refetch().catch(console.error);
  });

  useSubscribeToEvent("participant-deleted", () => {
    room.refetch().catch(console.error);
  });

  useSubscribeToEvent("participant-payed", () => {
    room.refetch().catch(console.error);
  });

  return (
    <RoomContext.Provider
      value={{
        roomData,
        userProfile,
        isUserOwner,
        isUserParticipant,
        hasEveryonePayed,
        isRoomLoading: room.isLoading,
        joinRoom,
        handleDeleteParticipant,
        handleOpenRoom,
        handleCloseRoom,
        handleSetReadyForSettlement,
        handleSettleRoom,
        removeParticipant,
        handleWeightChange,
      }}
    >
      {children}
    </RoomContext.Provider>
  );
};

export const useRoomContext = () => {
  const context = useContext(RoomContext);
  if (context === undefined) {
    throw new Error("useRoomContext must be used within a RoomProvider");
  }
  return context;
};
