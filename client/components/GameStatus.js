export default function GameStatus({ winner, isDraw, isPlayerTurn, lostByTimeout, surrendered }) {
  if (surrendered) {
    return <p className="text-xl font-semibold text-center">🏳️ Kamu menyerah.</p>;
  }

  if (lostByTimeout) {
    return <p className="text-xl font-semibold text-center text-red-500">⏰ Waktu habis! Bot menang.</p>;
  }

  if (winner) {
    return (
      <p className="text-xl font-semibold text-center">
        {winner === "X" ? "🎉 Kamu menang!" : "🤖 Bot menang!"}
      </p>
    );
  }

  if (isDraw) {
    return <p className="text-xl font-semibold text-center">🤝 Draw!</p>;
  }

  return (
    <p className="text-xl text-center text-gray-600 dark:text-gray-300">
      {isPlayerTurn ? "Giliran kamu (X)" : "Bot lagi mikir... 🤔"}
    </p>
  );
}