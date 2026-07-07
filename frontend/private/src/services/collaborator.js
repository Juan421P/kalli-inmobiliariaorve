import Service from './service.js'

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
        // Mongoose interpreta las claves con punto como rutas anidadas al construir el documento
        formData.append('phone.country_code', phone.country_code)
        formData.append('phone.number', phone.number)
        formData.append('document.type', documentType)
        formData.append('document.number', documentNumber)
        formData.append('picture', avatarFile)

        const response = await this.api.post(this.endpoint, formData)
        return response.data
    }

    async setActive(id, active) {
        const response = await this.api.put(`${this.endpoint}/${id}`, { active })
        return response.data
    }
}

export const collaboratorsService = new CollaboratorsService()
export default new CollaboratorsService()
