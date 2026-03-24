import api from "@/lib/axios";

const typeService = {
  async getTypes(params = {}) {
    const response = await api.get("/types", { params });
    return response.data;
  },

  async getAllTypes() {
    const response = await api.get("/types/all");
    return response.data;
  },

  async getTypeById(id) {
    const response = await api.get(`/types/${id}`);
    return response.data;
  },

  async createType(payload) {
    const response = await api.post("/types", payload);
    return response.data;
  },

  async updateType(id, payload) {
    const response = await api.patch(`/types/${id}`, payload);
    return response.data;
  },

  async deleteType(id) {
    const response = await api.delete(`/types/${id}`);
    return response.data;
  },

  async restoreType(id) {
    const response = await api.patch(`/types/${id}/restore`);
    return response.data;
  },

  async updateTypeStatus(id, payload) {
    const response = await api.patch(`/types/${id}/status`, payload);
    return response.data;
  },

  async getAllCategories() {
    const response = await api.get("/categories/all");
    return response.data;
  },
};

export default typeService;