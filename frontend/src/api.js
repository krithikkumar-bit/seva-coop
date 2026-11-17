import axios from "axios";

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || "/api" });

api.interceptors.request.use((cfg) => {
  const t = localStorage.getItem("token");
  if (t) cfg.headers.Authorization = `Bearer ${t}`;
  return cfg;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const url = err?.config?.url || "";
    const isAuthAttempt = url.includes("/auth/login") || url.includes("/auth/register");
    if (err?.response?.status === 401 && !isAuthAttempt) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      if (window.location.pathname !== "/login") {
        window.location.assign("/login");
      }
    }
    return Promise.reject(err);
  }
);

export default api;
