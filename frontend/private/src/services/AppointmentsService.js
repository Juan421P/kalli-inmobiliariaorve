import Service from './Service.js'

// Parsea 'YYYY-MM-DD' (el value crudo de <input type="date">) como fecha local.
// `new Date('YYYY-MM-DD')` la interpreta como medianoche UTC, lo que corre el
// día de la semana hacia atrás al convertirla de vuelta a local en el backend.
const parseLocalDate = (dateStr) => {
    const [y, m, d] = dateStr.split('-').map(Number)
    return new Date(y, m - 1, d)
}

// Campos que acepta tanto crear como actualizar (ver backend/src/schemas/appointment.js:
// schemas.update es .strict() y NO incluye buyer/property/time, esos solo se mandan al crear)
const buildCommonPayload = ({
    proposedDate, fundsSource, monthlyIncome, reason,
    addressReference, notes, location,
}) => {
    const payload = {
        proposed_dates: [parseLocalDate(proposedDate).toISOString()],
        qualification: {
            fundsSource,
            monthlyIncome: Number(monthlyIncome),
            reason,
        },
        current_address: {
            location: { type: 'Point', coordinates: location.coordinates },
            address: location.address,
            reference: addressReference,
        },
    }
    if (notes?.trim()) payload.notes = notes.trim()
    return payload
}

class AppointmentsService extends Service {
    constructor() {
        super('/appointment')
    }

    async getAll() {
        const response = await this.api.get(this.endpoint)
        return response.data
    }

    async create(formData) {
        const payload = {
            ...buildCommonPayload(formData),
            buyer: formData.buyer,
            property: formData.property,
            time: {
                startTime: formData.slot.start_time,
                endTime: formData.slot.end_time,
            },
        }
        const response = await this.api.post(this.endpoint, payload)
        return response.data
    }

    async update(id, formData) {
        const response = await this.api.put(`${this.endpoint}/${id}`, buildCommonPayload(formData))
        return response.data
    }

    async updateStatus(id, status) {
        // No hay un PUT /:id genérico para status: son endpoints dedicados sin body
        const action = status === 'completed' ? 'complete' : 'cancel'
        const response = await this.api.put(`${this.endpoint}/${id}/${action}`)
        return response.data
    }
}

// listas reales (no simuladas) para los selectores del formulario de nueva cita;
// separadas de clientsService/propertiesService, que aún trabajan con datos de prueba
class AppointmentOptionsService extends Service {
    async listClients() {
        const response = await this.api.get('/client')
        return response.data.clients ?? []
    }

    async listProperties() {
        const response = await this.api.get('/property')
        return response.data.properties ?? []
    }

    async listSchedules() {
        const response = await this.api.get('/schedule-availability')
        return response.data.schedules ?? []
    }
}

export const appointmentsService = new AppointmentsService()
export const appointmentOptionsService = new AppointmentOptionsService()