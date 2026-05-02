export default function RoundHistory({ history }) {
  if (history.length === 0) return null;

  return (
    <div className="flex flex-col gap-1 w-72">
      <p className="text-xs text-gray-400 mb-1">Riwayat ronde</p>
      {history.map((round, i) => (
        <div
          key={i}
          className="flex justify-between items-center text-sm px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800"
        >
          <span className="text-gray-400">Ronde {i + 1}</span>
          <span className={
            round.result === "win" ? "text-green-500 font-medium" :
            round.result === "lose" ? "text-red-500 font-medium" :
            "text-yellow-500 font-medium"
          }>
            {round.result === "win"  ? "Menang" :
             round.result === "lose" ? `Kalah${round.reason === "timeout" ? " (timeout)" : round.reason === "surrender" ? " (menyerah)" : ""}` :
             "Draw"}
          </span>
        </div>
      ))}
    </div>
  );
}