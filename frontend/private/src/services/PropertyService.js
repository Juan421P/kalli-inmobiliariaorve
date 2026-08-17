import Service from './Service.js'

// Quedó de cuando se armó esta pantalla antes de que el backend tuviera todo
// listo. Se deja el interruptor por si hace falta demostrar la UI sin backend
// (o sin internet), pero en desarrollo normal esto va en false
const USE_MOCK = false

const mockDelay = () => new Promise((r) => setTimeout(r, 300))

const mockState = {
    properties: [
        {
            _id: 'p1',
            public_id: 'SS-SSC-AYT-C-ALQ-0025',
            title: 'Casa en Urbanización Santísima Trinidad',
            description: 'Amplia casa familiar con jardín privado.',
            property_type: 'house',
            listing_type: 'rent',
            status: 'available',
            price: 800,
            address: 'Urb. Santísima Trinidad, San Salvador',
            bedrooms: 3, bathrooms: 2, parking_spaces: 1,
            area: { number: 120, unit: 'm2' },
            allows_pets: false, furnished: false,
            pictures: [],
            collaborator: { _id: 'col1', name: 'Laura', lastname: 'Martínez' },
            createdAt: '2026-03-10T10:00:00.000Z',
        },
        {
            _id: 'p2',
            public_id: 'SS-SSC-SSV-A-ALQ-0017',
            title: 'Apartamento en Colonia San Benito',
            description: 'Moderno apartamento con vista a la ciudad.',
            property_type: 'apartment',
            listing_type: 'rent',
            status: 'occupied',
            price: 590,
            address: 'Col. San Benito, San Salvador',
            bedrooms: 2, bathrooms: 1, parking_spaces: 1,
            area: { number: 75, unit: 'm2' },
            allows_pets: true, furnished: true,
            pictures: [],
            collaborator: { _id: 'col2', name: 'Carlos', lastname: 'López' },
            createdAt: '2026-02-14T08:30:00.000Z',
        },
        {
            _id: 'p3',
            public_id: 'SS-SSC-S6V-C-VEN-0109',
            title: 'Casa en Barrio San Miguelito',
            description: 'Casa céntrica ideal para familia.',
            property_type: 'house',
            listing_type: 'sale',
            status: 'occupied',
            price: 95000,
            address: 'B° San Miguelito, San Salvador',
            bedrooms: 4, bathrooms: 3, parking_spaces: 2,
            area: { number: 200, unit: 'm2' },
            allows_pets: false, furnished: false,
            pictures: [],
            collaborator: null,
            createdAt: '2026-01-20T15:00:00.000Z',
        },
        {
            _id: 'p4',
            public_id: 'SS-SSN-DEL-T-VEN-0009',
            title: 'Lote en Colonia El Mirador',
            description: 'Terreno plano con escritura lista.',
            property_type: 'land',
            listing_type: 'sale',
            status: 'available',
            price: 45000,
            address: 'Col. El Mirador, San Salvador Norte',
            bedrooms: 0, bathrooms: 0, parking_spaces: 0,
            area: { number: 300, unit: 'v2' },
            allows_pets: false, furnished: false,
            pictures: [],
            collaborator: { _id: 'col1', name: 'Laura', lastname: 'Martínez' },
            createdAt: '2026-04-05T12:00:00.000Z',
        },
        {
            _id: 'p5',
            public_id: 'SS-SSC-LLR-C-ALQ-0031',
            title: 'Residencial Los Laureles',
            description: 'Residencia en condominio privado con seguridad 24h.',
            property_type: 'house',
            listing_type: 'rent',
            status: 'available',
            price: 1200,
            address: 'Res. Los Laureles, Santa Tecla',
            bedrooms: 3, bathrooms: 2, parking_spaces: 2,
            area: { number: 160, unit: 'm2' },
            allows_pets: true, furnished: false,
            pictures: [],
            collaborator: { _id: 'col2', name: 'Carlos', lastname: 'López' },
            createdAt: '2026-05-01T09:00:00.000Z',
        },
        {
            _id: 'p6',
            public_id: 'SS-SSC-TFT-A-VEN-0044',
            title: 'Apartamento Torre Futura',
            description: 'Piso 12 con acabados de lujo y terraza.',
            property_type: 'apartment',
            listing_type: 'sale',
            status: 'available',
            price: 120000,
            address: 'Torre Futura, Col. Escalón, San Salvador',
            bedrooms: 2, bathrooms: 2, parking_spaces: 1,
            area: { number: 90, unit: 'm2' },
            allows_pets: false, furnished: true,
            pictures: [],
            collaborator: null,
            createdAt: '2026-05-18T11:00:00.000Z',
        },
    ],
}

class PropertyService extends Service {
    constructor() { super('/property') }

    async getAll({ search = '', page = 1, limit = 5, type = '', listing = '', status = '' } = {}) {
        // El backend no soporta filtros ni paginación en GET /property, se hace del lado del cliente
        if (USE_MOCK) {
            await mockDelay()
            const q = search.toLowerCase()
            const all = mockState.properties
            const filtered = all.filter((p) => {
                const matchSearch =
                    !q ||
                    p.title?.toLowerCase().includes(q) ||
                    p.address?.toLowerCase().includes(q) ||
                    p.public_id?.toLowerCase().includes(q)
                const matchType    = !type    || p.property_type === type
                const matchListing = !listing || p.listing_type  === listing
                const matchStatus  = !status  || p.status        === status
                return matchSearch && matchType && matchListing && matchStatus
            })
            const total      = filtered.length
            const properties = filtered.slice((page - 1) * limit, page * limit)
            const metrics = {
                total:     all.length,
                available: all.filter((p) => p.status === 'available').length,
                rented:    all.filter((p) => p.status === 'occupied' && p.listing_type === 'rent').length,
                sold:      all.filter((p) => p.status === 'occupied' && p.listing_type === 'sale').length,
            }
            return { properties, total, page, limit, metrics }
        }

        const data = await super.get()
        const all = data.properties ?? []
        const q = search.toLowerCase()
        const filtered = all.filter((p) => {
            const matchSearch =
                !q ||
                p.title?.toLowerCase().includes(q) ||
                p.address?.toLowerCase().includes(q) ||
                p.public_id?.toLowerCase().includes(q)
            const matchType    = !type    || p.property_type === type
            const matchListing = !listing || p.listing_type  === listing
            const matchStatus  = !status  || p.status        === status
            return matchSearch && matchType && matchListing && matchStatus
        })
        const total      = filtered.length
        const properties = filtered.slice((page - 1) * limit, page * limit)
        const metrics = {
            total:     all.length,
            available: all.filter((p) => p.status === 'available').length,
            rented:    all.filter((p) => p.status === 'occupied' && p.listing_type === 'rent').length,
            sold:      all.filter((p) => p.status === 'occupied' && p.listing_type === 'sale').length,
        }
        return { properties, total, page, limit, metrics }
    }

    async create(data) {
        if (USE_MOCK) {
            await mockDelay()
            const { images = [], ...fields } = data
            const newProp = {
                _id: `p${Date.now()}`,
                public_id: `MOCK-${Date.now()}`,
                pictures: [],
                collaborator: null,
                createdAt: new Date().toISOString(),
                ...fields,
            }
            mockState.properties.unshift(newProp)
            return { property: newProp }
        }

        const form = new FormData()
        const { images = [], ...fields } = data
        // form-data no entiende objetos anidados (location, area, address_components...),
        // así que van como texto y el backend los vuelve a parsear del otro lado
        for (const [key, value] of Object.entries(fields)) {
            if (value !== null && value !== undefined) {
                form.append(key, typeof value === 'object' ? JSON.stringify(value) : value)
            }
        }
        for (const file of images) {
            form.append('pictures', file)
        }
        const response = await this.api.post(this.endpoint, form, {
            headers: { 'Content-Type': 'multipart/form-data' },
        })
        return response.data
    }

    async update(id, data) {
        if (USE_MOCK) {
            await mockDelay()
            const { newImages: _new, removePictureIds: _rm, ...fields } = data
            const idx = mockState.properties.findIndex((p) => p._id === id)
            if (idx !== -1) mockState.properties[idx] = { ...mockState.properties[idx], ...fields }
            return { property: mockState.properties[idx] }
        }

        const form = new FormData()
        const { newImages = [], removePictureIds = [], ...fields } = data
        for (const [key, value] of Object.entries(fields)) {
            if (value !== null && value !== undefined) {
                form.append(key, typeof value === 'object' ? JSON.stringify(value) : value)
            }
        }
        // el backend espera esta llave en snake_case (remove_pictures), a
        // diferencia de casi todo lo demás en este payload
        if (removePictureIds.length) {
            form.append('remove_pictures', JSON.stringify(removePictureIds))
        }
        for (const file of newImages) {
            form.append('pictures', file)
        }
        const response = await this.api.put(`${this.endpoint}/${id}`, form, {
            headers: { 'Content-Type': 'multipart/form-data' },
        })
        return response.data
    }

    async remove(id) {
        if (USE_MOCK) {
            await mockDelay()
            mockState.properties = mockState.properties.filter((p) => p._id !== id)
            return { ok: true }
        }
        return super.delete(id)
    }

    async getByPublicId(publicId) {
        if (USE_MOCK) {
            await mockDelay()
            return { property: mockState.properties.find((p) => p.public_id === publicId) ?? null }
        }
        const response = await this.api.get(`${this.endpoint}/public/${publicId}`)
        return response.data
    }
}

export const propertyService = new PropertyService()
export default propertyService
