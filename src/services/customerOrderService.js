import api from "@/lib/axios";

const customerOrderService = {
  async getMyOrders() {
    const response = await api.get("/public/orders/my");
    return response.data;
  },

  async getOrderByNumber(orderNumber) {
    const response = await api.get(`/public/orders/${orderNumber}`);
    return response.data;
  },

  async cancelOrder(orderNumber) {
    const response = await api.patch(`/public/orders/${orderNumber}/cancel`);
    return response.data;
  },
};

export default customerOrderService;