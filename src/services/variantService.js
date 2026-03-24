import api from "@/lib/axios";

const variantService = {
  async getVariants(params = {}) {
    const response = await api.get("/variants", { params });
    return response.data;
  },

  async getAllVariants() {
    const response = await api.get("/variants/all");
    return response.data;
  },

  async getVariantById(id) {
    const response = await api.get(`/variants/${id}`);
    return response.data;
  },

  async createVariant(payload) {
    const response = await api.post("/variants", payload);
    return response.data;
  },

  async updateVariant(id, payload) {
    const response = await api.patch(`/variants/${id}`, payload);
    return response.data;
  },

  async deleteVariant(id) {
    const response = await api.delete(`/variants/${id}`);
    return response.data;
  },

  async getVariantStatus(id) {
    const response = await api.get(`/variants/${id}/status`);
    return response.data;
  },

  async updateVariantStatus(id, payload) {
    const response = await api.patch(`/variants/${id}/status`, payload);
    return response.data;
  },

  async searchVariants(query) {
    const response = await api.get(
      `/variants/search?q=${encodeURIComponent(query)}`
    );
    return response.data;
  },

  async getPaginatedVariants(page = 1, limit = 10) {
    const response = await api.get(
      `/variants/paginated?page=${page}&limit=${limit}`
    );
    return response.data;
  },

  async exportVariants(format = "csv") {
    const response = await api.get(`/variants/export?format=${format}`, {
      responseType: "blob",
    });
    return response.data;
  },
};

export default variantService;