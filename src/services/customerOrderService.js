import api from "@/lib/axios";

const customerOrderService = {
  async getMyOrders() {
    const response = await api.get("/customer/orders");
    return response.data;
  },

  async getOrderByNumber(orderNumber) {
    const response = await api.get(`/customer/orders/${orderNumber}`);
    return response.data;
  },

  async cancelOrder(orderNumber) {
    const response = await api.patch(`/customer/orders/${orderNumber}/cancel`);
    return response.data;
  },
};

export default customerOrderService;