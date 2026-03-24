import api from "@/lib/axios";

const categoryService = {
  async getCategories(params = {}) {
    const response = await api.get("/categories", { params });
    return response.data;
  },

  async getAllCategories() {
    const response = await api.get("/categories/all");
    return response.data;
  },

  async getCategoryById(id) {
    const response = await api.get(`/categories/${id}`);
    return response.data;
  },

  async createCategory(payload) {
    const response = await api.post("/categories", payload);
    return response.data;
  },

  async updateCategory(id, payload) {
    const response = await api.patch(`/categories/${id}`, payload);
    return response.data;
  },

  async deleteCategory(id) {
    const response = await api.delete(`/categories/${id}`);
    return response.data;
  },

  async restoreCategory(id) {
    const response = await api.patch(`/categories/${id}/restore`);
    return response.data;
  },

  async updateCategoryStatus(id, payload) {
    const response = await api.patch(`/categories/${id}/status`, payload);
    return response.data;
  },
};

export default categoryService;