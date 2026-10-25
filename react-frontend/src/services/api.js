import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:5000"
});

// Attach the JWT (if the student is logged in) so that
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