import api from "@/lib/axios";

const addonService = {
  async getAddons(params = {}) {
    const response = await api.get("/addons", { params });
    return response.data;
  },

  async getAllAddons() {
    const response = await api.get("/addons/all");
    return response.data;
  },

  async getAddonById(id) {
    const response = await api.get(`/addons/${id}`);
    return response.data;
  },

  async createAddon(payload) {
    const response = await api.post("/addons", payload);
    return response.data;
  },

  async updateAddon(id, payload) {
    const response = await api.put(`/addons/${id}`, payload);
    return response.data;
  },

  async deleteAddon(id) {
    const response = await api.delete(`/addons/${id}`);
    return response.data;
  },

  async restoreAddon(id) {
    const response = await api.patch(`/addons/${id}/restore`);
    return response.data;
  },

  async updateAddonStatus(id, payload) {
    const response = await api.patch(`/addons/${id}/status`, payload);
    return response.data;
  },
};

export default addonService;