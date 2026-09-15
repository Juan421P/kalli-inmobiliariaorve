import { api } from './Service.js'

const geoSVService = {
    getAddress: (coordinates) =>
        api.post('/resolve-address', { coordinates }).then((r) => r.data),
}

export default geoSVService