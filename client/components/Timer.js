"use client";

import { useEffect, useState, useRef } from "react";

/**
 * @param {number} duration - detik total (default 15)
 * @param {boolean} isActive - jalan atau tidak
 * @param {function} onTimeout - callback kalau habis
 * @param {any} resetKey - kalau value ini berubah, timer reset
 */
export default function Timer({ duration = 15, isActive, onTimeout, resetKey }) {
  const [timeLeft, setTimeLeft] = useState(duration);
  const onTimeoutRef = useRef(onTimeout);

  // update ref tiap render biar tidak stale closure
  useEffect(() => {
    onTimeoutRef.current = onTimeout;
  });

  // reset kalau giliran ganti atau game reset
  useEffect(() => {
    setTimeLeft(duration);
  }, [resetKey, duration]);

  useEffect(() => {
    if (!isActive) return;

    if (timeLeft <= 0) {
      onTimeoutRef.current();
      return;
    }

    const tick = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearTimeout(tick);
  }, [timeLeft, isActive]);

  const percentage = (timeLeft / duration) * 100;

  const barColor =
    timeLeft > 10 ? "bg-green-400" :
    timeLeft > 5  ? "bg-yellow-400" :
                    "bg-red-500";

  return (
    <div className="w-72 flex flex-col gap-1">
      <div className="flex justify-between text-xs text-gray-400">
        <span>Waktu</span>
        <span className={timeLeft <= 5 ? "text-red-500 font-bold" : ""}>{timeLeft}s</span>
      </div>
      <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-1000 ${barColor}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}