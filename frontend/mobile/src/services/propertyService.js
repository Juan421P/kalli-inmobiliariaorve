import api from './apiClient';

// backend/src/routers/property.js monta las rutas en /property (singular), no /properties
const propertyService = {
    async getAll(params = {}) {
        const query = new URLSearchParams(params).toString();
        return api.get(`/property${query ? `?${query}` : ''}`);
    },
    async getByPublicId(publicId) {
        return api.get(`/property/public/${publicId}`);
    },
};

export default propertyService;
