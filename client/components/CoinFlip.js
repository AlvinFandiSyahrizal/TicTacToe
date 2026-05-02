"use client";

import { useEffect, useState } from "react";

/**
 * @param {"X"|"O"} result - hasil flip
 * @param {function} onDone - callback setelah animasi selesai
 */
export default function CoinFlip({ result, onDone }) {
  const [phase, setPhase] = useState("flipping"); // "flipping" | "result"

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("result"), 1200);
    const t2 = setTimeout(() => onDone(), 2400);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-10 flex flex-col items-center gap-4 shadow-2xl">
        {phase === "flipping" ? (
          <>
            <div className="text-6xl animate-bounce">🪙</div>
            <p className="text-gray-500 text-sm">Melempar koin...</p>
          </>
        ) : (
          <>
            <div className="text-5xl">{result === "X" ? "🧑" : "🤖"}</div>
            <p className="text-xl font-bold">
              {result === "X" ? "Kamu jalan pertama!" : "Bot jalan pertama!"}
            </p>
          </>
        )}
      </div>
    </div>
  );
}