import Service from './service.js'

// Mock
// Cuando el backend esté listo, cambiar USE_MOCK a false.

const USE_MOCK = true

const DAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']

const mockState = {
    schedules: DAYS.map((day, i) => ({
        _id: `day_${i}`,
        day,
        slots: i < 6
            ? [
                { _id: `slot_${i}_1`, from: '08:00', to: '12:00' },
                { _id: `slot_${i}_2`, from: '14:00', to: '17:00' },
              ]
            : [],
    })),
}

const mockDelay = () => new Promise((r) => setTimeout(r, 300))
const mockId    = () => `mock_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`

class ScheduleService extends Service {
    constructor() {
        super('/schedules')
    }

    async get() {
        if (USE_MOCK) {
            await mockDelay()
            return { schedules: structuredClone(mockState.schedules) }
        }
        return super.get()
    }

    async addSlot(day, from, to) {
        if (USE_MOCK) {
            await mockDelay()
            const dayEntry = mockState.schedules.find((d) => d.day === day)
            const newSlot = { _id: mockId(), from, to }
            dayEntry.slots.push(newSlot)
            return { slot: newSlot }
        }
        const response = await this.api.post(`${this.endpoint}/slot`, { day, from, to })
        return response.data
    }

    async updateSlot(slotId, from, to) {
        if (USE_MOCK) {
            await mockDelay()
            for (const dayEntry of mockState.schedules) {
                const slot = dayEntry.slots.find((s) => s._id === slotId)
                if (slot) { slot.from = from; slot.to = to; break }
            }
            return { ok: true }
        }
        const response = await this.api.put(`${this.endpoint}/slot/${slotId}`, { from, to })
        return response.data
    }

    async deleteSlot(slotId) {
        if (USE_MOCK) {
            await mockDelay()
            for (const dayEntry of mockState.schedules) {
                const idx = dayEntry.slots.findIndex((s) => s._id === slotId)
                if (idx !== -1) { dayEntry.slots.splice(idx, 1); break }
            }
            return { ok: true }
        }
        const response = await this.api.delete(`${this.endpoint}/slot/${slotId}`)
        return response.data
    }
}

export const scheduleService = new ScheduleService()