export default function Participant({
  participant,
  removeParticipant,
}: {
  participant: { name: string; payed: boolean; id: string };
  removeParticipant: (participantId: string) => void;
}) {
  return (
    <div className="flex flex-row justify-between rounded-sm border border-gray-300 bg-white p-4">
      <div className="self-center">
        <h2 className="text-2xl font-bold">{participant.name}</h2>
        <button
          onClick={() => removeParticipant(participant.id)}
          type="button"
          className="me-2 rounded-full bg-red-500 p-1 px-2 text-xs font-medium text-white hover:bg-red-800 focus:outline-none focus:ring-4 focus:ring-red-300 dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-800"
        >
          Delete
        </button>
      </div>
      <div className="self-center">
        {participant.payed ? (
          <div className="rounded-lg bg-green-500 p-3">Ok!</div>
        ) : (
          <div className="bold bg-red-500 p-3 font-semibold text-white">
            Not payed!
          </div>
        )}
      </div>
    </div>
  );
}
