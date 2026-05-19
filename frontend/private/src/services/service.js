import axios from 'axios';
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    headers: { 'Content-Type': 'application/json' }
});
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});
class Service {
    constructor(endpoint) {
        this.endpoint = endpoint;
        this.api = api;
    }
    async get(params = {}) {
        const response = this.api.get(this.endpoint, { params });
        return response.data;
    }
    async getById(id) {
        const response = this.api.get(`${this.endpoint}/${id}`);
        return response.data;
    }
    async post(data) {
        const response = this.api.post(this.endpoint, data);
        return response.data;
    }
    async put(id, data) {
        const response = this.api.put(`${this.endpoint}/${id}`, data);
        return response.data;
    }
    async delete(id) {
        const response = this.api.delete(`${this.endpoint}/${id}`);
        return response.data;
    }
}
export default Service;