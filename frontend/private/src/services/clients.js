import Service from './service.js'

// ─── Mock ─────────────────────────────────────────────────────────────────────
const USE_MOCK = true

const mockDelay = () => new Promise((r) => setTimeout(r, 300))
const mockId    = () => `mock_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`

const mockState = {
    clients: [
        { _id: 'cl1', name: 'Abel',     lastname: 'Joyar',     email: 'andrea.m@gmail.com',  phone: { country_code: '+503', number: '7890-1234' }, document: { type: 'dui',      number: '12345678A' }, avatarUrl: null, favoriteProperty: { title: 'Casa en Urbanización Santísima Trinidad', code: 'SS-SSC-AYT-C-ALQ-0025' } },
        { _id: 'cl2', name: 'José',     lastname: 'Molina',    email: 'maria.lpez@email.com', phone: { country_code: '+503', number: '6543-9876' }, document: { type: 'pasaporte', number: 'P-A1234567'  }, avatarUrl: null, favoriteProperty: { title: 'Apartamento en Colonia San Benito',       code: 'SS-SSC-SSV-A-ALQ-0017' } },
        { _id: 'cl3', name: 'Axel',     lastname: 'Flores',    email: 'r.herrera@biz.sv',     phone: { country_code: '+503', number: '7712-3344' }, document: { type: 'dui',      number: '00629468-1'  }, avatarUrl: null, favoriteProperty: { title: 'Casa en Urbanización Santísima Trinidad', code: 'SS-SSC-AYT-C-VEN-0053' } },
        { _id: 'cl4', name: 'Vladimir', lastname: 'Escamilla', email: 'sofia.v@gmail.com',    phone: { country_code: '+503', number: '7712-3344' }, document: { type: 'nit',      number: '0614-01019-0-101-1' }, avatarUrl: null, favoriteProperty: { title: 'Casa en Barrio San Miguelito',          code: 'SS-SSC-S6V-C-VEN-0109' } },
        { _id: 'cl5', name: 'Abel',     lastname: 'Joyar',     email: 'holiii@gmail.com',     phone: { country_code: '+503', number: '4589-4584' }, document: { type: 'dui',      number: '98765432B'   }, avatarUrl: null, favoriteProperty: { title: 'Lote en Colonia El Mirador',             code: 'SS-SSN-DEL-T-VEN-0009' } },
        { _id: 'cl6', name: 'Ivanya',   lastname: 'Nolazco',   email: 'ivanya@gmail.com',     phone: { country_code: '+503', number: '7654-3210' }, document: { type: 'dui',      number: '11223344-5'  }, avatarUrl: null, favoriteProperty: null },
        { _id: 'cl7', name: 'Diego',    lastname: 'Gómez',     email: 'diego@hotmail.com',    phone: { country_code: '+503', number: '6789-0123' }, document: { type: 'pasaporte', number: 'P-B9876543'  }, avatarUrl: null, favoriteProperty: null },
    ],
    metrics: {
        totalActive:      10,
        interestedBuy:    5,
        interestedRent:   8,
        pendingContact:   1,
    },
}

// ─── Clase ────────────────────────────────────────────────────────────────────
class ClientsService extends Service {
    constructor() {
        super('/client')
    }

    async getAll({ search = '', page = 1, limit = 5 } = {}) {
        if (USE_MOCK) {
            await mockDelay()
            const filtered = mockState.clients.filter((c) => {
                const q = search.toLowerCase()
                return (
                    !q ||
                    c.name.toLowerCase().includes(q) ||
                    c.lastname.toLowerCase().includes(q) ||
                    c.email.toLowerCase().includes(q) ||
                    c.favoriteProperty?.title.toLowerCase().includes(q)
                )
            })
            const total = filtered.length
            const data  = filtered.slice((page - 1) * limit, page * limit)
            return { clients: data, total, page, limit, metrics: mockState.metrics }
        }
        return super.get({ search, page, limit })
    }

    async create(data) {
        if (USE_MOCK) {
            await mockDelay()
            const newClient = {
                _id:      mockId(),
                name:     data.name,
                lastname: data.lastname,
                email:    data.email,
                phone:    data.phone,
                document: data.document,
                avatarUrl: null,
                favoriteProperty: null,
            }
            mockState.clients.unshift(newClient)
            mockState.metrics.totalActive += 1
            return { client: newClient }
        }
        const response = await this.api.post(this.endpoint, data)
        return response.data
    }

    async update(id, data) {
        if (USE_MOCK) {
            await mockDelay()
            const idx = mockState.clients.findIndex((c) => c._id === id)
            if (idx !== -1) mockState.clients[idx] = { ...mockState.clients[idx], ...data }
            return { client: mockState.clients[idx] }
        }
        return super.put(id, data)
    }

    async remove(id) {
        if (USE_MOCK) {
            await mockDelay()
            mockState.clients = mockState.clients.filter((c) => c._id !== id)
            mockState.metrics.totalActive = Math.max(0, mockState.metrics.totalActive - 1)
            return { ok: true }
        }
        return super.delete(id)
    }
}

export const clientsService = new ClientsService()