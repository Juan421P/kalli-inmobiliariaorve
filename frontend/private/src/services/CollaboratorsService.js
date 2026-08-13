import Service from './Service.js'

class CollaboratorsService extends Service {
    constructor() {
        super('/collaborator')
    }

    async getAll() {
        const response = await this.api.get(this.endpoint)
        return response.data
    }

    // el backend espera multipart/form-data (requiere foto) y crea la cuenta
    // como una invitación: el colaborador define su propia contraseña después
    async create({ name, lastname, email, phone, documentType, documentNumber, avatarFile }) {
        const formData = new FormData()
        formData.append('name', name)
        formData.append('lastname', lastname)
        formData.append('email', email)
        // El backend reconvierte a objeto los campos anidados que llegan como JSON.stringify
        formData.append('phone', JSON.stringify(phone))
        formData.append('document', JSON.stringify({ type: documentType, number: documentNumber }))
        formData.append('picture', avatarFile)

        const response = await this.api.post(`${this.endpoint}/invite`, formData)
        return response.data
    }

    async setActive(id, active) {
        const response = await this.api.put(`${this.endpoint}/${id}`, { active })
        return response.data
    }

    async login(email, password) {
        const response = await this.api.post(`${this.endpoint}/login`, { email, password })
        return response.data
    }

    async completeInvitation(data) {
        const response = await this.api.post(`${this.endpoint}/complete-invitation`, data)
        return response.data
    }

    async logout() {
        const response = await this.api.post(`${this.endpoint}/logout`)
        return response.data
    }

    async uploadPicture(id, file) {
        const formData = new FormData()
        formData.append('picture', file)
        const response = await this.api.put(`${this.endpoint}/${id}/image`, formData)
        return response.data
    }
}

export const collaboratorsService = new CollaboratorsService()
