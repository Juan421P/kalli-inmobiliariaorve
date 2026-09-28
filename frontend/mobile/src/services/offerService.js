import api from './apiClient';

const offerService = {
    async create(payload) {
        return api.post('/offer', payload);
    },
    async getById(id) {
        return api.get(`/offer/${id}`);
    },
    async counter(id, price) {
        return api.post(`/offer/${id}/counter`, { price });
    },
    async resolve(id, status) {
        return api.patch(`/offer/${id}/resolve`, { status });
    },
};

export default offerService;
