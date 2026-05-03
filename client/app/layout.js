"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/lib/useAuthStore";
import Navbar from "@/components/Navbar";
import { Geist } from "next/font/google";
import "./globals.css";

const geist = Geist({ subsets: ["latin"] });

export default function RootLayout({ children }) {
  const init = useAuthStore((s) => s.init);

  useEffect(() => { init(); }, []);

  return (
    <html lang="id">
      <body className={`${geist.className} bg-gray-50 dark:bg-gray-950 min-h-screen flex flex-col`}>
        <Navbar />
        <div className="flex-1 flex flex-col max-w-6xl w-full mx-auto px-3 py-3">
          {children}
        </div>
      </body>
    </html>
  );
}