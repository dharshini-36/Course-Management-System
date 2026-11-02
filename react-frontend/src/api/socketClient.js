import { io } from "socket.io-client";

// Backend ORIGIN only (no /api/v1). Set VITE_SOCKET_URL on Vercel.
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";

export function createSocket() {
  return io(SOCKET_URL, {
    autoConnect: false,
    auth: {
      token: sessionStorage.getItem("token"),
    },
  });
}