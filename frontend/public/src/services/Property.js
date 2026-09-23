import Service from './Service.js'

class PropertyService extends Service {
    constructor() {
        // backend/src/routers/property.js monta las rutas en /property (singular), no /properties
        super('/property')
    }

    async getByPublicId(publicId) {
        const response = await this.api.get(`${this.endpoint}/public/${publicId}`)
        return response.data
    }

    async incrementView(id) {
        const response = await this.api.put(`${this.endpoint}/${id}/view`)
        return response.data
    }
}

export default new PropertyService()