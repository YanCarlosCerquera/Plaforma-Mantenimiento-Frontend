import axios from "axios";
import Cookies from "js-cookie";

const jwt_decode = require("jwt-decode");

// Acceder a la variable de entorno de Vue
const API_BASE_URL = process.env.VUE_APP_API_URL || "https://king-prawn-app-2u9tk.ondigitalocean.app";

// Crear cliente API
const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

const isTokenExpired = (token) => {
    try {
        const decoded = jwt_decode.jwtDecode(token);
        const currentTime = Date.now() / 1000; 
        return decoded.exp < currentTime; 
    } catch (error) {
        console.error("Error al decodificar el token:", error);
        return true; 
    }
};

apiClient.interceptors.request.use(
    async (config) => {
        const token = Cookies.get("authToken"); 
        if (token) {
            if (isTokenExpired(token)) {
                try {
                    const response = await axios.post(`${API_BASE_URL}/auth/refresh-access-token`, {
                        access_token: token,
                    });
                    const newToken = response.data.access_token; 
                    Cookies.set("authToken", newToken); 
                    config.headers.Authorization = `Bearer ${newToken}`; 
                } catch (error) {
                    if (error.response && error.response.status === 401) {
                        console.warn("El token no está próximo a expirar. Continuando con el token actual.");
                        config.headers.Authorization = `Bearer ${token}`;
                    } else {
                        console.error("Error al refrescar el token:", error);
                        throw new Error("No se pudo refrescar el token. Por favor, inicia sesión nuevamente.");
                    }
                }
            } else {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Log para depuración
console.log("API Service inicializado con URL base:", API_BASE_URL);

const apiService = {
    // Método para obtener la URL base
    getBaseUrl: () => {
        return API_BASE_URL;
    },

    get: async (route, params = {}) => {
        try {
            const response = await apiClient.get(route, { params });
            return response.data;
        } catch (error) {
            console.error("Error en GET:", error.response?.data || error.message);
            throw error;
        }
    },

    // Método para obtener archivos binarios como PDFs
    getBlob: async (route, params = {}) => {
        try {
            const response = await apiClient.get(route, { 
                params,
                responseType: 'blob',
                headers: {
                    'Accept': 'application/pdf',
                    'Content-Type': 'application/pdf'
                }
            });
            return response.data;
        } catch (error) {
            console.error("Error en getBlob:", error.response?.data || error.message);
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