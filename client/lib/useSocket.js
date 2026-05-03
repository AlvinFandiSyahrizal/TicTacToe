import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { useAuthStore } from "./useAuthStore";

let socketInstance = null;

export function useSocket() {
  const { token } = useAuthStore();
  const [connected, setConnected] = useState(false);
  const [onlineCount, setOnlineCount] = useState(0);

  useEffect(() => {
    if (socketInstance?.connected) {
      setConnected(true);
      return;
    }

    socketInstance = io(
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000",
      {
        auth: { token: token || null },
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      }
    );

    socketInstance.on("connect", () => setConnected(true));
    socketInstance.on("disconnect", () => setConnected(false));
    socketInstance.on("online:count", (count) => setOnlineCount(count));

    return () => {
      // Jangan disconnect saat unmount — biarkan singleton
    };
  }, [token]);

  return { socket: socketInstance, connected, onlineCount };
}