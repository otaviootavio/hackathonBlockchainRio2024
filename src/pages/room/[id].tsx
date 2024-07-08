import Participant from "../_components/Participant";

const room = {
  name: "Pizza Room",
  description: "Pizza Ordering Room",
  id: "1",
  totalPrice: 100,
  paymentInfo: {
    payTo: "John Doe",
    type: "pix",
    inputType: "phone",
    inputValue: "11 9876 54321",
  },
  participants: [
    {
      name: "John Doe",
      payed: false,
      id: "1",
    },
    {
      name: "Yan Li",
      payed: false,
      id: "2",
    },
    {
      name: "Sam Foo",
      payed: false,
      id: "3",
    },
  ],
};
type Room = typeof room;

export default function Room() {
  return (
    <div className="flex h-screen flex-col items-center bg-blue-200">
      <div className="min-w-96 gap-4">
        <div className="rounded-lg border-2 bg-white p-4">
          <div className="flex flex-row justify-between ">
            <div>
              <h2 className="text-2xl font-bold">{room.name}</h2>
              <p className="text-lg">{room.description}</p>
            </div>
            <button
              type="button"
              className="mb-5 me-2 rounded-lg bg-blue-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
            >
              Join
            </button>
          </div>
          <div>
            <h2>Participants</h2>
            <div className="flex flex-col gap-4">
              {room.participants.map((participant) => (
                <div key={participant.id}>
                  <Participant participant={participant} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
