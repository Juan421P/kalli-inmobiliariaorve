import Service from './Service.js'

const USE_MOCK = false

const mockDelay = () => new Promise((r) => setTimeout(r, 300))

const mockState = {
    offers: [
        {
            _id: 'off1',
            buyer:    { _id: 'cl1', name: 'Abel',     lastname: 'Joyar',     picture: null },
            property: { _id: 'p1',  title: 'Casa en Urbanización Santísima Trinidad', public_id: 'SS-SSC-AYT-C-ALQ-0025', listing_type: 'rent' },
            price: 4000, status: 'pending',
            move_in_date: '2026-05-02T00:00:00.000Z', rental_months: '6',
        },
        {
            _id: 'off2',
            buyer:    { _id: 'cl2', name: 'José',     lastname: 'Molina',    picture: null },
            property: { _id: 'p2',  title: 'Apartamento en Colonia San Benito', public_id: 'SS-SSC-SSV-A-ALQ-0017', listing_type: 'rent' },
            price: 590, status: 'rejected',
            move_in_date: '2026-05-02T00:00:00.000Z', rental_months: '12',
        },
        {
            _id: 'off3',
            buyer:    { _id: 'cl3', name: 'Axel',     lastname: 'Flores',    picture: null },
            property: { _id: 'p1',  title: 'Casa en Urbanización Santísima Trinidad', public_id: 'SS-SSC-AYT-C-HEN-0003', listing_type: 'rent' },
            price: 3000, status: 'accepted',
            move_in_date: '2026-05-06T00:00:00.000Z', rental_months: '12',
        },
        {
            _id: 'off4',
            buyer:    { _id: 'cl4', name: 'Vladimir', lastname: 'Escamilla', picture: null },
            property: { _id: 'p3',  title: 'Casa en Barrio San Miguelito', public_id: 'SS-SSC-S6V-C-VEN-0109', listing_type: 'sale' },
            price: 790, status: 'pending',
            move_in_date: '2026-05-08T00:00:00.000Z', rental_months: '12',
        },
        {
            _id: 'off5',
            buyer:    { _id: 'cl5', name: 'Abel',     lastname: 'Joyar',     picture: null },
            property: { _id: 'p4',  title: 'Lote en Colonia El Mirador', public_id: 'SS-SSN-DEL-T-VEN-0009', listing_type: 'sale' },
            price: 1500, status: 'accepted',
            move_in_date: '2026-05-12T00:00:00.000Z', rental_months: '24',
        },
        {
            _id: 'off6',
            buyer:    { _id: 'cl1', name: 'Abel',     lastname: 'Joyar',     picture: null },
            property: { _id: 'p5',  title: 'Residencial Los Laureles', public_id: 'SS-SSC-LLR-C-ALQ-0031', listing_type: 'rent' },
            price: 2200, status: 'countered',
            move_in_date: '2026-06-01T00:00:00.000Z', rental_months: '6',
        },
        {
            _id: 'off7',
            buyer:    { _id: 'cl6', name: 'Ivanya',   lastname: 'Nolazco',   picture: null },
            property: { _id: 'p6',  title: 'Apartamento Torre Futura', public_id: 'SS-SSC-TFT-A-VEN-0044', listing_type: 'sale' },
            price: 85000, status: 'withdrawn',
            move_in_date: null, rental_months: null,
        },
    ],
    metrics: { total: 10, pending: 3, confirmed: 8, completed: 8 },
}

class OffersService extends Service {
    constructor() {
        super('/offer')
    }

    async getAll({ search = '', page = 1, limit = 5, type = 'all' } = {}) {
        if (USE_MOCK) {
            await mockDelay()
            const q = search.toLowerCase()
            const filtered = mockState.offers.filter((o) => {
                const matchSearch =
                    !q ||
                    o.buyer.name.toLowerCase().includes(q) ||
                    o.buyer.lastname.toLowerCase().includes(q) ||
                    o.property.title.toLowerCase().includes(q) ||
                    o.property.public_id.toLowerCase().includes(q)
                const matchType = type === 'all' || o.property.listing_type === type
                return matchSearch && matchType
            })
            const total = filtered.length
            const data  = filtered.slice((page - 1) * limit, page * limit)
            return { offers: data, total, page, limit, metrics: mockState.metrics }
        }
        return super.get({ search, page, limit, type })
    }

    async updateStatus(id, status) {
        if (USE_MOCK) {
            await mockDelay()
            const idx = mockState.offers.findIndex((o) => o._id === id)
            if (idx !== -1) mockState.offers[idx] = { ...mockState.offers[idx], status }
            return { offer: mockState.offers[idx] }
        }
        const response = await this.api.patch(`${this.endpoint}/${id}/resolve`, { status })
        return response.data
    }

    async remove(id) {
        if (USE_MOCK) {
            await mockDelay()
            mockState.offers = mockState.offers.filter((o) => o._id !== id)
            return { ok: true }
        }
        return super.delete(id)
    }
}

export const offersService = new OffersService()
