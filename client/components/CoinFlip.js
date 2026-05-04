"use client";

import { useEffect, useState } from "react";
import Avatar from "./Avatar";

/**
 * @param {"player1"|"player2"} firstPlayer - siapa yang jalan pertama
 * @param {{ username: string, avatarId: string }} player1 - data player 1
 * @param {{ username: string, avatarId: string }} player2 - data player 2 (null kalau vs bot)
 * @param {string} myId - id user saat ini (untuk online mode)
 * @param {function} onDone - callback setelah animasi selesai
 */
export default function CoinFlip({ firstPlayer, player1, player2, myId, onDone }) {
  const [phase, setPhase] = useState("flipping"); // "flipping" | "spinning" | "result"

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("spinning"), 800);
    const t2 = setTimeout(() => setPhase("result"), 2000);
    const t3 = setTimeout(() => onDone(), 3500);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  // Tentukan teks hasil
  function getResultText() {
    if (!player2) {
      // VS Bot
      return firstPlayer === "X" ? "Kamu jalan pertama!" : "Bot jalan pertama!";
    }
    // VS Player online
    const firstPlayerData = firstPlayer === player1?.id ? player1 : player2;
    if (myId) {
      return firstPlayer === myId ? "Kamu jalan pertama!" : `${firstPlayerData?.username} jalan pertama`;
    }
    return `${firstPlayerData?.username} jalan pertama`;
  }

  function getResultAvatar() {
    if (!player2) {
      return firstPlayer === "X"
        ? <span className="text-5xl">🧑</span>
        : <span className="text-5xl">🤖</span>;
    }
    const firstPlayerData = firstPlayer === player1?.id ? player1 : player2;
    return <Avatar id={firstPlayerData?.avatarId || "knight"} size={64} />;
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 rounded-2xl px-12 py-10 flex flex-col items-center gap-5 shadow-2xl min-w-[260px]">

        {phase === "flipping" && (
          <>
            <div className="text-7xl">🪙</div>
            <p className="text-gray-400 text-sm font-medium">Melempar koin...</p>
          </>
        )}

        {phase === "spinning" && (
          <>
            <div
              className="text-7xl"
              style={{
                animation: "spin 0.3s linear infinite",
                display: "inline-block",
              }}
            >
              🪙
            </div>
            <p className="text-gray-400 text-sm font-medium">Menentukan siapa duluan...</p>
            <style>{`
              @keyframes spin {
                0%   { transform: rotateY(0deg) scale(1); }
                50%  { transform: rotateY(90deg) scale(0.8); }
                100% { transform: rotateY(180deg) scale(1); }
              }
            `}</style>
          </>
        )}

        {phase === "result" && (
          <>
            <div className="flex flex-col items-center gap-3 animate-bounce-once">
              {getResultAvatar()}
              <div className="text-center">
                <p className="text-xl font-bold">{getResultText()}</p>
                <p className="text-xs text-gray-400 mt-1">Game dimulai...</p>
              </div>
            </div>
          </>
        )}

      </div>
    </div>
  );
}