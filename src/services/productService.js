import api from "@/lib/axios";

const productService = {
  async getProducts(params = {}) {
    const response = await api.get("/products", { params });
    return response.data;
  },

  async getAllProducts() {
    const response = await api.get("/products/all");
    return response.data;
  },

  async getProductById(id) {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },

  async createProduct(payload) {
    const config = payload instanceof FormData ? {} : {};
    const response = await api.post("/products", payload, config);
    return response.data;
  },

  async updateProduct(id, payload) {
    const config = payload instanceof FormData ? {} : {};
    const response = await api.put(`/products/${id}`, payload, config);
    return response.data;
  },

  async deleteProduct(id) {
    const response = await api.delete(`/products/${id}`);
    return response.data;
  },

  async restoreProduct(id) {
    const response = await api.patch(`/products/${id}/restore`);
    return response.data;
  },

  async updateProductStatus(id, payload) {
    const response = await api.patch(`/products/${id}/status`, payload);
    return response.data;
  },

  async getAllCategories() {
    const response = await api.get("/categories/all");
    return response.data;
  },
};

export default productService;