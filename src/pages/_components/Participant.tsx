export default function Participant({
  participant,
}: {
  participant: { name: string; payed: boolean; id: string };
}) {
  return (
    <div className="flex flex-row justify-between rounded-sm border border-gray-300 bg-white p-4">
      <div className="self-center">
        <h2 className="text-2xl font-bold">{participant.name}</h2>
      </div>
      <div className="self-center">
        {participant.payed ? (
          <div className="rounded-lg bg-green-500 p-3">Ok!</div>
        ) : (
          <div className="bold rounded-lg bg-red-500 p-3 font-semibold text-white">
            Not payed!
          </div>
        )}
      </div>
    </div>
  );
}
