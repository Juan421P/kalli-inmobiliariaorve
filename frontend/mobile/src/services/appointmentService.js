import api from './apiClient';

export const scheduleAvailabilityService = {
    get: () => api.get('/scheduleAvailability'),
};

export const appointmentService = {
    create: (data) => api.post('/appointment', data),
};
