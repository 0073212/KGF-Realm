import axios from "axios";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "";
export const API = BACKEND_URL ? `${BACKEND_URL}/api` : "/api";

const api = axios.create({
    baseURL: API,
    withCredentials: true,
});

// Attach token from localStorage as Bearer fallback (in case cookies blocked)
api.interceptors.request.use((config) => {
    const token = localStorage.getItem("kgf_token");
  if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;

export function formatApiError(detail) {
    if (detail == null) return "";
    if (typeof detail === "string") return detail;
    if (Array.isArray(detail)) {
        return detail
            .map((e) => (e && typeof e.msg === "string" ? e.msg : JSON.stringify(e)))
                .filter(Boolean)
                .join(" ");
  }
    if (detail && typeof detail.msg === "string") return detail.msg;
    return String(detail);
}
