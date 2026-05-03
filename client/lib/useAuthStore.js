import { create } from "zustand";
import api from "./api";

export const useAuthStore = create((set) => ({
  user: null,
  token: null,
  isLoading: true,

  init: async () => {
    const token = localStorage.getItem("ttc_token");
    if (!token) { set({ isLoading: false }); return; }
    try {
      const res = await api.get("/api/auth/me");
      set({ user: res.data, token, isLoading: false });
    } catch {
      localStorage.removeItem("ttc_token");
      set({ user: null, token: null, isLoading: false });
    }
  },

  login: async (username, password) => {
    const res = await api.post("/api/auth/login", { username, password });
    localStorage.setItem("ttc_token", res.data.token);
    set({ user: res.data.user, token: res.data.token });
  },

  register: async (username, password, email) => {
    const res = await api.post("/api/auth/register", { username, password, email });
    localStorage.setItem("ttc_token", res.data.token);
    set({ user: res.data.user, token: res.data.token });
  },

  logout: () => {
    localStorage.removeItem("ttc_token");
    set({ user: null, token: null });
  },

  updateUser: (data) => set((state) => ({ user: { ...state.user, ...data } })),
}));