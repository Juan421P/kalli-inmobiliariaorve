import Service from './service.js'

const USE_MOCK = false

// El backend guarda los días en inglés; el frontend trabaja siempre con los nombres en español
const DAYS_ES = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']
const DAYS_EN = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
const toEnglish = (es) => DAYS_EN[DAYS_ES.indexOf(es)] ?? es

// El backend acepta y devuelve horas en formato AM/PM; el frontend las maneja en formato 24h
const to12h = (time24) => {
    const [h, m] = time24.split(':').map(Number)
    const suffix = h >= 12 ? 'PM' : 'AM'
    const h12 = h % 12 === 0 ? 12 : h % 12
    return `${String(h12).padStart(2, '0')}:${String(m).padStart(2, '0')} ${suffix}`
}
const to24h = (ampm) => {
    const [timePart, period] = ampm.toUpperCase().split(' ')
    const [h, m] = timePart.split(':').map(Number)
    const hours = period === 'PM' && h !== 12 ? h + 12 : (period === 'AM' && h === 12 ? 0 : h)
    return `${String(hours).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

// Adapta la respuesta del backend al shape que consumen la página y los componentes
// Backend: { _id, day: 'monday', intervals: [{ _id, start_time, end_time }] }
// Frontend: { _id, day: 'Lunes', slots: [{ _id, from: '08:00', to: '12:00' }] }
const normalizeSchedules = (backendDocs) => {
    return DAYS_ES.map((spanishDay) => {
        const englishDay = toEnglish(spanishDay)
        const doc = backendDocs.find((d) => d.day === englishDay)
        return {
            _id:   doc?._id   ?? null,
            day:   spanishDay,
            slots: (doc?.intervals ?? []).map((iv) => ({
                _id:  iv._id,
                from: to24h(iv.start_time),
                to:   to24h(iv.end_time),
            })),
        }
    })
}

// ─── Mock ─────────────────────────────────────────────────────────────────────
const mockState = {
    schedules: DAYS_ES.map((day, i) => ({
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

// ─── Servicio ─────────────────────────────────────────────────────────────────
class ScheduleService extends Service {
    constructor() {
        super('/scheduleAvailability')
        // Guardamos los docs originales del backend en caché para poder hacer PUT/DELETE
        // sin necesidad de refetch en cada mutación de slot
        this._cache = []
    }

    async get() {
        if (USE_MOCK) {
            await mockDelay()
            return { schedules: structuredClone(mockState.schedules) }
        }
        const data = await super.get()
        this._cache = data.schedules ?? []
        return { schedules: normalizeSchedules(this._cache) }
    }

    async addSlot(day, from, to) {
        if (USE_MOCK) {
            await mockDelay()
            const dayEntry = mockState.schedules.find((d) => d.day === day)
            const newSlot = { _id: mockId(), from, to }
            dayEntry.slots.push(newSlot)
            return { slot: newSlot }
        }

        const englishDay   = toEnglish(day)
        const newInterval  = { start_time: to12h(from), end_time: to12h(to) }
        const existing     = this._cache.find((d) => d.day === englishDay)

        let updatedDoc
        if (existing) {
            // El día ya tiene documento: agregamos el intervalo con PUT
            const oldIds    = existing.intervals.map((iv) => String(iv._id))
            const intervals = [
                ...existing.intervals.map((iv) => ({ start_time: iv.start_time, end_time: iv.end_time })),
                newInterval,
            ]
            const res    = await this.api.put(`${this.endpoint}/${existing._id}`, { intervals })
            updatedDoc   = res.data.schedule
            const idx    = this._cache.findIndex((d) => d._id === existing._id)
            this._cache[idx] = updatedDoc
            const addedIv = updatedDoc.intervals.find((iv) => !oldIds.includes(String(iv._id)))
            return { slot: { _id: addedIv._id, from, to } }
        } else {
            // El día no tiene documento aún: creamos uno nuevo con POST
            const res   = await this.api.post(this.endpoint, { day: englishDay, intervals: [newInterval] })
            updatedDoc  = res.data.schedule
            this._cache.push(updatedDoc)
            const addedIv = updatedDoc.intervals[0]
            return { slot: { _id: addedIv._id, from, to } }
        }
    }

    async updateSlot(slotId, from, to) {
        if (USE_MOCK) {
            await mockDelay()
            for (const d of mockState.schedules) {
                const slot = d.slots.find((s) => s._id === slotId)
                if (slot) { slot.from = from; slot.to = to; break }
            }
            return { ok: true }
        }

        const dayDoc = this._cache.find((d) => d.intervals.some((iv) => String(iv._id) === String(slotId)))
        if (!dayDoc) throw new Error('Slot no encontrado')

        const intervals = dayDoc.intervals.map((iv) =>
            String(iv._id) === String(slotId)
                ? { start_time: to12h(from), end_time: to12h(to) }
                : { start_time: iv.start_time, end_time: iv.end_time }
        )

        const res     = await this.api.put(`${this.endpoint}/${dayDoc._id}`, { intervals })
        const idx     = this._cache.findIndex((d) => d._id === dayDoc._id)
        this._cache[idx] = res.data.schedule

        return { ok: true }
    }

    async deleteSlot(slotId) {
        if (USE_MOCK) {
            await mockDelay()
            for (const d of mockState.schedules) {
                const i = d.slots.findIndex((s) => s._id === slotId)
                if (i !== -1) { d.slots.splice(i, 1); break }
            }
            return { ok: true }
        }

        const dayDoc = this._cache.find((d) => d.intervals.some((iv) => String(iv._id) === String(slotId)))
        if (!dayDoc) return { ok: true }

        const intervals = dayDoc.intervals
            .filter((iv) => String(iv._id) !== String(slotId))
            .map((iv) => ({ start_time: iv.start_time, end_time: iv.end_time }))

        if (intervals.length === 0) {
            // Si no quedan intervalos eliminamos el documento del día completo
            await this.api.delete(`${this.endpoint}/${dayDoc._id}`)
            this._cache = this._cache.filter((d) => d._id !== dayDoc._id)
        } else {
            const res    = await this.api.put(`${this.endpoint}/${dayDoc._id}`, { intervals })
            const idx    = this._cache.findIndex((d) => d._id === dayDoc._id)
            this._cache[idx] = res.data.schedule
        }

        return { ok: true }
    }
}

export const scheduleService = new ScheduleService()
