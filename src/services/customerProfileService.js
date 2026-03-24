import api from "@/lib/axios";

const customerProfileService = {
  async getProfile() {
    const response = await api.get("/customer/profile");
    return response.data;
  },

  async updateProfile(data) {
    const response = await api.put("/customer/profile", data);
    return response.data;
  },
};

export default customerProfileService;