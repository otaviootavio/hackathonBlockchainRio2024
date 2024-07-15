import React from "react";

interface RoomStatusProps {
  room: {
    isOpen: boolean;
    isReadyForSettlement: boolean;
    hasSettled: boolean;
  };
  handleSettleRoom: () => void;
  handleSetReadyForSettlement: () => void;
  hasEveryonePayed: boolean;
  isUserOwner: boolean;
}

const RenderButton = ({
  isUserOwner,
  room,
  handleSettleRoom,
  handleSetReadyForSettlement,
  hasEveryonePayed,
}: {
  hasEveryonePayed: boolean;
  handleSetReadyForSettlement: () => void;
  isUserOwner: boolean;
  room: {
    isOpen: boolean;
    isReadyForSettlement: boolean;
    hasSettled: boolean;
  };
  handleSettleRoom: () => void;
}) => {
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
  handleSettleRoom,
  handleSetReadyForSettlement,
  hasEveryonePayed,
  isUserOwner,
}) => {
  return (
    <div className="bg-slate-100 p-1">
      <div className="rounded-sm border border-gray-300 bg-white ">
        <div className=" flex flex-row items-center justify-between gap-2 p-4">
          <div>
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
                handleSettleRoom,
                handleSetReadyForSettlement,
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
