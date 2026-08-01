import axios from 'axios'

const client = axios.create({ baseURL: import.meta.env.VITE_API_URL, withCredentials: true })

const GeoSVService = {
    getAddress: (coordinates) =>
        client.post('/resolve-address', { coordinates }).then((r) => r.data),
}

export default GeoSVService
