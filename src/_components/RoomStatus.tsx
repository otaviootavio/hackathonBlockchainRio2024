import React from "react";

interface RoomStatusProps {
  room: {
    isOpen: boolean;
    isReadyForSettlement: boolean;
    hasSettled: boolean;
  };
  handleSettleRoom: () => void;
  handleSetReadyForSettlement: () => void;
}

const RoomStatus: React.FC<RoomStatusProps> = ({
  room,
  handleSettleRoom,
  handleSetReadyForSettlement,
}) => {
  const RenderButton = () => {
    if (!room.isReadyForSettlement && !room.hasSettled) {
      return (
        <button
          className="  rounded border border-solid border-red-500 bg-transparent px-4 py-2 text-xs font-bold uppercase text-red-500 outline-none transition-all duration-150 ease-linear hover:bg-red-500 hover:text-white focus:outline-none active:bg-red-600"
          onClick={handleSetReadyForSettlement}
        >
          <i className="fa fa-check" />
          Set Ready for Settlement
        </button>
      );
    }
    if (room.isReadyForSettlement) {
      return (
        <button
          className="  rounded border border-solid border-red-500 bg-transparent px-4 py-2 text-xs font-bold uppercase text-red-500 outline-none transition-all duration-150 ease-linear hover:bg-red-500 hover:text-white focus:outline-none active:bg-red-600"
          onClick={handleSettleRoom}
        >
          <i className="fa fa-check" />
          Settle Room
        </button>
      );
    }

    if (room.hasSettled) {
      return (
        <button
          className="  rounded border border-solid border-red-500 bg-transparent px-4 py-2 text-xs font-bold uppercase text-red-500 outline-none transition-all duration-150 ease-linear hover:bg-red-500 hover:text-white focus:outline-none active:bg-red-600"
          onClick={handleSettleRoom}
        >
          <i className="fa fa-check" />
          Settle Room
        </button>
      );
    }
  };

  return (
    <div className="bg-slate-100 p-1">
      <div className="rounded-sm border border-gray-300 bg-white ">
        <div className=" flex flex-row items-center justify-between gap-2 p-4">
          <div>
            <strong>
              {!room.isReadyForSettlement && !room.hasSettled && "Free Room"}
              {room.hasSettled && "Settled"}
              {room.isReadyForSettlement && "Ready to Settle"}
            </strong>
          </div>
          <div>
            <RenderButton />
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomStatus;
