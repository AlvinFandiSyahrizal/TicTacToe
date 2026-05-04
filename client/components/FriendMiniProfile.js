"use client";

import { useEffect, useState } from "react";
import Avatar from "./Avatar";
import { getRank } from "./RankBadge";
import api from "@/lib/api";

export default function FriendMiniProfile({ friend, onChallenge, onClose }) {
  const [stats, setStats] = useState(null);
  const rank = getRank(friend.points);

  useEffect(() => {
    api.get(`/api/friends/stats/${friend.id}`)
      .then((res) => setStats(res.data))
      .catch(() => {});
  }, [friend.id]);

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 w-full max-w-xs flex flex-col gap-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Avatar + info */}
        <div className="flex items-center gap-4">
          <Avatar id={friend.avatarId || "knight"} size={64} />
          <div>
            <p className="font-bold text-lg leading-tight">{friend.username}</p>
            <p className="text-sm text-gray-500">
              {rank.icon} {rank.name}
            </p>
            <p className="text-xs text-gray-400">{friend.points} poin</p>
          </div>
        </div>

        {/* Ranked stats */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3">
          <p className="text-xs text-gray-400 mb-2 font-medium">Ranked Stats</p>
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div>
              <p className="font-bold text-green-500 text-base">{friend.wins ?? 0}</p>
              <p className="text-gray-400">Menang</p>
            </div>
            <div>
              <p className="font-bold text-red-500 text-base">{friend.losses ?? 0}</p>
              <p className="text-gray-400">Kalah</p>
            </div>
            <div>
              <p className="font-bold text-yellow-500 text-base">{friend.draws ?? 0}</p>
              <p className="text-gray-400">Draw</p>
            </div>
          </div>
        </div>

        {/* H2H stats */}
        <div className="bg-blue-50 dark:bg-blue-950/30 rounded-xl p-3">
          <p className="text-xs text-gray-400 mb-2 font-medium">
            Head-to-Head (kamu vs dia)
          </p>
          {!stats ? (
            <p className="text-xs text-gray-400 text-center py-1">Memuat...</p>
          ) : stats.total === 0 ? (
            <p className="text-xs text-gray-400 text-center py-1">
              Belum pernah main bareng
            </p>
          ) : (
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div>
                <p className="font-bold text-green-500 text-base">{stats.win}</p>
                <p className="text-gray-400">Menang</p>
              </div>
              <div>
                <p className="font-bold text-red-500 text-base">{stats.lose}</p>
                <p className="text-gray-400">Kalah</p>
              </div>
              <div>
                <p className="font-bold text-yellow-500 text-base">{stats.draw}</p>
                <p className="text-gray-400">Draw</p>
              </div>
            </div>
          )}
        </div>

        {/* Tombol */}
        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-xl text-sm font-medium transition-colors"
          >
            Tutup
          </button>
          <button
            onClick={() => { onChallenge(friend); onClose(); }}
            className="flex-1 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-sm font-medium transition-colors"
          >
            ⚔️ Tantang
          </button>
        </div>
      </div>
    </div>
  );
}