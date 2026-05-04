"use client";

import { useState, useEffect, useRef } from "react";
import Avatar from "./Avatar";

export default function ChallengeToast({ challenge, onAccept, onDecline, onClose }) {
  const [timeLeft, setTimeLeft] = useState(300); // 5 menit
  const timerRef = useRef(null);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          onClose(); // expired
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, []);

  const mins = Math.floor(timeLeft / 60);
  const secs = String(timeLeft % 60).padStart(2, "0");

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-in slide-in-from-bottom-4">
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl p-4 w-72 flex flex-col gap-3">

        {/* Header */}
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-widest">
            Tantangan Masuk
          </p>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-lg leading-none"
          >
            ×
          </button>
        </div>

        {/* Player info */}
        <div className="flex items-center gap-3">
          <Avatar id={challenge.from.avatarId || "knight"} size={48} />
          <div>
            <p className="font-semibold">{challenge.from.username}</p>
            <p className="text-xs text-gray-400">menantangmu bermain</p>
          </div>
        </div>

        {/* Timer */}
        <div className="flex items-center gap-1.5 text-xs text-gray-400">
          <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" />
          <span>Kedaluwarsa dalam {mins}:{secs}</span>
        </div>

        {/* Tombol */}
        <div className="flex gap-2">
          <button
            onClick={onDecline}
            className="flex-1 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-xl text-sm font-medium transition-colors"
          >
            Tolak
          </button>
          <button
            onClick={onAccept}
            className="flex-1 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-sm font-medium transition-colors"
          >
            Terima ⚔️
          </button>
        </div>

      </div>
    </div>
  );
}