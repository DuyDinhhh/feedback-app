import httpAxios from "./httpAxios";

const DashboardService = {
  getDashboardStats: async (month = null) => {
    const params = month ? { month } : {};
    return await httpAxios.get(`dashboard/stats`, { params });
  },
};

export default DashboardService;
