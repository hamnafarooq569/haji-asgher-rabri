import api from "@/lib/axios";

const customerCheckoutService = {
  async validateOrder(data) {
    const response = await api.post("/public/orders/validate", data);
    return response.data;
  },

  async placeOrder(data) {
    const response = await api.post("/public/orders", data);
    return response.data;
  },
};

export default customerCheckoutService;