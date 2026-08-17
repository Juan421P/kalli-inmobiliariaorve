import Service from './service.js'

// No hay create() aquí a propósito: los clientes se registran ellos mismos desde
// el sitio público, el panel solo administra lo que ya existe
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
