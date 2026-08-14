import { api } from './service.js'

const GeoSVService = {
    getAddress: (coordinates) =>
        api.post('/resolve-address', { coordinates }).then((r) => r.data),
}

export default GeoSVService