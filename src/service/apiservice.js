import axios from "axios";
import Cookies from "js-cookie";

const apiClient = axios.create({
    baseURL: process.env.Url || "http://localhost:3000",
    headers: {
        "Content-Type": "application/json",
    },
});

apiClient.interceptors.request.use(
    (config) => {
        const token = Cookies.get("authToken"); 
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

const apiService = {
    get: async (route, params = {}) => {
        try {
            const response = await apiClient.get(route, { params });
            return response.data;
        } catch (error) {
            console.error("Error en GET:", error.response?.data || error.message);
            throw error;
        }
    },

    post: async (route, data = {}) => {
        try {
            const response = await apiClient.post(route, data);
            return response.data;
        } catch (error) {
            console.error("Error en POST:", error.response?.data || error.message);
            throw error;
        }
    },

    patch: async (route, data = {}) => {
        try {
            const response = await apiClient.patch(route, data);
            return response.data;
        } catch (error) {
            console.error("Error en PATCH:", error.response?.data || error.message);
            throw error;
        }
    },

    delete: async (route) => {
        try {
            const response = await apiClient.delete(route);
            return response.data;
        } catch (error) {
            console.error("Error en DELETE:", error.response?.data || error.message);
            throw error;
        }
    },
};

export default apiService;