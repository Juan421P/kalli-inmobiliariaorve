import { api } from './Service.js'

const offerService = {
    create: async (data) => {
        const response = await api.post('/offer', data)
        return response.data
    },
    getById: async (id) => {
        const response = await api.get(`/offer/${id}`)
        return response.data
    },
    counter: async (id, price) => {
        const response = await api.post(`/offer/${id}/counter`, { price })
        return response.data
    },
    resolve: async (id, status) => {
        const response = await api.patch(`/offer/${id}/resolve`, { status })
        return response.data
    },
}

export default offerService