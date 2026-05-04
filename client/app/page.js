"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/lib/useAuthStore";
import { getRank } from "@/components/RankBadge";
import Avatar from "@/components/Avatar";
import GamePanel from "@/components/GamePanel";
import FriendMiniProfile from "@/components/FriendMiniProfile";
import api from "@/lib/api";
import { useSocket } from "@/lib/useSocket";

const MODES = [
  { id: "bot",    icon: "🤖", title: "VS Bot",   desc: "Lawan komputer",         available: true },
  { id: "ranked", icon: "🏆", title: "Ranked",   desc: "Lawan pemain, +/- poin", available: true },
  { id: "friend", icon: "👥", title: "VS Teman", desc: "Tantang teman",           available: true },
];

export default function Home() {
  const { user, isLoading } = useAuthStore();
  const { socket, onlineCount } = useSocket();

  const [activeMode,      setActiveMode]      = useState(null);
  const [friendMatchData, setFriendMatchData] = useState(null);
  const [leaderboard,     setLeaderboard]     = useState([]);
  const [loadingLB,       setLoadingLB]       = useState(true);
  const [showAllLB,       setShowAllLB]       = useState(false);
  const [friends,         setFriends]         = useState([]);
  const [selectedFriend,  setSelectedFriend]  = useState(null);
  const [onlineFriendIds, setOnlineFriendIds] = useState(new Set());

  const rank = user ? getRank(user.points) : null;

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const friendGame = params.get("friendGame");
    if (friendGame) {
      try {
        const matchData = JSON.parse(decodeURIComponent(friendGame));
        setActiveMode("friend");
        setFriendMatchData(matchData);
        window.history.replaceState({}, "", "/");
      } catch {}
    }
  }, []);

  useEffect(() => {
    api.get("/api/user/leaderboard")
      .then((res) => setLeaderboard(res.data))
      .catch(() => {})
      .finally(() => setLoadingLB(false));
  }, []);

  useEffect(() => {
    if (!user) return;
    api.get("/api/friends/list")
      .then((res) => setFriends(res.data))
      .catch(() => {});
  }, [user]);

  useEffect(() => {
    if (!socket || !user) return;
    socket.emit("friends:getOnline");
    socket.on("friends:onlineList", (ids) => {
      setOnlineFriendIds(new Set(ids));
    });
    return () => {
      socket.off("friends:onlineList");
    };
  }, [socket, user]);

  function handleChallengeFromHome(friend) {
    socket?.emit("friends:challenge", { toUserId: friend.id });
  }

  const isMobileGame = activeMode === "bot" ||
                       activeMode === "ranked" ||
                       activeMode === "friend";

  return (
    <div className="flex flex-col lg:flex-row gap-3 h-full">

      {/* KOLOM KIRI */}
      <aside className={`lg:w-56 flex-shrink-0 flex flex-col gap-3 ${isMobileGame ? "hidden lg:flex" : "flex"}`}>

        {!isLoading && (
          user ? (
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-4 flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <Avatar id={user.avatarId || "knight"} size={48} />
                <div className="min-w-0">
                  <p className="font-semibold truncate">{user.username}</p>
                  <p className="text-xs text-gray-500">{rank.icon} {rank.name} · {user.points} pts</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs text-center">
                <div className="bg-gray-50 dark:bg-gray-800 rounded-xl py-2">
                  <p className="font-bold text-green-500 text-sm">{user.wins}</p>
                  <p className="text-gray-400">Menang</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-xl py-2">
                  <p className="font-bold text-red-500 text-sm">{user.losses}</p>
                  <p className="text-gray-400">Kalah</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-xl py-2">
                  <p className="font-bold text-yellow-500 text-sm">{user.draws}</p>
                  <p className="text-gray-400">Draw</p>
                </div>
              </div>
              <a href="/profile" className="text-xs text-center text-blue-500 hover:underline">
                Lihat Profil →
              </a>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-4 flex flex-col gap-2 text-center">
              <p className="text-sm text-gray-500">Login untuk simpan progress</p>
              <a href="/login" className="text-sm py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl transition-colors">Login</a>
              <a href="/register" className="text-xs text-blue-500 hover:underline">Belum punya akun? Daftar</a>
            </div>
          )
        )}

        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-3 flex flex-col gap-1">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-widest px-2 py-1">Mode Main</p>
          {MODES.map((mode) => (
            <button
              key={mode.id}
              onClick={() => mode.available && setActiveMode(mode.id)}
              disabled={!mode.available}
              className={`w-full text-left px-3 py-2.5 rounded-xl flex items-center gap-3 transition-all text-sm
                ${!mode.available ? "opacity-40 cursor-not-allowed" : ""}
                ${activeMode === mode.id
                  ? "bg-blue-500 text-white"
                  : mode.available
                    ? "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
                    : "text-gray-400"}`}
            >
              <span className="text-xl">{mode.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="font-medium leading-tight">{mode.title}</p>
                <p className={`text-xs ${activeMode === mode.id ? "text-blue-100" : "text-gray-400"}`}>
                  {mode.desc}
                </p>
              </div>
              {!mode.available && (
                <span className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-400 px-1.5 py-0.5 rounded-full">Soon</span>
              )}
            </button>
          ))}
        </div>

      </aside>

      {/* KOLOM TENGAH */}
      <main className="flex-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden flex flex-col min-h-[500px] lg:min-h-0">
        <GamePanel
          activeMode={activeMode}
          onExit={() => { setActiveMode(null); setFriendMatchData(null); }}
          friendMatchData={friendMatchData}
        />
      </main>

      {/* KOLOM KANAN */}
      <aside className={`lg:w-56 flex-shrink-0 flex flex-col gap-3 ${isMobileGame ? "hidden lg:flex" : "flex"}`}>

        {/* Leaderboard */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
            <p className="text-xs font-medium text-gray-400 uppercase tracking-widest">Leaderboard</p>
          </div>
          <div className="flex flex-col">
            {loadingLB ? (
              Array(5).fill(0).map((_, i) => (
                <div key={i} className="px-4 py-2.5 flex items-center gap-2 border-b border-gray-50 dark:border-gray-800/50 last:border-0">
                  <div className="w-4 h-3 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
                  <div className="w-6 h-6 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
                  <div className="flex-1 h-3 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
                  <div className="w-10 h-3 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
                </div>
              ))
            ) : leaderboard.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-6">Belum ada pemain</p>
            ) : (
              (showAllLB ? leaderboard : leaderboard.slice(0, 10)).map((p, i) => {
                const r = getRank(p.points);
                return (
                  <div key={p.id} className="px-3 py-2 flex items-center gap-2 text-sm border-b border-gray-50 dark:border-gray-800/50 last:border-0">
                    <span className="text-xs text-gray-400 w-4 font-mono flex-shrink-0">{i + 1}</span>
                    <Avatar id={p.avatarId || "knight"} size={24} />
                    <span className="flex-1 truncate text-xs font-medium">{p.username}</span>
                    <span className="text-xs text-blue-500 font-medium flex-shrink-0">{p.points}</span>
                  </div>
                );
              })
            )}
          </div>
          {!loadingLB && leaderboard.length > 10 && (
            <button
              onClick={() => setShowAllLB((v) => !v)}
              className="w-full px-4 py-2 text-xs text-blue-500 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors border-t border-gray-100 dark:border-gray-800"
            >
              {showAllLB ? "Sembunyikan ↑" : `Lihat semua (${leaderboard.length}) →`}
            </button>
          )}
        </div>

        {/* Friend list */}
        {user && (
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <p className="text-xs font-medium text-gray-400 uppercase tracking-widest">Teman</p>
              <a href="/friends" className="text-xs text-blue-500 hover:underline">Kelola →</a>
            </div>
            {friends.length === 0 ? (
              <div className="px-4 py-4 text-center">
                <p className="text-xs text-gray-400">Belum ada teman</p>
                <a href="/friends" className="text-xs text-blue-500 hover:underline mt-1 block">Tambah teman</a>
              </div>
            ) : (
              <div className="flex flex-col">
                {friends.slice(0, 5).map((f) => {
                  const r = getRank(f.points);
                  const isOnline = onlineFriendIds.has(f.id);
                  return (
                    <div
                      key={f.id}
                      onClick={() => setSelectedFriend(f)}
                      className="px-3 py-2.5 flex items-center gap-2 border-b border-gray-50 dark:border-gray-800/50 last:border-0 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                    >
                      <div className="relative flex-shrink-0">
                        <Avatar id={f.avatarId || "knight"} size={28} />
                        {isOnline && (
                          <span className="absolute bottom-0 right-0 w-2 h-2 bg-green-400 rounded-full border border-white dark:border-gray-900" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium truncate">{f.username}</p>
                        <p className="text-xs text-gray-400">
                          {isOnline
                            ? <span className="text-green-400">● Online</span>
                            : <span>{r.icon} {r.name}</span>
                          }
                        </p>
                      </div>
                      {isOnline && (
                        <button
                          onClick={(e) => { e.stopPropagation(); handleChallengeFromHome(f); }}
                          className="text-xs px-2 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors flex-shrink-0"
                        >
                          ⚔️
                        </button>
                      )}
                    </div>
                  );
                })}
                {friends.length > 5 && (
                  <a
                    href="/friends"
                    className="px-4 py-2 text-xs text-blue-500 text-center hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors border-t border-gray-100 dark:border-gray-800 block"
                  >
                    Lihat semua ({friends.length}) →
                  </a>
                )}
              </div>
            )}
          </div>
        )}

        {/* Online count */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-4">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-widest mb-2">Online</p>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse flex-shrink-0" />
            <p className="text-xs text-gray-500">{onlineCount} pemain online</p>
          </div>
        </div>

      </aside>

      {selectedFriend && (
        <FriendMiniProfile
          friend={selectedFriend}
          onChallenge={handleChallengeFromHome}
          onClose={() => setSelectedFriend(null)}
        />
      )}

    </div>
  );
}