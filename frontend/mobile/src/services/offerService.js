import api from './apiClient';

const offerService = {
    async create(payload) {
        return api.post('/offer', payload);
    },
};

export default offerService;
