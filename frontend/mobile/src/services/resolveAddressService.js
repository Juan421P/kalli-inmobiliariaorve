import api from './apiClient';

const resolveAddressService = {
    // coordinates: [lng, lat] (orden GeoJSON)
    resolve: (coordinates) => api.post('/resolve-address', { coordinates }),
};

export default resolveAddressService;
