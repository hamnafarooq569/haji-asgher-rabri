import api from "@/lib/axios";

export const authService = {
  login: async (payload) => {
    const response = await api.post("/auth/login", payload);
    return response.data;
  },

  me: async () => {
    const response = await api.get("/auth/me");
    return response.data;
  },

  logout: async () => {
    const response = await api.post("/auth/logout");
    return response.data;
  },
};  