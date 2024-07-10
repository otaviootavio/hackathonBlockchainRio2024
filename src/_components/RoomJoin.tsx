import React from "react";

interface RoomOpenAndCloseProps {
  room: {
    isOpen: boolean;
  };
  joinRoom: () => void;
}

export const RoomJoin: React.FC<RoomOpenAndCloseProps> = ({
  room,
  joinRoom,
}) => {
  return (
    <div className="mt-1 bg-slate-100 p-1">
      <div className="flex flex-row justify-center rounded-lg">
        {room?.isOpen ? (
          <button
            onClick={joinRoom}
            type="button"
            className="rounded-lg bg-blue-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
          >
            Join room
          </button>
        ) : (
          <div className="rounded-full bg-red-400 px-5 py-2.5 text-center font-bold text-white">
            <p>Closed</p>
          </div>
        )}
      </div>
    </div>
  );
};
