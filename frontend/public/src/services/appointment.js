import { api } from './service.js'

export const scheduleAvailabilityService = {
    get: async () => {
        const response = await api.get('/scheduleAvailability')
        return response.data
    },
}

export const appointmentService = {
    create: async (data) => {
        const response = await api.post('/appointment', data)
        return response.data
    },
}