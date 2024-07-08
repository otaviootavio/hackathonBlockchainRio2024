import { useRouter } from "next/router";

export default function NewRoom() {
  const router = useRouter();
  const handleSubmit = () => {
    const sleep = (ms = 1000) => new Promise((r) => setTimeout(r, ms));
    sleep(3000).then(() => router.push("/rooms"));
  };
  return (
    <div className="flex h-screen min-w-96 flex-col items-center bg-blue-200">
      <div className="min-w-96 gap-4">
        <div className="rounded-lg border-2 bg-white p-4">
          <div className="flex flex-row justify-between">
            <div>
              <h2 className="text-2xl font-bold">Create Room</h2>
            </div>
          </div>
          <div className="flex flex-col">
            <div>
              <label htmlFor="roomName" className="block text-gray-700">
                Room Name
              </label>
              <input
                type="text"
                id="roomName"
                className="mb-2 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="roomPrice" className="block text-gray-700">
                Room Price (in ETH)
              </label>
              <input
                type="text"
                id="roomName"
                className="mb-2 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="roomDescription" className="block text-gray-700">
                Room Description
              </label>
              <textarea
                id="roomDescription"
                className="mb-2 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
              />
            </div>
          </div>
          <button
            type="button"
            className=" me-2 rounded-lg bg-blue-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
            onClick={handleSubmit}
          >
            Create Room
          </button>
        </div>
      </div>
    </div>
  );
}
