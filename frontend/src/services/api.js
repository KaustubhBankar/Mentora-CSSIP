import axios from "axios";
import { getToken, removeAuthData } from "../utils/storage";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
});

api.interceptors.request.use(
  (config) => {
    const token = getToken();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    /*
     * Do not set Content-Type for FormData.
     * The browser must generate the multipart boundary.
     */
    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    } else if (!config.headers["Content-Type"]) {
      config.headers["Content-Type"] = "application/json";
    }

    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isUnauthorized = error.response?.status === 401;
    const isLoginRequest =
      error.config?.url?.includes("/api/auth/login");

    if (isUnauthorized && !isLoginRequest) {
      removeAuthData();
      window.dispatchEvent(
        new Event("mentora:unauthorized"),
      );
    }

    return Promise.reject(error);
  },
);

export default api;