import React from "react";
import { BsFillDoorClosedFill, BsFillDoorOpenFill } from "react-icons/bs";
import { useRoomContext } from "~/_context/room/RoomContext";

interface RoomOpenAndCloseProps {
  isOpen: boolean;
}

export const RoomOpenAndClose: React.FC<RoomOpenAndCloseProps> = ({
  isOpen,
}) => {
  const { handleOpenRoom, handleCloseRoom } = useRoomContext();
  return (
    <div>
      {isOpen ? (
        <button
          onClick={handleCloseRoom}
          type="button"
          className=" flex items-center rounded border border-solid border-green-500 bg-transparent px-4 py-2 text-xs font-bold uppercase text-green-500 outline-none transition-all duration-150 ease-linear hover:bg-green-500 hover:text-white focus:outline-none active:bg-green-600"
        >
          <BsFillDoorOpenFill className="mr-2" />
          Room Open
        </button>
      ) : (
        <button
          onClick={handleOpenRoom}
          type="button"
          className="flex items-center rounded border border-solid border-red-500 bg-transparent px-4 py-2 text-xs font-bold uppercase text-red-500 outline-none transition-all duration-150 ease-linear hover:bg-red-500 hover:text-white focus:outline-none active:bg-red-600"
        >
          <BsFillDoorClosedFill className="mr-2" />
          Room Closed
        </button>
      )}
    </div>
  );
};
