import Service from './service.js'

// ─── Mock ─────────────────────────────────────────────────────────────────────
const USE_MOCK = true

const mockDelay = () => new Promise((r) => setTimeout(r, 300))
const mockId    = () => `mock_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`

const mockState = {
    collaborators: [
        { _id: 'c1', name: 'Abel',     lastname: 'Joyar',     email: 'abel@orve.sv',     phone: { country_code: '+503', number: '7123-4589' }, document: { type: 'dui', number: '12345678-9' }, avatarUrl: null },
        { _id: 'c2', name: 'José',     lastname: 'Molina',    email: 'jose@orve.sv',     phone: { country_code: '+503', number: '6457-2391' }, document: { type: 'dui', number: '04567891-2' }, avatarUrl: null },
        { _id: 'c3', name: 'Axel',     lastname: 'Flores',    email: 'axel@orve.sv',     phone: { country_code: '+503', number: '6234-7789' }, document: { type: 'dui', number: '34567890-1' }, avatarUrl: null },
        { _id: 'c4', name: 'Vladimir', lastname: 'Escamilla', email: 'vlad@orve.sv',     phone: { country_code: '+503', number: '7432-6651' }, document: { type: 'dui', number: '09876543-2' }, avatarUrl: null },
        { _id: 'c5', name: 'Bryan',    lastname: 'Miranda',   email: 'bryan@orve.sv',    phone: { country_code: '+503', number: '6908-1573' }, document: { type: 'dui', number: '90123456-7' }, avatarUrl: null },
        { _id: 'c6', name: 'Mario',    lastname: 'Vásquez',   email: 'mario@orve.sv',    phone: { country_code: '+503', number: '7890-1234' }, document: { type: 'pasaporte', number: 'P-12345678' }, avatarUrl: null },
        { _id: 'c7', name: 'Carlos',   lastname: 'Sánchez',   email: 'carlos@orve.sv',   phone: { country_code: '+503', number: '6543-9876' }, document: { type: 'dui', number: '23456789-0' }, avatarUrl: null },
    ],
}

// ─── Clase ────────────────────────────────────────────────────────────────────
class CollaboratorsService extends Service {
    constructor() {
        super('/collaborator')
    }

    async getAll({ search = '', page = 1, limit = 5 } = {}) {
        if (USE_MOCK) {
            await mockDelay()
            const filtered = mockState.collaborators.filter((c) => {
                const q = search.toLowerCase()
                return (
                    !q ||
                    c.name.toLowerCase().includes(q) ||
                    c.lastname.toLowerCase().includes(q) ||
                    c.email.toLowerCase().includes(q)
                )
            })
            const total = filtered.length
            const data  = filtered.slice((page - 1) * limit, page * limit)
            return { collaborators: data, total, page, limit }
        }
        return super.get({ search, page, limit })
    }

    async create(data) {
        if (USE_MOCK) {
            await mockDelay()
            const newCollaborator = {
                _id:      mockId(),
                name:     data.name,
                lastname: data.lastname,
                email:    data.email,
                phone:    data.phone,
                document: data.document,
                avatarUrl: null,
            }
            mockState.collaborators.unshift(newCollaborator)
            return { collaborator: newCollaborator }
        }
        const response = await this.api.post(this.endpoint, data)
        return response.data
    }

    async update(id, data) {
        if (USE_MOCK) {
            await mockDelay()
            const idx = mockState.collaborators.findIndex((c) => c._id === id)
            if (idx !== -1) mockState.collaborators[idx] = { ...mockState.collaborators[idx], ...data }
            return { collaborator: mockState.collaborators[idx] }
        }
        return super.put(id, data)
    }

    async remove(id) {
        if (USE_MOCK) {
            await mockDelay()
            mockState.collaborators = mockState.collaborators.filter((c) => c._id !== id)
            return { ok: true }
        }
        return super.delete(id)
    }
}

export const collaboratorsService = new CollaboratorsService()
export default new CollaboratorsService()