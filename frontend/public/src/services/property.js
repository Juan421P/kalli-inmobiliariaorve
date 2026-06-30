import Service from './service.js'

class PropertyService extends Service {
    constructor() {
        super('/properties')
    }

    async getByPublicId(publicId) {
        const response = await this.api.get(`${this.endpoint}/public/${publicId}`)
        return response.data
    }
}

export default new PropertyService()
