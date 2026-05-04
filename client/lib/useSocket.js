import { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import { useAuthStore } from "./useAuthStore";

let socketInstance = null;

export function useSocket() {
  const { token, isLoading } = useAuthStore();
  const [connected, setConnected]   = useState(false);
  const [onlineCount, setOnlineCount] = useState(0);
  const prevToken = useRef(undefined);

  useEffect(() => {
    // Tunggu auth selesai load dulu
    if (isLoading) return;

    // Kalau token sama, tidak perlu reconnect
    if (prevToken.current === token && socketInstance?.connected) return;
    prevToken.current = token;

    // Disconnect socket lama
    if (socketInstance) {
      socketInstance.removeAllListeners();
      socketInstance.disconnect();
      socketInstance = null;
    }

    socketInstance = io(
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000",
      {
        auth: { token: token || null },
        reconnectionAttempts: 5,
        reconnectionDelay: 2000,
        timeout: 10000,
      }
    );

    socketInstance._token = token;

    socketInstance.on("connect", () => {
      setConnected(true);
    });

    socketInstance.on("disconnect", () => {
      setConnected(false);
    });

    socketInstance.on("online:count", (count) => {
      setOnlineCount(count);
    });

    return () => {
      socketInstance?.off("online:count");
    };
  }, [token, isLoading]); // ← tambah isLoading

  return { socket: socketInstance, connected, onlineCount };
}