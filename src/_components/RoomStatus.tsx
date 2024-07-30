import React from "react";
import { useRoomContext } from "~/_context/pusher/room/RoomContext";

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
        onClick={handleSetReadyForSettlement}
      >
        <i className="fa fa-check" />
        Close the bill!
      </button>
    );
  }
  if (room.isReadyForSettlement && !hasEveryonePayed) {
    return <h2>Everyone has not paid yet!</h2>;
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
