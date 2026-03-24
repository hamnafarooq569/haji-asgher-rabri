import api from "@/lib/axios";

const customerAuthService = {
  async login(data) {
    const response = await api.post("/customer/login", data);
    return response.data;
  },

  async register(data) {
    const response = await api.post("/customer/register", data);
    return response.data;
  },

  async logout() {
    const response = await api.post("/customer/logout");
    return response.data;
  },

  async me() {
    const response = await api.get("/customer/me");
    return response.data;
  },
};

export default customerAuthService;