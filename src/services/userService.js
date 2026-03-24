import api from "@/lib/axios";

export const userService = {
  getUsers: async () => {
    const response = await api.get("/users");
    return response.data;
  },

  searchUsers: async (query) => {
    const response = await api.get(`/users/search?q=${encodeURIComponent(query)}`);
    return response.data;
  },

  getUserById: async (userId) => {
    const response = await api.get(`/users/${userId}`);
    return response.data;
  },

  createUser: async (payload) => {
    const response = await api.post("/users", payload);
    return response.data;
  },

  updateUser: async (userId, payload) => {
    const response = await api.patch(`/users/${userId}`, payload);
    return response.data;
  },

  deleteUser: async (userId) => {
    const response = await api.delete(`/users/${userId}`);
    return response.data;
  },

  restoreUser: async (userId) => {
    const response = await api.patch(`/users/${userId}/restore`);
    return response.data;
  },

  exportUsers: async (format = "csv") => {
    const response = await api.get(`/users/export?format=${format}`, {
      responseType: "blob",
    });
    return response.data;
  },
};