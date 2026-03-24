import api from "@/lib/axios";

export const roleService = {
  getRoles: async () => {
    const response = await api.get("/roles/all");
    return response.data;
  },

  getRoleById: async (roleId) => {
    const response = await api.get(`/roles/${roleId}`);
    return response.data;
  },

  getRolePermissions: async (roleId) => {
    const response = await api.get(`/roles/${roleId}/permissions`);
    return response.data;
  },

  getGroupedPermissions: async () => {
    const response = await api.get("/permissions/grouped");
    return response.data;
  },

  createRole: async (payload) => {
    const response = await api.post("/roles", payload);
    return response.data;
  },

  updateRole: async (roleId, payload) => {
    const response = await api.patch(`/roles/${roleId}`, payload);
    return response.data;
  },

  deleteRole: async (roleId) => {
    const response = await api.delete(`/roles/${roleId}`);
    return response.data;
  },

  restoreRole: async (roleId) => {
    const response = await api.patch(`/roles/${roleId}/restore`);
    return response.data;
  },

  exportRoles: async (format = "csv") => {
    const response = await api.get(`/roles/export?format=${format}`, {
      responseType: "blob",
    });
    return response.data;
  },
};