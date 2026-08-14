import axios from 'axios'

const client = axios.create({ baseURL: import.meta.env.VITE_API_URL, withCredentials: true })

// /resolve-address es del backend de ORVE, no de geosv directamente — el backend
// reenvía la petición a lo que tenga configurado como ADDRESS_API (geosv en
// desarrollo). Este service no sabe ni le importa cuál geocodificador hay detrás
const GeoSVService = {
    getAddress: (coordinates) =>
        client.post('/resolve-address', { coordinates }).then((r) => r.data),
}

export default GeoSVService
