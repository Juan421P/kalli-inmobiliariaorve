import Service from './service.js'

class ClientsService extends Service {
    constructor() {
        super('/client')
    }

    async getAll() {
        const response = await this.api.get(this.endpoint)
        return response.data
    }

    async setActive(id, active) {
        const response = await this.api.put(`${this.endpoint}/${id}`, { active })
        return response.data
    }
}

export const clientsService = new ClientsService()
