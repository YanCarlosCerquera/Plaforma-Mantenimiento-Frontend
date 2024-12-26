import axios from "axios";

const apiClient = axios.create({
    baseURL: process.env.Url || "http://localhost:3001",
    headers: {
        "Content-Type": "application/json",
    },
});

const apiService = {
    get: async (route, params = {}, headers = {}) => {
        try {
            const config = { params, headers };
            const response = await apiClient.get(route, config);
            return response.data;
        } catch (error) {
            console.error("Error en GET:", error.response?.data || error.message);
            throw error;
        }
    },

    post: async (route, data = {}, headers = {}) => {
        try {
            const config = { headers };
            const response = await apiClient.post(route, data, config);
            return response.data;
        } catch (error) {
            console.error("Error en POST:", error.response?.data || error.message);
            throw error;
        }
    },

    patch: async (route, data = {}, headers = {}) => {
        try {
            const config = { headers };
            const response = await apiClient.patch(route, data, config);
            return response.data;
        } catch (error) {
            console.error("Error en PATCH:", error.response?.data || error.message);
            throw error;
        }
    },

    delete: async (route, headers = {}) => {
        try {
            const config = { headers };
            const response = await apiClient.delete(route, config);
            return response.data;
        } catch (error) {
            console.error("Error en DELETE:", error.response?.data || error.message);
            throw error;
        }
    },
};

export default apiService;