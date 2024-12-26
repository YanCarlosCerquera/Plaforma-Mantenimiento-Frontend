import axios from "axios";

const apiClient = axios.create({
    baseURL: process.env.Url || "http://localhost:3001",
    headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
});

const apiService = {
    get: async (route, params = {}, headers = {}) => {
        try {
            const config = { params, headers };
            const response = await apiClient.get(route, config);
            return response.data;
        } catch (error) {
            if (error.response) {
                // Error específico de respuesta
                console.error(`Error en GET: ${error.response.status} ${error.response.statusText}`);
                console.error("Detalles:", error.response.data);
                throw new Error(`Error al obtener datos: ${error.response.data.message || 'Error desconocido'}`);
            } else if (error.request) {
                // No hubo respuesta del servidor
                console.error("Error en la solicitud, sin respuesta:", error.request);
                throw new Error("No se recibió respuesta del servidor");
            } else {
                // Otro tipo de error
                console.error("Error en la configuración de la solicitud:", error.message);
                throw new Error(error.message);
            }
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