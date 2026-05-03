// app/game/page.js
"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function GameRedirect() {
  const router = useRouter();
  useEffect(() => { router.replace("/"); }, []);
  return null;
}