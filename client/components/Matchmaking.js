"use client";

import { useState, useEffect, useRef } from "react";
import Avatar from "./Avatar";

export default function Matchmaking({ socket, user, onMatched, onCancel }) {
  const [seconds, setSeconds] = useState(0);
  const [dots, setDots] = useState(".");
  const intervalRef = useRef(null);

  useEffect(() => {
    // Join queue
    socket.emit("matchmaking:join");

    // Timer naik
    intervalRef.current = setInterval(() => {
      setSeconds((s) => s + 1);
      setDots((d) => d.length >= 3 ? "." : d + ".");
    }, 1000);

    // Listener matched
    socket.on("matchmaking:matched", (data) => {
      clearInterval(intervalRef.current);
      onMatched(data);
    });

    socket.on("matchmaking:error", ({ message }) => {
      clearInterval(intervalRef.current);
      alert(message);
      onCancel();
    });

    return () => {
      clearInterval(intervalRef.current);
      socket.off("matchmaking:matched");
      socket.off("matchmaking:error");
    };
  }, []);

  function handleCancel() {
    socket.emit("matchmaking:cancel");
    clearInterval(intervalRef.current);
    onCancel();
  }

  const pad = (n) => String(n).padStart(2, "0");
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;

  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-6 p-8">

      {/* Animasi loading */}
      <div className="relative">
        <div className="w-24 h-24 rounded-2xl overflow-hidden border-4 border-blue-500 animate-pulse">
          <Avatar id={user?.avatarId || "knight"} size={96} />
        </div>
        {/* Ring animasi */}
        <div className="absolute inset-0 rounded-2xl border-4 border-blue-400 animate-ping opacity-30" />
      </div>

      <div className="text-center">
        <p className="text-lg font-semibold">Mencari lawan{dots}</p>
        <p className="text-gray-400 text-sm mt-1">
          {user?.username} · {user?.points} pts
        </p>
      </div>

      {/* Timer */}
      <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl px-8 py-4 text-center">
        <p className="text-3xl font-mono font-bold text-blue-500">
          {pad(mins)}:{pad(secs)}
        </p>
        <p className="text-xs text-gray-400 mt-1">Waktu mencari</p>
      </div>

      <button
        onClick={handleCancel}
        className="px-6 py-2.5 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 rounded-xl text-sm font-medium transition-colors"
      >
        Batalkan
      </button>
    </div>
  );
}