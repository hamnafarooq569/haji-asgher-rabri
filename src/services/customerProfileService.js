import api from "@/lib/axios";

const customerProfileService = {
  async getProfile() {
    const response = await api.get("/public/profile");
    return response.data;
  },

  async updateProfile(data) {
    const response = await api.patch("/public/profile", data);
    return response.data;
  },
};

export default customerProfileService;