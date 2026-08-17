import axios from 'axios';
// withCredentials para que el navegador mande la cookie httpOnly del JWT en cada
// request; sin esto cualquier ruta protegida responde 401 aunque el login haya
// funcionado bien
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    withCredentials: true
});
// Log genérico de errores de red/HTTP para no andar repitiendo el mismo catch en
// cada service. Los componentes igual atrapan el error para mostrar su propio
// toast, esto es solo para poder ver rápido en consola qué reventó y por qué
api.interceptors.response.use(
    (response) => response,
    (error) => {
        console.log('AXIOS ERROR');
        console.log('status:', error.response?.status);
        console.log('data:', error.response?.data);
        console.log('url:', error.config?.url);
        console.log('method:', error.config?.method);
        console.log('request data:', error.config?.data);
        return Promise.reject(error);
    }
);
// Clase base con el CRUD genérico que usa la mayoría de services. Los que
// necesitan algo distinto (payloads con forma rara, multipart, endpoints
// anidados) simplemente sobreescriben el método que les haga falta
class Service {
    constructor(endpoint) {
        this.endpoint = endpoint;
        this.api = api;
    }
    async get(params = {}) {
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
    async put(id, data) {
        const response = await this.api.put(`${this.endpoint}/${id}`, data);
        return response.data;
    }
    async delete(id) {
        const response = await this.api.delete(`${this.endpoint}/${id}`);
        return response.data;
    }
}
export default Service;