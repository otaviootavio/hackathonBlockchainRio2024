import { useRouter } from "next/router";
import Room from "./_components/Room";

const userProfile = {
  name: "John Doe",
  wallet: "0x1234567890",
  pix: "11 9876 54321",
};

const rooms = [
  {
    name: "Pizza Room",
    description: "Pizza Ordering Room",
    id: "1",
  },
  {
    name: "Coffee Room",
    description: "Coffee Ordering Room",
    id: "2",
  },
  {
    name: "Starbucks Room",
    description: "Starbucks Ordering Room",
    id: "3",
  },
  {
    name: "Burger Room",
    description: "Burger Ordering Room",
    id: "4",
  },
];

export default function Rooms() {
  const router = useRouter();

  return (
    <div className="flex h-screen flex-col items-center bg-blue-200">
      <div className="min-w-96 gap-4">
        <div className="rounded-lg border-2 bg-white p-4">
          <div className="mb-5 flex flex-row items-center justify-between">
            <p className="text-sm">{userProfile.name}</p>
            <p className="text-sm">{userProfile.wallet}</p>
            <p className="text-sm">{userProfile.pix}</p>
          </div>
          <div className="flex flex-row justify-between">
            <div>
              <h2 className="text-2xl font-bold">My Rooms</h2>
            </div>
            <div>
              <button
                type="button"
                className="mb-5 me-2 rounded-lg bg-blue-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                onClick={() => void router.push("/room/new")}
              >
                Create Room
              </button>
            </div>
          </div>
          <div className="flex flex-col gap-4">
            {rooms.map((room) => (
              <div key={room.id}>
                <Room room={room} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
