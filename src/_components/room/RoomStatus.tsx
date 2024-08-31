import Link from "next/link";
import React from "react";
import { useRoomContext } from "~/_context/room/RoomContext";
import { OwnerWalletNotFoundError } from "~/_errors/OwnerWalletNotFound";
import { useModal } from "~/_hooks/useModal";

interface RoomStatusProps {
  room: {
    isOpen: boolean;
    isReadyForSettlement: boolean;
    hasSettled: boolean;
  };
  hasEveryonePayed: boolean;
  isUserOwner: boolean;
}

const RenderButton = ({
  isUserOwner,
  room,
  hasEveryonePayed,
}: {
  hasEveryonePayed: boolean;
  isUserOwner: boolean;
  room: {
    isOpen: boolean;
    isReadyForSettlement: boolean;
    hasSettled: boolean;
  };
}) => {
  const { handleSetReadyForSettlement, handleSettleRoom } = useRoomContext();
  const { showModal } = useModal();

  const handleClickToSettleRoom = async () => {
    try {
      await handleSetReadyForSettlement();
    } catch (error) {
      if (error instanceof OwnerWalletNotFoundError) {
        showModal(
          "info",
          <div className="flex flex-col gap-2">
            <div>
              <p>Add a payment method!</p>
            </div>
            <div>
              <Link
                className="inline-flex w-28 items-center justify-center rounded bg-blue-500 p-2 px-2 text-xs font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-1 focus:ring-blue-300 "
                href="/update-payment-method/1"
              >
                Add Payment
              </Link>
            </div>
          </div>,
        );
      } else {
        console.error(error);
      }
    }
  };

  if (!isUserOwner) {
    return <></>;
  }
  if (room.hasSettled) {
    return <></>;
  }
  if (!room.isReadyForSettlement && !room.hasSettled) {
    return (
      <button
        className="  rounded border border-solid border-red-500 bg-transparent px-4 py-2 text-xs font-bold uppercase text-red-500 outline-none transition-all duration-150 ease-linear hover:bg-red-500 hover:text-white focus:outline-none active:bg-red-600"
        onClick={handleClickToSettleRoom}
      >
        <i className="fa fa-check" />
        Close the bill!
      </button>
    );
  }
  if (room.isReadyForSettlement && !hasEveryonePayed) {
    return <h2>Payments still pending</h2>;
  }
  if (room.isReadyForSettlement && hasEveryonePayed) {
    return (
      <button
        className="  rounded border border-solid border-red-500 bg-transparent px-4 py-2 text-xs font-bold uppercase text-red-500 outline-none transition-all duration-150 ease-linear hover:bg-red-500 hover:text-white focus:outline-none active:bg-red-600"
        onClick={handleSettleRoom}
      >
        <i className="fa fa-check" />
        End the room!
      </button>
    );
  }
};

const RoomStatus: React.FC<RoomStatusProps> = ({
  room,
  hasEveryonePayed,
  isUserOwner,
}) => {
  return (
    <div className="p-2">
      <div className="flex flex-col gap-2 rounded-md border border-slate-300 bg-slate-50 ">
        <div className="flex flex-row items-center justify-between p-2">
          <div>
            <div className="text-xs  text-slate-600">Status:</div>
            <strong>
              {!room.isReadyForSettlement && !room.hasSettled && (
                <>
                  <h2>Eating Pizza!</h2>
                </>
              )}
              {room.isReadyForSettlement && !room.hasSettled && (
                <>
                  <h2>Payment Time!</h2>
                </>
              )}
              {room.hasSettled && (
                <>
                  <h2>This room is settled!</h2>
                </>
              )}
            </strong>
          </div>

          <div>
            <RenderButton
              {...{
                isUserOwner,
                room,
                hasEveryonePayed,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomStatus;
