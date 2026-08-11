import express from 'express'

// Mini-servicio de geocodificación inversa para desarrollo local.
// Envuelve Nominatim/OpenStreetMap (gratis, sin API key) y expone el mismo
// contrato que backend/src/utils/resolve_address.js espera de ADDRESS_API:
//
//   POST /address  { coordinates: [lng, lat] }
//   -> 200 { data: { formatted_address, components: { department, municipality, district } } }
//
// No es parte del backend principal — es un proceso aparte, pensado solo
// para desarrollo. En producción esto debería reemplazarse por un proveedor
// de verdad (o por este mismo servicio corriendo detrás de su propia infra).

const app = express()
app.use(express.json())

const PORT = process.env.PORT || 4001
const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/reverse'

app.post('/address', async (req, res) => {
    const { coordinates } = req.body ?? {}
    if (!Array.isArray(coordinates) || coordinates.length !== 2 || coordinates.some((n) => typeof n !== 'number')) {
        return res.status(400).json({ message: 'coordinates must be an array of two numbers: [lng, lat]' })
    }
    const [lng, lat] = coordinates

    try {
        const url = `${NOMINATIM_URL}?lat=${lat}&lon=${lng}&format=json&addressdetails=1&accept-language=es`
        const response = await fetch(url, {
            // Nominatim exige un User-Agent identificable; sin esto rechaza la petición.
            headers: { 'User-Agent': 'kalli-inmobiliaria-orve-dev/1.0' },
        })
        if (!response.ok) throw new Error(`nominatim respondió ${response.status}`)

        const result = await response.json()
        if (result.error) {
            return res.status(404).json({ message: 'no se encontró dirección para estas coordenadas' })
        }

        const addr = result.address ?? {}
        return res.status(200).json({
            data: {
                formatted_address: result.display_name ?? '',
                components: {
                    department: addr.state ?? addr.region ?? '',
                    municipality: addr.city ?? addr.town ?? addr.municipality ?? addr.county ?? '',
                    district: addr.suburb ?? addr.city_district ?? addr.neighbourhood ?? addr.village ?? '',
                },
            },
        })
    } catch (err) {
        console.error('geocoding-service error:', err.message)
        return res.status(502).json({ message: 'no se pudo resolver la dirección' })
    }
})

app.listen(PORT, () => console.log(`geocoding-service (Nominatim) escuchando en el puerto ${PORT}`))