import api from './apiClient';

export const scheduleAvailabilityService = {
    get: () => api.get('/schedule-availability'),
};

export const appointmentService = {
    create: (data) => api.post('/appointment', data),
};
