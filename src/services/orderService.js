import axiosInstance from "@/lib/axios";

const orderService = {
  // Get all orders
  getOrders: async (params = {}) => {
    const response = await axiosInstance.get("/orders", {
      params,
    });
    return response.data;
  },

  // Get single order details
  getOrderById: async (id) => {
    const response = await axiosInstance.get(`/orders/${id}`);
    return response.data;
  },

  // Update order status
    updateOrderStatus: async ({ id, status }) => {
    const response = await axiosInstance.patch(`/orders/${id}/status`, {
        status,
    });
    return response.data;
    },

  // Update payment status
  updatePaymentStatus: async ({ id, paymentStatus }) => {
    const response = await axiosInstance.patch(`/orders/${id}/payment-status`, {
      paymentStatus,
    });
    return response.data;
  },

    getPublicProducts: async (params = {}) => {
    const response = await axiosInstance.get("/public/products", {
        params: {
        page: 1,
        limit: 50,
        ...params,
        },
    });
    return response.data;
    },

  // Restore order
  restoreOrder: async (id) => {
    const response = await axiosInstance.patch(`/orders/${id}/restore`);
    return response.data;
  },

  // Get invoice data
  getOrderInvoice: async (id) => {
    const response = await axiosInstance.get(`/orders/${id}/invoice`);
    return response.data;
  },

  // Get printable order/invoice data
  getPrintableOrder: async (id) => {
    const response = await axiosInstance.get(`/orders/${id}/print`);
    return response.data;
  },
};

export default orderService;