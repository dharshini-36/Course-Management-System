import axios from "axios";

// This client is used by the course pages with paths like "/api/v1/courses".
// Its base URL is the backend ORIGIN (no /api/v1), taken from the same
// VITE_API_URL variable as apiClient.js so there is one place to configure it.
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1";

const api = axios.create({
    baseURL: API_URL.replace(/\/api\/v1\/?$/, "")
});

// Attach the JWT (if the user is logged in) so that
// course add / edit / delete (protected routes) are accepted.
api.interceptors.request.use(
    (config) => {
        const token = sessionStorage.getItem("token");

        if (token) {
            config.headers = config.headers || {};
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => Promise.reject(error)
);

export default api;