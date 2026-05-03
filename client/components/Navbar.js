"use client";

import Link from "next/link";
import { useAuthStore } from "@/lib/useAuthStore";
import Avatar from "./Avatar";
import { getRank } from "./RankBadge";

export default function Navbar() {
  const { user } = useAuthStore();
  const rank = user ? getRank(user.points) : null;

  return (
    <nav className="w-full border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 px-4 py-2 flex items-center justify-between sticky top-0 z-40">
      <Link href="/" className="font-bold text-lg tracking-tight">
        TTC <span className="text-blue-500">Online</span>
      </Link>

      <div className="flex items-center gap-3">
        {user ? (
          <Link href="/profile" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <Avatar id={user.avatarId || "knight"} size={32} />
            <div className="hidden sm:flex flex-col items-start">
              <span className="text-sm font-medium leading-tight">{user.username}</span>
              <span className="text-xs text-gray-400 leading-tight">{rank?.name} · {user.points} pts</span>
            </div>
          </Link>
        ) : (
          <div className="flex gap-2 text-sm">
            <Link href="/login" className="px-3 py-1.5 text-gray-600 dark:text-gray-400 hover:text-blue-500 transition-colors">
              Login
            </Link>
            <Link href="/register" className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors">
              Daftar
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}