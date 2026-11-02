import axios from "axios";

// In production (Vercel) set VITE_API_URL=https://your-backend.onrender.com/api/v1
// The localhost fallback is only for development.
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach the JWT (if the user is logged in) to every request.
apiClient.interceptors.request.use(
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

// If the server says our token is expired or invalid, clear the saved login so
// the app does not keep pretending the user is logged in.
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const message = error.response?.data?.message || "";
    const url = error.config?.url || "";
    const sentToken = Boolean(error.config?.headers?.Authorization);

    const isAuthCall = url.startsWith("/auth/");
    const tokenRejected = message === "Invalid or expired token";

    if (status === 401 && sentToken && tokenRejected && !isAuthCall) {
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("role");
      localStorage.removeItem("loggedInStudent");
      localStorage.removeItem("currentStudent");
      localStorage.removeItem("loggedInAdmin");

      if (window.location.pathname !== "/login") {
        window.location.assign("/login");
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;