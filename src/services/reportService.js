import axiosInstance from "@/lib/axios";

const reportService = {
  getSalesReport: async (params = {}) => {
    const response = await axiosInstance.get("/reports/sales", {
      params,
    });
    return response.data;
  },

  exportSalesReportCsv: async (params = {}) => {
    const response = await axiosInstance.get("/reports/sales/export/csv", {
      params,
      responseType: "blob",
    });
    return response.data;
  },

  exportSalesReportXlsx: async (params = {}) => {
    const response = await axiosInstance.get("/reports/sales/export/xlsx", {
      params,
      responseType: "blob",
    });
    return response.data;
  },

  getSellingReport: async (params = {}) => {
    const response = await axiosInstance.get("/reports/selling", {
      params,
    });
    return response.data;
  },

  exportSellingReportCsv: async (params = {}) => {
    const response = await axiosInstance.get("/reports/selling/export/csv", {
      params,
      responseType: "blob",
    });
    return response.data;
  },

  exportSellingReportXlsx: async (params = {}) => {
    const response = await axiosInstance.get("/reports/selling/export/xlsx", {
      params,
      responseType: "blob",
    });
    return response.data;
  },

  getCustomerReport: async (params = {}) => {
    const response = await axiosInstance.get("/reports/customers", {
      params,
    });
    return response.data;
  },

  exportCustomerReportCsv: async (params = {}) => {
    const response = await axiosInstance.get("/reports/customers/exports/csv", {
      params,
      responseType: "blob",
    });
    return response.data;
  },

  exportCustomerReportXlsx: async (params = {}) => {
    const response = await axiosInstance.get("/reports/customers/exports/xlsx", {
      params,
      responseType: "blob",
    });
    return response.data;
  },

  getMarginReport: async (params = {}) => {
    const response = await axiosInstance.get("/reports/margin", {
      params,
    });
    return response.data;
  },

  exportMarginReportCsv: async (params = {}) => {
    const response = await axiosInstance.get("/reports/margin/export/csv", {
      params,
      responseType: "blob",
    });
    return response.data;
  },

  exportMarginReportXlsx: async (params = {}) => {
    const response = await axiosInstance.get("/reports/margin/export/xlsx", {
      params,
      responseType: "blob",
    });
    return response.data;
  },
};

export default reportService;