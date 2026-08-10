import Service from './Service.js'

// Mock 
// Cuando el backend esté listo, cambiá USE_MOCK a false y listo.

const USE_MOCK = false

const MOCK_DATA = {
    '/amenities': [
        { _id: 'am1',  name: 'Wi-Fi' },
        { _id: 'am2',  name: 'Aire acondicionado' },
        { _id: 'am3',  name: 'A/C' },
        { _id: 'am4',  name: 'Parqueo' },
        { _id: 'am5',  name: 'Piscina' },
        { _id: 'am6',  name: 'Área de asadores' },
        { _id: 'am7',  name: 'Seguridad' },
        { _id: 'am8',  name: 'Cochera eléctrica' },
        { _id: 'am9',  name: 'Terraza' },
        { _id: 'am10', name: 'Patio trasero' },
        { _id: 'am11', name: 'Cuarto de servicio' },
        { _id: 'am12', name: 'Sótano' },
        { _id: 'am13', name: 'Internet inalámbrico' },
        { _id: 'am14', name: 'Gimnasio' },
        { _id: 'am15', name: 'Área de juegos' },
    ],
    '/tags': [
        { _id: 'tg1',  name: 'Para parejas' },
        { _id: 'tg2',  name: 'Para estudiantes' },
        { _id: 'tg3',  name: 'Zona estudiantil' },
        { _id: 'tg4',  name: 'Ubicación estratégica' },
        { _id: 'tg5',  name: 'Sin escaleras' },
        { _id: 'tg6',  name: 'Acogedora y privada' },
        { _id: 'tg7',  name: 'Para Airbnb' },
        { _id: 'tg8',  name: 'Pet friendly' },
        { _id: 'tg9',  name: 'Ideal para vida activa' },
        { _id: 'tg10', name: 'Espacio para oficina' },
        { _id: 'tg11', name: 'Cerca de centros comerciales' },
        { _id: 'tg12', name: 'Vista al volcán' },
    ],
    '/features': [
        { _id: 'ft1', name: 'Paredes con acabado en yeso liso' },
        { _id: 'ft2', name: 'Puertas de madera sólida' },
        { _id: 'ft3', name: 'Ventanas con marco de aluminio' },
        { _id: 'ft4', name: 'Revestimiento de azulejos en baños' },
        { _id: 'ft5', name: 'Pintura interior de calidad' },
        { _id: 'ft6', name: 'Zócalos de madera' },
        { _id: 'ft7', name: 'Techos con estructura de concreto' },
        { _id: 'ft8', name: 'Pisos de porcelanato' },
        { _id: 'ft9', name: 'Cocina integral' },
    ],
    '/appliances': [
        { _id: 'ap1',  name: 'Horno' },
        { _id: 'ap2',  name: 'Lavadora' },
        { _id: 'ap3',  name: 'Televisión' },
        { _id: 'ap4',  name: 'Microondas' },
        { _id: 'ap5',  name: 'Licuadora' },
        { _id: 'ap6',  name: 'Humidificador' },
        { _id: 'ap7',  name: 'Freidora de aire' },
        { _id: 'ap8',  name: 'Refrigerador' },
        { _id: 'ap9',  name: 'Aspiradora' },
        { _id: 'ap10', name: 'Plancha' },
        { _id: 'ap11', name: 'Nevera' },
        { _id: 'ap12', name: 'Sandwichera' },
        { _id: 'ap13', name: 'Secadora' },
        { _id: 'ap14', name: 'Estufa' },
        { _id: 'ap15', name: 'Tostadora' },
    ],
}

// Copia mutable en memoria (simula la DB durante la sesión)
const mockState = structuredClone(MOCK_DATA)

const mockDelay = () => new Promise((resolve) => setTimeout(resolve, 300))
const mockId    = () => `mock_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`

//  Clase 

class CatalogService extends Service {
    constructor(endpoint) {
        super(endpoint)
    }

    async get(params = {}) {
        if (USE_MOCK) {
            await mockDelay()
            // Devuelve { items: [...] } — CatalogPage busca el primer array
            return { items: structuredClone(mockState[this.endpoint]) }
        }
        return super.get(params)
    }

    async post(data) {
        if (USE_MOCK) {
            await mockDelay()
            const newItem = { _id: mockId(), name: data.name }
            mockState[this.endpoint].push(newItem)
            return { item: newItem }
        }
        return super.post(data)
    }

    async merge(principalId, referenceIds) {
        if (USE_MOCK) {
            await mockDelay()
            mockState[this.endpoint] = mockState[this.endpoint].filter(
                (item) => !referenceIds.includes(item._id)
            )
            return { items: structuredClone(mockState[this.endpoint]) }
        }
        const response = await this.api.post(`${this.endpoint}/merge`, {
            principal: principalId,
            references: referenceIds,
        })
        return response.data
    }
}

//  Instancias exportadas 

export const amenityService   = new CatalogService('/possible-amenity')
export const tagService       = new CatalogService('/possible-tag')
export const featureService   = new CatalogService('/possible-feature')
export const applianceService = new CatalogService('/possible-appliance')