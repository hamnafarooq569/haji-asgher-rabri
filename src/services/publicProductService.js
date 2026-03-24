import api from "@/lib/axios";

const publicProductService = {
  async getAllProducts(params = {}) {
    const query = new URLSearchParams({
      page: String(params.page || 1),
      limit: String(params.limit || 200),
      ...(params.sort ? { sort: params.sort } : {}),
      ...(params.categorySlug ? { categorySlug: params.categorySlug } : {}),
    }).toString();

    const response = await api.get(`/public/products?${query}`);
    return response.data;
  },

  async getProductBySlug(slug) {
    const response = await api.get(`/public/products/${slug}`);
    return response.data;
  },
};

export default publicProductService;