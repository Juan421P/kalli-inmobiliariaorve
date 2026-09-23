import axios from "axios";
import { getErrorMessage } from "@/lib/errorMessages.js";

// El backend monta todas las rutas bajo /api (ver backend/app.js -> app.use('/api', router)),
// asi que VITE_API_URL, si se define, debe incluir ese prefijo (ej. https://mi-api.com/api).
// Si no hay variable de entorno, caemos al backend local con el prefijo ya puesto.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:4000/api",
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.log("AXIOS ERROR");
    console.log("status:", error.response?.status);
    console.log("data:", error.response?.data);
    console.log("url:", error.config?.url);
    console.log("method:", error.config?.method);
    console.log("request data:", error.config?.data);
    // Se calcula acá, una sola vez, un mensaje legible para el usuario.
    // Así cualquier catch en hooks/páginas puede usar `error.friendlyMessage`
    // en vez de repetir `error.response?.data?.message || 'algo genérico'`
    // (y terminar mostrando cosas como "Request failed with status code 404"
    // cuando el backend no manda un mensaje útil, o el mensaje incorrecto
    // cuando el rate limiter responde con `{ error: '...' }` en vez de
    // `{ message: '...' }`).
    error.friendlyMessage = getErrorMessage(error);
    return Promise.reject(error);
  },
);

class Service {
  constructor(endpoint) {
    this.endpoint = endpoint;
    this.api = api;
  }

  async getAll(params = {}) {
    const response = await this.api.get(this.endpoint, { params });
    return response.data;
  }

  async getById(id) {
    const response = await this.api.get(`${this.endpoint}/${id}`);
    return response.data;
  }

  async post(data) {
    const response = await this.api.post(this.endpoint, data);
    return response.data;
  }
}

export { api };
export default Service;
