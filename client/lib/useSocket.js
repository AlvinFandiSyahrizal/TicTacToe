import { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import { useAuthStore } from "./useAuthStore";

let socketInstance = null;

export function useSocket() {
  const { token, isLoading } = useAuthStore();
  const [connected, setConnected]     = useState(false);
  const [onlineCount, setOnlineCount] = useState(0);
  const prevToken = useRef(null);
  const initialized = useRef(false);

  useEffect(() => {
    // Tunggu auth selesai
    if (isLoading) return;

    // Kalau token sama dan socket masih connect, skip
    if (prevToken.current === token && socketInstance?.connected) return;

    prevToken.current = token;

    // Disconnect yang lama
    if (socketInstance) {
      socketInstance.removeAllListeners();
      socketInstance.disconnect();
      socketInstance = null;
    }

    socketInstance = io(
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000",
      {
        auth: { token: token || null },
        reconnection: true,
        reconnectionAttempts: Infinity,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        timeout: 10000,
      }
    );

    socketInstance.on("connect", () => {
      setConnected(true);
    });

    socketInstance.on("disconnect", () => {
      setConnected(false);
    });

    socketInstance.on("online:count", (count) => {
      setOnlineCount(count);
    });

  }, [token, isLoading]);

  return { socket: socketInstance, connected, onlineCount };
}