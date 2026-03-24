import api from "@/lib/axios";

const customerCheckoutService = {
  async validateOrder(data) {
    return {
      success: true,
      ...data,
    };
  },

  async placeOrder(data) {
    const response = await api.post("/customer/orders", data);
    return response.data;
  },
};

export default customerCheckoutService;