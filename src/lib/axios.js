import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  withCredentials: true,
});

// Do NOT force Content-Type globally.
// Browser/axios should set it automatically for FormData.

export default api;