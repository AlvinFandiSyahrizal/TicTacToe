"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/lib/useAuthStore";
import { useSocket } from "@/lib/useSocket";
import Navbar from "@/components/Navbar";
import ChallengeToast from "@/components/ChallengeToast";

// Global event bus — simpel tanpa library
const gameReadyListeners = new Set();
export function onFriendGameReady(fn) {
  gameReadyListeners.add(fn);
  return () => gameReadyListeners.delete(fn);
}

export default function ClientLayout({ children }) {
  const init = useAuthStore((s) => s.init);
  const { socket } = useSocket();
  const [challenge, setChallenge] = useState(null);

  useEffect(() => { init(); }, []);

  useEffect(() => {
    if (!socket) return;

    socket.on("friends:challenged", (data) => {
      setChallenge(data);
    });

    socket.on("friends:challengeDeclined", ({ username }) => {
      console.log(`${username} menolak tantanganmu`);
    });

    socket.on("friends:gameReady", (matchData) => {
      setChallenge(null);
      // Broadcast ke semua listener (page.js)
      gameReadyListeners.forEach((fn) => fn(matchData));
    });

    return () => {
      socket.off("friends:challenged");
      socket.off("friends:challengeDeclined");
      socket.off("friends:gameReady");
    };
  }, [socket]);

  function handleAccept() {
    if (!challenge || !socket) return;
    socket.emit("friends:acceptChallenge", { toSocketId: challenge.socketId });
    setChallenge(null);
  }

  function handleDecline() {
    if (!challenge || !socket) return;
    socket.emit("friends:declineChallenge", { toSocketId: challenge.socketId });
    setChallenge(null);
  }

  return (
    <>
      <Navbar />
      <div className="flex-1 flex flex-col max-w-6xl w-full mx-auto px-3 py-3">
        {children}
      </div>
      {challenge && (
        <ChallengeToast
          challenge={challenge}
          onAccept={handleAccept}
          onDecline={handleDecline}
          onClose={() => setChallenge(null)}
        />
      )}
    </>
  );
}