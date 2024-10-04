import Link from "next/link";
import React from "react";
import { useRoomContext } from "~/_context/room/RoomContext";
import { OwnerWalletNotFoundError } from "~/_errors/OwnerWalletNotFound";
import { useModal } from "~/_hooks/useModal";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { InfoCircledIcon } from "@radix-ui/react-icons";
import { Skeleton } from "~/components/ui/skeleton";

const RenderButton = () => {
  const {
    roomData: room,
    hasEveryonePayed,
    isUserOwner,
    handleSetReadyForSettlement,
    handleSettleRoom,
  } = useRoomContext();
  const { showModal } = useModal();

  const handleClickToSettleRoom = async () => {
    try {
      await handleSetReadyForSettlement();
    } catch (error) {
      if (error instanceof OwnerWalletNotFoundError) {
        showModal(
          "info",
          <div className="flex flex-col gap-2">
            <p>Add a payment method!</p>
            <Link href="/update-payment-method/1">
              <Button>Add Payment</Button>
            </Link>
          </div>,
        );
      } else {
        console.error(error);
      }
    }
  };

  if (!room) return null;
  if (!isUserOwner || room.hasSettled) return null;

  if (!room.isReadyForSettlement) {
    return (
      <Button variant="destructive" onClick={handleClickToSettleRoom}>
        Close the bill!
      </Button>
    );
  }

  if (room.isReadyForSettlement && !hasEveryonePayed) {
    return (
      <Alert>
        <InfoCircledIcon className="h-4 w-4" />
        <AlertTitle>Payments Pending</AlertTitle>
        <AlertDescription>
          Some participants haven&apos;t paid yet.
        </AlertDescription>
      </Alert>
    );
  }

  if (room.isReadyForSettlement && hasEveryonePayed) {
    return (
      <Button variant="destructive" onClick={handleSettleRoom}>
        End the room!
      </Button>
    );
  }
};

const RoomStatus = () => {
  const { roomData: room } = useRoomContext();

  if (!room) return <Skeleton className="h-20 w-full" />;

  return (
    <Card>
      <CardContent className="p-4">
        <Alert>
          <InfoCircledIcon className="h-4 w-4" />
          <AlertTitle>Room Status</AlertTitle>
          <AlertDescription>
            {!room.isReadyForSettlement && !room.hasSettled && "Eating Pizza!"}
            {room.isReadyForSettlement && !room.hasSettled && "Payment Time!"}
            {room.hasSettled && "This room is settled!"}
          </AlertDescription>
        </Alert>
        <div className="mt-4 flex justify-end">
          <RenderButton />
        </div>
      </CardContent>
    </Card>
  );
};

export default RoomStatus;
