import { api } from './Service.js'

export const scheduleAvailabilityService = {
    get: async () => {
        const response = await api.get('/schedule-availability')
        return response.data
    },
}

export const appointmentService = {
    create: async (data) => {
        const response = await api.post('/appointment', data)
        return response.data
    },
    // GET /appointment sin filtro adicional: el backend ya limita el
    // resultado a las citas propias cuando quien pregunta es un client
    // (ver backend/src/services/appointment.js -> getAll).
    getAll: async () => {
        const response = await api.get('/appointment')
        return response.data
    },
    cancel: async (id) => {
        const response = await api.put(`/appointment/${id}/cancel`)
        return response.data
    },
}