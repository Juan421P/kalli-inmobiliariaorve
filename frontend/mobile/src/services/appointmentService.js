import api from './apiClient';

export const scheduleAvailabilityService = {
    get: () => api.get('/schedule-availability'),
};

export const appointmentService = {
    create: (data) => api.post('/appointment', data),
    // GET /appointment sin filtro adicional: el backend ya limita el
    // resultado a las citas propias cuando quien pregunta es un client
    // (ver backend/src/services/appointment.js -> getAll), igual que en
    // frontend/public/src/services/Appointment.js.
    getAll: () => api.get('/appointment'),
    cancel: (id) => api.put(`/appointment/${id}/cancel`),
};
