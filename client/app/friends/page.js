"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/useAuthStore";
import { useSocket } from "@/lib/useSocket";
import Avatar from "@/components/Avatar";
import { getRank } from "@/components/RankBadge";
import api from "@/lib/api";
import FriendMiniProfile from "@/components/FriendMiniProfile";

export default function FriendsPage() {
  const { user, isLoading } = useAuthStore();
  const { socket } = useSocket();
  const router = useRouter();

  const [tab, setTab]           = useState("friends"); // friends | pending | add
  const [friends, setFriends]   = useState([]);
  const [pending, setPending]   = useState([]);
  const [searchVal, setSearchVal] = useState("");
  const [searchMsg, setSearchMsg] = useState({ type: "", text: "" });
  const [loading, setLoading]   = useState(false);
  const [challenge, setChallenge] = useState(null); // incoming challenge

  const [selectedFriend, setSelectedFriend] = useState(null);
  const [challengeSent, setChallengeSent]   = useState(null);

  useEffect(() => {
    if (!isLoading && !user) router.push("/login");
  }, [user, isLoading]);

  useEffect(() => {
    if (!user) return;
    fetchFriends();
    fetchPending();
  }, [user]);

  // Listener notifikasi realtime
  useEffect(() => {
    if (!socket) return;

    socket.on("friends:notification", ({ type, data }) => {
      if (type === "newRequest") {
        setPending((p) => [...p, data]);
      }
      if (type === "accepted") {
        setFriends((p) => [...p, data]);
      }
    });

    return () => {
      socket.off("friends:notification");
    };
  }, [socket]);

  async function fetchFriends() {
    try {
      const res = await api.get("/api/friends/list");
      setFriends(res.data);
    } catch {}
  }

  async function fetchPending() {
    try {
      const res = await api.get("/api/friends/pending");
      setPending(res.data);
    } catch {}
  }

  async function handleAdd() {
    if (!searchVal.trim()) return;
    setLoading(true);
    setSearchMsg({ type: "", text: "" });

    try {
      const res = await api.post("/api/friends/request", { username: searchVal.trim() });

      // Notif realtime ke target
      const targetRes = await api.get(`/api/user/${searchVal.trim()}`);
      socket?.emit("friends:notify", {
        toUserId: targetRes.data.id,
        type: "newRequest",
        data: {
          id: res.data.id,
          sender: { id: user.id, username: user.username, avatarId: user.avatarId },
        },
      });

      setSearchMsg({ type: "success", text: `Request dikirim ke ${searchVal}` });
      setSearchVal("");
    } catch (err) {
      setSearchMsg({ type: "error", text: err.response?.data?.message || "Gagal" });
    } finally {
      setLoading(false);
    }
  }

  async function handleRespond(friendshipId, action, sender) {
    try {
      await api.post("/api/friends/respond", { friendshipId, action });
      setPending((p) => p.filter((r) => r.id !== friendshipId));

      if (action === "accept") {
        setFriends((p) => [...p, sender]);
        socket?.emit("friends:notify", {
          toUserId: sender.id,
          type: "accepted",
          data: { id: user.id, username: user.username, avatarId: user.avatarId, points: user.points },
        });
      }
    } catch (err) {
      alert(err.response?.data?.message || "Gagal");
    }
  }

  function handleChallenge(friend) {
    socket?.emit("friends:challenge", { toUserId: friend.id });
    setChallengeSent(friend.username);
    setTimeout(() => setChallengeSent(null), 4000);
  }

  function handleAcceptChallenge() {
    socket?.emit("friends:acceptChallenge", { toSocketId: challenge.socketId });
    setChallenge(null);
  }

  function handleDeclineChallenge() {
    socket?.emit("friends:declineChallenge", { toSocketId: challenge.socketId });
    setChallenge(null);
  }

  if (isLoading || !user) return null;

  return (
    <div className="max-w-md mx-auto flex flex-col gap-4 pb-10">

      {/* Back */}
      <button
        onClick={() => router.push("/")}
        className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors w-fit"
      >
        ← Kembali ke Lobby
      </button>

      <h1 className="text-xl font-bold">Teman</h1>

      {/* Incoming challenge modal */}
      {challenge && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 flex flex-col items-center gap-4 max-w-xs w-full">
            <p className="font-bold text-lg">Tantangan Masuk!</p>
            <Avatar id={challenge.from.avatarId || "knight"} size={64} />
            <p className="text-gray-600 dark:text-gray-400">
              <strong>{challenge.from.username}</strong> menantangmu bermain
            </p>
            <div className="flex gap-3 w-full">
              <button
                onClick={handleDeclineChallenge}
                className="flex-1 py-2 bg-gray-100 dark:bg-gray-800 rounded-xl text-sm font-medium"
              >
                Tolak
              </button>
              <button
                onClick={handleAcceptChallenge}
                className="flex-1 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-sm font-medium"
              >
                Terima
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
        {[
          { id: "friends", label: `Teman (${friends.length})` },
          { id: "pending", label: `Permintaan${pending.length > 0 ? ` (${pending.length})` : ""}` },
          { id: "add",     label: "Tambah" },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 py-2 rounded-lg text-xs font-medium transition-colors ${
              tab === t.id
                ? "bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 shadow-sm"
                : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab: Teman */}
      {tab === "friends" && (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden">

          {friends.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-gray-400 text-sm">
                Belum ada teman
              </p>

              <button
                onClick={() => setTab("add")}
                className="mt-2 text-blue-500 text-sm hover:underline"
              >
                Tambah teman sekarang
              </button>
            </div>
          ) : (

            friends.map((f) => {
              const rank = getRank(f.points);

              return (
                <div
                  key={f.id}
                  onClick={() => setSelectedFriend(f)}
                  className="flex items-center gap-3 px-4 py-3 border-b border-gray-50 dark:border-gray-800 last:border-0 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                >
                  <Avatar
                    id={f.avatarId || "knight"}
                    size={40}
                  />

                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">
                      {f.username}
                    </p>

                    <p className="text-xs text-gray-400">
                      {rank.icon} {rank.name} · {f.points} pts
                    </p>
                  </div>

                  <span className="text-xs text-gray-400">
                    ›
                  </span>
                </div>
              );
            })

          )}

        </div>
      )}

      {challengeSent && (
        <div className="fixed bottom-4 left-4 z-50 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg px-4 py-3 text-sm">
          ⚔️ Tantangan dikirim ke <strong>{challengeSent}</strong>
        </div>
      )}

      {selectedFriend && (
        <FriendMiniProfile
          friend={selectedFriend}
          onChallenge={handleChallenge}
          onClose={() => setSelectedFriend(null)}
        />
      )}


      {/* Tab: Pending */}
      {tab === "pending" && (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden">
          {pending.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-gray-400 text-sm">Tidak ada permintaan masuk</p>
            </div>
          ) : (
            pending.map((req) => (
              <div
                key={req.id}
                className="flex items-center gap-3 px-4 py-3 border-b border-gray-50 dark:border-gray-800 last:border-0"
              >
                <Avatar id={req.sender.avatarId || "knight"} size={40} />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{req.sender.username}</p>
                  <p className="text-xs text-gray-400">Ingin berteman</p>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button
                    onClick={() => handleRespond(req.id, "reject", req.sender)}
                    className="px-3 py-1.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 text-gray-600 dark:text-gray-300 rounded-lg text-xs font-medium transition-colors"
                  >
                    Tolak
                  </button>
                  <button
                    onClick={() => handleRespond(req.id, "accept", req.sender)}
                    className="px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white rounded-lg text-xs font-medium transition-colors"
                  >
                    Terima
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab: Tambah teman */}
      {tab === "add" && (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 flex flex-col gap-4">
          <div>
            <p className="text-sm font-semibold">Cari pemain</p>
            <p className="text-xs text-gray-400 mt-0.5">Masukkan username yang ingin kamu tambahkan</p>
          </div>

          <div className="flex gap-2">
            <input
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              placeholder="Username..."
              className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
            <button
              onClick={handleAdd}
              disabled={loading || !searchVal.trim()}
              className="px-4 py-2.5 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white rounded-xl text-sm font-medium transition-colors"
            >
              {loading ? "..." : "Kirim"}
            </button>
          </div>

          {searchMsg.text && (
            <p className={`text-sm px-4 py-2.5 rounded-xl ${
              searchMsg.type === "success"
                ? "text-green-600 bg-green-50 dark:bg-green-950/30"
                : "text-red-500 bg-red-50 dark:bg-red-950/30"
            }`}>
              {searchMsg.text}
            </p>
          )}
        </div>
      )}
    </div>
  );
}