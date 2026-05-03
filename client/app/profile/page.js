"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/useAuthStore";
import Avatar, { AVATAR_LIST, AVATAR_NAMES } from "@/components/Avatar";
import { getRank } from "@/components/RankBadge";
import api from "@/lib/api";

export default function ProfilePage() {
  const { user, logout, isLoading, updateUser } = useAuthStore();
  const router = useRouter();

  const [selectedAvatar, setSelectedAvatar] = useState("knight");
  const [form, setForm] = useState({ email: "", oldPassword: "", newPassword: "" });
  const [message, setMessage] = useState({ type: "", text: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) router.push("/login");
    if (user) {
      setForm((prev) => ({ ...prev, email: user.email || "" }));
      setSelectedAvatar(user.avatarId || "knight");
    }
  }, [user, isLoading]);

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSave(e) {
    e.preventDefault();
    setMessage({ type: "", text: "" });
    setSaving(true);

    try {
      const body = {};
      if (selectedAvatar !== user.avatarId) body.avatarId = selectedAvatar;
      if (form.email !== (user.email || "")) body.email = form.email;
      if (form.newPassword) {
        body.oldPassword = form.oldPassword;
        body.newPassword = form.newPassword;
      }

      if (Object.keys(body).length === 0) {
        setMessage({ type: "info", text: "Tidak ada perubahan" });
        setSaving(false);
        return;
      }

      const res = await api.patch("/api/user/update", body);
      updateUser(res.data);
      setMessage({ type: "success", text: "Profil berhasil diupdate!" });
      setForm((prev) => ({ ...prev, oldPassword: "", newPassword: "" }));
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.message || "Terjadi kesalahan" });
    } finally {
      setSaving(false);
    }
  }

  function handleLogout() {
    logout();
    router.push("/");
  }

  if (isLoading || !user) return null;

  const rank = getRank(user.points);
  const totalGames = user.wins + user.losses + user.draws;
  const winRate = totalGames > 0 ? Math.round((user.wins / totalGames) * 100) : 0;

  return (
    <div className="max-w-md mx-auto flex flex-col gap-5 pb-10">

      {/* Back */}
      <button
        onClick={() => router.push("/")}
        className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors w-fit"
      >
        ← Kembali ke Lobby
      </button>

      {/* Header profil */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 flex items-center gap-4">
        <Avatar id={selectedAvatar} size={64} />
        <div>
          <h1 className="text-xl font-bold">{user.username}</h1>
          <p className="text-sm text-gray-500">{rank.icon} {rank.name} · {user.points} poin</p>
          <div className="flex gap-3 mt-1 text-xs text-gray-400">
            <span className="text-green-500 font-medium">{user.wins}W</span>
            <span className="text-red-500 font-medium">{user.losses}L</span>
            <span className="text-yellow-500 font-medium">{user.draws}D</span>
            <span>{winRate}% WR</span>
          </div>
        </div>
      </div>

      {/* Avatar picker */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5">
        <p className="text-sm font-semibold mb-3">Pilih Avatar</p>
        <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
          {AVATAR_LIST.map((id) => (
            <button
              key={id}
              onClick={() => setSelectedAvatar(id)}
              className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${
                selectedAvatar === id
                  ? "bg-blue-100 dark:bg-blue-900/40 ring-2 ring-blue-500"
                  : "hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
            >
              <Avatar id={id} size={36} />
              <span className="text-xs text-gray-500 leading-tight">{AVATAR_NAMES[id]}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Form update */}
      <form onSubmit={handleSave} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 flex flex-col gap-4">
        <p className="text-sm font-semibold">Pengaturan Akun</p>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium">
            Email <span className="text-gray-400 font-normal text-xs">(opsional, untuk recovery)</span>
          </label>
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            placeholder="email@kamu.com"
            className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium">Password lama</label>
          <input
            name="oldPassword"
            type="password"
            value={form.oldPassword}
            onChange={handleChange}
            placeholder="Isi kalau mau ganti password"
            className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium">Password baru</label>
          <input
            name="newPassword"
            type="password"
            value={form.newPassword}
            onChange={handleChange}
            placeholder="Minimal 6 karakter"
            className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
        </div>

        {message.text && (
          <p className={`text-sm px-4 py-2.5 rounded-xl ${
            message.type === "success" ? "text-green-600 bg-green-50 dark:bg-green-950/30" :
            message.type === "error"   ? "text-red-500 bg-red-50 dark:bg-red-950/30" :
                                         "text-gray-500 bg-gray-100 dark:bg-gray-800"
          }`}>
            {message.text}
          </p>
        )}

        <button
          type="submit"
          disabled={saving}
          className="py-2.5 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white rounded-xl font-medium transition-colors"
        >
          {saving ? "Menyimpan..." : "Simpan Perubahan"}
        </button>
      </form>

      <button
        onClick={handleLogout}
        className="py-2.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 rounded-xl text-sm font-medium transition-colors"
      >
        Logout
      </button>
    </div>
  );
}