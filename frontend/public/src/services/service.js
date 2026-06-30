import axios from 'axios'

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    withCredentials: false
})

api.interceptors.response.use(
    (response) => response,
    (error) => {
        console.log('AXIOS ERROR')
        console.log('status:', error.response?.status)
        console.log('data:', error.response?.data)
        console.log('url:', error.config?.url)
        console.log('method:', error.config?.method)
        console.log('request data:', error.config?.data)
        return Promise.reject(error)
    }
)

class Service {
    constructor(endpoint) {
        this.endpoint = endpoint
        this.api = api
    }

    async getAll(params = {}) {
        const response = await this.api.get(this.endpoint, { params })
        return response.data
    }

    async getById(id) {
        const response = await this.api.get(`${this.endpoint}/${id}`)
        return response.data
    }

    async post(data) {
        const response = await this.api.post(this.endpoint, data)
        return response.data
    }
}

export default Service
