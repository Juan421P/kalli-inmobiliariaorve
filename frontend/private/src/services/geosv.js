import axios from 'axios'

const client = axios.create({ baseURL: 'http://localhost:4000/api' })

const GeoSVService = {
    getAddress: (coordinates) =>
        client.post('/address', { coordinates }).then((r) => r.data.data),
}

export default GeoSVService
