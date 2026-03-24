import api from "@/lib/axios";

const customerAuthService = {
  async start(data) {
    const response = await api.post("/public/auth/start", data);
    return response.data;
  },

  async verifyOtp(data) {
    const response = await api.post("/public/auth/verify-otp", data);
    return response.data;
  },

  async resendOtp(data) {
    const response = await api.post("/public/auth/resend-otp", data);
    return response.data;
  },

  async logout() {
    const response = await api.post("/public/auth/logout");
    return response.data;
  },

  async me() {
    const response = await api.get("/public/auth/me");
    return response.data;
  },
};

export default customerAuthService;